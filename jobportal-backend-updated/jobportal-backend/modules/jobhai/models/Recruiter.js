import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const RecruiterSchema = new Schema(
  {
    employer: {
      type: Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["owner", "recruiter"],
      default: "recruiter",
    },
    permissions: {
      canPostJobs: { type: Boolean, default: true },
      canManageApplicants: { type: Boolean, default: true },
      canManageRecruiters: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "Recruiter",
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One email can only be used once per company (same email can recruit for
// different companies under different accounts, hence not globally unique)
RecruiterSchema.index({ employer: 1, email: 1 }, { unique: true });
RecruiterSchema.index({ employer: 1, status: 1 });

RecruiterSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

RecruiterSchema.methods.comparePassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

RecruiterSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export default mongoose.model("Recruiter", RecruiterSchema);
