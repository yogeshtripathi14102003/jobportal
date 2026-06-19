import Application from "../models/Application.js";
import Job from "../models/Job.js";
import ApiError from "../../../utils/ApiError.js";
import { getPagination, buildPaginatedResponse } from "../../../utils/pagination.js";

async function ensureJobOwnership(employerId, jobId) {
  const job = await Job.findOne({ _id: jobId, employer: employerId, isDeleted: { $ne: true } });
  if (!job) throw new ApiError(404, "Job not found");
  return job;
}

async function getApplicantsForJob(employerId, jobId, query) {
  await ensureJobOwnership(employerId, jobId);

  const { page, limit, skip } = getPagination(query);
  const { status } = query;

  const filter = { job: jobId };
  if (status) filter.status = status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("candidate", "name email phone city skills education experienceYears resumeUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  return buildPaginatedResponse(applications, total, page, limit);
}

async function getApplicationById(employerId, applicationId) {
  const application = await Application.findOne({ _id: applicationId, employer: employerId })
    .populate("candidate", "name email phone city skills education experienceYears resumeUrl")
    .populate("job", "title city status")
    .lean();

  if (!application) throw new ApiError(404, "Application not found");
  return application;
}

async function updateApplicationStatus(employerId, applicationId, actor, accountType, payload) {
  const { status, rejectionReason, interviewDetails } = payload;

  const application = await Application.findOne({ _id: applicationId, employer: employerId });
  if (!application) throw new ApiError(404, "Application not found");

  application.status = status;

  if (status === "rejected") {
    application.rejectionReason = rejectionReason || "Not a fit for this role";
  }

  if (status === "interview_scheduled" && interviewDetails) {
    application.interviewDetails = { ...application.interviewDetails, ...interviewDetails };
  }

  application.statusHistory.push({
    status,
    changedBy: actor._id,
    changedByModel: accountType === "recruiter" ? "Recruiter" : "Employer",
  });

  await application.save();
  return application.toObject();
}

export { getApplicantsForJob, getApplicationById, updateApplicationStatus };
