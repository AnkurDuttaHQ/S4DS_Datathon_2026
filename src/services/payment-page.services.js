import Registration from "../models/Registration.js";

export const getPaymentPageService = async (
  paymentToken
) => {
  if (!paymentToken) {
    const error = new Error(
      "Payment token is required"
    );
    error.statusCode = 400;
    throw error;
  }

  const registration =
    await Registration.findOne({
      paymentAccessToken: paymentToken
    });

  if (!registration) {
    const error = new Error(
      "Invalid payment link"
    );
    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------
  // PAYMENT MUST STILL BE REQUIRED
  // -----------------------------------

  if (
    registration.status !== "PAYMENT_REQUIRED"
  ) {
    const error = new Error(
      "This payment link is no longer active"
    );
    error.statusCode = 400;
    throw error;
  }

  if (!registration.payment.required) {
    const error = new Error(
      "Payment is not required"
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    registrationId:
      registration.registrationId,

    teamName:
      registration.team.name,

    leadName:
      registration.lead.fullName,

    amount:
      registration.payment.amount,

    paymentStatus:
      registration.payment.status
  };
};