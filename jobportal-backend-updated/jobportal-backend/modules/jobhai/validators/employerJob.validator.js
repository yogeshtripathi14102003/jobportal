import { body } from "express-validator";

const JOB_CATEGORIES = [
  "sales_marketing",
  "bpo_customer_support",
  "delivery_logistics",
  "security_guard",
  "technician_repair",
  "retail_shop",
  "driver",
  "other",
];

const JOB_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "work_from_home",
  "internship",
];

const createJobValidator = [
  body("title").trim().notEmpty().withMessage("Job title is required"),
  body("category").isIn(JOB_CATEGORIES).withMessage("Invalid category"),
  body("jobType").optional().isIn(JOB_TYPES).withMessage("Invalid job type"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("locality").optional().trim(),
  body("salaryMin").isNumeric().withMessage("Minimum salary must be a number"),
  body("salaryMax").optional().isNumeric().withMessage("Maximum salary must be a number"),
  body("educationRequired")
    .optional()
    .isIn(["10th", "12th", "graduate", "post_graduate", "any"])
    .withMessage("Invalid education requirement"),
  body("experienceRequired")
    .optional()
    .isIn(["fresher", "0-1", "1-3", "3-5", "5+"])
    .withMessage("Invalid experience requirement"),
  body("vacancies").optional().isInt({ min: 1 }).withMessage("Vacancies must be at least 1"),
  body("languagesRequired").optional().isArray().withMessage("languagesRequired must be an array"),
  body("isUrgent").optional().isBoolean(),
  body("expiresAt").optional().isISO8601().withMessage("expiresAt must be a valid date"),
];

const updateJobValidator = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("category").optional().isIn(JOB_CATEGORIES).withMessage("Invalid category"),
  body("jobType").optional().isIn(JOB_TYPES).withMessage("Invalid job type"),
  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
  body("city").optional().trim().notEmpty().withMessage("City cannot be empty"),
  body("salaryMin").optional().isNumeric(),
  body("salaryMax").optional().isNumeric(),
  body("vacancies").optional().isInt({ min: 1 }),
  body("isUrgent").optional().isBoolean(),
];

export { createJobValidator, updateJobValidator };
