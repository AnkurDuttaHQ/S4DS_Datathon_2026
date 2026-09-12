import express from "express";

import {
  loginAdmin,
  getAllRegistrations,
  getRegistrationById,
  approveRegistration,
  markPaymentRequired,
  rejectRegistration,
  exportRegistrations
} from "../controllers/admin.controllers.js";

import {
  resendApprovalEmail,
} from "../controllers/admin.controllers.js";

import {
  authMiddleware,
} from "../middlewares/auth.middleware.js";


const router =
  express.Router();


// LOGIN
router.post(
  "/login",
  loginAdmin
);


// ALL REGISTRATIONS
router.get(
  "/registrations",
  authMiddleware,
  getAllRegistrations
);

router.get(
  "/registrations/export",
  authMiddleware,
  exportRegistrations
);

// SINGLE REGISTRATION
router.get(
  "/registrations/:registrationId",
  authMiddleware,
  getRegistrationById
);


// APPROVE
router.patch(
  "/registrations/:registrationId/approve",
  authMiddleware,
  approveRegistration
);


// PAYMENT REQUIRED
router.patch(
  "/registrations/:registrationId/payment-required",
  authMiddleware,
  markPaymentRequired
);


// REJECT
router.patch(
  "/registrations/:registrationId/reject",
  authMiddleware,
  rejectRegistration
);

router.post(
  "/registrations/:registrationId/resend-approval-email",
  authMiddleware,
  resendApprovalEmail
);

export default router;