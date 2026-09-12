import express from "express";

import {
  getCheckInDetails,
} from "../controllers/check-in.controllers.js";

const router = express.Router();

router.get(
  "/:registrationId",
  getCheckInDetails
);

export default router;