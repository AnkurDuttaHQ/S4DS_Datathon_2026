
const sendEmail = async ({
  to,
  subject,
  htmlContent,
  attachment,
}) => {
  const apiKey = process.env.BREVO_API_KEY;

  const senderEmail =
    process.env.BREVO_SENDER_EMAIL;

  const senderName =
    process.env.BREVO_SENDER_NAME ||
    "S4DS Datathon 2026";

  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY is not configured"
    );
  }

  if (!senderEmail) {
    throw new Error(
      "BREVO_SENDER_EMAIL is not configured"
    );
  }

  const emailData = {
    sender: {
      name: senderName,
      email: senderEmail,
    },

    to,

    subject,

    htmlContent,
  };

  // Add attachment only when one actually exists
  if (
    attachment &&
    attachment.length > 0
  ) {
    emailData.attachment =
      attachment;
  }

  console.log(
    "Sending email to:",
    to
  );

  console.log(
    "Email subject:",
    subject
  );

  console.log(
    "Has attachment:",
    Boolean(
      attachment &&
      attachment.length > 0
    )
  );

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",

      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type":
          "application/json",
      },

      body: JSON.stringify(
        emailData
      ),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "BREVO ERROR:",
      errorText
    );

    throw new Error(
      `Brevo API error: ${response.status} ${errorText}`
    );
  }

const result = await response.json();

console.log("BREVO RESPONSE:", result);

return result;

};

export const sendTestEmail = async (recipientEmail) => {
  if (!recipientEmail) {
    throw new Error("Recipient email is required");
  }

  return await sendEmail({
    to: [
      {
        email: recipientEmail,
      },
    ],
    subject: "S4DS Datathon 2026 — Email Test",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <body style="
          margin:0;
          padding:30px;
          background:#f8fafc;
          font-family:Arial,sans-serif;
        ">
          <div style="
            max-width:600px;
            margin:auto;
            background:#ffffff;
            padding:30px;
            border-radius:12px;
          ">
            <h1>S4DS Datathon 2026 🚀</h1>

            <h2>Email System Test</h2>

            <p>
              This is a test email from the
              S4DS Datathon backend.
            </p>

            <p>
              If you received this email,
              Brevo integration is working successfully.
            </p>

            <hr />

            <p>
              <strong>Status:</strong>
              Email service connected successfully ✅
            </p>

            <p>S4DS Society</p>
          </div>
        </body>
      </html>
    `,
  });
};

export const sendPaymentRequiredEmail = async ({
  registration,
  paymentUrl,
}) => {
  if (!registration) {
    throw new Error("Registration is required");
  }

  if (!paymentUrl) {
    throw new Error("Payment URL is required");
  }

  const leadEmail =
    registration.lead?.email?.trim();

  const leadName =
    registration.lead?.fullName?.trim() ||
    "Team Lead";

  if (!leadEmail) {
    throw new Error(
      "Team lead email is missing"
    );
  }

  const teamName =
    registration.team?.name || "S4DS Team";

  const registrationId =
    registration.registrationId;

  const amount =
    registration.payment?.amount ??
    registration.fee ??
    100;

  return await sendEmail({
    to: [
      {
        email: leadEmail,
        name: leadName,
      },
    ],

    subject:
      "S4DS Datathon 2026 — Payment Required",

    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport"
                content="width=device-width, initial-scale=1.0" />
          <title>Payment Required</title>
        </head>

        <body style="
          margin:0;
          padding:0;
          background:#f1f5f9;
          font-family:Arial,Helvetica,sans-serif;
        ">

          <div style="
            max-width:620px;
            margin:30px auto;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
          ">

            <!-- Header -->

            <div style="
              padding:30px;
              background:#111827;
              color:#ffffff;
              text-align:center;
            ">

              <div style="
                font-size:14px;
                font-weight:bold;
                letter-spacing:2px;
              ">
                S4DS SOCIETY
              </div>

              <div style="
                margin-top:8px;
                font-size:28px;
                font-weight:bold;
              ">
                DATATHON '26
              </div>

            </div>

            <!-- Content -->

            <div style="
              padding:35px 30px;
            ">

              <h2 style="
                margin-top:0;
                color:#111827;
              ">
                Payment Required
              </h2>

              <p style="
                color:#475569;
                font-size:15px;
                line-height:1.7;
              ">
                Hello ${leadName},
              </p>

              <p style="
                color:#475569;
                font-size:15px;
                line-height:1.7;
              ">
                During verification of your team
                registration, it was found that
                the team requires the applicable
                registration fee.
              </p>

              <!-- Registration details -->

              <div style="
                margin:25px 0;
                padding:20px;
                background:#f8fafc;
                border-radius:12px;
                border:1px solid #e2e8f0;
              ">

                <p style="margin:8px 0;">
                  <strong>Team Name:</strong>
                  ${teamName}
                </p>

                <p style="margin:8px 0;">
                  <strong>Registration ID:</strong>
                  ${registrationId}
                </p>

                <p style="margin:8px 0;">
                  <strong>Amount:</strong>
                  ₹${amount}
                </p>

              </div>

              <p style="
                color:#475569;
                font-size:15px;
                line-height:1.7;
              ">
                Please complete the payment using
                the secure payment page below.
              </p>

              <!-- Payment button -->

              <div style="
                text-align:center;
                margin:30px 0;
              ">

                <a
                  href="${paymentUrl}"
                  style="
                    display:inline-block;
                    padding:15px 32px;
                    background:#2563eb;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:10px;
                    font-size:16px;
                    font-weight:bold;
                  "
                >
                  Pay ₹${amount}
                </a>

              </div>

              <div style="
                padding:18px;
                background:#eff6ff;
                border-radius:10px;
                color:#1e3a8a;
                font-size:14px;
                line-height:1.7;
              ">

                <strong>After payment:</strong>

                <br />

                1. Enter your 12-digit UTR /
                Transaction ID.

                <br />

                2. Upload your payment screenshot.

                <br />

                3. Submit the payment details.

              </div>

              <p style="
                margin-top:25px;
                color:#64748b;
                font-size:13px;
                line-height:1.6;
              ">
                Please do not share your secure
                payment link with others.
              </p>

              <p style="
                color:#475569;
                font-size:15px;
              ">
                Regards,<br />
                <strong>S4DS Society</strong>
              </p>

            </div>

            <!-- Footer -->

            <div style="
              padding:20px;
              background:#f8fafc;
              text-align:center;
              color:#94a3b8;
              font-size:12px;
            ">
              S4DS Datathon 2026
            </div>

          </div>

        </body>
      </html>
    `,
  });
};



