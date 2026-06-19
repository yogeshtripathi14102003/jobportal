import * as recruiterService from "../service/employerRecruiter.service.js";
import catchAsync from "../../../utils/catchAsync.js";

const inviteRecruiter = catchAsync(async (req, res) => {
  const recruiter = await recruiterService.inviteRecruiter(req.employerId, req.user._id, req.body);
  res.status(201).json({ success: true, message: "Recruiter added", data: recruiter });
});

const getRecruiters = catchAsync(async (req, res) => {
  const result = await recruiterService.getRecruiters(req.employerId, req.query);
  res.status(200).json({ success: true, ...result });
});

const updateRecruiter = catchAsync(async (req, res) => {
  const recruiter = await recruiterService.updateRecruiter(req.employerId, req.params.id, req.body);
  res.status(200).json({ success: true, message: "Recruiter updated", data: recruiter });
});

const removeRecruiter = catchAsync(async (req, res) => {
  await recruiterService.removeRecruiter(req.employerId, req.params.id);
  res.status(200).json({ success: true, message: "Recruiter removed" });
});

export { inviteRecruiter, getRecruiters, updateRecruiter, removeRecruiter };
