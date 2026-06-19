import express from "express";

import * as userController from "../controllers/adminUser.controller.js";
import validateObjectId from "../../../middlewares/validateObjectId.middleware.js";

const router = express.Router();

// NOTE: Plug in your existing auth middleware (e.g. protect)
// + restrictTo("admin") where this router is mounted.
//
// Example:
// app.use(
//   "/api/admin/users",
//   protect,
//   restrictTo("admin"),
//   router
// );

router.get("/stats/summary", userController.getUserStats);

router.get("/", userController.getUsers);

router.get(
  "/:id",
  validateObjectId("id"),
  userController.getUserById
);

router.patch(
  "/:id",
  validateObjectId("id"),
  userController.updateUser
);

router.patch(
  "/:id/block",
  validateObjectId("id"),
  userController.blockUser
);

router.patch(
  "/:id/unblock",
  validateObjectId("id"),
  userController.unblockUser
);

router.delete(
  "/:id",
  validateObjectId("id"),
  userController.deleteUser
);

export default router;