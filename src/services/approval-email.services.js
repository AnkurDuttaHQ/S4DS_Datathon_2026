import Registration from "../models/Registration.js";

import {
  generateEventPassService,
} from "./event-pass.services.js";

import {
  sendApprovalEmail,
} from "./email.services.js";

// ==========================================
// RESEND APPROVAL EMAIL
// ==========================================

export const resendApprovalEmailService =
  async (registrationId) => {

    // ------------------------------------------
    // 1. Validate Registration ID
    // ------------------------------------------

    if (!registrationId) {
      const error = new Error(
        "Registration ID is required"
      );

      error.statusCode = 400;
      throw error;
    }

    // ------------------------------------------
    // 2. Find Registration
    // ------------------------------------------

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

    // ------------------------------------------
    // 3. Registration must be APPROVED
    // ------------------------------------------

    if (
      registration.status !== "APPROVED"
    ) {
      const error = new Error(
        "Approval email can only be sent for approved registrations"
      );

      error.statusCode = 400;
      throw error;
    }

    // ------------------------------------------
    // 4. Generate Event Pass if missing
    // ------------------------------------------

    if (
      !registration.eventPass?.passUrl
    ) {

      console.log(
        `Event Pass missing for ${registration.registrationId}`
      );

      await generateEventPassService(
        registration.registrationId
      );
    }

    // ------------------------------------------
    // 5. Get latest registration
    // ------------------------------------------

    const updatedRegistration =
      await Registration.findOne({
        registrationId:
          registration.registrationId,
      });

    if (!updatedRegistration) {
      const error = new Error(
        "Registration not found after Event Pass generation"
      );

      error.statusCode = 500;
      throw error;
    }

    // ------------------------------------------
    // 6. Make sure Event Pass exists
    // ------------------------------------------

    if (
      !updatedRegistration.eventPass
        ?.passUrl
    ) {
      const error = new Error(
        "Event Pass could not be generated"
      );

      error.statusCode = 500;
      throw error;
    }

    console.log(
      "Event Pass ready:",
      updatedRegistration.eventPass.passUrl
    );

    // ------------------------------------------
    // 7. Send Approval Email
    // ------------------------------------------

    await sendApprovalEmail(
      updatedRegistration
    );

    console.log(
      `Approval email resent successfully for ${updatedRegistration.registrationId}`
    );

    // ------------------------------------------
    // 8. Return Result
    // ------------------------------------------

    return {
      registration:
        updatedRegistration,

      approvalEmailSent: true,

      eventPassGenerated: true,
    };
  };