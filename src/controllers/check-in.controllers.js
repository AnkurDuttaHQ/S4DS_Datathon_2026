import {
  getCheckInDetailsService,
} from "../services/check-in.services.js";

export const getCheckInDetails =
  async (req, res) => {
    try {
      const { registrationId } =
        req.params;

      const data =
        await getCheckInDetailsService(
          registrationId
        );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        "Check-In Details Error:",
        error
      );

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to load team details",
      });
    }
  };