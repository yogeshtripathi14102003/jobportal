import mongoose from "mongoose";

const { Schema } = mongoose;

const ApplicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    // Denormalized so employer-side queries can filter by employer
    // without an extra lookup/populate on every list call.
    employer: {
      type: Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: "JobPortalUser",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview_scheduled", "rejected", "hired"],
      default: "applied",
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    coverNote: {
      type: String,
      trim: true,
      default: null,
    },
    interviewDetails: {
      scheduledAt: { type: Date, default: null },
      mode: { type: String, enum: ["in_person", "phone", "video", null], default: null },
      location: { type: String, default: null },
      notes: { type: String, default: null },
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, refPath: "statusHistory.changedByModel" },
        changedByModel: { type: String, enum: ["Employer", "Recruiter"] },
      },
    ],
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevents a candidate applying to the same job twice
ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
ApplicationSchema.index({ employer: 1, status: 1 });
ApplicationSchema.index({ candidate: 1, createdAt: -1 });

export default mongoose.model("Application", ApplicationSchema);
