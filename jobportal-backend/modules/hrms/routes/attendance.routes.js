// import { Router } from "express";
// import multer from "multer";
// import * as AttendanceController from "../../hrms/controllers/attendance.controller.js";
// import { protect, allowRoles } from "../../../middlewares/auth.middleware.js";
// import { validate, mongoIdParam } from "../../../middlewares/validate.middleware.js";
// import { body, query } from "express-validator";

// const router = Router();

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits:  { fileSize: 3 * 1024 * 1024 }, // 3MB selfie
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith("image/")) {
//       return cb(new Error("Only image files allowed"), false);
//     }
//     cb(null, true);
//   },
// });

// router.use(protect);

// // ── Employee routes ────────────────────────────────────────────────────────────

// // POST /api/attendance/punch
// router.post(
//   "/punch",
//   allowRoles("employee"),
//   upload.fields([{ name: "selfie", maxCount: 1 }]),
//   [
//     body("type").isIn(["in", "out"]).withMessage("type must be 'in' or 'out'"),
//     body("method").isIn(["face", "manual"]).withMessage("method must be 'face' or 'manual'"),
//     body("latitude").optional().isFloat({ min: -90, max: 90 }),
//     body("longitude").optional().isFloat({ min: -180, max: 180 }),
//     body("faceConfidence").optional().isFloat({ min: 0, max: 1 }),
//   ],
//   validate,
//   AttendanceController.punch
// );

// // GET /api/attendance/today
// router.get(
//   "/today",
//   allowRoles("employee"),
//   AttendanceController.getTodayAttendance
// );

// // GET /api/attendance/my?month=6&year=2026
// router.get(
//   "/my",
//   allowRoles("employee"),
//   [
//     query("month").optional().isInt({ min: 1, max: 12 }),
//     query("year").optional().isInt({ min: 2020 }),
//   ],
//   validate,
//   AttendanceController.getMyAttendance
// );

// // ── Admin routes ───────────────────────────────────────────────────────────────

// // GET /api/attendance?date=2026-06-10&department=IT
// router.get(
//   "/",
//   allowRoles("admin"),
//   AttendanceController.getAllAttendance
// );

// // PATCH /api/attendance/:id/override
// router.patch(
//   "/:id/override",
//   allowRoles("admin"),
//   mongoIdParam("id"),
//   [
//     body("status")
//       .isIn(["present", "absent", "half-day", "late", "on-leave"])
//       .withMessage("Invalid status"),
//   ],
//   validate,
//   AttendanceController.overrideAttendance
// );

// // GET /api/attendance/summary/:employeeId?month=6&year=2026
// router.get(
//   "/summary/:employeeId",
//   allowRoles("admin"),
//   mongoIdParam("employeeId"),
//   validate,
//   AttendanceController.getMonthlySummary
// );

// export default router;
import { Router } from "express";
import multer       from "multer";
import * as AttendanceController from "../../hrms/controllers/attendance.controller.js";
import { protect, allowRoles }   from "../../../middlewares/auth.middleware.js";
import { validate, mongoIdParam } from "../../../middlewares/validate.middleware.js";
import { body, query }           from "express-validator";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"), false);
    }
    cb(null, true);
  },
});

router.use(protect);

// ── Employee routes ────────────────────────────────────────────────────────────

// POST /api/attendance/enroll-face
// Body (JSON): { faceDescriptor: number[] }  ← 128 floats
router.post(
  "/enroll-face",
  allowRoles("employee"),
  [
    body("faceDescriptor")
      .notEmpty()
      .withMessage("faceDescriptor is required (array of 128 numbers)"),
  ],
  validate,
  AttendanceController.enrollFace
);

// GET /api/attendance/face-status
router.get(
  "/face-status",
  allowRoles("employee"),
  AttendanceController.getFaceStatus
);

// POST /api/attendance/punch
// FormData: type, method, latitude?, longitude?, address?, note?,
//           faceDescriptor? (JSON string), faceConfidence?, selfie (file)
router.post(
  "/punch",
  allowRoles("employee"),
  upload.fields([{ name: "selfie", maxCount: 1 }]),
  [
    body("type")
      .isIn(["in", "out"])
      .withMessage("type must be 'in' or 'out'"),
    body("method")
      .isIn(["face", "manual"])
      .withMessage("method must be 'face' or 'manual'"),
    body("latitude").optional().isFloat({ min: -90,   max: 90 }),
    body("longitude").optional().isFloat({ min: -180, max: 180 }),
    body("faceConfidence").optional().isFloat({ min: 0, max: 1 }),
  ],
  validate,
  AttendanceController.punch
);

// GET /api/attendance/today
router.get(
  "/today",
  allowRoles("employee"),
  AttendanceController.getTodayAttendance
);

// GET /api/attendance/my?month=6&year=2026
router.get(
  "/my",
  allowRoles("employee"),
  [
    query("month").optional().isInt({ min: 1,    max: 12 }),
    query("year").optional().isInt({ min: 2020 }),
  ],
  validate,
  AttendanceController.getMyAttendance
);

// ── Admin routes ───────────────────────────────────────────────────────────────

// GET /api/attendance?date=2026-06-10&department=IT&status=absent
router.get(
  "/",
  allowRoles("admin"),
  AttendanceController.getAllAttendance
);

// PATCH /api/attendance/:id/override
router.patch(
  "/:id/override",
  allowRoles("admin"),
  mongoIdParam("id"),
  [
    body("status")
      .isIn(["present", "absent", "half-day", "late", "on-leave"])
      .withMessage("Invalid status"),
  ],
  validate,
  AttendanceController.overrideAttendance
);

// GET /api/attendance/summary/:employeeId?month=6&year=2026
router.get(
  "/summary/:employeeId",
  allowRoles("admin"),
  mongoIdParam("employeeId"),
  validate,
  AttendanceController.getMonthlySummary
);

export default router;