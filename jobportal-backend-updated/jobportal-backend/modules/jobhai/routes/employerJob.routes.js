import express from "express";
import * as jobController from "../controllers/employerJob.controller.js";
import { protectEmployer } from "../middlewares/employerAuth.middleware.js";
import requirePermission from "../middlewares/permission.middleware.js";
import validateObjectId from "../../../middlewares/validateObjectId.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { createJobValidator, updateJobValidator } from "../validators/employerJob.validator.js";

const router = express.Router();

router.use(protectEmployer);

router.post("/", requirePermission("canPostJobs"), createJobValidator, validate, jobController.createJob);
router.get("/", jobController.getMyJobs);
router.get("/:id", validateObjectId("id"), jobController.getMyJobById);
router.patch(
  "/:id",
  validateObjectId("id"),
  requirePermission("canPostJobs"),
  updateJobValidator,
  validate,
  jobController.updateJob
);
router.delete("/:id", validateObjectId("id"), requirePermission("canPostJobs"), jobController.deleteJob);

export default router;
