import express from "express";

import {
  getPaymentPage
} from "../controllers/payment-page.controllers.js";

const router = express.Router();

router.get(
  "/:token",
  getPaymentPage
);

export default router;