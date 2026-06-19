import { body } from "express-validator";

const inviteRecruiterValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").optional().trim(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("permissions.canPostJobs").optional().isBoolean(),
  body("permissions.canManageApplicants").optional().isBoolean(),
  body("permissions.canManageRecruiters").optional().isBoolean(),
];

const updateRecruiterValidator = [
  body("name").optional().trim().notEmpty(),
  body("phone").optional().trim(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Status must be active or inactive"),
  body("permissions.canPostJobs").optional().isBoolean(),
  body("permissions.canManageApplicants").optional().isBoolean(),
  body("permissions.canManageRecruiters").optional().isBoolean(),
];

export { inviteRecruiterValidator, updateRecruiterValidator };
