import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/secondbrain";
    console.log("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn("If you are using MongoDB Atlas, make sure to whitelist IP 0.0.0.0/0 in your Network Access settings.");
    // Do not exit process so the app can still boot
  }
};

