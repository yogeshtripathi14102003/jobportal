import express from "express";

import dashboardRoutes from "./adminDashboard.routes.js";
import userRoutes from "./adminUser.routes.js";
import employerRoutes from "./adminEmployer.routes.js";
import jobRoutes from "./adminJob.routes.js";

const router = express.Router();

// Final mounted paths (once this index is mounted at /api/admin):
// /api/admin/dashboard
// /api/admin/users
// /api/admin/employers
// /api/admin/jobs

router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/employers", employerRoutes);
router.use("/jobs", jobRoutes);

export default router;