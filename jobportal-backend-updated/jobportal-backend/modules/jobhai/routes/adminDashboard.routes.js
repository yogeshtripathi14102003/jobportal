import express from "express";
import * as dashboardController from "../controllers/adminDashboard.controller.js";

const router = express.Router();

// NOTE: mount with your existing auth middleware + restrictTo("admin")
// Example:
// app.use(
//   "/api/admin/dashboard",
//   protect,
//   restrictTo("admin"),
//   router
// );

router.get("/", dashboardController.getDashboardOverview);

export default router;