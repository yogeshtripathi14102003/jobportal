// import * as AttendanceService from "../../hrms/services/attendance.service.js";
// import asyncHandler from "../../../utils/asyncHandler.js";
// import { sendSuccess } from "../../../utils/ApiResponse.js";

// export const punch = asyncHandler(async (req, res) => {
//   const selfieFile = req.files?.selfie?.[0] || null;
//   const attendance = await AttendanceService.punch(req.user._id, req.body, selfieFile);
//   sendSuccess(res, 200, `Punched ${req.body.type} successfully.`, { attendance });
// });

// export const getTodayAttendance = asyncHandler(async (req, res) => {
//   const data = await AttendanceService.getTodayAttendance(req.user._id);
//   sendSuccess(res, 200, "Today's attendance fetched.", data);
// });

// export const getMyAttendance = asyncHandler(async (req, res) => {
//   const data = await AttendanceService.getMyAttendance(req.user._id, req.query);
//   sendSuccess(res, 200, "Attendance history fetched.", data);
// });

// export const getAllAttendance = asyncHandler(async (req, res) => {
//   const data = await AttendanceService.getAllAttendance(req.query);
//   sendSuccess(res, 200, "Attendance records fetched.", data);
// });

// export const overrideAttendance = asyncHandler(async (req, res) => {
//   const attendance = await AttendanceService.overrideAttendance(
//     req.params.id, req.body, req.user._id
//   );
//   sendSuccess(res, 200, "Attendance updated.", { attendance });
// });

// export const getMonthlySummary = asyncHandler(async (req, res) => {
//   const { month, year } = req.query;
//   const data = await AttendanceService.getMonthlySummary(
//     req.params.employeeId,
//     Number(month),
//     Number(year)
//   );
//   sendSuccess(res, 200, "Monthly summary fetched.", data);
// });

import * as AttendanceService from "../../hrms/services/attendance.service.js";
import asyncHandler           from "../../../utils/asyncHandler.js";
import { sendSuccess }        from "../../../utils/ApiResponse.js";

// ─── Punch In / Out ────────────────────────────────────────────────────────────
export const punch = asyncHandler(async (req, res) => {
  const selfieFile = req.files?.selfie?.[0] || null;
  const attendance = await AttendanceService.punch(req.user._id, req.body, selfieFile);
  sendSuccess(res, 200, `Punched ${req.body.type} successfully.`, { attendance });
});

// ─── Enroll Face ───────────────────────────────────────────────────────────────
export const enrollFace = asyncHandler(async (req, res) => {
  const data = await AttendanceService.enrollFace(req.user._id, req.body);
  sendSuccess(res, 200, "Face enrolled successfully.", data);
});

// ─── Face Enrollment Status ────────────────────────────────────────────────────
export const getFaceStatus = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getFaceStatus(req.user._id);
  sendSuccess(res, 200, "Face status fetched.", data);
});

// ─── Get Today's Attendance ────────────────────────────────────────────────────
export const getTodayAttendance = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getTodayAttendance(req.user._id);
  sendSuccess(res, 200, "Today's attendance fetched.", data);
});

// ─── Get My Attendance ─────────────────────────────────────────────────────────
export const getMyAttendance = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getMyAttendance(req.user._id, req.query);
  sendSuccess(res, 200, "Attendance history fetched.", data);
});

// ─── Admin: Get All Attendance ─────────────────────────────────────────────────
export const getAllAttendance = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getAllAttendance(req.query);
  sendSuccess(res, 200, "Attendance records fetched.", data);
});

// ─── Admin: Override Attendance ────────────────────────────────────────────────
export const overrideAttendance = asyncHandler(async (req, res) => {
  const attendance = await AttendanceService.overrideAttendance(
    req.params.id,
    req.body,
    req.user._id
  );
  sendSuccess(res, 200, "Attendance updated.", { attendance });
});

// ─── Admin: Monthly Summary ────────────────────────────────────────────────────
export const getMonthlySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const data = await AttendanceService.getMonthlySummary(
    req.params.employeeId,
    Number(month),
    Number(year)
  );
  sendSuccess(res, 200, "Monthly summary fetched.", data);
});