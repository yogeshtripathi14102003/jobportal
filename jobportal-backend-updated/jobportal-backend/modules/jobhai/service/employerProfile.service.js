import Employer from "../models/Employer.js";
import ApiError from "../../../utils/ApiError.js";
import { uploadToCloudinary } from "../../../utils/cloudinary.js";

async function getMyProfile(employerId) {
  const employer = await Employer.findById(employerId).lean();
  if (!employer) throw new ApiError(404, "Employer not found");
  return employer;
}

const EDITABLE_FIELDS = ["companyName", "ownerName", "industry", "companySize", "city", "address", "gstNumber"];

async function updateMyProfile(employerId, data) {
  const sanitized = {};
  for (const field of EDITABLE_FIELDS) {
    if (data[field] !== undefined) sanitized[field] = data[field];
  }

  const employer = await Employer.findByIdAndUpdate(employerId, sanitized, {
    new: true,
    runValidators: true,
  }).lean();

  if (!employer) throw new ApiError(404, "Employer not found");
  return employer;
}

async function uploadLogo(employerId, fileBuffer) {
  const result = await uploadToCloudinary(fileBuffer, { folder: "jobhai/logos" });

  const employer = await Employer.findByIdAndUpdate(
    employerId,
    { logoUrl: result.secure_url },
    { new: true }
  ).lean();

  if (!employer) throw new ApiError(404, "Employer not found");
  return employer;
}

export { getMyProfile, updateMyProfile, uploadLogo };
