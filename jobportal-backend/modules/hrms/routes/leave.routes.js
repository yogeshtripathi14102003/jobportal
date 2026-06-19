// import { Router } from "express";
// import * as LeaveController from "../../hrms/controllers/leave.controller.js";
// import { protect, allowRoles } from "../../../middlewares/auth.middleware.js";
// import { validate, mongoIdParam } from "../../../middlewares/validate.middleware.js";


// import { body } from "express-validator";

// const router = Router();
// router.use(protect);

// // Employee
// router.post("/",
//   allowRoles("employee"),
//   [
//     body("leaveType").isIn(["sick","casual","earned","maternity","paternity","unpaid"])
//       .withMessage("Invalid leave type"),
//     body("fromDate").isISO8601().withMessage("Valid fromDate required"),
//     body("toDate").isISO8601().withMessage("Valid toDate required"),
//     body("reason").trim().notEmpty().withMessage("Reason required"),
//   ],
//   validate,
//   LeaveController.applyLeave
// );

// router.get("/my", allowRoles("employee"), LeaveController.getMyLeaves);

// // Admin
// router.get("/", allowRoles("admin", "subadmin"), LeaveController.getAllLeaves);

// router.patch("/:id/approve",
//   allowRoles("admin"),
//   mongoIdParam("id"), validate,
//   LeaveController.approveLeave
// );

// router.patch("/:id/reject",
//   allowRoles("admin"),
//   mongoIdParam("id"),
//   [body("reason").optional().trim()],
//   validate,
//   LeaveController.rejectLeave
// );

// export default router;


import { Router } from "express";
import * as LeaveController from "../../hrms/controllers/leave.controller.js";
import { protect, allowRoles } from "../../../middlewares/auth.middleware.js";
import { validate, mongoIdParam } from "../../../middlewares/validate.middleware.js";
import { body, param, query } from "express-validator";

const router = Router();
router.use(protect);

// ── Employee Routes ────────────────────────────────────────────────────────────
router.post("/",
  allowRoles("employee"),
  [
    body("leaveType").isIn(["sick","casual","earned","maternity","paternity","unpaid"])
      .withMessage("Invalid leave type"),
    body("fromDate").isISO8601().withMessage("Valid fromDate required"),
    body("toDate").isISO8601().withMessage("Valid toDate required"),
    body("reason").trim().notEmpty().withMessage("Reason required"),
  ],
  validate,
  LeaveController.applyLeave
);

router.get("/my",      allowRoles("employee"), LeaveController.getMyLeaves);
router.get("/balance", allowRoles("employee"), LeaveController.getMyBalance);  // apna balance

// ── Admin Routes ───────────────────────────────────────────────────────────────
router.get("/", allowRoles("admin", "subadmin"), LeaveController.getAllLeaves);

router.patch("/:id/approve",
  allowRoles("admin"),
  mongoIdParam("id"), validate,
  LeaveController.approveLeave
);

router.patch("/:id/reject",
  allowRoles("admin"),
  mongoIdParam("id"),
  [body("reason").optional().trim()],
  validate,
  LeaveController.rejectLeave
);

// ── Admin: Balance Management ──────────────────────────────────────────────────

// Kisi bhi employee ka balance dekho (year optional, default current year)
// GET /leaves/balance/:employeeId?year=2026
router.get("/balance/:employeeId",
  allowRoles("admin", "subadmin"),
  mongoIdParam("employeeId"), validate,
  LeaveController.getEmployeeBalance
);

// Employee ka allocated balance update karo
// PATCH /leaves/balance/:employeeId
// body: { year: 2026, sick: 10, casual: 8, earned: 15 }
router.patch("/balance/:employeeId",
  allowRoles("admin"),
  mongoIdParam("employeeId"),
  [
    body("year").optional().isInt({ min: 2020, max: 2100 }).withMessage("Valid year required"),
    body("sick").optional().isInt({ min: 0 }).withMessage("Must be >= 0"),
    body("casual").optional().isInt({ min: 0 }).withMessage("Must be >= 0"),
    body("earned").optional().isInt({ min: 0 }).withMessage("Must be >= 0"),
    body("maternity").optional().isInt({ min: 0 }).withMessage("Must be >= 0"),
    body("paternity").optional().isInt({ min: 0 }).withMessage("Must be >= 0"),
    body("unpaid").optional().isInt({ min: 0 }).withMessage("Must be >= 0"),
  ],
  validate,
  LeaveController.updateLeaveBalance
);

export default router;