import express from "express";
import * as authController from "../controllers/employerAuth.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { authLimiter, refreshLimiter } from "../../../config/rateLimiter.js";
import { registerEmployerValidator, loginValidator } from "../validators/employerAuth.validator.js";
import { protectEmployer } from "../middlewares/employerAuth.middleware.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.post("/register", authLimiter, registerEmployerValidator, validate, authController.register);
router.post("/login", authLimiter, loginValidator, validate, authController.login);
router.post("/refresh", refreshLimiter, authController.refresh);

// ── Protected ───────────────────────────────────────────────────────────────
router.post("/logout", protectEmployer, authController.logout);
router.get("/me", protectEmployer, authController.getMe);

export default router;
