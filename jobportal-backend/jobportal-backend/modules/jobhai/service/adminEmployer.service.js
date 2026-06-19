import Employer from "../models/Employer.js"
import Job from "../models/Job.js";
import ApiError from "../../../utils/ApiError.js";
import {
  getPagination,
  buildPaginatedResponse,
} from "../../../utils/pagination.js";


/**
 * Get paginated list of employers with search & filters
 */
async function getEmployers(query) {
  const { page, limit, skip } = getPagination(query);
  const { search, status, plan, city } = query;

  const filter = {};
  if (status) filter.status = status;
  if (plan) filter.plan = plan;
  if (city) filter.city = new RegExp(city, 'i');

  if (search) {
    filter.$or = [
      { companyName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { gstNumber: new RegExp(search, 'i') },
    ];
  }

  const [employers, total] = await Promise.all([
    Employer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Employer.countDocuments(filter),
  ]);

  return buildPaginatedResponse(employers, total, page, limit);
}

/**
 * Get a single employer by ID, with their job count
 */
async function getEmployerById(employerId) {
  const employer = await Employer.findById(employerId).lean();
  if (!employer) throw new ApiError(404, 'Employer not found');

  const jobsCount = await Job.countDocuments({ employer: employerId });
  return { ...employer, jobsCount };
}

/**
 * Verify a pending employer (admin approval)
 */
async function verifyEmployer(employerId, adminId) {
  const employer = await Employer.findByIdAndUpdate(
    employerId,
    {
      status: 'verified',
      verifiedAt: new Date(),
      verifiedBy: adminId,
      rejectionReason: null,
    },
    { new: true }
  ).lean();

  if (!employer) throw new ApiError(404, 'Employer not found');
  return employer;
}

/**
 * Reject a pending employer with a reason
 */
async function rejectEmployer(employerId, reason) {
  const employer = await Employer.findByIdAndUpdate(
    employerId,
    { status: 'rejected', rejectionReason: reason || 'Documents incomplete or invalid' },
    { new: true }
  ).lean();

  if (!employer) throw new ApiError(404, 'Employer not found');
  return employer;
}

/**
 * Suspend a verified employer (e.g. for policy violation)
 */
async function suspendEmployer(employerId, reason) {
  const employer = await Employer.findByIdAndUpdate(
    employerId,
    { status: 'suspended', rejectionReason: reason || 'Suspended due to policy violation' },
    { new: true }
  ).lean();

  if (!employer) throw new ApiError(404, 'Employer not found');
  return employer;
}

/**
 * Restore a suspended employer back to verified
 */
async function restoreEmployer(employerId) {
  const employer = await Employer.findByIdAndUpdate(
    employerId,
    { status: 'verified', rejectionReason: null },
    { new: true }
  ).lean();

  if (!employer) throw new ApiError(404, 'Employer not found');
  return employer;
}

/**
 * Update employer's subscription plan
 */
async function updateEmployerPlan(employerId, plan, planExpiresAt) {
  const validPlans = ['free', 'pro', 'enterprise'];
  if (!validPlans.includes(plan)) {
    throw new ApiError(400, `Plan must be one of: ${validPlans.join(', ')}`);
  }

  const employer = await Employer.findByIdAndUpdate(
    employerId,
    { plan, planExpiresAt: planExpiresAt || null },
    { new: true }
  ).lean();

  if (!employer) throw new ApiError(404, 'Employer not found');
  return employer;
}

/**
 * Delete an employer permanently (cascades: also delete their jobs)
 */
async function deleteEmployer(employerId) {
  const employer = await Employer.findById(employerId);
  if (!employer) throw new ApiError(404, 'Employer not found');

  await Job.deleteMany({ employer: employerId });
  await Employer.findByIdAndDelete(employerId);

  return employer;
}

/**
 * Get summary stats for employers (used in admin dashboard)
 */
async function getEmployerStats() {
  const [total, verified, pending, suspended] = await Promise.all([
    Employer.countDocuments(),
    Employer.countDocuments({ status: 'verified' }),
    Employer.countDocuments({ status: 'pending' }),
    Employer.countDocuments({ status: 'suspended' }),
  ]);

  return { total, verified, pending, suspended };
}

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
