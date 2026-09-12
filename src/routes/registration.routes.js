import express from 'express';

import { createRegistration } from '../controllers/registration.controllers.js';
const router = express.Router();

router.post("/",createRegistration);

export default router;