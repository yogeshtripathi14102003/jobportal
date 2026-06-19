// src/modules/hrms/models/LeaveBalance.model.js
import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(), // Current year automatically le lega (e.g., 2026)
    },
    // Har leave type ke liye 'allocated' (total) aur 'available' (remaining) track karenge
    sick: {
      allocated: { type: Number, default: 12 }, // Admin isko edit kar sakta hai
      available: { type: Number, default: 12 }, // Employee ke leave lene par ye kam hoga
    },
    casual: {
      allocated: { type: Number, default: 12 },
      available: { type: Number, default: 12 },
    },
    earned: {
      allocated: { type: Number, default: 15 },
      available: { type: Number, default: 15 },
    },
    maternity: {
      allocated: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    paternity: {
      allocated: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    unpaid: {
      allocated: { type: Number, default: 99 }, // Unpaid leave ki generally koi limit nahi hoti
      available: { type: Number, default: 99 },
    },
  },
  { timestamps: true, versionKey: false }
);

// Ek employee ka ek saal me ek hi balance record hona chahiye
leaveBalanceSchema.index({ employee: 1, year: 1 }, { unique: true });

const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);
export default LeaveBalance;