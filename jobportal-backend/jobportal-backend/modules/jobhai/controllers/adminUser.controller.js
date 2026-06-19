import * as userService from "../service/adminUser.service.js";
import catchAsync from "../../../utils/catchAsync.js";

/**
 * GET /api/admin/users
 * Query params: search, status, city, role, page, limit
 */
const getUsers = catchAsync(async (req, res) => {
  const result = await userService.getUsers(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * GET /api/admin/users/:id
 */
const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * PATCH /api/admin/users/:id
 * Body: editable user fields
 */
const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

/**
 * PATCH /api/admin/users/:id/block
 * Body: { reason }
 */
const blockUser = catchAsync(async (req, res) => {
  const user = await userService.blockUser(
    req.params.id,
    req.body.reason
  );

  res.status(200).json({
    success: true,
    message: "User blocked successfully",
    data: user,
  });
});

/**
 * PATCH /api/admin/users/:id/unblock
 */
const unblockUser = catchAsync(async (req, res) => {
  const user = await userService.unblockUser(req.params.id);

  res.status(200).json({
    success: true,
    message: "User unblocked successfully",
    data: user,
  });
});

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

/**
 * GET /api/admin/users/stats/summary
 */
const getUserStats = catchAsync(async (req, res) => {
  const stats = await userService.getUserStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

export {
  getUsers,
  getUserById,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
  getUserStats,
};