import * as dashboardService from "../service/adminDashboard.service.js";
import catchAsync from "../../../utils/catchAsync.js";

const getDashboardOverview = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboardOverview();

  res.status(200).json({
    success: true,
    data,
  });
});

export { getDashboardOverview };