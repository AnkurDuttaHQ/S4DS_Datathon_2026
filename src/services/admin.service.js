import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Registration from "../models/Registration.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendPaymentRequiredEmail,
  sendRejectionEmail,
  sendApprovalEmail
} from "./email.services.js";

import { releaseSlot } from "./capacity.services.js";

import {
  generateEventPassService,
} from "./event-pass.services.js";


// ======================================================
// ADMIN LOGIN
// ======================================================

export const loginAdminService = async (
  identifier,
  password
) => {
  if (!identifier || !password) {
    const error = new Error(
      "Username/email and password are required"
    );

    error.statusCode = 400;

    throw error;
  }

  const cleanIdentifier =
    String(identifier).trim();

  const admin = await Admin.findOne({
    $or: [
      {
        username: cleanIdentifier,
      },
      {
        email:
          cleanIdentifier.toLowerCase(),
      },
    ],
  });

  if (!admin) {
    const error = new Error(
      "Invalid username/email or password"
    );

    error.statusCode = 401;

    throw error;
  }

  const isPasswordValid =
    await bcrypt.compare(
      password,
      admin.passwordHash
    );

  if (!isPasswordValid) {
    const error = new Error(
      "Invalid username/email or password"
    );

    error.statusCode = 401;

    throw error;
  }

  const token = jwt.sign(
    {
      adminId:
        admin._id.toString(),

      role: admin.role,
    },

    process.env.JWT_SECRET,

    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "1d",
    }
  );

  return {
    token,

    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  };
};


// ======================================================
// GET ALL REGISTRATIONS
// ======================================================

export const getAllRegistrationsService =
  async () => {
    const registrations =
      await Registration.find({})
        .sort({
          createdAt: -1,
        })
        .lean();

    return registrations;
  };


// ======================================================
// GET SINGLE REGISTRATION
// ======================================================

export const getRegistrationByIdService =
  async (registrationId) => {
    if (!registrationId) {
      const error = new Error(
        "Registration ID is required"
      );

      error.statusCode = 400;

      throw error;
    }

    const cleanRegistrationId =
      String(
        registrationId
      ).trim();

    const escapedId =
      cleanRegistrationId.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const registration =
      await Registration.findOne({
        registrationId: {
          $regex:
            `^${escapedId}$`,
          $options: "i",
        },
      }).lean();

    if (!registration) {
      const error = new Error(
        "Registration not found"
      );

      error.statusCode = 404;

      throw error;
    }

    return registration;
  };


// ======================================================
// APPROVE REGISTRATION
// ======================================================

