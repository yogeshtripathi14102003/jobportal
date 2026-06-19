// import { Router } from "express";
// import multer from "multer";
// import * as EmployeeController from "../../hrms/controllers/employee.controller.js";

// import { protect, allowRoles } from "../../../middlewares/auth.middleware.js";
// import { validate, mongoIdParam } from "../../../middlewares/validate.middleware.js";
// import { body } from "express-validator";

// const router  = Router();

// // Memory storage — buffer Cloudinary ko bhejenge
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith("image/")) {
//       return cb(new Error("Only image files allowed"), false);
//     }
//     cb(null, true);
//   },
// });

// const employeeUpload = upload.fields([
//   { name: "profilePhoto", maxCount: 1 },
//   { name: "faceImages",   maxCount: 3 },
// ]);

// router.use(protect);

// // ── Admin only ─────────────────────────────────────────────────────────────────
// router.post(
//   "/",
//   allowRoles("admin"),
//   employeeUpload,
//   [
//     body("name").trim().notEmpty().withMessage("Name required"),
//     body("email").normalizeEmail().isEmail().withMessage("Valid email required"),
//     body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
//     body("department").trim().notEmpty().withMessage("Department required"),
//     body("designation").trim().notEmpty().withMessage("Designation required"),
//   ],
//   validate,
//   EmployeeController.addEmployee
// );

// router.get(
//   "/",
//   allowRoles("admin"),
//   EmployeeController.getAllEmployees
// );

// router.get(
//   "/:id",
//   allowRoles("admin"),
//   mongoIdParam("id"),
//   validate,
//   EmployeeController.getEmployee
// );

// router.patch(
//   "/:id",
//   allowRoles("admin"),
//   employeeUpload,
//   mongoIdParam("id"),
//   validate,
//   EmployeeController.updateEmployee
// );

// router.delete(
//   "/:id",
//   allowRoles("admin"),
//   mongoIdParam("id"),
//   validate,
//   EmployeeController.deleteEmployee
// );

// // ── Employee: own profile ──────────────────────────────────────────────────────
// router.get(
//   "/me/profile",
//   allowRoles("employee"),
//   EmployeeController.getMyProfile
// );

// export default router;
import { Router } from "express";
import * as EmployeeController from "../controllers/employee.controller.js";
import { protect, allowRoles } from "../../../middlewares/auth.middleware.js";
import { validate, mongoIdParam } from "../../../middlewares/validate.middleware.js";
import { upload } from "../../../utils/upload.js";  // ← local upload
import { body } from "express-validator";

const router = Router();

// ── Multer fields config ───────────────────────────────────────────────────────
const employeeUpload = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "faceImages",   maxCount: 3 },
]);

router.use(protect);

// ── Employee: own profile ──────────────────────────────────────────────────────
// ⚠️ /me/profile pehle hona chahiye — warna /:id se match ho jaata hai
router.get(
  "/me/profile",
  allowRoles("employee"),
  EmployeeController.getMyProfile
);

// ── Admin only ─────────────────────────────────────────────────────────────────

// POST /api/hrms/employees
router.post(
  "/",
  allowRoles("admin"),
  employeeUpload,
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").normalizeEmail().isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("department").trim().notEmpty().withMessage("Department required"),
    body("designation").trim().notEmpty().withMessage("Designation required"),
    body("phone")
      .optional()
      .matches(/^[6-9]\d{9}$/).withMessage("Valid 10-digit phone required"),
    body("salary")
      .optional()
      .isNumeric().withMessage("Salary must be a number"),
    body("employmentType")
      .optional()
      .isIn(["full-time", "part-time", "contract", "intern"])
      .withMessage("Invalid employment type"),
    body("shiftStart")
      .optional()
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("shiftStart format: HH:MM"),
    body("shiftEnd")
      .optional()
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("shiftEnd format: HH:MM"),
  ],
  validate,
  EmployeeController.addEmployee
);

// GET /api/hrms/employees?department=IT&status=active&search=rahul&page=1&limit=10
router.get(
  "/",
  allowRoles("admin", "subadmin"),
  EmployeeController.getAllEmployees
);

// GET /api/hrms/employees/:id
router.get(
  "/:id",
  allowRoles("admin", "subadmin"),
  mongoIdParam("id"),
  validate,
  EmployeeController.getEmployee
);

// PATCH /api/hrms/employees/:id
router.patch(
  "/:id",
  allowRoles("admin"),
  employeeUpload,
  mongoIdParam("id"),
  [
    body("department").optional().trim().notEmpty(),
    body("designation").optional().trim().notEmpty(),
    body("phone")
      .optional()
      .matches(/^[6-9]\d{9}$/).withMessage("Valid 10-digit phone required"),
    body("salary")
      .optional()
      .isNumeric().withMessage("Salary must be a number"),
    body("status")
      .optional()
      .isIn(["active", "inactive", "terminated"])
      .withMessage("Invalid status"),
    body("employmentType")
      .optional()
      .isIn(["full-time", "part-time", "contract", "intern"])
      .withMessage("Invalid employment type"),
    body("shiftStart")
      .optional()
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("shiftStart format: HH:MM"),
    body("shiftEnd")
      .optional()
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("shiftEnd format: HH:MM"),
  ],
  validate,
  EmployeeController.updateEmployee
);

// DELETE /api/hrms/employees/:id  (soft delete — status: terminated)
router.delete(
  "/:id",
  allowRoles("admin"),
  mongoIdParam("id"),
  validate,
  EmployeeController.deleteEmployee
);

export default router;