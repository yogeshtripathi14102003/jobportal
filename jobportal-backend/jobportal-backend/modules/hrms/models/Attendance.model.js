// import mongoose from "mongoose";

// const punchSchema = new mongoose.Schema(
//   {
//     time: { type: Date, required: true },

//     type: {
//       type: String,
//       enum: ["in", "out"],
//       required: true,
//     },

//     method: {
//       type: String,
//       enum: ["face", "manual"],
//       required: true,
//     },

//     // ─── Location ─────────────────────────────────────────────────────────
//     location: {
//       latitude:  { type: Number },
//       longitude: { type: Number },
//       address:   { type: String },  // reverse geocode (optional)
//     },

//     // ─── Selfie ───────────────────────────────────────────────────────────
//     selfie: {
//       url:      { type: String, default: "" },
//       publicId: { type: String, default: "" },
//     },

//     // Face match confidence (0–1), null if manual
//     faceConfidence: { type: Number, default: null },

//     note: { type: String, trim: true },
//   },
//   { _id: true }
// );

// const attendanceSchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },

//     date: {
//       type: String,   // "YYYY-MM-DD" — easy filtering
//       required: true,
//     },

//     punches: [punchSchema],

//     // ─── Computed Fields (updated on each punch) ──────────────────────────
//     firstIn:   { type: Date, default: null },
//     lastOut:   { type: Date, default: null },
//     totalHours:{ type: Number, default: 0 },  // decimal hours

//     status: {
//       type: String,
//       enum: ["present", "absent", "half-day", "late", "on-leave"],
//       default: "present",
//     },

//     isLate:        { type: Boolean, default: false },
//     earlyDeparture:{ type: Boolean, default: false },

//     // ─── Override by admin ────────────────────────────────────────────────
//     adminNote:  { type: String, trim: true },
//     overriddenBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//   },
//   { timestamps: true, versionKey: false }
// );

// // One record per employee per day
// attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
// attendanceSchema.index({ date: 1, status: 1 });

// const Attendance = mongoose.model("Attendance", attendanceSchema);
// export default Attendance;


import mongoose from "mongoose";

const punchSchema = new mongoose.Schema(
  {
    time: { type: Date, required: true },

    type: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },

    method: {
      type: String,
      enum: ["face", "manual"],
      required: true,
    },

    location: {
      latitude:  { type: Number },
      longitude: { type: Number },
      address:   { type: String },
    },

    // ─── Selfie ───────────────────────────────────────────────────────────
    selfie: {
      url:  { type: String, default: "" },
      path: { type: String, default: "" },   // ← publicId → path (local storage)
    },

    // Face match confidence (0–1), null if manual
    faceConfidence: { type: Number, default: null },

    note: { type: String, trim: true },
  },
  { _id: true }
);

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: String,   // "YYYY-MM-DD"
      required: true,
    },

    punches: [punchSchema],

    // ─── Computed fields (updated on each punch) ──────────────────────────
    firstIn:    { type: Date,   default: null },
    lastOut:    { type: Date,   default: null },
    totalHours: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["present", "absent", "half-day", "late", "on-leave"],
      default: "present",
    },

    isLate:         { type: Boolean, default: false },
    earlyDeparture: { type: Boolean, default: false },

    // ─── Admin override ───────────────────────────────────────────────────
    adminNote: { type: String, trim: true },
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

// One record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;