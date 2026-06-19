import Employee    from "../models/Employee.model.js";
import User        from "../../../models/User.model.js";
import LeaveBalance from "../models/LeaveBalance.model.js"; // ✅ add karo
import ApiError    from "../../../utils/ApiError.js";
import { fileUrl, deleteFile } from "../../../utils/upload.js";

// ─── Helper: Pro-rata calculate karo ──────────────────────────────────────────
const proRata = (allocated, joiningMonth) => {
  const remainingMonths = 13 - joiningMonth;
  return Math.round((allocated / 12) * remainingMonths);
};

// ─── Admin: Add Employee ───────────────────────────────────────────────────────
export const addEmployee = async (body, files, adminId) => {
  const { name, email, password, phone, address,
    department, designation, dateOfJoining,
    employmentType, salary, shiftStart, shiftEnd,
    emergencyContactName, emergencyContactPhone, emergencyContactRelation,
  } = body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict(`Email '${email}' already registered.`);

  const user = await User.create({
    name, email, password, phone,
    role: "employee",
    isVerified: true,
    status: "active",
  });

  // ── Profile photo ──────────────────────────────────────────────────────────
  let profilePhoto = { url: "", path: "" };
  if (files?.profilePhoto?.[0]) {
    const f = files.profilePhoto[0];
    profilePhoto = { url: fileUrl(f.path), path: f.path };
  }

  // ── Face images ────────────────────────────────────────────────────────────
  const faceImages = [];
  if (files?.faceImages) {
    for (const f of files.faceImages.slice(0, 3)) {
      faceImages.push({ url: fileUrl(f.path), path: f.path });
    }
  }

  const joining = dateOfJoining ? new Date(dateOfJoining) : new Date();

  const employee = await Employee.create({
    user: user._id,
    phone, address, department, designation,
    dateOfJoining: joining,
    employmentType: employmentType || "full-time",
    salary: Number(salary) || 0,
    shiftStart: shiftStart || "09:00",
    shiftEnd:   shiftEnd   || "18:00",
    emergencyContact: {
      name:     emergencyContactName,
      phone:    emergencyContactPhone,
      relation: emergencyContactRelation,
    },
    profilePhoto,
    faceImages,
    faceDescriptor: body.faceDescriptor ? JSON.parse(body.faceDescriptor) : [],
    addedBy: adminId,
  });

  // ✅ Auto LeaveBalance create karo ─────────────────────────────────────────
  const currentYear    = new Date().getFullYear();
  const joiningYear    = joining.getFullYear();
  const joiningMonth   = joining.getMonth() + 1; // 1-12
  const isJoiningYear  = joiningYear === currentYear;

  // Agar current year mein join kiya toh pro-rata, warna full
  const sick      = isJoiningYear ? proRata(12, joiningMonth) : 12;
  const casual    = isJoiningYear ? proRata(12, joiningMonth) : 12;
  const earned    = isJoiningYear ? proRata(15, joiningMonth) : 15;

  await LeaveBalance.create({
    employee:  employee._id,
    year:      currentYear,
    sick:      { allocated: sick,   available: sick   },
    casual:    { allocated: casual, available: casual },
    earned:    { allocated: earned, available: earned },
    maternity: { allocated: 0,      available: 0      },
    paternity: { allocated: 0,      available: 0      },
    unpaid:    { allocated: 99,     available: 99     },
  });

  return { user, employee };
};

// ─── Get All Employees ─────────────────────────────────────────────────────────
export const getAllEmployees = async (query) => {
  const { department, status, search, page = 1, limit = 20 } = query;

  const filter = {};
  if (department) filter.department = department;
  if (status)     filter.status = status;

  if (search) {
    const users = await User.find({
      $or: [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");
    filter.user = { $in: users.map((u) => u._id) };
  }

  const skip = (page - 1) * limit;

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate("user", "name email phone status")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Employee.countDocuments(filter),
  ]);

  return { employees, total, page: Number(page), limit: Number(limit) };
};

// ─── Get Single Employee ───────────────────────────────────────────────────────
export const getEmployeeById = async (id) => {
  const employee = await Employee.findById(id)
    .populate("user", "name email phone status role");
  if (!employee) throw ApiError.notFound("Employee not found.");
  return employee;
};

// ─── Get My Profile ───────────────────────────────────────────────────────────
export const getMyProfile = async (userId) => {
  const employee = await Employee.findOne({ user: userId })
    .populate("user", "name email phone");
  if (!employee) throw ApiError.notFound("Employee profile not found.");
  return employee;
};

// ─── Update Employee ───────────────────────────────────────────────────────────
export const updateEmployee = async (id, body, files) => {
  const employee = await Employee.findById(id);
  if (!employee) throw ApiError.notFound("Employee not found.");

  // Profile photo update
  if (files?.profilePhoto?.[0]) {
    // Purani file delete karo
    if (employee.profilePhoto?.path) deleteFile(employee.profilePhoto.path);
    const f = files.profilePhoto[0];
    body.profilePhoto = { url: fileUrl(f.path), path: f.path };
  }

  // Face images update
  if (files?.faceImages?.length) {
    // Purani delete karo
    for (const img of employee.faceImages) {
      if (img.path) deleteFile(img.path);
    }
    body.faceImages = files.faceImages.slice(0, 3).map((f) => ({
      url:  fileUrl(f.path),
      path: f.path,
    }));
  }

  if (body.faceDescriptor) {
    body.faceDescriptor = JSON.parse(body.faceDescriptor);
  }

  const updated = await Employee.findByIdAndUpdate(id, body, {
    new: true, runValidators: true,
  }).populate("user", "name email phone status");

  return updated;
};

// ─── Delete Employee (soft) ────────────────────────────────────────────────────
export const deleteEmployee = async (id) => {
  const employee = await Employee.findByIdAndUpdate(
    id, { status: "terminated" }, { new: true }
  );
  if (!employee) throw ApiError.notFound("Employee not found.");

  await User.findByIdAndUpdate(employee.user, { status: "inactive" });
  return employee;
};