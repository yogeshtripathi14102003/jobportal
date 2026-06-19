import * as AdminService from "../services/admin.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";

// POST /api/admin/users
export const createUser = asyncHandler(async (req, res) => {
  const user = await AdminService.createUserByAdmin(req.body, req.user.role);
  sendSuccess(res, 201, "User created successfully.", { user });
});

// GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const data = await AdminService.getAllUsers(req.query);
  sendSuccess(res, 200, "Users fetched.", data);
});

// GET /api/admin/users/:id
export const getUser = asyncHandler(async (req, res) => {
  const user = await AdminService.getUserById(req.params.id);
  sendSuccess(res, 200, "User fetched.", { user });
});

// PATCH /api/admin/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const user = await AdminService.updateUser(req.params.id, req.body);
  sendSuccess(res, 200, "User updated.", { user });
});

// DELETE /api/admin/users/:id  (soft delete)
export const deleteUser = asyncHandler(async (req, res) => {
  await AdminService.deleteUser(req.params.id);
  sendSuccess(res, 200, "User deactivated.");
});

// PATCH /api/admin/users/:id/block
export const blockUser = asyncHandler(async (req, res) => {
  const user = await AdminService.toggleBlockUser(req.params.id, true);
  sendSuccess(res, 200, "User blocked.", { user });
});

// PATCH /api/admin/users/:id/unblock
export const unblockUser = asyncHandler(async (req, res) => {
  const user = await AdminService.toggleBlockUser(req.params.id, false);
  sendSuccess(res, 200, "User unblocked.", { user });
});

// PATCH /api/admin/counsellors/:id/assign-students
export const assignStudents = asyncHandler(async (req, res) => {
  const counsellor = await AdminService.assignStudentsToCounsellor(
    req.params.id,
    req.body.studentIds  // array of student _ids
  );
  sendSuccess(res, 200, "Students assigned.", { counsellor });
});