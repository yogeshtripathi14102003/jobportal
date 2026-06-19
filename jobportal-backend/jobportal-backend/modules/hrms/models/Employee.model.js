// import mongoose from "mongoose";

// const employeeSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true,
//     },

//     employeeId: {
//       type: String,
//       unique: true,
//       trim: true,
//     },

//     department:    { type: String, trim: true },
//     designation:   { type: String, trim: true },
//     dateOfJoining: { type: Date },

//     employmentType: {
//       type: String,
//       enum: ["full-time", "part-time", "contract", "intern"],
//       default: "full-time",
//     },

//     salary: { type: Number, default: 0 },

//     phone:   { type: String, trim: true },
//     address: { type: String, trim: true },

//     emergencyContact: {
//       name:     { type: String, trim: true },
//       phone:    { type: String, trim: true },
//       relation: { type: String, trim: true },
//     },

//     faceImages: [
//       {
//         url:        { type: String },
//         // publicId:   { type: String },
//         path:       { type: String }, 
//         uploadedAt: { type: Date, default: Date.now },
//       },
//     ],

//     faceDescriptor: { type: [Number], default: [] },

//     profilePhoto: {
//       url:      { type: String, default: "" },
//       // publicId: { type: String, default: "" },
//         path: { type: String, default: "" },

//     },

//     status: {
//       type: String,
//       enum: ["active", "inactive", "terminated"],
//       default: "active",
//     },

//     shiftStart: { type: String, default: "10:00" },
//     shiftEnd:   { type: String, default: "19:00" },

//     addedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true, versionKey: false }
// );

// // ✅ FIX: Mongoose 9.x mein async hook mein next() mat use karo
// employeeSchema.pre("save", async function () {
//   if (!this.employeeId) {
//     const count = await mongoose.model("Employee").countDocuments();
//     this.employeeId = `EMP-${String(count + 1).padStart(4, "0")}`;
//   }
// });

// employeeSchema.index({ employeeId: 1 });
// employeeSchema.index({ department: 1, status: 1 });

// const Employee = mongoose.model("Employee", employeeSchema);
// export default Employee;
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeId: {
      type: String,
      unique: true,
      trim: true,
    },

    department:    { type: String, trim: true },
    designation:   { type: String, trim: true },
    dateOfJoining: { type: Date },

    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "intern"],
      default: "full-time",
    },

    salary: { type: Number, default: 0 },

    phone:   { type: String, trim: true },
    address: { type: String, trim: true },

    emergencyContact: {
      name:     { type: String, trim: true },
      phone:    { type: String, trim: true },
      relation: { type: String, trim: true },
    },

    faceImages: [
      {
        url:        { type: String },
        path:       { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ─── Face Recognition ──────────────────────────────────────────────────
    faceDescriptor: {
      type:    [Number],   // 128 floats — face-api.js ka descriptor
      default: [],
    },

    faceEnrolledAt: {       // ← sirf yeh naya add kiya
      type:    Date,
      default: null,
    },
    // ───────────────────────────────────────────────────────────────────────

    profilePhoto: {
      url:  { type: String, default: "" },
      path: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
    },

    shiftStart: { type: String, default: "10:00" },
    shiftEnd:   { type: String, default: "19:00" },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
);

// Mongoose 9.x mein async hook mein next() mat use karo
employeeSchema.pre("save", async function () {
  if (!this.employeeId) {
    const count     = await mongoose.model("Employee").countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(4, "0")}`;
  }
});

employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ department: 1, status: 1 });

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;