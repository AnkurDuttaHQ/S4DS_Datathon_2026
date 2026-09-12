import PDFDocument from "pdfkit";
import Registration from "../models/Registration.js";
import { generateCheckInQR } from "./qr.services.js";
import { uploadToCloudinary } from "./cloudinary.service.js";

// --------------------------------------------------
// Generate PDF Buffer
// --------------------------------------------------

const generatePDFBuffer = (
  registration,
  qrDataUrl
) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", (error) => {
      reject(error);
    });

    // Header
    doc
      .fontSize(12)
      .fillColor("#2563eb")
      .font("Helvetica-Bold")
      .text("S4DS SOCIETY", {
        align: "center",
      });

    doc
      .moveDown(0.3)
      .fontSize(26)
      .fillColor("#111827")
      .text("DATATHON '26", {
        align: "center",
      });

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#64748b")
      .font("Helvetica")
      .text("OFFICIAL EVENT PASS", {
        align: "center",
      });

    doc.moveDown(1);

    doc
      .moveTo(70, doc.y)
      .lineTo(525, doc.y)
      .strokeColor("#cbd5e1")
      .stroke();

    doc.moveDown(1.2);

    // Team
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .font("Helvetica-Bold")
      .text("TEAM NAME");

    doc
      .moveDown(0.3)
      .fontSize(24)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(registration.team.name);

    doc.moveDown(1);

    // Registration ID
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .font("Helvetica-Bold")
      .text("REGISTRATION ID");

    doc
      .moveDown(0.3)
      .fontSize(15)
      .fillColor("#2563eb")
      .font("Helvetica-Bold")
      .text(registration.registrationId);

    doc.moveDown(1);

    // Lead
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .font("Helvetica-Bold")
      .text("TEAM LEAD");

    doc
      .moveDown(0.3)
      .fontSize(16)
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .text(registration.lead.fullName);

    doc
      .moveDown(0.2)
      .fontSize(11)
      .fillColor("#475569")
      .font("Helvetica")
      .text(
        `Contact: ${registration.lead.phoneNumber}`
      );

    doc.moveDown(1);

    // Members
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .font("Helvetica-Bold")
      .text("TEAM MEMBERS");

    doc.moveDown(0.4);

    registration.members.forEach(
      (member, index) => {
        doc
          .fontSize(11)
          .fillColor("#334155")
          .font("Helvetica")
          .text(
            `${index + 2}. ${member.fullName}`
          );
      }
    );

    doc.moveDown(1.2);

    // QR
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .font("Helvetica-Bold")
      .text("CHECK-IN QR", {
        align: "center",
      });

    doc.moveDown(0.5);

    const qrBase64 =
      qrDataUrl.replace(
        /^data:image\/png;base64,/,
        ""
      );

    const qrBuffer =
      Buffer.from(
        qrBase64,
        "base64"
      );

    doc.image(
      qrBuffer,
      205,
      doc.y,
      {
        width: 180,
        height: 180,
      }
    );

    doc.y += 195;

    doc
      .fontSize(9)
      .fillColor("#64748b")
      .font("Helvetica")
      .text(
        "Scan this QR code to verify the team registration.",
        {
          align: "center",
        }
      );

    doc.moveDown(1);

    doc
      .fontSize(12)
      .fillColor("#15803d")
      .font("Helvetica-Bold")
      .text(
        "✓ APPROVED REGISTRATION",
        {
          align: "center",
        }
      );

    doc.moveDown(2);

    doc
      .fontSize(8)
      .fillColor("#94a3b8")
      .font("Helvetica")
      .text(
        "S4DS Datathon '26 • Official Event Pass",
        {
          align: "center",
        }
      );

    doc.end();
  });
};

// --------------------------------------------------
// Small delay helper
// --------------------------------------------------

const delay = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

// --------------------------------------------------
// Generate Event Pass
// --------------------------------------------------

export const generateEventPassService =
  async (registrationId) => {
    if (!registrationId) {
      const error = new Error(
        "Registration ID is required"
      );

      error.statusCode = 400;
      throw error;
    }

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

    if (
      registration.status !==
      "APPROVED"
    ) {
      const error = new Error(
        "Event pass is available only for approved registrations"
      );

      error.statusCode = 400;
      throw error;
    }

    // --------------------------------------------------
    // Already generated
    // --------------------------------------------------

    if (
      registration.eventPass?.passUrl
    ) {
      console.log(
        `Event pass already exists for ${registration.registrationId}`
      );

      return registration;
    }

    // --------------------------------------------------
    // Generate QR
    // --------------------------------------------------

    const qr =
      await generateCheckInQR(
        registration.registrationId
      );

    // --------------------------------------------------
    // Generate PDF
    // --------------------------------------------------

    const pdfBuffer =
      await generatePDFBuffer(
        registration,
        qr.dataUrl
      );

    // --------------------------------------------------
    // Upload with retry
    // --------------------------------------------------

    let uploadedPass = null;

    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        console.log(
          `Uploading Event Pass attempt ${attempt}/${maxAttempts}...`
        );

          uploadedPass =
          await uploadToCloudinary(
          pdfBuffer,
          "s4ds-datathon/event-passes",
          "raw"
  );

        break;
      } catch (error) {
        console.error(
          `Event Pass upload attempt ${attempt} failed:`,
          error
        );

        if (
          attempt === maxAttempts
        ) {
          throw error;
        }

        // Wait before retry
        await delay(
          attempt * 2000
        );
      }
    }

    if (
      !uploadedPass?.url
    ) {
      throw new Error(
        "Event Pass upload failed"
      );
    }

    // --------------------------------------------------
    // Save Event Pass
    // --------------------------------------------------

    registration.eventPass = {
      passUrl:
        uploadedPass.url,

      qrCode:
        qr.dataUrl,

      generatedAt:
        new Date(),
    };

    await registration.save();

    console.log(
      `Event pass saved successfully for ${registration.registrationId}`
    );

    return registration;
  };