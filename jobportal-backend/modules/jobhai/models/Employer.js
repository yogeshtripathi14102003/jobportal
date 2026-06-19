import mongoose from "mongoose";

const { Schema } = mongoose;

const EmployerSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
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
    industry: {
      type: String,
      trim: true,
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      default: null,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["verified", "pending", "suspended", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    totalJobsPosted: {
      type: Number,
      default: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

EmployerSchema.index({
  companyName: "text",
  email: "text",
  gstNumber: "text",
});

EmployerSchema.index({ status: 1, plan: 1 });
EmployerSchema.index({ city: 1 });

export default mongoose.model("Employer", EmployerSchema);