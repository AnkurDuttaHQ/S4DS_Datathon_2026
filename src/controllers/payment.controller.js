import {
  submitPaymentService
} from "../services/payment.services.js";


// ==========================================
// SUBMIT PAYMENT
// ==========================================

export const submitPayment = async (req, res) => {

  try {

    // ------------------------------------------
    // 1. Get secure payment token
    // ------------------------------------------

    const { token } = req.params;


    // ------------------------------------------
    // 2. Get UTR
    // ------------------------------------------

    const { utr } = req.body || {};


    // ------------------------------------------
    // 3. Validate token
    // ------------------------------------------

    if (!token) {

      return res.status(400).json({
        success: false,
        message: "Payment token is required"
      });

    }


    // ------------------------------------------
    // 4. Validate UTR
    // ------------------------------------------

    if (!utr) {

      return res.status(400).json({
        success: false,
        message:
          "UTR / Transaction ID is required"
      });

    }


    // ------------------------------------------
    // 5. Find payment screenshot
    // ------------------------------------------

    const screenshotFile =
      req.files?.find(
        (file) =>
          file.fieldname.trim() ===
          "paymentScreenshot"
      );


    // ------------------------------------------
    // 6. Validate screenshot
    // ------------------------------------------

    if (!screenshotFile) {

      return res.status(400).json({
        success: false,
        message:
          "Payment screenshot is required"
      });

    }


    // ------------------------------------------
    // 7. Submit payment
    // ------------------------------------------

    const registration =
      await submitPaymentService(
        token,
        utr,
        screenshotFile
      );


    // ------------------------------------------
    // 8. Send safe response
    // ------------------------------------------

    return res.status(200).json({

      success: true,

      message:
        "Payment submitted successfully",

      data: {

        registrationId:
          registration.registrationId,

        teamName:
          registration.team.name,

        fee:
          registration.fee,

        paymentStatus:
          registration.payment.status,

        status:
          registration.status

      }

    });

  } catch (error) {

    console.error(
      "Payment Submission Error:",
      error
    );


    return res.status(
      error.statusCode || 500
    ).json({

      success: false,

      message:
        error.message ||
        "Internal server error"

    });

  }

};