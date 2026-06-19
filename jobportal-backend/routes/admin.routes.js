import { Router } from "express";
import * as AdminController from "../controllers/admin.controller.js";
import { protect, allowRoles } from "../middlewares/auth.middleware.js";
import {
  validate,
  mongoIdParam,
  createUserByAdminValidators,
  updateUserValidators,
  assignStudentsValidators,
} from "../middlewares/validate.middleware.js";

const router = Router();

// ── All routes need login ──────────────────────────────────────────────────────
router.use(protect);

// ── Create counsellor / subadmin ───────────────────────────────────────────────
router.post(
  "/users",
  allowRoles("admin", "subadmin"),
  createUserByAdminValidators,
  validate,
  AdminController.createUser
);

// ── List all users (with filters ?role=&status=&page=&limit=) ─────────────────
router.get(
  "/users",
  allowRoles("admin", "subadmin"),
  AdminController.getUsers
);

// ── Single user ───────────────────────────────────────────────────────────────
router.get(
  "/users/:id",
  allowRoles("admin", "subadmin"),
  mongoIdParam("id"),
  validate,
  AdminController.getUser
);

// ── Update user ───────────────────────────────────────────────────────────────
router.patch(
  "/users/:id",
  allowRoles("admin"),
  mongoIdParam("id"),
  updateUserValidators,
  validate,
  AdminController.updateUser
);

// ── Soft delete (status → inactive) ───────────────────────────────────────────
router.delete(
  "/users/:id",
  allowRoles("admin"),
  mongoIdParam("id"),
  validate,
  AdminController.deleteUser
);

// ── Block ─────────────────────────────────────────────────────────────────────
router.patch(
  "/users/:id/block",
  allowRoles("admin"),
  mongoIdParam("id"),
  validate,
  AdminController.blockUser
);

// ── Unblock ───────────────────────────────────────────────────────────────────
router.patch(
  "/users/:id/unblock",
  allowRoles("admin"),
  mongoIdParam("id"),
  validate,
  AdminController.unblockUser
);

// ── Assign students to counsellor ─────────────────────────────────────────────
router.patch(
  "/counsellors/:id/assign-students",
  allowRoles("admin"),
  mongoIdParam("id"),
  assignStudentsValidators,
  validate,
  AdminController.assignStudents
);

export default router;