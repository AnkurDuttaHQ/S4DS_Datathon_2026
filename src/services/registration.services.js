import mongoose from "mongoose";
import crypto from "crypto";

import Registration from "../models/Registration.js";

import { reserveSlot } from "./capacity.services.js";

// ==========================================
// CREATE REGISTRATION
// ==========================================

export const createRegistrationService = async (data) => {
    // ------------------------------------------
    // 1. Check registration data
    // ------------------------------------------
    if (!data) {
        const error = new Error(
            "Registration data is required"
        );
        error.statusCode = 400;
        throw error;
    }

    // ------------------------------------------
    // 2. Extract data
    // ------------------------------------------
    const {
        team,
        lead,
        members
    } = data;

    // ------------------------------------------
    // 3. Validate team
    // ------------------------------------------
    if (!team || !team.name) {
        const error = new Error(
            "Team name is required"
        );
        error.statusCode = 400;
        throw error;
    }

    // ------------------------------------------
    // 4. Validate team lead
    // ------------------------------------------
    if (!lead) {
        const error = new Error(
            "Team lead information is required"
        );
        error.statusCode = 400;
        throw error;
    }

    // ------------------------------------------
    // 5. Validate members
    // ------------------------------------------
    if (!Array.isArray(members)) {
        const error = new Error(
            "Members must be an array"
        );
        error.statusCode = 400;
        throw error;
    }

    // ------------------------------------------
    // 6. Exactly 3 additional members
    // ------------------------------------------
    if (members.length !== 3) {
        const error = new Error(
            "A team must contain exactly 3 additional members"
        );
        error.statusCode = 400;
        throw error;
    }

    // ------------------------------------------
    // 7. Clean team name
    // ------------------------------------------
    const teamName = team.name.trim();

    // ------------------------------------------
    // 8. Check duplicate team name
    // ------------------------------------------
    const existingTeam = await Registration.findOne({
        "team.name": teamName
    });

    if (existingTeam) {
        const error = new Error(
            "This team name is already registered"
        );
        error.statusCode = 409;
        throw error;
    }

    // ------------------------------------------
    // 9. Combine all 4 participants
    // ------------------------------------------
    const allMembers = [
        lead,
        ...members
    ];

    // ------------------------------------------
    // 10. Check S4DS membership claim
    // ------------------------------------------
    const hasNonMember = allMembers.some(
        (member) => member.s4dsMember === false
    );

    // ------------------------------------------
    // 11. Calculate registration fee
    // ------------------------------------------
    const fee = hasNonMember ? 100 : 0;

    // ------------------------------------------
    // 12. Decide whether payment is required
    // ------------------------------------------
    const paymentRequired = hasNonMember;

    // ------------------------------------------
    // 13. Generate payment token ONLY
    //     when payment is immediately required
    // ------------------------------------------
    const paymentAccessToken = paymentRequired
        ? crypto.randomBytes(32).toString("hex")
        : undefined;

    // ------------------------------------------
    // 14. Start MongoDB transaction
    // ------------------------------------------
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // ------------------------------------------
        // 15. Reserve one team slot
        // ------------------------------------------
        await reserveSlot(session);

        // ------------------------------------------
        // 16. Generate registration ID
        // ------------------------------------------
        const registrationId =
            await generateRegistrationId(session);

        // ------------------------------------------
        // 17. Create registration object
        // ------------------------------------------
        const registrationData = {
            registrationId,

            // --------------------------------------
            // Team
            // --------------------------------------
            team: {
                name: teamName
            },

            // --------------------------------------
            // Team lead
            // --------------------------------------
            lead,

            // --------------------------------------
            // Other 3 members
            // --------------------------------------
            members,

            // --------------------------------------
            // Fee
            // --------------------------------------
            fee,

            // --------------------------------------
            // Payment
            // --------------------------------------
            payment: {
                required: paymentRequired,
                amount: fee,
                utr: null,
                screenshotUrl: null,

                status: paymentRequired
                    ? "REQUIRED"
                    : "NOT_REQUIRED",

                verifiedAt: null
            },

            // --------------------------------------
            // Admin review
            // --------------------------------------
            adminReview: {
                decision: null,
                reviewedBy: null,
                reviewedAt: null,
                notes: null
            },

            // --------------------------------------
            // Registration status
            // --------------------------------------
            status: paymentRequired
                ? "PAYMENT_REQUIRED"
                : "UNDER_VERIFICATION",

            // --------------------------------------
            // Rejection
            // --------------------------------------
            rejectionReason: null,

            // --------------------------------------
            // Event pass
            // --------------------------------------
            eventPass: {
                passUrl: null,
                qrCode: null,
                generatedAt: null
            }
        };

        // ------------------------------------------
        // 18. Add payment token ONLY when required
        // ------------------------------------------
        if (paymentRequired) {
            registrationData.paymentAccessToken =
                paymentAccessToken;
        }

        // ------------------------------------------
        // 19. Save registration
        // ------------------------------------------
        const registrations =
            await Registration.create(
                [registrationData],
                { session }
            );

        const registration =
            registrations[0];

        // ------------------------------------------
        // 20. Commit transaction
        // ------------------------------------------
        await session.commitTransaction();

        // ------------------------------------------
        // 21. Generate payment URL
        // ------------------------------------------
        const paymentUrl = paymentRequired
            ? `${process.env.FRONTEND_URL}/payment/${paymentAccessToken}`
            : null;

        // ------------------------------------------
        // 22. Return registration + payment URL
        // ------------------------------------------
        return {
            registration,
            paymentUrl
        };

    } catch (error) {

        // ------------------------------------------
        // Rollback transaction
        // ------------------------------------------
        await session.abortTransaction();

        throw error;

    } finally {

        // ------------------------------------------
        // Close session
        // ------------------------------------------
        await session.endSession();
    }
};


// ==========================================
// GENERATE REGISTRATION ID
// ==========================================

const generateRegistrationId = async (session) => {

    const count =
        await Registration
            .countDocuments()
            .session(session);

    const number =
        String(count + 1).padStart(4, "0");

    return `SD26-${number}`;
};