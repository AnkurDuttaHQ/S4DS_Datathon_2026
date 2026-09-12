import QRCode from "qrcode";

export const generateCheckInQR = async (
  registrationId
) => {
  if (!registrationId) {
    throw new Error(
      "Registration ID is required"
    );
  }

  const frontendUrl =
    process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error(
      "FRONTEND_URL is not configured"
    );
  }

  const checkInUrl =
    `${frontendUrl.replace(/\/$/, "")}` +
    `/check-in/${encodeURIComponent(
      registrationId
    )}`;

  const dataUrl =
    await QRCode.toDataURL(
      checkInUrl,
      {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 500,
      }
    );

  return {
    url: checkInUrl,
    dataUrl,
  };
};