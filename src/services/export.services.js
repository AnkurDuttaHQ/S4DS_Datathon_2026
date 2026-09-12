import XLSX from "xlsx";
import Registration from "../models/Registration.js";

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const yesNo = (value) => {
  if (value === true) return "YES";
  if (value === false) return "NO";
  return "";
};

export const exportRegistrationsToExcel = async () => {
  // --------------------------------------------------
  // 1. GET ALL REGISTRATIONS
  // --------------------------------------------------

  const registrations = await Registration.find({})
    .sort({ createdAt: 1 })
    .lean();

  // --------------------------------------------------
  // 2. REGISTRATION SHEET
  // --------------------------------------------------

  const registrationData = registrations.map((registration) => {
    const lead = registration.lead || {};
    const members = registration.members || [];

    const allMembers = [lead, ...members];

    const totalS4dsMembers = allMembers.filter(
      (member) => member.s4dsMember === true
    ).length;

    const totalNonS4dsMembers = allMembers.filter(
      (member) => member.s4dsMember === false
    ).length;

    return {
      "Registration ID": registration.registrationId || "",

      "Team Name": registration.team?.name || "",

      "Status": registration.status || "",

      // ----------------------------------------------
      // LEAD
      // ----------------------------------------------

      "Lead Name": lead.fullName || "",
      "Lead Email": lead.email || "",
      "Lead Phone": lead.phoneNumber || "",
      "Lead College": lead.college || "",
      "Lead Department": lead.department || "",
      "Lead Academic Year": lead.academicYear || "",
      "Lead S4DS Member": yesNo(lead.s4dsMember),

      // ----------------------------------------------
      // MEMBER 2
      // ----------------------------------------------

      "Member 2 Name": members[0]?.fullName || "",
      "Member 2 Email": members[0]?.email || "",
      "Member 2 College": members[0]?.college || "",
      "Member 2 Department": members[0]?.department || "",
      "Member 2 Academic Year": members[0]?.academicYear || "",
      "Member 2 S4DS Member": yesNo(
        members[0]?.s4dsMember
      ),

      // ----------------------------------------------
      // MEMBER 3
      // ----------------------------------------------

      "Member 3 Name": members[1]?.fullName || "",
      "Member 3 Email": members[1]?.email || "",
      "Member 3 College": members[1]?.college || "",
      "Member 3 Department": members[1]?.department || "",
      "Member 3 Academic Year": members[1]?.academicYear || "",
      "Member 3 S4DS Member": yesNo(
        members[1]?.s4dsMember
      ),

      // ----------------------------------------------
      // MEMBER 4
      // ----------------------------------------------

      "Member 4 Name": members[2]?.fullName || "",
      "Member 4 Email": members[2]?.email || "",
      "Member 4 College": members[2]?.college || "",
      "Member 4 Department": members[2]?.department || "",
      "Member 4 Academic Year": members[2]?.academicYear || "",
      "Member 4 S4DS Member": yesNo(
        members[2]?.s4dsMember
      ),

      // ----------------------------------------------
      // MEMBER SUMMARY
      // ----------------------------------------------

      "Total S4DS Members": totalS4dsMembers,

      "Total Non-S4DS Members": totalNonS4dsMembers,

      // ----------------------------------------------
      // PAYMENT
      // ----------------------------------------------

      "Fee": registration.fee ?? 0,

      "Payment Required": registration.payment?.required
        ? "YES"
        : "NO",

      "Payment Status":
        registration.payment?.status || "",

      "UTR / Transaction ID":
        registration.payment?.utr || "",

      "Payment Screenshot URL":
        registration.payment?.screenshotUrl || "",

      // ----------------------------------------------
      // ADMIN REVIEW
      // ----------------------------------------------

      "Admin Decision":
        registration.adminReview?.decision || "",

      "Admin Notes":
        registration.adminReview?.notes || "",

      "Rejection Reason":
        registration.rejectionReason || "",

      // ----------------------------------------------
      // DATES
      // ----------------------------------------------

      "Registered At":
        formatDate(registration.createdAt),

      "Last Updated":
        formatDate(registration.updatedAt),
    };
  });

  const registrationWorksheet =
    XLSX.utils.json_to_sheet(registrationData);

  // Column widths
  registrationWorksheet["!cols"] = [
    { wch: 18 }, // Registration ID
    { wch: 25 }, // Team Name
    { wch: 22 }, // Status

    // Lead
    { wch: 22 },
    { wch: 32 },
    { wch: 17 },
    { wch: 30 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },

    // Member 2
    { wch: 22 },
    { wch: 32 },
    { wch: 30 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },

    // Member 3
    { wch: 22 },
    { wch: 32 },
    { wch: 30 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },

    // Member 4
    { wch: 22 },
    { wch: 32 },
    { wch: 30 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },

    // Summary
    { wch: 20 },
    { wch: 24 },

    // Payment
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 24 },
    { wch: 45 },

    // Admin
    { wch: 22 },
    { wch: 30 },
    { wch: 30 },

    // Dates
    { wch: 25 },
    { wch: 25 },
  ];

  // Freeze first row
  registrationWorksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
  };

  // --------------------------------------------------
  // 3. PAYMENT DETAILS SHEET
  // --------------------------------------------------

  const paymentData = registrations.map((registration) => {
    const lead = registration.lead || {};

    return {
      "Registration ID":
        registration.registrationId || "",

      "Team Name":
        registration.team?.name || "",

      "Lead Name":
        lead.fullName || "",

      "Lead Email":
        lead.email || "",

      "Lead Phone":
        lead.phoneNumber || "",

      "Fee":
        registration.fee ?? 0,

      "Payment Required":
        registration.payment?.required
          ? "YES"
          : "NO",

      "Payment Status":
        registration.payment?.status || "",

      "UTR / Transaction ID":
        registration.payment?.utr || "",

      "Payment Screenshot URL":
        registration.payment?.screenshotUrl || "",

      "Admin Decision":
        registration.adminReview?.decision || "",

      "Rejection Reason":
        registration.rejectionReason || "",

      "Registered At":
        formatDate(registration.createdAt),
    };
  });

  const paymentWorksheet =
    XLSX.utils.json_to_sheet(paymentData);

  paymentWorksheet["!cols"] = [
    { wch: 18 },
    { wch: 25 },
    { wch: 22 },
    { wch: 32 },
    { wch: 17 },
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 24 },
    { wch: 50 },
    { wch: 22 },
    { wch: 30 },
    { wch: 25 },
  ];

  paymentWorksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
  };

  // --------------------------------------------------
  // 4. SUMMARY SHEET
  // --------------------------------------------------

  const totalRegistrations =
    registrations.length;

  const underVerification =
    registrations.filter(
      (registration) =>
        registration.status === "UNDER_VERIFICATION"
    ).length;

  const paymentRequired =
    registrations.filter(
      (registration) =>
        registration.status === "PAYMENT_REQUIRED"
    ).length;

  const paymentSubmitted =
    registrations.filter(
      (registration) =>
        registration.status === "PAYMENT_SUBMITTED"
    ).length;

  const approved =
    registrations.filter(
      (registration) =>
        registration.status === "APPROVED"
    ).length;

  const rejected =
    registrations.filter(
      (registration) =>
        registration.status === "REJECTED"
    ).length;

  const freeTeams =
    registrations.filter(
      (registration) =>
        registration.fee === 0
    ).length;

  const paidTeams =
    registrations.filter(
      (registration) =>
        registration.fee === 100
    ).length;

  const totalExpectedPayment =
    registrations.reduce(
      (total, registration) =>
        total + (registration.fee || 0),
      0
    );

  const totalCollectedPayment =
    registrations
      .filter(
        (registration) =>
          registration.payment?.status === "VERIFIED"
      )
      .reduce(
        (total, registration) =>
          total + (registration.fee || 0),
        0
      );

  // IMPORTANT:
  // This is based on registration count because
  // one registration = one team = one slot.
  const totalSlots = 50;

  const occupiedSlots =
    registrations.filter(
      (registration) =>
        registration.status !== "REJECTED"
    ).length;

  const remainingSlots =
    Math.max(
      totalSlots - occupiedSlots,
      0
    );

  const summaryData = [
    {
      "Metric": "Total Registrations",
      "Value": totalRegistrations,
    },

    {
      "Metric": "Total Capacity",
      "Value": totalSlots,
    },

    {
      "Metric": "Occupied Slots",
      "Value": occupiedSlots,
    },

    {
      "Metric": "Remaining Slots",
      "Value": remainingSlots,
    },

    {
      "Metric": "Approved Teams",
      "Value": approved,
    },

    {
      "Metric": "Under Verification",
      "Value": underVerification,
    },

    {
      "Metric": "Payment Required",
      "Value": paymentRequired,
    },

    {
      "Metric": "Payment Submitted",
      "Value": paymentSubmitted,
    },

    {
      "Metric": "Rejected Teams",
      "Value": rejected,
    },

    {
      "Metric": "Free Teams",
      "Value": freeTeams,
    },

    {
      "Metric": "₹100 Teams",
      "Value": paidTeams,
    },

    {
      "Metric": "Total Expected Payment",
      "Value": `₹${totalExpectedPayment}`,
    },

    {
      "Metric": "Total Verified Payment",
      "Value": `₹${totalCollectedPayment}`,
    },
  ];

  const summaryWorksheet =
    XLSX.utils.json_to_sheet(summaryData);

  summaryWorksheet["!cols"] = [
    { wch: 32 },
    { wch: 25 },
  ];

  // --------------------------------------------------
  // 5. CREATE WORKBOOK
  // --------------------------------------------------

  const workbook =
    XLSX.utils.book_new();

  // Sheet 1
  XLSX.utils.book_append_sheet(
    workbook,
    registrationWorksheet,
    "Registrations"
  );

  // Sheet 2
  XLSX.utils.book_append_sheet(
    workbook,
    paymentWorksheet,
    "Payment Details"
  );

  // Sheet 3
  XLSX.utils.book_append_sheet(
    workbook,
    summaryWorksheet,
    "Summary"
  );

  // --------------------------------------------------
  // 6. RETURN EXCEL BUFFER
  // --------------------------------------------------

  const excelBuffer = XLSX.write(
    workbook,
    {
      type: "buffer",
      bookType: "xlsx",
    }
  );

  return excelBuffer;
};