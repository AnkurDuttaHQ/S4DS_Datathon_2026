import express from "express";

import {
  submitPayment
} from "../controllers/payment.controller.js";

import upload from "../middlewares/upload.middleware.js";


const router = express.Router();


// ==========================================
// SUBMIT PAYMENT USING SECURE TOKEN
// ==========================================

router.patch(
  "/:token",
  upload.any(),
  submitPayment
);


export default router;