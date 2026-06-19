import * as profileService from "../service/employerProfile.service.js";
import catchAsync from "../../../utils/catchAsync.js";
import ApiError from "../../../utils/ApiError.js";

const getMyProfile = catchAsync(async (req, res) => {
  const employer = await profileService.getMyProfile(req.employerId);
  res.status(200).json({ success: true, data: employer });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const employer = await profileService.updateMyProfile(req.employerId, req.body);
  res.status(200).json({ success: true, message: "Profile updated", data: employer });
});

const uploadLogo = catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Logo file is required");
  const employer = await profileService.uploadLogo(req.employerId, req.file.buffer);
  res.status(200).json({ success: true, message: "Logo updated", data: employer });
});

export { getMyProfile, updateMyProfile, uploadLogo };
