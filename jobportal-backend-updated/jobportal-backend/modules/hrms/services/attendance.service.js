// import Attendance from "../models/Attendance.model.js";
// import Employee   from "../models/Employee.model.js";
// import ApiError   from "../../../utils/ApiError.js";
// // import { uploadToCloudinary } from "../../../utils/cloudinary.js";
// import { fileUrl } from "../../../utils/upload.js";

// // ─── Helper: date string "YYYY-MM-DD" ─────────────────────────────────────────
// const toDateStr = (date = new Date()) =>
//   date.toISOString().split("T")[0];

// // ─── Helper: calculate total hours ────────────────────────────────────────────
// const calcHours = (punches) => {
//   let total = 0;
//   const ins  = punches.filter((p) => p.type === "in").map((p) => new Date(p.time));
//   const outs = punches.filter((p) => p.type === "out").map((p) => new Date(p.time));

//   ins.forEach((inTime, i) => {
//     if (outs[i]) {
//       total += (outs[i] - inTime) / 3_600_000; // ms → hours
//     }
//   });
//   return Math.round(total * 100) / 100;
// };

// // ─── Helper: is late? ─────────────────────────────────────────────────────────
// const checkLate = (firstIn, shiftStart) => {
//   if (!firstIn || !shiftStart) return false;
//   const [h, m]    = shiftStart.split(":").map(Number);
//   const shiftDate = new Date(firstIn);
//   shiftDate.setHours(h, m, 0, 0);
//   return firstIn > shiftDate;
// };

// // ─── Punch In / Out ────────────────────────────────────────────────────────────
// export const punch = async (userId, body, selfieFile) => {
//   const { type, method, latitude, longitude, address, faceConfidence, note } = body;

//   // Employee dhundo
//   const employee = await Employee.findOne({ user: userId });
//   if (!employee) throw ApiError.notFound("Employee profile not found.");
//   if (employee.status !== "active") throw ApiError.forbidden("Your account is not active.");

//   const today = toDateStr();

//   // Selfie upload cloudnry 
//   // let selfie = { url: "", publicId: "" };
//   // if (selfieFile) {
//   //   const result = await uploadToCloudinary(selfieFile.buffer, {
//   //     folder: "hrms/selfies",
//   //     public_id: `selfie_${employee._id}_${Date.now()}`,
//   //   });
//   //   selfie = { url: result.secure_url, publicId: result.public_id };
//   // }


//   // selfiupload on local 
//    let selfie = { url: "", path: "" };
//   if (selfieFile) {
//     selfie = {
//       url:  fileUrl(selfieFile.path),
//       path: selfieFile.path,
//     };
//   }

//   // Punch object
//   const punchData = {
//     time:   new Date(),
//     type,
//     method: method || "manual",
//     location: { latitude, longitude, address },
//     selfie,
//     faceConfidence: faceConfidence ? Number(faceConfidence) : null,
//     note,
//   };

//   // Aaj ka attendance record find ya create
//   let attendance = await Attendance.findOne({ employee: employee._id, date: today });

//   if (!attendance) {
//     attendance = await Attendance.create({
//       employee: employee._id,
//       date:     today,
//       punches:  [punchData],
//       status:   "present",
//     });
//   } else {
//     // Duplicate punch check — same type last punch se match
//     const lastPunch = attendance.punches[attendance.punches.length - 1];
//     if (lastPunch && lastPunch.type === type) {
//       throw ApiError.badRequest(
//         `Already punched ${type}. Please punch ${type === "in" ? "out" : "in"} first.`
//       );
//     }
//     attendance.punches.push(punchData);
//   }

//   // Computed fields update
//   const inPunches  = attendance.punches.filter((p) => p.type === "in");
//   const outPunches = attendance.punches.filter((p) => p.type === "out");

//   attendance.firstIn    = inPunches[0]?.time || null;
//   attendance.lastOut    = outPunches[outPunches.length - 1]?.time || null;
//   attendance.totalHours = calcHours(attendance.punches);
//   attendance.isLate     = checkLate(attendance.firstIn, employee.shiftStart);