export const approveRegistrationService = async (
  registrationId,
  adminId
) => {
  if (!registrationId) {
    const error = new Error(
      "Registration ID is required"
    );

    error.statusCode = 400;
    throw error;
  }

  const registration =
    await Registration.findOne({
      registrationId:
        String(registrationId).trim(),
    });

  if (!registration) {
    const error = new Error(
      "Registration not found"
    );

    error.statusCode = 404;
    throw error;
  }

  // --------------------------------------------------
  // Validate Status
  // --------------------------------------------------

  if (
    registration.status !==
      "UNDER_VERIFICATION" &&
    registration.status !==
      "PAYMENT_SUBMITTED"
  ) {
    const error = new Error(
      `Registration cannot be approved from ${registration.status} status`
    );

    error.statusCode = 400;
    throw error;
  }

  // --------------------------------------------------
  // Free Registration
  // --------------------------------------------------

  if (
    registration.status ===
    "UNDER_VERIFICATION"
  ) {
    if (registration.fee !== 0) {
      const error = new Error(
        "This registration requires payment before approval"
      );

      error.statusCode = 400;
      throw error;
    }

    if (
      registration.payment?.required ===
      true
    ) {
      const error = new Error(
        "Payment is required before approval"
      );

      error.statusCode = 400;
      throw error;
    }
  }

  // --------------------------------------------------
  // Payment Submitted
  // --------------------------------------------------

  if (
    registration.status ===
    "PAYMENT_SUBMITTED"
  ) {
    if (
      !registration.payment
    ) {
      const error = new Error(
        "Payment information not found"
      );

      error.statusCode = 400;
      throw error;
    }

    if (
      registration.payment.status !==
      "SUBMITTED"
    ) {
      const error = new Error(
        "Payment has not been submitted for verification"
      );

      error.statusCode = 400;
      throw error;
    }

    registration.payment.status =
      "VERIFIED";

    registration.payment.verifiedAt =
      new Date();
  }

  // --------------------------------------------------
  // APPROVE
  // --------------------------------------------------

  registration.status =
    "APPROVED";

  registration.adminReview.decision =
    "APPROVE";

  registration.adminReview.reviewedBy =
    adminId;

  registration.adminReview.reviewedAt =
    new Date();

  registration.rejectionReason =
    null;

  await registration.save();

  console.log(
    `Registration approved: ${registration.registrationId}`
  );

  // --------------------------------------------------
  // Generate Event Pass
  // --------------------------------------------------

  let eventPassGenerated = false;

  try {
    const result =
      await generateEventPassService(
        registration.registrationId
      );

    registration.eventPass =
      result.eventPass;

    eventPassGenerated =
      Boolean(
        registration.eventPass?.passUrl
      );

  } catch (error) {
    console.error(
      `Event pass generation failed for ${registration.registrationId}:`,
      error
    );
  }

  // --------------------------------------------------
  // Send Approval Email
  // --------------------------------------------------

  let approvalEmailSent = false;

  if (
    registration.eventPass?.passUrl
  ) {
    try {
      await sendApprovalEmail(
        registration
      );

      approvalEmailSent = true;

      console.log(
        `Approval email sent successfully for ${registration.registrationId}`
      );

    } catch (error) {
      console.error(
        `Approval email failed for ${registration.registrationId}:`,
        error
      );
    }
  } else {
    console.warn(
      `Approval email not sent because Event Pass is not available for ${registration.registrationId}`
    );
  }

  // --------------------------------------------------
  // Return Updated Registration
  // --------------------------------------------------

  const updatedRegistration =
    await Registration.findOne({
      registrationId:
        registration.registrationId,
    });

  return {
    registration:
      updatedRegistration,

    eventPassGenerated,

    approvalEmailSent,
  };
};
// ======================================================
// MARK PAYMENT REQUIRED
// ======================================================

export const markPaymentRequiredService = async (
  registrationId,
  adminId
) => {
  // --------------------------------------------------
  // 1. Validate Registration ID
  // --------------------------------------------------

  if (!registrationId) {
    const error = new Error(
      "Registration ID is required"
    );

    error.statusCode = 400;
    throw error;
  }

  // --------------------------------------------------
  // 2. Find Registration
  // --------------------------------------------------

  const registration = await Registration.findOne({
    registrationId: String(
      registrationId
    ).trim(),
  });

  if (!registration) {
    const error = new Error(
      "Registration not found"
    );

    error.statusCode = 404;
    throw error;
  }

  // --------------------------------------------------
  // 3. Validate Current Status
  // --------------------------------------------------

  if (
    registration.status !==
    "UNDER_VERIFICATION"
  ) {
    const error = new Error(
      `Payment requirement cannot be created from ${registration.status} status`
    );

    error.statusCode = 400;
    throw error;
  }

  // --------------------------------------------------
  // 4. Generate Secure Payment Token
  // --------------------------------------------------

  const paymentAccessToken =
    crypto
      .randomBytes(32)
      .toString("hex");

  // --------------------------------------------------
  // 5. Set Payment Required
  // --------------------------------------------------

  registration.fee = 100;

  registration.payment.required =
    true;

  registration.payment.amount =
    100;

  registration.payment.utr =
    null;

  registration.payment.screenshotUrl =
    null;

  registration.payment.status =
    "REQUIRED";

  registration.payment.verifiedAt =
    null;

  // --------------------------------------------------
  // 6. Update Registration Status
  // --------------------------------------------------

  registration.status =
    "PAYMENT_REQUIRED";

  // --------------------------------------------------
  // 7. Update Admin Review
  // --------------------------------------------------

  registration.adminReview.decision =
    "PAYMENT_REQUIRED";

  registration.adminReview.reviewedBy =
    adminId;

  registration.adminReview.reviewedAt =
    new Date();

  registration.adminReview.notes =
    "Payment of ₹100 is required before approval.";

  // --------------------------------------------------
  // 8. Store Payment Access Token
  // --------------------------------------------------

  registration.paymentAccessToken =
    paymentAccessToken;

  // --------------------------------------------------
  // 9. Save Registration
  // --------------------------------------------------

  await registration.save();

  console.log(
    `Payment required for ${registration.registrationId}`
  );

  // --------------------------------------------------
  // 10. Create Payment URL
  // --------------------------------------------------

  const frontendUrl =
    process.env.FRONTEND_URL;

  if (!frontendUrl) {
    const error = new Error(
      "FRONTEND_URL is not configured"
    );

    error.statusCode = 500;
    throw error;
  }

  const paymentUrl =
    `${frontendUrl.replace(/\/$/, "")}/payment/${paymentAccessToken}`;

  // --------------------------------------------------
  // 11. Send Payment Required Email
  // --------------------------------------------------

  let paymentEmailSent =
    false;

  try {
    await sendPaymentRequiredEmail({
      registration,
      paymentUrl,
    });

    paymentEmailSent =
      true;

    console.log(
      `Payment required email sent to ${registration.lead.email}`
    );
  } catch (error) {
    console.error(
      `Payment required email failed for ${registration.registrationId}:`,
      error
    );

    /*
      Registration remains PAYMENT_REQUIRED.
      Email failure should not undo the
      admin's payment-required decision.
    */
  }

  // --------------------------------------------------
  // 12. Return Result
  // --------------------------------------------------

  return {
    registration,
    paymentUrl,
    paymentEmailSent,
  };
};
// ======================================================
// REJECT REGISTRATION
// ======================================================

