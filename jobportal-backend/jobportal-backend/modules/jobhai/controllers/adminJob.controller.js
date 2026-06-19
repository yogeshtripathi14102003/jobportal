import * as jobService from "../service/adminJob.service.js";
import catchAsync from "../../../utils/catchAsync.js";

/**
 * GET /api/admin/jobs
 * Query params: search, status, category, city, employerId, page, limit
 */
const getJobs = catchAsync(async (req, res) => {
  const result = await jobService.getJobs(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * GET /api/admin/jobs/:id
 */
const getJobById = catchAsync(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);

  res.status(200).json({
    success: true,
    data: job,
  });
});

/**
 * PATCH /api/admin/jobs/:id/approve
 */
const approveJob = catchAsync(async (req, res) => {
  const adminId = req.admin?._id || req.user?._id;

  const job = await jobService.approveJob(req.params.id, adminId);

  res.status(200).json({
    success: true,
    message: "Job approved successfully",
    data: job,
  });
});

/**
 * PATCH /api/admin/jobs/:id/reject
 * Body: { reason }
 */
const rejectJob = catchAsync(async (req, res) => {
  const adminId = req.admin?._id || req.user?._id;

  const job = await jobService.rejectJob(
    req.params.id,
    req.body.reason,
    adminId
  );

  res.status(200).json({
    success: true,
    message: "Job rejected",
    data: job,
  });
});

/**
 * PATCH /api/admin/jobs/:id/flag
 * Body: { reason }
 */
const flagJob = catchAsync(async (req, res) => {
  const adminId = req.admin?._id || req.user?._id;

  const job = await jobService.flagJob(
    req.params.id,
    req.body.reason,
    adminId
  );

  res.status(200).json({
    success: true,
    message: "Job flagged for review",
    data: job,
  });
});

/**
 * PATCH /api/admin/jobs/:id/remove
 */
const removeJob = catchAsync(async (req, res) => {
  const job = await jobService.removeJob(req.params.id);

  res.status(200).json({
    success: true,
    message: "Job removed from listings",
    data: job,
  });
});

/**
 * DELETE /api/admin/jobs/:id
 */
const deleteJob = catchAsync(async (req, res) => {
  await jobService.deleteJob(req.params.id);

  res.status(200).json({
    success: true,
    message: "Job deleted permanently",
  });
});

/**
 * GET /api/admin/jobs/stats/summary
 */
const getJobStats = catchAsync(async (req, res) => {
  const stats = await jobService.getJobStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

export {
  getJobs,
  getJobById,
  approveJob,
  rejectJob,
  flagJob,
  removeJob,
  deleteJob,
  getJobStats,
};