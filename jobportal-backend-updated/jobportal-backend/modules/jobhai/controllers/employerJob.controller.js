import * as jobService from "../service/employerJob.service.js";
import catchAsync from "../../../utils/catchAsync.js";

const createJob = catchAsync(async (req, res) => {
  const job = await jobService.createJob(req.employerId, req.user, req.accountType, req.body);
  res.status(201).json({ success: true, message: "Job submitted for review", data: job });
});

const getMyJobs = catchAsync(async (req, res) => {
  const result = await jobService.getMyJobs(req.employerId, req.query);
  res.status(200).json({ success: true, ...result });
});

const getMyJobById = catchAsync(async (req, res) => {
  const job = await jobService.getMyJobById(req.employerId, req.params.id);
  res.status(200).json({ success: true, data: job });
});

const updateJob = catchAsync(async (req, res) => {
  const job = await jobService.updateJob(req.employerId, req.params.id, req.user, req.accountType, req.body);
  res.status(200).json({ success: true, message: "Job updated", data: job });
});

const deleteJob = catchAsync(async (req, res) => {
  await jobService.deleteJob(req.employerId, req.params.id);
  res.status(200).json({ success: true, message: "Job removed" });
});

export { createJob, getMyJobs, getMyJobById, updateJob, deleteJob };
