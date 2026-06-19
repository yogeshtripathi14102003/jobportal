import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // ─── Personal Info ─────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"],
    },

    address: { type: String, trim: true },
    dob: { type: Date },
    fatherName: { type: String, trim: true },
    profilePhoto: { type: String, default: "" },

    // ─── Auth ──────────────────────────────────────────────────────────────
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    otp:       { type: String, select: false },
    otpExpiry: { type: Date,   select: false },

    isVerified: { type: Boolean, default: false },

    // ─── Role & Status ─────────────────────────────────────────────────────
    role: {
      type: String,
      enum: {
        // ✅ "employee" add kiya — HRMS employees ke liye
        values: ["admin", "subadmin", "counsellor", "student", "employee"],
        message: "Role must be admin | subadmin | counsellor | student | employee",
      },
      default: "student",
    },

    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "blocked"],
        message: "Status must be active | inactive | blocked",
      },
      default: "active",
    },

    // ─── Academic Info ────────────────────────────────────────────────────
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },

    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialization",
      default: null,
    },

    enrollmentNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    admissionYear: { type: Number },

    semester: {
      type: Number,
      min: [1, "Semester min is 1"],
      max: [12, "Semester max is 12"],
    },

    // ─── Counsellor-specific ───────────────────────────────────────────────
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ─── Tokens ───────────────────────────────────────────────────────────
    refreshToken:        { type: String, select: false },
    passwordResetToken:  { type: String, select: false },
    passwordResetExpiry: { type: Date,   select: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1, status: 1 });
userSchema.index({ course: 1, branch: 1, specialization: 1 });

// ─── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified("password") || !user.password) return;

  try {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (error) {
    throw new Error(error.message);
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.isOtpValid = function () {
  return this.otp && this.otpExpiry && this.otpExpiry > new Date();
};

// ─── toJSON: strip sensitive fields ──────────────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpiry;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;