export const sendRejectionEmail = async ({
  registration,
  reason,
}) => {
  if (!registration) {
    throw new Error("Registration is required");
  }

  if (!reason || !String(reason).trim()) {
    throw new Error("Rejection reason is required");
  }

  const leadEmail =
    registration.lead?.email?.trim();

  const leadName =
    registration.lead?.fullName?.trim() ||
    "Team Lead";

  if (!leadEmail) {
    throw new Error(
      "Team lead email is missing"
    );
  }

  const teamName =
    registration.team?.name ||
    "S4DS Team";

  const registrationId =
    registration.registrationId;

  const cleanReason =
    String(reason).trim();

  return await sendEmail({
    to: [
      {
        email: leadEmail,
        name: leadName,
      },
    ],

    subject:
      "S4DS Datathon 2026 — Registration Update",

    htmlContent: `
      <!DOCTYPE html>
      <html>

        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>
            Registration Update
          </title>
        </head>

        <body style="
          margin:0;
          padding:0;
          background:#f1f5f9;
          font-family:Arial,Helvetica,sans-serif;
        ">

          <div style="
            max-width:620px;
            margin:30px auto;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
          ">

            <!-- Header -->

            <div style="
              padding:30px;
              background:#111827;
              color:#ffffff;
              text-align:center;
            ">

              <div style="
                font-size:14px;
                font-weight:bold;
                letter-spacing:2px;
              ">
                S4DS SOCIETY
              </div>

              <div style="
                margin-top:8px;
                font-size:28px;
                font-weight:bold;
              ">
                DATATHON '26
              </div>

            </div>

            <!-- Content -->

            <div style="
              padding:35px 30px;
            ">

              <h2 style="
                margin-top:0;
                color:#111827;
              ">
                Registration Update
              </h2>

              <p style="
                color:#475569;
                font-size:15px;
                line-height:1.7;
              ">
                Hello ${leadName},
              </p>

              <p style="
                color:#475569;
                font-size:15px;
                line-height:1.7;
              ">
                Unfortunately, your team's
                registration for S4DS Datathon
                2026 could not be approved.
              </p>

              <!-- Registration Details -->

              <div style="
                margin:25px 0;
                padding:20px;
                background:#f8fafc;
                border-radius:12px;
                border:1px solid #e2e8f0;
              ">

                <p style="margin:8px 0;">
                  <strong>Team Name:</strong>
                  ${teamName}
                </p>

                <p style="margin:8px 0;">
                  <strong>Registration ID:</strong>
                  ${registrationId}
                </p>

              </div>

              <!-- Rejection Reason -->

              <div style="
                margin:25px 0;
                padding:20px;
                background:#fff1f2;
                border:1px solid #fecdd3;
                border-radius:12px;
              ">

                <div style="
                  color:#9f1239;
                  font-size:13px;
                  font-weight:bold;
                  margin-bottom:8px;
                ">
                  REJECTION REASON
                </div>

                <div style="
                  color:#881337;
                  font-size:14px;
                  line-height:1.7;
                ">
                  ${cleanReason}
                </div>

              </div>

              <p style="
                color:#64748b;
                font-size:14px;
                line-height:1.7;
              ">
                If you believe this decision was
                made in error, please contact the
                S4DS Society organizing team.
              </p>

              <p style="
                color:#475569;
                font-size:15px;
                margin-top:25px;
              ">
                Regards,<br />
                <strong>S4DS Society</strong>
              </p>

            </div>

            <!-- Footer -->

            <div style="
              padding:20px;
              background:#f8fafc;
              text-align:center;
              color:#94a3b8;
              font-size:12px;
            ">
              S4DS Datathon 2026
            </div>

          </div>

        </body>

      </html>
    `,
  });
};

