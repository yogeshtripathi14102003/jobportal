import mongoose from "mongoose";

const { Schema } = mongoose;

const JobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    employer: {
      type: Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "sales_marketing",
        "bpo_customer_support",
        "delivery_logistics",
        "security_guard",
        "technician_repair",
        "retail_shop",
        "driver",
        "other",
      ],
      required: true,
    },
    jobType: {
      type: String,
      enum: [
        "full_time",
        "part_time",
        "contract",
        "freelance",
        "work_from_home",
        "internship",
      ],
      default: "full_time",
    },
    description: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    locality: {
      type: String,
      trim: true,
    },
    salaryMin: {
      type: Number,
      required: true,
    },
    salaryMax: {
      type: Number,
    },
    educationRequired: {
      type: String,
      enum: ["10th", "12th", "graduate", "post_graduate", "any"],
      default: "any",
    },
    experienceRequired: {
      type: String,
      enum: ["fresher", "0-1", "1-3", "3-5", "5+"],
      default: "fresher",
    },
    vacancies: {
      type: Number,
      default: 1,
    },
    languagesRequired: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["active", "review", "flagged", "closed", "draft"],
      default: "review",
    },
    flaggedReason: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      refPath: "createdByModel",
      default: null,
    },
    createdByModel: {
      type: String,
      enum: ["Employer", "Recruiter"],
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      refPath: "updatedByModel",
      default: null,
    },
    updatedByModel: {
      type: String,
      enum: ["Employer", "Recruiter"],
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ title: "text", description: "text" });
JobSchema.index({ status: 1, category: 1 });
JobSchema.index({ city: 1 });
JobSchema.index({ employer: 1 });
JobSchema.index({ isDeleted: 1 });

export default mongoose.model("Job", JobSchema);