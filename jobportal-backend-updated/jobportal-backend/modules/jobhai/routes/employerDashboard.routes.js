import express from "express";
import * as dashboardController from "../controllers/employerDashboard.controller.js";
import { protectEmployer } from "../middlewares/employerAuth.middleware.js";

const router = express.Router();

router.get("/", protectEmployer, dashboardController.getDashboard);

export default router;
