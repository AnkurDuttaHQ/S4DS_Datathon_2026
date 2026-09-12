import Registration from "../models/Registration.js";
import { uploadToCloudinary } from "./cloudinary.service.js";

// ==========================================
// SUBMIT PAYMENT SERVICE
// ==========================================

export const submitPaymentService = async (
  paymentToken,
  utr,
  screenshotFile
) => {
  // ========================================
  // VALIDATE PAYMENT TOKEN
  // ========================================

  if (!paymentToken) {
    const error = new Error(
      "Payment token is required"
    );

    error.statusCode = 400;

    throw error;
  }

  // ========================================
  // VALIDATE UTR
  // ========================================

  if (!utr) {
    const error = new Error(
      "UTR / Transaction ID is required"
    );

    error.statusCode = 400;

    throw error;
  }

  const cleanUtr = String(utr).trim();

  // Exactly 12 digits
  if (!/^\d{12}$/.test(cleanUtr)) {
    const error = new Error(
      "UTR / Transaction ID must contain exactly 12 digits"
    );

    error.statusCode = 400;

    throw error;
  }

  // ========================================
  // VALIDATE SCREENSHOT
  // ========================================

  if (!screenshotFile) {
    const error = new Error(
      "Payment screenshot is required"
    );

    error.statusCode = 400;

    throw error;
  }

  // ========================================
  // FIND REGISTRATION
  // ========================================

  const registration =
    await Registration.findOne({
      paymentAccessToken: paymentToken,
    });

  if (!registration) {
    const error = new Error(
      "Invalid payment link"
    );

    error.statusCode = 404;

    throw error;
  }

  // ========================================
  // CHECK PAYMENT REQUIRED
  // ========================================

  if (!registration.payment.required) {
    const error = new Error(
      "Payment is not required for this registration"
    );

    error.statusCode = 400;

    throw error;
  }

  // ========================================
  // CHECK STATUS
  // ========================================

  if (
    registration.status !==
    "PAYMENT_REQUIRED"
  ) {
    const error = new Error(
      `Payment cannot be submitted from ${registration.status} status`
    );

    error.statusCode = 400;

    throw error;
  }

  // ========================================
  // UPLOAD SCREENSHOT
  // ========================================

  const uploadedFile =
    await uploadToCloudinary(
      screenshotFile.buffer,
      "s4ds-datathon/payment-screenshots"
    );

  // ========================================
  // UPDATE PAYMENT
  // ========================================

  registration.payment.utr =
    cleanUtr;

  registration.payment.screenshotUrl =
    uploadedFile.url;

  registration.payment.status =
    "SUBMITTED";

  registration.status =
    "PAYMENT_SUBMITTED";

  // ========================================
  // INVALIDATE PAYMENT TOKEN
  // ========================================
  // IMPORTANT:
  // Do NOT set this to null.
  // undefined causes Mongoose to omit
  // the field from MongoDB.
  // ========================================

  registration.paymentAccessToken =
    undefined;

  // ========================================
  // SAVE REGISTRATION
  // ========================================

  await registration.save();

  return registration;
};