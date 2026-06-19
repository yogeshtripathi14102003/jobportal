import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import ApiError from "../../../utils/ApiError.js";
import {
  getPagination,
  buildPaginatedResponse,
} from "../../../utils/pagination.js";
/**
 * Get paginated list of jobs with search & filters
 */
async function getJobs(query) {
  const { page, limit, skip } = getPagination(query);
  const { search, status, category, city, employerId, includeDeleted } = query;

  const filter = {};
  if (!includeDeleted) filter.isDeleted = { $ne: true };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (city) filter.city = new RegExp(city, 'i');
  if (employerId) filter.employer = employerId;

  if (search) {
    filter.$or = [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('employer', 'companyName city status plan')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  return buildPaginatedResponse(jobs, total, page, limit);
}

/**
 * Get a single job by ID with employer details
 */
async function getJobById(jobId) {
  const job = await Job.findById(jobId).populate('employer', 'companyName city status plan').lean();
  if (!job) throw new ApiError(404, 'Job not found');
  return job;
}

/**
 * Approve a job that is under review, making it active.
 * Validates the employer exists and isn't suspended.
 */
async function approveJob(jobId, adminId) {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const employer = await Employer.findById(job.employer);
  if (!employer) throw new ApiError(404, 'Associated employer not found');
  if (employer.status === 'suspended') {
    throw new ApiError(400, 'Cannot approve a job from a suspended employer');
  }

  job.status = 'active';
  job.reviewedBy = adminId;
  job.flaggedReason = null;
  await job.save();

  return job.toObject();
}

/**
 * Reject a job under review
 */
async function rejectJob(jobId, reason, adminId) {
  const job = await Job.findByIdAndUpdate(
    jobId,
    { status: 'closed', flaggedReason: reason || 'Rejected by admin', reviewedBy: adminId },
    { new: true }
  ).lean();

  if (!job) throw new ApiError(404, 'Job not found');
  return job;
}

/**
 * Flag a job as suspicious / needing review
 */
async function flagJob(jobId, reason, adminId) {
  const job = await Job.findByIdAndUpdate(
    jobId,
    { status: 'flagged', flaggedReason: reason || 'Flagged for manual review', reviewedBy: adminId },
    { new: true }
  ).lean();

  if (!job) throw new ApiError(404, 'Job not found');
  return job;
}

/**
 * Remove (soft-close) a job from listings
 */
async function removeJob(jobId) {
  const job = await Job.findByIdAndUpdate(jobId, { status: 'closed' }, { new: true }).lean();
  if (!job) throw new ApiError(404, 'Job not found');
  return job;
}

/**
 * Permanently delete a job
 */
async function deleteJob(jobId) {
  const job = await Job.findByIdAndDelete(jobId).lean();
  if (!job) throw new ApiError(404, 'Job not found');
  return job;
}

/**
 * Get summary stats for jobs (used in admin dashboard)
 */
async function getJobStats() {
  const [total, active, review, flagged, closed] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ status: 'active' }),
    Job.countDocuments({ status: 'review' }),
    Job.countDocuments({ status: 'flagged' }),
    Job.countDocuments({ status: 'closed' }),
  ]);

  return { total, active, review, flagged, closed };
}

/**
 * Aggregate job counts grouped by category (used for dashboard pie chart)
 */
async function getJobCategoryBreakdown() {
  const breakdown = await Job.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return breakdown.map((item) => ({ category: item._id, count: item.count }));
}

export{
  getJobs,
  getJobById,
  approveJob,
  rejectJob,
  flagJob,
  removeJob,
  deleteJob,
  getJobStats,
  getJobCategoryBreakdown,
};
