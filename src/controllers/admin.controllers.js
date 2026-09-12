import {
  loginAdminService,
  getAllRegistrationsService,
  getRegistrationByIdService,
  approveRegistrationService,
  markPaymentRequiredService,
  rejectRegistrationService,
} from "../services/admin.service.js";

import {
  resendApprovalEmailService,
} from "../services/approval-email.services.js";

import { exportRegistrationsToExcel } from "../services/export.services.js";

// ==========================================
// ADMIN LOGIN
// ==========================================

export const loginAdmin = async (req, res) => {
  try {

    const {
      identifier,
      password,
    } = req.body || {};


    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Username/email and password are required",
      });
    }


    const result =
      await loginAdminService(
        identifier.trim(),
        password
      );


    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });

  } catch (error) {

    console.error(
      "Admin Login Error:",
      error
    );


    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
};


// ==========================================
// GET ALL REGISTRATIONS
// ==========================================

export const getAllRegistrations =
  async (req, res) => {

    try {

      console.log(
        "Admin requested all registrations"
      );


      const registrations =
        await getAllRegistrationsService();


      console.log(
        "Registrations found:",
        registrations.length
      );


      return res.status(200).json({
        success: true,
        data: registrations,
      });

    } catch (error) {

      console.error(
        "Get All Registrations Error:",
        error
      );


      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch registrations",
      });
    }
  };


// ==========================================
// GET SINGLE REGISTRATION
// ==========================================

export const getRegistrationById =
  async (req, res) => {

    try {

      const {
        registrationId,
      } = req.params;


      console.log(
        "Admin requested registration:",
        registrationId
      );


      if (!registrationId) {

        return res.status(400).json({
          success: false,
          message:
            "Registration ID is required",
        });

      }


      const registration =
        await getRegistrationByIdService(
          registrationId
        );


      console.log(
        "Registration found:",
        registration.registrationId
      );


      return res.status(200).json({
        success: true,
        data: registration,
      });

    } catch (error) {

      console.error(
        "Get Registration Error:",
        error
      );


      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch registration",
      });
    }
  };


// ==========================================
// APPROVE REGISTRATION
// ==========================================

export const approveRegistration = async (
  req,
  res
) => {
  try {
    const { registrationId } =
      req.params;

    const result =
      await approveRegistrationService(
        registrationId,
        req.admin.adminId
      );

    return res.status(200).json({
      success: true,

      message:
        result.eventPassGenerated
          ? "Registration approved and event pass generated successfully"
          : "Registration approved, but event pass generation failed",

      data: result.registration,

      eventPassGenerated:
        result.eventPassGenerated,
    });

  } catch (error) {

    console.error(
      "Approval Error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,

      message:
        error.message ||
        "Unable to approve registration",
    });
  }
};

// ==========================================
// PAYMENT REQUIRED
// ==========================================

export const markPaymentRequired =
  async (req, res) => {
    try {
      const {
        registrationId,
      } = req.params;

      const result =
        await markPaymentRequiredService(
          registrationId,
          req.admin.adminId
        );

      return res.status(200).json({
        success: true,

        message:
          "Payment requirement created successfully",

        data: {
          registration:
            result.registration,

          paymentUrl:
            result.paymentUrl,
        },
      });
    } catch (error) {
      console.error(
        "Payment Required Error:",
        error
      );

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to mark payment required",
      });
    }
  };


// ==========================================
// REJECT REGISTRATION
// ==========================================

export const rejectRegistration =
  async (req, res) => {

    try {

      const {
        registrationId,
      } = req.params;


      const {
        reason,
      } = req.body || {};


      const registration =
        await rejectRegistrationService(
          registrationId,
          req.admin.adminId,
          reason
        );


      return res.status(200).json({
        success: true,
        message:
          "Registration rejected successfully",
        data: registration,
      });

    } catch (error) {

      console.error(
        "Reject Registration Error:",
        error
      );


      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to reject registration",
      });
    }
  };

  export const resendApprovalEmail =
  async (req, res) => {
    try {
      const {
        registrationId,
      } = req.params;

      const result =
        await resendApprovalEmailService(
          registrationId
        );

      return res.status(200).json({
        success: true,

        message:
          "Approval email sent successfully",

        data: {
          registration:
            result.registration,

          approvalEmailSent:
            result.approvalEmailSent,

          eventPassGenerated:
            result.eventPassGenerated,
        },
      });

    } catch (error) {
      console.error(
        "Resend Approval Email Error:",
        error
      );

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,

        message:
          error.message ||
          "Failed to send approval email",
      });
    }
  };

  export const exportRegistrations = async (req, res) => {
  try {
    const excelBuffer =
      await exportRegistrationsToExcel();

    const filename =
      `S4DS_Datathon_2026_Registrations_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return res.status(200).send(excelBuffer);

  } catch (error) {
    console.error(
      "Excel Export Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to export registrations",
    });
  }
};