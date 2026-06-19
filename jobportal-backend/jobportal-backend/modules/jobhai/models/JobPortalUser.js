import mongoose from "mongoose";

const { Schema } = mongoose;

const JobPortalUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    city: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "employer", "admin"],
      default: "user",
    },
    profileScore: {
      type: Number,
      default: 0,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    education: {
      type: String,
      enum: ["10th", "12th", "graduate", "post_graduate", "other"],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "blocked", "warning", "pending"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    blockedReason: {
      type: String,
      default: null,
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

JobPortalUserSchema.index({
  name: "text",
  email: "text",
  phone: "text",
});

JobPortalUserSchema.index({ status: 1, role: 1 });
JobPortalUserSchema.index({ city: 1 });

export default mongoose.model("JobPortalUser", JobPortalUserSchema);