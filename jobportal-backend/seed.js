import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.model.js";

async function seedDatabase() {
  try {
    await connectDB();
    console.log("🌱 Seeding database...\n");

    await User.deleteMany({});
    console.log("🗑️ Old users cleared.");

    console.log("Creating Admin and Users safely...");
    
    // Ab yeh bina error ke chalega kyunki model fix ho gaya hai!
    await User.create([
      {
        name: "Super Admin",
        email: "admin@edu.com",
        password: "admin@123", // Automatic hash hoga!
        role: "admin",
        isVerified: true,
        status: "active",
      },
      { 
        name: "Sub Admin", 
        email: "subadmin@edu.com", 
        password: "sub@123", 
        role: "subadmin", 
        isVerified: true, 
        status: "active" 
      },
      { 
        name: "John Counsellor", 
        email: "counsel@edu.com", 
        password: "counsel@123", 
        role: "counsellor", 
        isVerified: true, 
        status: "active"
      },
      { 
        name: "Rahul Student", 
        email: "student@edu.com", 
        password: "student@123", 
        role: "student",    
        isVerified: true, 
        status: "active"
      }
    ]);

    console.log("✅ All users seeded successfully with hashed passwords!");

  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    process.exit(0);
  }
}

seedDatabase();