import Job from "../models/Job.js";
import Application from "../models/Application.js";

async function getEmployerDashboard(employerId) {
  const [jobStats, applicationStats, recentApplications] = await Promise.all([
    Job.aggregate([
      { $match: { employer: employerId, isDeleted: { $ne: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Application.aggregate([
      { $match: { employer: employerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Application.find({ employer: employerId })
      .populate("candidate", "name email city")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const toMap = (arr) => arr.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});

  return {
    jobs: toMap(jobStats),
    applications: toMap(applicationStats),
    recentApplications,
  };
}

export { getEmployerDashboard };
