  // src/modules/hrms/models/LeaveRequest.model.js
  import mongoose from "mongoose";

  const leaveSchema = new mongoose.Schema(
    {
      employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },

      leaveType: {
        type: String,
        enum: ["sick", "casual", "earned", "maternity", "paternity", "unpaid"],
        required: true,
      },

      fromDate: { type: Date, required: true },
      toDate:   { type: Date, required: true },
      totalDays:{ type: Number, required: true },

      reason: { type: String, trim: true, required: true },

      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },

      // Admin action
      actionBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      actionAt:  { type: Date, default: null },
      rejectReason: { type: String, trim: true },
    },
    { timestamps: true, versionKey: false }
  );

  leaveSchema.index({ employee: 1, status: 1 });
  leaveSchema.index({ fromDate: 1, toDate: 1 });

  const LeaveRequest = mongoose.model("LeaveRequest", leaveSchema);
  export default LeaveRequest;