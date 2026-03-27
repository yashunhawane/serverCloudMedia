import "./env.js";
import mongoose from "mongoose";
import { requireEnv } from "./env.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(requireEnv("MONGO_URI"));

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