//   // Half-day check (4 hours se kam)
//   if (attendance.totalHours > 0 && attendance.totalHours < 4) {
//     attendance.status = "half-day";
//   }

//   await attendance.save();
//   return attendance;
// };

// // ─── Get My Attendance (employee) ─────────────────────────────────────────────
// export const getMyAttendance = async (userId, query) => {
//   const employee = await Employee.findOne({ user: userId });
//   if (!employee) throw ApiError.notFound("Employee not found.");

//   const { month, year, page = 1, limit = 31 } = query;
//   const filter = { employee: employee._id };

//   if (month && year) {
//     const start = `${year}-${String(month).padStart(2, "0")}-01`;
//     const end   = `${year}-${String(month).padStart(2, "0")}-31`;
//     filter.date = { $gte: start, $lte: end };
//   }
 
//   const skip = (page - 1) * limit;

//   const [records, total] = await Promise.all([
//     Attendance.find(filter)
//       .sort({ date: -1 })
//       .skip(skip)
//       .limit(Number(limit)),
//     Attendance.countDocuments(filter),
//   ]);

//   // Summary
//   const present  = records.filter((r) => r.status === "present").length;
//   const absent   = records.filter((r) => r.status === "absent").length;
//   const halfDay  = records.filter((r) => r.status === "half-day").length;
//   const late     = records.filter((r) => r.isLate).length;

//   return { records, total, summary: { present, absent, halfDay, late }, page: Number(page) };
// };

// // ─── Get Today's Attendance ────────────────────────────────────────────────────
// export const getTodayAttendance = async (userId) => {
//   const employee = await Employee.findOne({ user: userId });
//   if (!employee) throw ApiError.notFound("Employee not found.");

//   const today      = toDateStr();
//   const attendance = await Attendance.findOne({ employee: employee._id, date: today });

//   // Current status
//   const lastPunch  = attendance?.punches?.slice(-1)[0] || null;
//   const isPunchedIn = lastPunch?.type === "in";

//   return {
//     attendance: attendance || null,
//     today,
//     isPunchedIn,
//     lastPunch,
//     totalHours: attendance?.totalHours || 0,
//   };
// };

// // ─── Admin: Get All Attendance ─────────────────────────────────────────────────
// export const getAllAttendance = async (query) => {
//   const { date, employeeId, department, status, month, year, page = 1, limit = 50 } = query;

//   const filter = {};
//   if (date)   filter.date   = date;
//   if (status) filter.status = status;

//   if (month && year) {
//     const start = `${year}-${String(month).padStart(2, "0")}-01`;
//     const end   = `${year}-${String(month).padStart(2, "0")}-31`;
//     filter.date = { $gte: start, $lte: end };
//   }

//   // Employee filter
//   if (employeeId) {
//     filter.employee = employeeId;
//   } else if (department) {
//     const emps = await Employee.find({ department }).select("_id");
//     filter.employee = { $in: emps.map((e) => e._id) };
//   }

//   const skip = (page - 1) * limit;

//   const [records, total] = await Promise.all([
//     Attendance.find(filter)
//       .populate({ path: "employee", populate: { path: "user", select: "name email" } })
//       .sort({ date: -1 })
//       .skip(skip)
//       .limit(Number(limit)),
//     Attendance.countDocuments(filter),
//   ]);

//   return { records, total, page: Number(page), limit: Number(limit) };
// };

// // ─── Admin: Override Attendance ────────────────────────────────────────────────
// export const overrideAttendance = async (id, body, adminId) => {
//   const { status, adminNote } = body;
//   const attendance = await Attendance.findByIdAndUpdate(
//     id,
//     { status, adminNote, overriddenBy: adminId },
//     { new: true, runValidators: true }
//   );
//   if (!attendance) throw ApiError.notFound("Attendance record not found.");
//   return attendance;
// };

