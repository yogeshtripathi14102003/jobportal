import * as applicationService from "../service/employerApplication.service.js";
import catchAsync from "../../../utils/catchAsync.js";

const getApplicantsForJob = catchAsync(async (req, res) => {
  const result = await applicationService.getApplicantsForJob(req.employerId, req.params.jobId, req.query);
  res.status(200).json({ success: true, ...result });
});

const getApplicationById = catchAsync(async (req, res) => {
  const application = await applicationService.getApplicationById(req.employerId, req.params.id);
  res.status(200).json({ success: true, data: application });
});

const updateApplicationStatus = catchAsync(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.employerId,
    req.params.id,
    req.user,
    req.accountType,
    req.body
  );
  res.status(200).json({ success: true, message: "Application status updated", data: application });
});

export { getApplicantsForJob, getApplicationById, updateApplicationStatus };
