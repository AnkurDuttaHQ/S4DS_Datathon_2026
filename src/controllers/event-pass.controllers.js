import {
  generateEventPassService,
} from "../services/event-pass.services.js";

export const getEventPass = async (req, res) => {
  try {
    const { registrationId } = req.params;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required",
      });
    }

    const registration =
      await generateEventPassService(
        registrationId
      );

    return res.status(200).json({
      success: true,
      message: "Event pass generated successfully",
      data: {
        registrationId:
          registration.registrationId,

        teamName:
          registration.team.name,

        leadName:
          registration.lead.fullName,

        leadPhone:
          registration.lead.phoneNumber,

        passUrl:
          registration.eventPass?.passUrl || null,

        qrCode:
          registration.eventPass?.qrCode || null,

        generatedAt:
          registration.eventPass?.generatedAt || null,
      },
    });
  } catch (error) {
    console.error(
      "Event Pass Error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to generate event pass",
    });
  }
};