// // ─── Admin: Monthly Summary per Employee ──────────────────────────────────────
// export const getMonthlySummary = async (employeeId, month, year) => {
//   const start = `${year}-${String(month).padStart(2, "0")}-01`;
//   const end   = `${year}-${String(month).padStart(2, "0")}-31`;

//   const records = await Attendance.find({
//     employee: employeeId,
//     date: { $gte: start, $lte: end },
//   });

//   const summary = {
//     totalDays:   records.length,
//     present:     records.filter((r) => r.status === "present").length,
//     absent:      records.filter((r) => r.status === "absent").length,
//     halfDay:     records.filter((r) => r.status === "half-day").length,
//     late:        records.filter((r) => r.isLate).length,
//     onLeave:     records.filter((r) => r.status === "on-leave").length,
//     totalHours:  Math.round(records.reduce((sum, r) => sum + r.totalHours, 0) * 100) / 100,
//     avgHours:    records.length
//       ? Math.round((records.reduce((sum, r) => sum + r.totalHours, 0) / records.length) * 100) / 100
//       : 0,
//   };

//   return { summary, records };
// };
import Attendance from "../models/Attendance.model.js";
import Employee   from "../models/Employee.model.js";
import ApiError   from "../../../utils/ApiError.js";
import { fileUrl } from "../../../utils/upload.js";

// ─── Helper: date string "YYYY-MM-DD" ─────────────────────────────────────────
const toDateStr = (date = new Date()) =>
  date.toISOString().split("T")[0];

// ─── Helper: calculate total hours ────────────────────────────────────────────
const calcHours = (punches) => {
  let total = 0;
  const ins  = punches.filter((p) => p.type === "in").map((p) => new Date(p.time));
  const outs = punches.filter((p) => p.type === "out").map((p) => new Date(p.time));
  ins.forEach((inTime, i) => {
    if (outs[i]) total += (outs[i] - inTime) / 3_600_000;
  });
  return Math.round(total * 100) / 100;
};

// ─── Helper: is late? ─────────────────────────────────────────────────────────
const checkLate = (firstIn, shiftStart) => {
  if (!firstIn || !shiftStart) return false;
  const [h, m]    = shiftStart.split(":").map(Number);
  const shiftDate = new Date(firstIn);
  shiftDate.setHours(h, m, 0, 0);
  return firstIn > shiftDate;
};

// ─── Helper: euclidean distance (server-side face verify) ─────────────────────
const euclideanDistance = (a, b) => {
  if (!a || !b || a.length !== b.length) return Infinity;
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
};

