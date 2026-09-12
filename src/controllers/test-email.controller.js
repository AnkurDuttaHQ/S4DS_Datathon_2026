import {
  sendTestEmail,
} from "../services/email.services.js";

export const testEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email query parameter is required",
      });
    }

    const result = await sendTestEmail(email);

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Test Email Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Unable to send test email",
    });
  }
};