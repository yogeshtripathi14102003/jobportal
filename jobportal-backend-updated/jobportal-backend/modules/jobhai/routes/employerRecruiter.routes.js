import express from "express";
import * as recruiterController from "../controllers/employerRecruiter.controller.js";
import { protectEmployer } from "../middlewares/employerAuth.middleware.js";
import requirePermission from "../middlewares/permission.middleware.js";
import validateObjectId from "../../../middlewares/validateObjectId.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { inviteRecruiterValidator, updateRecruiterValidator } from "../validators/employerRecruiter.validator.js";

const router = express.Router();

router.use(protectEmployer, requirePermission("canManageRecruiters"));

router.post("/", inviteRecruiterValidator, validate, recruiterController.inviteRecruiter);
router.get("/", recruiterController.getRecruiters);
router.patch("/:id", validateObjectId("id"), updateRecruiterValidator, validate, recruiterController.updateRecruiter);
router.delete("/:id", validateObjectId("id"), recruiterController.removeRecruiter);

export default router;
