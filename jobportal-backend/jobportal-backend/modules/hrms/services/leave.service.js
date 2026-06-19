// import LeaveRequest from "../../../modules/hrms/models/LeaveRequest.model.js";
// import Employee     from "../../../modules/hrms/models/Employee.model.js";
// import ApiError     from "../../../utils/ApiError.js";

// // ─── Employee: Apply leave ─────────────────────────────────────────────────────
// export const applyLeave = async (userId, body) => {
//   const employee = await Employee.findOne({ user: userId });
//   if (!employee) throw ApiError.notFound("Employee profile not found.");

//   const { leaveType, fromDate, toDate, reason } = body;

//   const from  = new Date(fromDate);
//   const to    = new Date(toDate);
//   if (from > to) throw ApiError.badRequest("fromDate must be before toDate.");

//   const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

//   // Overlap check
//   const overlap = await LeaveRequest.findOne({
//     employee: employee._id,
//     status: { $ne: "rejected" },
//     $or: [
//       { fromDate: { $lte: to },   toDate: { $gte: from } },
//     ],
//   });
//   if (overlap) throw ApiError.conflict("Leave request overlaps with an existing one.");

//   const leave = await LeaveRequest.create({
//     employee: employee._id,
//     leaveType, fromDate: from, toDate: to,
//     totalDays, reason,
//   });

//   return leave;
// };

// // ─── Admin: Get all leaves ─────────────────────────────────────────────────────
// export const getAllLeaves = async (query) => {
//   const { status, leaveType, employeeId, page = 1, limit = 20 } = query;

//   const filter = {};
//   if (status)     filter.status     = status;
//   if (leaveType)  filter.leaveType  = leaveType;
//   if (employeeId) filter.employee   = employeeId;

//   const skip = (page - 1) * limit;

//   const [leaves, total] = await Promise.all([
//     LeaveRequest.find(filter)
//       .populate({
//         path: "employee",
//         populate: { path: "user", select: "name email" },
//       })
//       .populate("actionBy", "name")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit)),
//     LeaveRequest.countDocuments(filter),
//   ]);

//   return { leaves, total, page: Number(page), limit: Number(limit) };
// };

// // ─── Employee: My leaves ───────────────────────────────────────────────────────
// export const getMyLeaves = async (userId) => {
//   const employee = await Employee.findOne({ user: userId });
//   if (!employee) throw ApiError.notFound("Employee not found.");

//   const leaves = await LeaveRequest.find({ employee: employee._id })
//     .sort({ createdAt: -1 });

//   return leaves;
// };

// // ─── Admin: Approve ────────────────────────────────────────────────────────────
// export const approveLeave = async (id, adminId) => {
//   const leave = await LeaveRequest.findById(id);
//   if (!leave) throw ApiError.notFound("Leave request not found.");
//   if (leave.status !== "pending") {
//     throw ApiError.badRequest(`Leave already ${leave.status}.`);
//   }

//   leave.status   = "approved";
//   leave.actionBy = adminId;
//   leave.actionAt = new Date();
//   await leave.save();

//   return leave;
// };

// // ─── Admin: Reject ─────────────────────────────────────────────────────────────
// export const rejectLeave = async (id, adminId, rejectReason) => {
//   const leave = await LeaveRequest.findById(id);
//   if (!leave) throw ApiError.notFound("Leave request not found.");
//   if (leave.status !== "pending") {
//     throw ApiError.badRequest(`Leave already ${leave.status}.`);
//   }

//   leave.status       = "rejected";
//   leave.actionBy     = adminId;
//   leave.actionAt     = new Date();
//   leave.rejectReason = rejectReason || "Not specified";
//   await leave.save();

//   return leave;
// };

import LeaveRequest from "../../../modules/hrms/models/LeaveRequest.model.js";
import LeaveBalance from "../../../modules/hrms/models/LeaveBalance.model.js";
import Employee     from "../../../modules/hrms/models/Employee.model.js";
import ApiError     from "../../../utils/ApiError.js";

// ─── Helper: Get or create balance for current year ───────────────────────────
const getOrCreateBalance = async (employeeId, year) => {
  let balance = await LeaveBalance.findOne({ employee: employeeId, year });
  if (!balance) {
    balance = await LeaveBalance.create({ employee: employeeId, year });
  }
  return balance;
};

