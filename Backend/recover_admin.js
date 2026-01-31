import mongoose from "mongoose";
import { User } from "./models/userSchema.js";
import { config } from "dotenv";

config();

const recoverAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is missing in .env file");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "Life_Care_Hospital",
        });
        console.log("✅ Connected to Database");

        // Check for existing users with Admin role
        const admins = await User.find({ role: "Admin" });

        if (admins.length > 0) {
            console.log(`ℹ️ Found ${admins.length} existing admin(s).`);

            const adminToUpdate = admins[0];
            console.log(`🔄 Resetting password for admin: ${adminToUpdate.email}`);

            adminToUpdate.password = "Admin123!"; // The schema will hash this automatically
            await adminToUpdate.save();

            console.log("✅ Password updated successfully.");
            console.log("------------------------------------------------");
            console.log("📧 Email:    " + adminToUpdate.email);
            console.log("🔑 Password: Admin123!");
            console.log("------------------------------------------------");

        } else {
            console.log("ℹ️ No admin found. Creating a new one...");

            const newAdmin = await User.create({
                firstName: "Super",
                lastName: "Admin",
                email: "admin@hospital.com",
                phone: "9998887770", // 10 digits
                dob: new Date("1990-01-01"),
                aadhaar: "123412341234",
                gender: "Male",
                password: "Admin123!",
                role: "Admin",
            });

            console.log("✅ New Admin created successfully.");
            console.log("------------------------------------------------");
            console.log("📧 Email:    admin@hospital.com");
            console.log("🔑 Password: Admin123!");
            console.log("------------------------------------------------");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected from Database");
        process.exit(0);
    }
};

recoverAdmin();
