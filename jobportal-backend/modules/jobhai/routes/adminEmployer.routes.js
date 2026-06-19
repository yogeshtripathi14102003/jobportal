import express from "express";

import * as employerController from "../controllers/adminEmployer.controller.js"
import validateObjectId from "../../../middlewares/validateObjectId.middleware.js";

const router = express.Router();

// NOTE: mount with your existing auth middleware + restrictTo('admin')
// e.g.
// app.use(
//   "/api/admin/employers",
//   protect,
//   restrictTo("admin"),
//   router
// );

router.get("/stats/summary", employerController.getEmployerStats);

router.get("/", employerController.getEmployers);

router.get(
  "/:id",
  validateObjectId("id"),
  employerController.getEmployerById
);

router.patch(
  "/:id/verify",
  validateObjectId("id"),
  employerController.verifyEmployer
);

router.patch(
  "/:id/reject",
  validateObjectId("id"),
  employerController.rejectEmployer
);

router.patch(
  "/:id/suspend",
  validateObjectId("id"),
  employerController.suspendEmployer
);

router.patch(
  "/:id/restore",
  validateObjectId("id"),
  employerController.restoreEmployer
);

router.patch(
  "/:id/plan",
  validateObjectId("id"),
  employerController.updateEmployerPlan
);

router.delete(
  "/:id",
  validateObjectId("id"),
  employerController.deleteEmployer
);

export default router;