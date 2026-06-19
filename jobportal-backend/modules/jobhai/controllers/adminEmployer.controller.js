import * as employerService from "../service/adminEmployer.service.js";
import catchAsync from "../../../utils/catchAsync.js";

/**
 * GET /api/admin/employers
 * Query params: search, status, plan, city, page, limit
 */
const getEmployers = catchAsync(async (req, res) => {
  const result = await employerService.getEmployers(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * GET /api/admin/employers/:id
 */
const getEmployerById = catchAsync(async (req, res) => {
  const employer = await employerService.getEmployerById(req.params.id);

  res.status(200).json({
    success: true,
    data: employer,
  });
});

/**
 * PATCH /api/admin/employers/:id/verify
 */
const verifyEmployer = catchAsync(async (req, res) => {
  const adminId = req.admin?._id || req.user?._id;

  const employer = await employerService.verifyEmployer(
    req.params.id,
    adminId
  );

  res.status(200).json({
    success: true,
    message: "Employer verified successfully",
    data: employer,
  });
});

/**
 * PATCH /api/admin/employers/:id/reject
 * Body: { reason }
 */
const rejectEmployer = catchAsync(async (req, res) => {
  const employer = await employerService.rejectEmployer(
    req.params.id,
    req.body.reason
  );

  res.status(200).json({
    success: true,
    message: "Employer rejected",
    data: employer,
  });
});

/**
 * PATCH /api/admin/employers/:id/suspend
 * Body: { reason }
 */
const suspendEmployer = catchAsync(async (req, res) => {
  const employer = await employerService.suspendEmployer(
    req.params.id,
    req.body.reason
  );

  res.status(200).json({
    success: true,
    message: "Employer suspended",
    data: employer,
  });
});

/**
 * PATCH /api/admin/employers/:id/restore
 */
const restoreEmployer = catchAsync(async (req, res) => {
  const employer = await employerService.restoreEmployer(req.params.id);

  res.status(200).json({
    success: true,
    message: "Employer restored successfully",
    data: employer,
  });
});

/**
 * PATCH /api/admin/employers/:id/plan
 * Body: { plan, planExpiresAt }
 */
const updateEmployerPlan = catchAsync(async (req, res) => {
  const { plan, planExpiresAt } = req.body;

  const employer = await employerService.updateEmployerPlan(
    req.params.id,
    plan,
    planExpiresAt
  );

  res.status(200).json({
    success: true,
    message: "Employer plan updated",
    data: employer,
  });
});

/**
 * DELETE /api/admin/employers/:id
 */
const deleteEmployer = catchAsync(async (req, res) => {
  await employerService.deleteEmployer(req.params.id);

  res.status(200).json({
    success: true,
    message: "Employer deleted successfully",
  });
});

/**
 * GET /api/admin/employers/stats/summary
 */
const getEmployerStats = catchAsync(async (req, res) => {
  const stats = await employerService.getEmployerStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

export {
  getEmployers,
  getEmployerById,
  verifyEmployer,
  rejectEmployer,
  suspendEmployer,
  restoreEmployer,
  updateEmployerPlan,
  deleteEmployer,
  getEmployerStats,
};