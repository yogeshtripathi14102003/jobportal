import { validationResult, body, param } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Run after validator chains.
 * If there are errors, throw ApiError.badRequest with all field messages.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    throw ApiError.badRequest("Validation failed", formatted);
  }
  next();
};

// ─── Auth: Register ────────────────────────────────────────────────────────────
export const registerValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 100 }).withMessage("Name max 100 chars"),

  body("email")
    .normalizeEmail()
    .isEmail().withMessage("Valid email required"),

  body("password")
    .isLength({ min: 6 }).withMessage("Password min 6 chars"),

  // Public register se sirf student ban sakta hai
  body("role")
    .optional()
    .isIn(["student"]).withMessage("Only 'student' role allowed on self-registration"),
];

// ─── Auth: Login ───────────────────────────────────────────────────────────────
export const loginValidators = [
  body("email")
    .normalizeEmail()
    .isEmail().withMessage("Valid email required"),

  body("password")
    .notEmpty().withMessage("Password required"),
];

// ─── Auth: OTP ─────────────────────────────────────────────────────────────────
export const otpValidators = [
  body("email")
    .normalizeEmail()
    .isEmail().withMessage("Valid email required"),

  body("otp")
    .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
    .isNumeric().withMessage("OTP must be numeric"),
];

// ─── Reusable: MongoDB ObjectId param ─────────────────────────────────────────
export const mongoIdParam = (paramName = "id") => [
  param(paramName)
    .isMongoId().withMessage(`${paramName} must be a valid MongoDB ObjectId`),
];

// ─── Course ────────────────────────────────────────────────────────────────────
export const courseValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Course name required"),

  body("code")
    .trim()
    .notEmpty().withMessage("Course code required")
    .toUpperCase(),

  body("durationYears")
    .isInt({ min: 1, max: 7 }).withMessage("Duration must be 1–7 years"),

  body("type")
    .optional()
    .isIn(["undergraduate", "postgraduate", "diploma", "certificate"])
    .withMessage("Invalid course type"),
];

// ─── Branch ────────────────────────────────────────────────────────────────────
export const branchValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Branch name required"),

  body("code")
    .trim()
    .notEmpty().withMessage("Branch code required")
    .toUpperCase(),

  body("course")
    .isMongoId().withMessage("Valid course ID required"),
];

// ─── Specialization ────────────────────────────────────────────────────────────
export const specializationValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Specialization name required"),

  body("code")
    .trim()
    .notEmpty().withMessage("Specialization code required")
    .toUpperCase(),

  body("branch")
    .isMongoId().withMessage("Valid branch ID required"),

  body("course")
    .isMongoId().withMessage("Valid course ID required"),
];

// ─── Admin: Create User (counsellor / subadmin) ────────────────────────────────
export const createUserByAdminValidators = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 100 }).withMessage("Name max 100 chars"),

  body("email")
    .normalizeEmail()
    .isEmail().withMessage("Valid email required"),

  body("password")
    .isLength({ min: 6 }).withMessage("Password min 6 chars"),

  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["counsellor", "subadmin"]).withMessage("Admin can only create: counsellor | subadmin"),

  body("phone")
    .optional()
    .matches(/^[6-9]\d{9}$/).withMessage("Valid 10-digit Indian phone required"),

  body("course")
    .optional()
    .isMongoId().withMessage("course must be valid MongoDB ObjectId"),

  body("branch")
    .optional()
    .isMongoId().withMessage("branch must be valid MongoDB ObjectId"),

  body("specialization")
    .optional()
    .isMongoId().withMessage("specialization must be valid MongoDB ObjectId"),
];

// ─── Admin: Update User ────────────────────────────────────────────────────────
export const updateUserValidators = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Name max 100 chars"),

  body("email")
    .optional()
    .normalizeEmail()
    .isEmail().withMessage("Valid email required"),

  body("phone")
    .optional()
    .matches(/^[6-9]\d{9}$/).withMessage("Valid 10-digit Indian phone required"),

  body("role")
    .optional()
    .isIn(["admin", "subadmin", "counsellor", "student"]).withMessage("Invalid role"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "blocked"]).withMessage("Status: active | inactive | blocked"),

  body("semester")
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage("Semester must be 1–12"),

  body("admissionYear")
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage("Valid admission year required"),

  body("course")
    .optional()
    .isMongoId().withMessage("course must be valid MongoDB ObjectId"),

  body("branch")
    .optional()
    .isMongoId().withMessage("branch must be valid MongoDB ObjectId"),

  body("specialization")
    .optional()
    .isMongoId().withMessage("specialization must be valid MongoDB ObjectId"),
];

// ─── Admin: Assign Students to Counsellor ─────────────────────────────────────
export const assignStudentsValidators = [
  body("studentIds")
    .isArray({ min: 1 }).withMessage("studentIds must be a non-empty array"),

  body("studentIds.*")
    .isMongoId().withMessage("Each studentId must be a valid MongoDB ObjectId"),
];


// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPasswordValidators = [
  body("email")
    .normalizeEmail()
    .isEmail().withMessage("Valid email required"),
];

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPasswordValidators = [
  body("token")
    .notEmpty().withMessage("Reset token is required"),

  body("newPassword")
    .isLength({ min: 6 }).withMessage("Password min 6 chars"),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePasswordValidators = [
  body("oldPassword")
    .notEmpty().withMessage("Current password required"),

  body("newPassword")
    .isLength({ min: 6 }).withMessage("New password min 6 chars"),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];


