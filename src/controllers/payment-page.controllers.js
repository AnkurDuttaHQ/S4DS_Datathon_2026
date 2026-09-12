import {
  getPaymentPageService
} from "../services/payment-page.services.js";

export const getPaymentPage = async (req, res) => {
  try {
    const { token } = req.params;

    const paymentData = await getPaymentPageService(token);

    return res.status(200).json({
      success: true,
      data: paymentData
    });
  } catch (error) {
    console.error("Payment Page Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Unable to open payment page"
    });
  }
};