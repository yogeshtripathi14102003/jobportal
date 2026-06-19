import express from "express";
import * as applicationController from "../controllers/employerApplication.controller.js";
import { protectEmployer } from "../middlewares/employerAuth.middleware.js";
import requirePermission from "../middlewares/permission.middleware.js";
import validateObjectId from "../../../middlewares/validateObjectId.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { updateApplicationStatusValidator } from "../validators/employerApplication.validator.js";

const router = express.Router();

router.use(protectEmployer, requirePermission("canManageApplicants"));

router.get("/job/:jobId", validateObjectId("jobId"), applicationController.getApplicantsForJob);
router.get("/:id", validateObjectId("id"), applicationController.getApplicationById);
router.patch(
  "/:id/status",
  validateObjectId("id"),
  updateApplicationStatusValidator,
  validate,
  applicationController.updateApplicationStatus
);

export default router;
