import { Router } from "express";
import employeeRoutes   from "../../hrms/routes/employee.routes.js";
import attendanceRoutes  from "../../hrms/routes/attendance.routes.js";
import leaveRoutes      from "../../hrms/routes/leave.routes.js";


const router = Router();

router.use("/employees",  employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leaves",     leaveRoutes);
export default router;