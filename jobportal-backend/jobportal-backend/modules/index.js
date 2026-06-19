// Kisi bhi project mein sirf yahi import karo
export { default as routes }       from "../modules/hrms/routes/index.js";
export {default as routes } from "../modules/jobhai/routes/index.js";

// Models (dusre modules zaroorat ho toh)
export { default as Employee }         from "../modules/hrms/models/Employee.model.js";
export { default as Attendance }       from "../modules/hrms/models/Attendance.model.js";
export { default as LeaveRequest }     from "../modules/hrms/models/LeaveRequest.model.js";

// Services (agar kisi aur module ko HRMS data chahiye)
export * as employeeService            from "../modules/hrms/services/employee.service.js";
export * as attendanceService          from "../modules/hrms/services/attendance.service.js";