export const rejectRegistrationService =
  async (
    registrationId,
    adminId,
    reason
  ) => {

    // --------------------------------------------------
    // Validate reason
    // --------------------------------------------------

    if (
      !reason ||
      !String(reason).trim()
    ) {
      const error = new Error(
        "Rejection reason is required"
      );

      error.statusCode = 400;

      throw error;
    }


    // --------------------------------------------------
    // Validate registration ID
    // --------------------------------------------------

    if (!registrationId) {
      const error = new Error(
        "Registration ID is required"
      );

      error.statusCode = 400;

      throw error;
    }


    // --------------------------------------------------
    // Start MongoDB transaction
    // --------------------------------------------------

    const session =
      await mongoose.startSession();

    try {

      session.startTransaction();


      // ------------------------------------------------
      // Find registration
      // ------------------------------------------------

      const registration =
        await Registration.findOne({
          registrationId:
            String(
              registrationId
            ).trim(),
        }).session(session);


      if (!registration) {
        const error = new Error(
          "Registration not found"
        );

        error.statusCode = 404;

        throw error;
      }


      // ------------------------------------------------
      // Only active registrations can be rejected
      // ------------------------------------------------

      if (
        registration.status !==
          "UNDER_VERIFICATION" &&
        registration.status !==
          "PAYMENT_SUBMITTED"
      ) {

        const error = new Error(
          `Registration cannot be rejected from ${registration.status} status`
        );

        error.statusCode = 400;

        throw error;
      }


      // ------------------------------------------------
      // Reject
      // ------------------------------------------------

      registration.status =
        "REJECTED";

      registration.rejectionReason =
        String(reason).trim();

      registration.adminReview.decision =
        "REJECT";

      registration.adminReview.reviewedBy =
        adminId;

      registration.adminReview.reviewedAt =
        new Date();


      // Remove payment access token
      registration.paymentAccessToken =
        undefined;


      // ------------------------------------------------
      // Save registration
      // ------------------------------------------------

      await registration.save({
        session,
      });


      // ------------------------------------------------
      // Release occupied slot
      // ------------------------------------------------

      await releaseSlot(
        session
      );


      // ------------------------------------------------
      // Commit transaction
      // ------------------------------------------------

      await session.commitTransaction();

      try {
          await sendRejectionEmail({
          registration,
          reason,
        });

      console.log(
    `Rejection email sent to ${registration.lead.email}`
  );
} catch (emailError) {
  console.error(
    "Rejection email failed:",
    emailError
  );
}


  return registration;

    } catch (error) {

      await session.abortTransaction();

      throw error;

    } finally {

      await session.endSession();

    }
  };