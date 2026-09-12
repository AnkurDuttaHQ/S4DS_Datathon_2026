import express from "express";

import {
  getEventPass,
} from "../controllers/event-pass.controllers.js";

const router = express.Router();

router.get(
  "/:registrationId",
  getEventPass
);

export default router;