import cron         from "node-cron";
import Employee     from "../modules/hrms/models/Employee.model.js";
import LeaveBalance from "../modules/hrms/models/LeaveBalance.model.js";

// Har saal 1 January midnight ko chale
cron.schedule("0 0 1 1 *", async () => {
  try {
    const newYear   = new Date().getFullYear();
    const employees = await Employee.find({ status: "active" });

    let created = 0;
    for (const emp of employees) {
      const exists = await LeaveBalance.findOne({
        employee: emp._id,
        year: newYear,
      });

      if (!exists) {
        await LeaveBalance.create({
          employee:  emp._id,
          year:      newYear,
          // Default values model se automatically aayenge
        });
        created++;
      }
    }

    console.log(`✅ New year leave balances created: ${created} employees (${newYear})`);
  } catch (err) {
    console.error("❌ Leave balance cron failed:", err.message);
  }
});