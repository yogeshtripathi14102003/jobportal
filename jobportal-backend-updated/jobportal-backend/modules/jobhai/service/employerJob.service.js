import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import ApiError from "../../../utils/ApiError.js";
import slugify from "../../../utils/slugify.js";
import { getPagination, buildPaginatedResponse } from "../../../utils/pagination.js";

async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 0;
  // eslint-disable-next-line no-await-in-loop
  while (await Job.exists({ slug })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}

async function createJob(employerId, actor, accountType, data) {
  const employer = await Employer.findById(employerId);
  if (!employer) throw new ApiError(404, "Employer not found");
  if (employer.status !== "verified") {
    throw new ApiError(403, "Only verified companies can post jobs");
  }

  const baseSlug = slugify(`${data.title}-${employer.companyName}`);
  const slug = await ensureUniqueSlug(baseSlug);

  const job = await Job.create({
    ...data,
    employer: employerId,
    slug,
    status: "review",
    createdBy: actor._id,
    createdByModel: accountType === "recruiter" ? "Recruiter" : "Employer",
  });

  employer.totalJobsPosted += 1;
  await employer.save({ validateBeforeSave: false });

  return job.toObject();
}

async function getMyJobs(employerId, query) {
  const { page, limit, skip } = getPagination(query);
  const { search, status, jobType, category } = query;

  const filter = { employer: employerId, isDeleted: { $ne: true } };
  if (status) filter.status = status;
  if (jobType) filter.jobType = jobType;
  if (category) filter.category = category;
  if (search) filter.title = new RegExp(search, "i");

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  return buildPaginatedResponse(jobs, total, page, limit);
}

async function getMyJobById(employerId, jobId) {
  const job = await Job.findOne({ _id: jobId, employer: employerId, isDeleted: { $ne: true } }).lean();
  if (!job) throw new ApiError(404, "Job not found");
  return job;
}

const EDITABLE_FIELDS = [
  "title",
  "category",
  "jobType",
  "description",
  "city",
  "locality",
  "salaryMin",
  "salaryMax",
  "educationRequired",
  "experienceRequired",
  "vacancies",
  "languagesRequired",
  "isUrgent",
  "expiresAt",
];

async function updateJob(employerId, jobId, actor, accountType, data) {
  const job = await Job.findOne({ _id: jobId, employer: employerId, isDeleted: { $ne: true } });
  if (!job) throw new ApiError(404, "Job not found");

  for (const field of EDITABLE_FIELDS) {
    if (data[field] !== undefined) job[field] = data[field];
  }

  job.updatedBy = actor._id;
  job.updatedByModel = accountType === "recruiter" ? "Recruiter" : "Employer";

  // Edits to a live posting send it back through moderation
  if (job.status === "active") job.status = "review";

  await job.save();
  return job.toObject();
}

/**
 * Soft delete — keeps the job + its applications around for history/audit,
 * just hides it from listings. (Admin's deleteJob remains a hard delete.)
 */
async function deleteJob(employerId, jobId) {
  const job = await Job.findOne({ _id: jobId, employer: employerId, isDeleted: { $ne: true } });
  if (!job) throw new ApiError(404, "Job not found");

  job.isDeleted = true;
  job.deletedAt = new Date();
  job.status = "closed";
  await job.save();

  return job.toObject();
}

export { createJob, getMyJobs, getMyJobById, updateJob, deleteJob };
