import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { generateOTP, otpExpiry, generateResetToken } from "../utils/otp.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/email.js";
// ─── Admin: Create counsellor / subadmin ──────────────────────────────────────
// Admin directly creates these users — no OTP, auto-verified
export const createUserByAdmin = async (body, createdByRole) => {
  const { name, email, password, role, phone, course, branch, specialization } = body;

  // Sirf yahi roles admin bana sakta hai
  const allowedRoles = ["counsellor", "subadmin"];
  if (!allowedRoles.includes(role)) {
    throw ApiError.badRequest(`Admin can only create: ${allowedRoles.join(", ")}.`);
  }

  // Subadmin sirf counsellor bana sakta hai
  if (createdByRole === "subadmin" && role !== "counsellor") {
    throw ApiError.forbidden("Subadmin can only create counsellors.");
  }

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict(`Email '${email}' already registered.`);

  const user = await User.create({
    name,
    email,
    password,          // pre-save hook hash karega
    role,
    phone,
    course: course || null,
    branch: branch || null,
    specialization: specialization || null,
    isVerified: true,  // Admin-created → auto verified
    status: "active",
  });

  // Optional: credentials email bhejna
  sendOtpEmail(email, `Your account has been created. Password: ${password}`)
    .catch((e) => console.warn("Credential email failed:", e.message));

  return user;
};

// ─── Get all users (with filters) ────────────────────────────────────────────
export const getAllUsers = async (query) => {
  const { role, status, course, branch, page = 1, limit = 20 } = query;

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (course) filter.course = course;
  if (branch) filter.branch = branch;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate("course", "name")
      .populate("branch", "name")
      .populate("specialization", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return { users, total, page: Number(page), limit: Number(limit) };
};

// ─── Get single user ──────────────────────────────────────────────────────────
export const getUserById = async (id) => {
  const user = await User.findById(id)
    .populate("course", "name")
    .populate("branch", "name")
    .populate("specialization", "name")
    .populate("assignedStudents", "name email enrollmentNumber");

  if (!user) throw ApiError.notFound("User not found.");
  return user;
};

// ─── Update user ──────────────────────────────────────────────────────────────
export const updateUser = async (id, body) => {
  // Password yahan se update nahi hoga — alag route se
  const forbidden = ["password", "otp", "otpExpiry", "refreshToken"];
  forbidden.forEach((f) => delete body[f]);

  const user = await User.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound("User not found.");
  return user;
};

// ─── Delete (soft: status=inactive) ──────────────────────────────────────────
export const deleteUser = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    { status: "inactive" },
    { new: true }
  );
  if (!user) throw ApiError.notFound("User not found.");
  return user;
};

// ─── Block / Unblock user ─────────────────────────────────────────────────────
export const toggleBlockUser = async (id, block) => {
  const user = await User.findByIdAndUpdate(
    id,
    { status: block ? "blocked" : "active" },
    { new: true }
  );
  if (!user) throw ApiError.notFound("User not found.");
  return user;
};

// ─── Assign students to counsellor ───────────────────────────────────────────
export const assignStudentsToCounsellor = async (counsellorId, studentIds) => {
  const counsellor = await User.findById(counsellorId);
  if (!counsellor || counsellor.role !== "counsellor") {
    throw ApiError.badRequest("Target user is not a counsellor.");
  }

  // Duplicate avoid karo
  const existing = counsellor.assignedStudents.map((s) => s.toString());
  const newIds = studentIds.filter((id) => !existing.includes(id));

  counsellor.assignedStudents.push(...newIds);
  await counsellor.save();
  return counsellor;
};