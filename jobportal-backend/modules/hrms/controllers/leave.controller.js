import * as LeaveService from "../../hrms/services/leave.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import { sendSuccess } from "../../../utils/ApiResponse.js";

export const applyLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveService.applyLeave(req.user._id, req.body);
  sendSuccess(res, 201, "Leave applied successfully.", { leave });
});

export const getAllLeaves = asyncHandler(async (req, res) => {
  const data = await LeaveService.getAllLeaves(req.query);
  sendSuccess(res, 200, "Leaves fetched.", data);
});

export const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await LeaveService.getMyLeaves(req.user._id);
  sendSuccess(res, 200, "Your leaves fetched.", { leaves });
});

export const approveLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveService.approveLeave(req.params.id, req.user._id);
  sendSuccess(res, 200, "Leave approved.", { leave });
});

export const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveService.rejectLeave(
    req.params.id, req.user._id, req.body.reason
  );
  sendSuccess(res, 200, "Leave rejected.", { leave });
});

// ─── Balance Controllers ───────────────────────────────────────────────────────
export const getMyBalance = asyncHandler(async (req, res) => {
  const balance = await LeaveService.getMyBalance(req.user._id);
  sendSuccess(res, 200, "Leave balance fetched.", { balance });
});

export const getEmployeeBalance = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { year }       = req.query;
  const balance        = await LeaveService.getEmployeeBalance(employeeId, year);
  sendSuccess(res, 200, "Employee leave balance fetched.", { balance });
});

export const updateLeaveBalance = asyncHandler(async (req, res) => {
  const { employeeId }   = req.params;
  const { year, ...updates } = req.body;
  const balance = await LeaveService.updateLeaveBalance(employeeId, year, updates);
  sendSuccess(res, 200, "Leave balance updated.", { balance });
});