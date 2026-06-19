import Recruiter from "../models/Recruiter.js";
import ApiError from "../../../utils/ApiError.js";
import { getPagination, buildPaginatedResponse } from "../../../utils/pagination.js";

async function inviteRecruiter(employerId, invitedById, data) {
  const existing = await Recruiter.findOne({ employer: employerId, email: data.email });
  if (existing) throw new ApiError(409, "A recruiter with this email already exists for your company");

  const recruiter = await Recruiter.create({
    employer: employerId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
    permissions: data.permissions,
    invitedBy: invitedById,
  });

  return recruiter.toJSON();
}

async function getRecruiters(employerId, query) {
  const { page, limit, skip } = getPagination(query);
  const { search, status } = query;

  const filter = { employer: employerId };
  if (status) filter.status = status;
  if (search) {
    filter.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
  }

  const [recruiters, total] = await Promise.all([
    Recruiter.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Recruiter.countDocuments(filter),
  ]);

  return buildPaginatedResponse(recruiters, total, page, limit);
}

async function updateRecruiter(employerId, recruiterId, data) {
  const allowedFields = ["name", "phone", "permissions", "status"];
  const sanitized = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) sanitized[field] = data[field];
  }

  const recruiter = await Recruiter.findOneAndUpdate(
    { _id: recruiterId, employer: employerId },
    sanitized,
    { new: true, runValidators: true }
  ).lean();

  if (!recruiter) throw new ApiError(404, "Recruiter not found");
  return recruiter;
}

async function removeRecruiter(employerId, recruiterId) {
  const recruiter = await Recruiter.findOneAndDelete({ _id: recruiterId, employer: employerId }).lean();
  if (!recruiter) throw new ApiError(404, "Recruiter not found");
  return recruiter;
}

export { inviteRecruiter, getRecruiters, updateRecruiter, removeRecruiter };
