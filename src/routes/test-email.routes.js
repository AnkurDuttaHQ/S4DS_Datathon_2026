import express from "express";

import {
  testEmail,
} from "../controllers/test-email.controller.js";

const router = express.Router();

router.get("/", testEmail);

export default router;