import express from "express";
import { protect, allowRoles } from "../../../middlewares/auth.middleware.js";

// ── Admin-side (job portal moderation) ───────────────────────────────────────
import dashboardRoutes from "./adminDashboard.routes.js";
import userRoutes from "./adminUser.routes.js";
import employerRoutes from "./adminEmployer.routes.js";
import jobRoutes from "./adminJob.routes.js";

// ── Employer-side ─────────────────────────────────────────────────────────────
import employerAuthRoutes from "./employerAuth.routes.js";
import employerProfileRoutes from "./employerProfile.routes.js";
import employerJobRoutes from "./employerJob.routes.js";
import employerRecruiterRoutes from "./employerRecruiter.routes.js";
import employerApplicationRoutes from "./employerApplication.routes.js";
import employerDashboardRoutes from "./employerDashboard.routes.js";

const router = express.Router();

/**
 * Admin sub-router — reuses the ERP-wide login (shared User model, role
 * admin/subadmin). Previously these routes had NO auth applied at all;
 * that's fixed here.
 *
 * Final mounted paths:
 *   /api/jobhai/admin/dashboard
 *   /api/jobhai/admin/users
 *   /api/jobhai/admin/employers
 *   /api/jobhai/admin/jobs
 */
const adminRouter = express.Router();
adminRouter.use(protect, allowRoles("admin", "subadmin"));
adminRouter.use("/dashboard", dashboardRoutes);
adminRouter.use("/users", userRoutes);
adminRouter.use("/employers", employerRoutes);
adminRouter.use("/jobs", jobRoutes);

router.use("/admin", adminRouter);

/**
 * Employer sub-routes — each file applies its own protectEmployer middleware.
 *
 * Final mounted paths:
 *   /api/jobhai/employer/auth/...
 *   /api/jobhai/employer/profile
 *   /api/jobhai/employer/jobs/...
 *   /api/jobhai/employer/recruiters/...
 *   /api/jobhai/employer/applications/...
 *   /api/jobhai/employer/dashboard
 */
router.use("/employer/auth", employerAuthRoutes);
router.use("/employer/profile", employerProfileRoutes);
router.use("/employer/jobs", employerJobRoutes);
router.use("/employer/recruiters", employerRecruiterRoutes);
router.use("/employer/applications", employerApplicationRoutes);
router.use("/employer/dashboard", employerDashboardRoutes);

export default router;
