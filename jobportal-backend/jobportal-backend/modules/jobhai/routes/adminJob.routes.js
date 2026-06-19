import express from "express";

import * as jobController from "../controllers/adminJob.controller.js";
import validateObjectId from "../../../middlewares/validateObjectId.middleware.js";

const router = express.Router();

// NOTE: mount with your existing auth middleware + restrictTo("admin")
// e.g.
// app.use(
//   "/api/admin/jobs",
//   protect,
//   restrictTo("admin"),
//   router
// );

router.get("/stats/summary", jobController.getJobStats);

router.get("/", jobController.getJobs);

router.get(
  "/:id",
  validateObjectId("id"),
  jobController.getJobById
);

router.patch(
  "/:id/approve",
  validateObjectId("id"),
  jobController.approveJob
);

router.patch(
  "/:id/reject",
  validateObjectId("id"),
  jobController.rejectJob
);

router.patch(
  "/:id/flag",
  validateObjectId("id"),
  jobController.flagJob
);

router.patch(
  "/:id/remove",
  validateObjectId("id"),
  jobController.removeJob
);

router.delete(
  "/:id",
  validateObjectId("id"),
  jobController.deleteJob
);

export default router;