// ==========================================
// APPROVAL EMAIL
// ==========================================

export const sendApprovalEmail = async (
  registration
) => {
  if (!registration) {
    throw new Error(
      "Registration is required"
    );
  }

  const passUrl =
    registration.eventPass?.passUrl;

  if (!passUrl) {
    throw new Error(
      "Event Pass PDF URL is missing"
    );
  }

  const teamName =
    registration.team?.name ||
    "S4DS Team";

  const registrationId =
    registration.registrationId;

  const leadName =
    registration.lead?.fullName ||
    "Team Lead";

  // ------------------------------------------
  // 1. Get Lead + 3 Members
  // ------------------------------------------

  const members = [
    registration.lead,
    ...(registration.members || []),
  ];

  // ------------------------------------------
  // 2. Prepare Recipients
  // ------------------------------------------

  const recipients = members
    .filter((member) => member?.email)
    .map((member) => ({
      email: member.email.trim(),
      name:
        member.fullName?.trim() ||
        undefined,
    }));

  // ------------------------------------------
  // 3. Remove Duplicate Emails
  // ------------------------------------------

  const uniqueRecipients =
    Array.from(
      new Map(
        recipients.map(
          (recipient) => [
            recipient.email.toLowerCase(),
            recipient,
          ]
        )
      ).values()
    );

  if (
    uniqueRecipients.length === 0
  ) {
    throw new Error(
      "No valid team member email addresses found"
    );
  }

  // ------------------------------------------
  // 4. Event Information
  // ------------------------------------------

  const venue =
    process.env.EVENT_VENUE ||
    "Event venue will be announced";

  const whatsappGroup =
    process.env.WHATSAPP_GROUP_URL ||
    "";

  const passFileName =
    `${registrationId}_Event_Pass.pdf`;

  // ------------------------------------------
  // 5. Download Event Pass PDF
  // ------------------------------------------

  console.log(
    `Downloading Event Pass PDF for ${registrationId}...`
  );

  const pdfResponse =
    await fetch(passUrl);

  if (!pdfResponse.ok) {
    throw new Error(
      `Failed to download Event Pass PDF: ${pdfResponse.status} ${pdfResponse.statusText}`
    );
  }

  const pdfArrayBuffer =
    await pdfResponse.arrayBuffer();

  const pdfBuffer =
    Buffer.from(pdfArrayBuffer);

  // ------------------------------------------
  // 6. Validate PDF
  // ------------------------------------------

  const pdfHeader =
    pdfBuffer
      .subarray(0, 4)
      .toString();

  console.log(
    "PDF Header:",
    pdfHeader
  );

  if (pdfHeader !== "%PDF") {
    throw new Error(
      "Downloaded Event Pass is not a valid PDF file"
    );
  }

  console.log(
    `Event Pass PDF downloaded successfully. Size: ${pdfBuffer.length} bytes`
  );

  // ------------------------------------------
  // 7. Convert PDF to Base64
  // ------------------------------------------

  const pdfBase64 =
    pdfBuffer.toString("base64");

  // ------------------------------------------
  // 8. WhatsApp Section
  // ------------------------------------------

  const whatsappSection =
    whatsappGroup
      ? `
        <div style="text-align:center;margin:25px 0;">
          <a
            href="${whatsappGroup}"
            style="
              display:inline-block;
              padding:13px 26px;
              background:#16a34a;
              color:#ffffff;
              text-decoration:none;
              border-radius:10px;
              font-size:14px;
              font-weight:bold;
            "
          >
            Join WhatsApp Group
          </a>
        </div>
      `
      : "";

  // ------------------------------------------
  // 9. Email HTML
  // ------------------------------------------

  const htmlContent = `
<!DOCTYPE html>

<html>

<head>
  <meta charset="UTF-8" />

  <title>
    S4DS Datathon 2026
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f8fafc;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <div
    style="
      max-width:650px;
      margin:30px auto;
      background:#ffffff;
      border-radius:16px;
      overflow:hidden;
      border:1px solid #e2e8f0;
    "
  >

    <!-- HEADER -->

    <div
      style="
        background:#111827;
        padding:30px;
        text-align:center;
      "
    >

      <div
        style="
          color:#60a5fa;
          font-size:14px;
          font-weight:bold;
          letter-spacing:1px;
        "
      >
        S4DS SOCIETY
      </div>

      <h1
        style="
          color:#ffffff;
          margin:8px 0 0;
          font-size:30px;
        "
      >
        DATATHON '26
      </h1>

      <div
        style="
          color:#cbd5e1;
          margin-top:8px;
          font-size:13px;
        "
      >
        OFFICIAL EVENT CONFIRMATION
      </div>

    </div>


    <!-- CONTENT -->

    <div style="padding:35px;">

      <h2
        style="
          color:#15803d;
          margin-top:0;
        "
      >
        🎉 Registration Approved!
      </h2>

      <p
        style="
          color:#334155;
          font-size:15px;
          line-height:1.7;
        "
      >
        Hello ${leadName},
      </p>

      <p
        style="
          color:#334155;
          font-size:15px;
          line-height:1.7;
        "
      >
        Congratulations! Your team has been
        <strong>officially approved</strong>
        for S4DS Datathon 2026.
      </p>


      <!-- TEAM DETAILS -->

      <div
        style="
          background:#f8fafc;
          border-radius:12px;
          padding:20px;
          margin:25px 0;
        "
      >

        <p style="margin:8px 0;">
          <strong>Team Name:</strong>
          ${teamName}
        </p>

        <p style="margin:8px 0;">
          <strong>Registration ID:</strong>
          ${registrationId}
        </p>

        <p style="margin:8px 0;">
          <strong>Team Lead:</strong>
          ${leadName}
        </p>

        <p style="margin:8px 0;">
          <strong>Venue:</strong>
          ${venue}
        </p>

        <p
          style="
            margin:8px 0;
            color:#15803d;
            font-weight:bold;
          "
        >
          Status: APPROVED
        </p>

      </div>


      <!-- EVENT PASS -->

      <div
        style="
          border:1px solid #dbeafe;
          background:#eff6ff;
          border-radius:12px;
          padding:20px;
          margin:25px 0;
        "
      >

        <h3
          style="
            color:#1d4ed8;
            margin-top:0;
          "
        >
          🎟️ Your Event Pass
        </h3>

        <p
          style="
            color:#475569;
            line-height:1.6;
          "
        >
          Your official Event Pass PDF
          is attached to this email.
        </p>

        <p
          style="
            color:#475569;
            line-height:1.6;
          "
        >
          Please keep the Event Pass safely
          and bring it to the event for check-in.
        </p>

      </div>


      <!-- CHECK-IN -->

      <div
        style="
          background:#f0fdf4;
          border-radius:12px;
          padding:20px;
          margin:25px 0;
        "
      >

        <h3 style="color:#166534;">
          📱 Check-in Instructions
        </h3>

        <p
          style="
            color:#475569;
            line-height:1.6;
          "
        >
          Show the QR code from your Event Pass
          at the registration/check-in desk.
        </p>

        <p
          style="
            color:#475569;
            line-height:1.6;
          "
        >
          The QR code will be scanned to verify
          your team registration.
        </p>

      </div>


      ${whatsappSection}


      <p
        style="
          color:#64748b;
          font-size:13px;
          line-height:1.6;
          margin-top:30px;
        "
      >
        Please make sure all four team members
        have received this confirmation email.
      </p>

    </div>


    <!-- FOOTER -->

    <div
      style="
        background:#f8fafc;
        padding:20px;
        text-align:center;
        border-top:1px solid #e2e8f0;
      "
    >

      <p
        style="
          color:#64748b;
          font-size:12px;
          margin:0;
        "
      >
        S4DS Datathon '26
        • Official Event Communication
      </p>

    </div>

  </div>

</body>

</html>
`;

  // ------------------------------------------
  // 10. Send Through Brevo
  // ------------------------------------------

  return await sendEmail({
    to: uniqueRecipients,

    subject:
      `🎉 S4DS Datathon 2026 — ${teamName} Approved`,

    htmlContent,

    attachment: [
      {
        content: pdfBase64,
        name: passFileName,
      },
    ],
  });
};