import express from "express";
import { getCapacityController } from "../controllers/capacity.controllers.js";

const router = express.Router();

router.get("/", getCapacityController);

export default router;