// ─── Employee: Apply leave ─────────────────────────────────────────────────────
export const applyLeave = async (userId, body) => {
  const employee = await Employee.findOne({ user: userId });
  if (!employee) throw ApiError.notFound("Employee profile not found.");

  const { leaveType, fromDate, toDate, reason } = body;

  const from = new Date(fromDate);
  const to   = new Date(toDate);
  if (from > to) throw ApiError.badRequest("fromDate must be before toDate.");

  const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

  // Overlap check
  const overlap = await LeaveRequest.findOne({
    employee: employee._id,
    status: { $ne: "rejected" },
    $or: [{ fromDate: { $lte: to }, toDate: { $gte: from } }],
  });
  if (overlap) throw ApiError.conflict("Leave request overlaps with an existing one.");

  // Balance check (unpaid skip)
  if (leaveType !== "unpaid") {
    const year    = from.getFullYear();
    const balance = await getOrCreateBalance(employee._id, year);
    const avail   = balance[leaveType]?.available ?? 0;
    if (avail < totalDays) {
      throw ApiError.badRequest(
        `Insufficient ${leaveType} leave balance. Available: ${avail}, Required: ${totalDays}`
      );
    }
  }

  const leave = await LeaveRequest.create({
    employee: employee._id,
    leaveType, fromDate: from, toDate: to, totalDays, reason,
  });

  return leave;
};

// ─── Admin: Get all leaves ─────────────────────────────────────────────────────
export const getAllLeaves = async (query) => {
  const { status, leaveType, employeeId, page = 1, limit = 20 } = query;

  const filter = {};
  if (status)     filter.status    = status;
  if (leaveType)  filter.leaveType = leaveType;
  if (employeeId) filter.employee  = employeeId;

  const skip = (page - 1) * limit;

  const [leaves, total] = await Promise.all([
    LeaveRequest.find(filter)
      .populate({ path: "employee", populate: { path: "user", select: "name email" } })
      .populate("actionBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    LeaveRequest.countDocuments(filter),
  ]);

  return { leaves, total, page: Number(page), limit: Number(limit) };
};

// ─── Employee: My leaves ───────────────────────────────────────────────────────
export const getMyLeaves = async (userId) => {
  const employee = await Employee.findOne({ user: userId });
  if (!employee) throw ApiError.notFound("Employee not found.");

  const leaves = await LeaveRequest.find({ employee: employee._id })
    .sort({ createdAt: -1 });

  return leaves;
};

// ─── Admin: Approve ────────────────────────────────────────────────────────────
export const approveLeave = async (id, adminId) => {
  const leave = await LeaveRequest.findById(id);
  if (!leave) throw ApiError.notFound("Leave request not found.");
  if (leave.status !== "pending") {
    throw ApiError.badRequest(`Leave already ${leave.status}.`);
  }

  // Deduct from balance
  if (leave.leaveType !== "unpaid") {
    const year    = new Date(leave.fromDate).getFullYear();
    const balance = await getOrCreateBalance(leave.employee, year);
    const avail   = balance[leave.leaveType]?.available ?? 0;

    if (avail < leave.totalDays) {
      throw ApiError.badRequest(
        `Insufficient balance to approve. Available: ${avail}, Required: ${leave.totalDays}`
      );
    }

    balance[leave.leaveType].available -= leave.totalDays;
    await balance.save();
  }

  leave.status   = "approved";
  leave.actionBy = adminId;
  leave.actionAt = new Date();
  await leave.save();

  return leave;
};

// ─── Admin: Reject ─────────────────────────────────────────────────────────────
export const rejectLeave = async (id, adminId, rejectReason) => {
  const leave = await LeaveRequest.findById(id);
  if (!leave) throw ApiError.notFound("Leave request not found.");
  if (leave.status !== "pending") {
    throw ApiError.badRequest(`Leave already ${leave.status}.`);
  }

  leave.status       = "rejected";
  leave.actionBy     = adminId;
  leave.actionAt     = new Date();
  leave.rejectReason = rejectReason || "Not specified";
  await leave.save();

  return leave;
};

// ─── Get Balance: Employee apna balance dekhe ──────────────────────────────────
export const getMyBalance = async (userId) => {
  const employee = await Employee.findOne({ user: userId });
  if (!employee) throw ApiError.notFound("Employee not found.");

  const year    = new Date().getFullYear();
  const balance = await getOrCreateBalance(employee._id, year);
  return balance;
};

// ─── Get Balance: Admin kisi bhi employee ka balance dekhe ────────────────────
export const getEmployeeBalance = async (employeeId, year) => {
  const y       = year || new Date().getFullYear();
  const balance = await getOrCreateBalance(employeeId, y);
  return balance;
};

// ─── Admin: Update allocated leaves ───────────────────────────────────────────
export const updateLeaveBalance = async (employeeId, year, updates) => {
  const y       = year || new Date().getFullYear();
  const balance = await getOrCreateBalance(employeeId, y);

  const leaveTypes = ["sick", "casual", "earned", "maternity", "paternity", "unpaid"];

  for (const type of leaveTypes) {
    if (updates[type] !== undefined) {
      const diff = updates[type] - balance[type].allocated;
      balance[type].allocated  = updates[type];
      balance[type].available  = Math.max(0, balance[type].available + diff);
    }
  }

  await balance.save();
  return balance;
};