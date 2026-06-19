import * as dashboardService from "../service/employerDashboard.service.js";
import catchAsync from "../../../utils/catchAsync.js";

const getDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getEmployerDashboard(req.employerId);
  res.status(200).json({ success: true, data });
});

export { getDashboard };
