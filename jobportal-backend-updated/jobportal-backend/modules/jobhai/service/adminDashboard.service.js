import * as userService from "./adminUser.service.js";
import * as employerService from "./adminEmployer.service.js";
import * as jobService from "./adminJob.service.js";

/**
 * Combines stats from Users, Employers, and Jobs for the admin dashboard
 */
export async function getDashboardOverview() {
  const [
    userStats,
    employerStats,
    jobStats,
    categoryBreakdown,
  ] = await Promise.all([
    userService.getUserStats(),
    employerService.getEmployerStats(),
    jobService.getJobStats(),
    jobService.getJobCategoryBreakdown(),
  ]);

  return {
    users: userStats,
    employers: employerStats,
    jobs: jobStats,
    jobCategoryBreakdown: categoryBreakdown,
  };
}