// ─── Punch In / Out ────────────────────────────────────────────────────────────
export const punch = async (userId, body, selfieFile) => {
  const {
    type,
    method,
    latitude,
    longitude,
    address,
    note,
    faceDescriptor,   // frontend se aata hai JSON string ya Array (face method mein)
    faceConfidence,   // frontend ka confidence (0–1)
  } = body;

  // ── Employee dhundo ──────────────────────────────────────────────────────
  const employee = await Employee.findOne({ user: userId });
  if (!employee)                    throw ApiError.notFound("Employee profile not found.");
  if (employee.status !== "active") throw ApiError.forbidden("Your account is not active.");

  // ── Face verification ─────────────────────────────────────────────────────
  let verifiedConfidence = faceConfidence ? Number(faceConfidence) : null;

  if (method === "face") {
    // Stored descriptor check
    if (!employee.faceDescriptor || employee.faceDescriptor.length !== 128) {
      throw ApiError.badRequest(
        "Face not enrolled. Please enroll via POST /api/attendance/enroll-face first."
      );
    }

    // Parse incoming descriptor (multipart mein string aa sakta hai)
    let incoming;
    try {
      incoming =
        typeof faceDescriptor === "string"
          ? JSON.parse(faceDescriptor)
          : faceDescriptor;
    } catch {
      throw ApiError.badRequest("Invalid faceDescriptor. Expected JSON array of 128 numbers.");
    }

    if (!Array.isArray(incoming) || incoming.length !== 128) {
      throw ApiError.badRequest("faceDescriptor must be an array of exactly 128 numbers.");
    }

    // Server-side distance check (0.6 = standard threshold)
    const distance   = euclideanDistance(employee.faceDescriptor, incoming);
    const confidence = Math.max(0, Math.min(1, 1 - distance));

    if (distance >= 0.6) {
      throw ApiError.unauthorized(
        `Face verification failed. Confidence: ${Math.round(confidence * 100)}%. Please try again.`
      );
    }

    verifiedConfidence = Math.round(confidence * 100) / 100;
  }

  // ── Selfie upload (local) ─────────────────────────────────────────────────
  let selfie = { url: "", path: "" };
  if (selfieFile) {
    selfie = {
      url:  fileUrl(selfieFile.path),
      path: selfieFile.path,
    };
  }

  // ── Punch object ──────────────────────────────────────────────────────────
  const punchData = {
    time:     new Date(),
    type,
    method:   method || "manual",
    location: { latitude, longitude, address },
    selfie,
    faceConfidence: verifiedConfidence,
    note,
  };

  const today = toDateStr();

  // ── Aaj ka attendance record find ya create ───────────────────────────────
  let attendance = await Attendance.findOne({ employee: employee._id, date: today });

  if (!attendance) {
    attendance = await Attendance.create({
      employee: employee._id,
      date:     today,
      punches:  [punchData],
      status:   "present",
    });
  } else {
    // Duplicate punch check
    const lastPunch = attendance.punches[attendance.punches.length - 1];
    if (lastPunch && lastPunch.type === type) {
      throw ApiError.badRequest(
        `Already punched ${type}. Please punch ${type === "in" ? "out" : "in"} first.`
      );
    }
    attendance.punches.push(punchData);
  }

  // ── Computed fields update ────────────────────────────────────────────────
  const inPunches  = attendance.punches.filter((p) => p.type === "in");
  const outPunches = attendance.punches.filter((p) => p.type === "out");

  attendance.firstIn    = inPunches[0]?.time || null;
  attendance.lastOut    = outPunches[outPunches.length - 1]?.time || null;
  attendance.totalHours = calcHours(attendance.punches);
  attendance.isLate     = checkLate(attendance.firstIn, employee.shiftStart);

  if (attendance.totalHours > 0 && attendance.totalHours < 4) {
    attendance.status = "half-day";
  }

  await attendance.save();
  return attendance;
};

// ─── Enroll Face ───────────────────────────────────────────────────────────────
export const enrollFace = async (userId, body) => {
  const { faceDescriptor } = body;

  const employee = await Employee.findOne({ user: userId });
  if (!employee) throw ApiError.notFound("Employee profile not found.");

  // Parse descriptor (multipart ya JSON body dono handle)
  let descriptor;
  try {
    descriptor =
      typeof faceDescriptor === "string"
        ? JSON.parse(faceDescriptor)
        : faceDescriptor;
  } catch {
    throw ApiError.badRequest("Invalid faceDescriptor format. Expected JSON array.");
  }

  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    throw ApiError.badRequest("faceDescriptor must be an array of exactly 128 numbers.");
  }

  if (!descriptor.every((v) => typeof v === "number" && isFinite(v))) {
    throw ApiError.badRequest("faceDescriptor contains invalid values.");
  }

  employee.faceDescriptor = descriptor;
  employee.faceEnrolledAt = new Date();
  await employee.save();

  return {
    message:    "Face enrolled successfully.",
    enrolledAt: employee.faceEnrolledAt,
    employeeId: employee._id,
  };
};

// ─── Face Enrollment Status ────────────────────────────────────────────────────
export const getFaceStatus = async (userId) => {
  const employee = await Employee.findOne({ user: userId }).select(
    "faceDescriptor faceEnrolledAt"
  );
  if (!employee) throw ApiError.notFound("Employee not found.");

  return {
    enrolled:   employee.faceDescriptor?.length === 128,
    enrolledAt: employee.faceEnrolledAt || null,
  };
};

