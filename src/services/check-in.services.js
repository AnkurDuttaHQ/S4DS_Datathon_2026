import Registration from "../models/Registration.js";

export const getCheckInDetailsService = async (
  registrationId
) => {
  if (!registrationId) {
    const error = new Error(
      "Registration ID is required"
    );

    error.statusCode = 400;

    throw error;
  }

  const cleanRegistrationId =
    String(registrationId).trim();

  const registration =
    await Registration.findOne({
      registrationId: cleanRegistrationId,
    }).lean();

  if (!registration) {
    const error = new Error(
      "Registration not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // Only approved teams should be
  // publicly visible through the QR.
  if (registration.status !== "APPROVED") {
    const error = new Error(
      "This team does not have an active event pass"
    );

    error.statusCode = 403;

    throw error;
  }

  return {
    registrationId:
      registration.registrationId,

    teamName:
      registration.team?.name,

    lead: {
      fullName:
        registration.lead?.fullName,

      phoneNumber:
        registration.lead?.phoneNumber,
    },

    members:
      (registration.members || []).map(
        (member) => ({
          fullName:
            member.fullName,
        })
      ),

    status:
      registration.status,

    eventPassGeneratedAt:
      registration.eventPass?.generatedAt ||
      null,
  };
};