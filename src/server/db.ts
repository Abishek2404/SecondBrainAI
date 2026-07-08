import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/secondbrain";
    console.log("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn("If you are using MongoDB Atlas, make sure your username and password are correct and IP 0.0.0.0/0 is whitelisted.");
    throw error;
  }
};