// ─── Get My Attendance ─────────────────────────────────────────────────────────
export const getMyAttendance = async (userId, query) => {
  const employee = await Employee.findOne({ user: userId });
  if (!employee) throw ApiError.notFound("Employee not found.");

  const { month, year, page = 1, limit = 31 } = query;
  const filter = { employee: employee._id };

  if (month && year) {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end   = `${year}-${String(month).padStart(2, "0")}-31`;
    filter.date = { $gte: start, $lte: end };
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    Attendance.countDocuments(filter),
  ]);

  const present = records.filter((r) => r.status === "present").length;
  const absent  = records.filter((r) => r.status === "absent").length;
  const halfDay = records.filter((r) => r.status === "half-day").length;
  const late    = records.filter((r) => r.isLate).length;

  return { records, total, summary: { present, absent, halfDay, late }, page: Number(page) };
};

// ─── Get Today's Attendance ────────────────────────────────────────────────────
export const getTodayAttendance = async (userId) => {
  const employee = await Employee.findOne({ user: userId });
  if (!employee) throw ApiError.notFound("Employee not found.");

  const today      = toDateStr();
  const attendance = await Attendance.findOne({ employee: employee._id, date: today });

  const lastPunch   = attendance?.punches?.slice(-1)[0] || null;
  const isPunchedIn = lastPunch?.type === "in";

  return {
    attendance: attendance || null,
    today,
    isPunchedIn,
    lastPunch,
    totalHours: attendance?.totalHours || 0,
  };
};

// ─── Admin: Get All Attendance ─────────────────────────────────────────────────
export const getAllAttendance = async (query) => {
  const { date, employeeId, department, status, month, year, page = 1, limit = 50 } = query;

  const filter = {};
  if (date)   filter.date   = date;
  if (status) filter.status = status;

  if (month && year) {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end   = `${year}-${String(month).padStart(2, "0")}-31`;
    filter.date = { $gte: start, $lte: end };
  }

  if (employeeId) {
    filter.employee = employeeId;
  } else if (department) {
    const emps      = await Employee.find({ department }).select("_id");
    filter.employee = { $in: emps.map((e) => e._id) };
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate({ path: "employee", populate: { path: "user", select: "name email" } })
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Attendance.countDocuments(filter),
  ]);

  return { records, total, page: Number(page), limit: Number(limit) };
};

// ─── Admin: Override Attendance ────────────────────────────────────────────────
export const overrideAttendance = async (id, body, adminId) => {
  const { status, adminNote } = body;
  const attendance = await Attendance.findByIdAndUpdate(
    id,
    { status, adminNote, overriddenBy: adminId },
    { new: true, runValidators: true }
  );
  if (!attendance) throw ApiError.notFound("Attendance record not found.");
  return attendance;
};

// ─── Admin: Monthly Summary ────────────────────────────────────────────────────
export const getMonthlySummary = async (employeeId, month, year) => {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end   = `${year}-${String(month).padStart(2, "0")}-31`;

  const records = await Attendance.find({
    employee: employeeId,
    date: { $gte: start, $lte: end },
  });

  const summary = {
    totalDays:  records.length,
    present:    records.filter((r) => r.status === "present").length,
    absent:     records.filter((r) => r.status === "absent").length,
    halfDay:    records.filter((r) => r.status === "half-day").length,
    late:       records.filter((r) => r.isLate).length,
    onLeave:    records.filter((r) => r.status === "on-leave").length,
    totalHours: Math.round(records.reduce((sum, r) => sum + r.totalHours, 0) * 100) / 100,
    avgHours:   records.length
      ? Math.round((records.reduce((sum, r) => sum + r.totalHours, 0) / records.length) * 100) / 100
      : 0,
  };

  return { summary, records };
};