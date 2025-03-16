// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI: any = process.env.MONGODB_URI;

const opts = {
  bufferCommands: true,
};

let isConnected = false;

export default async function connectDB() {
  if (isConnected) {
    console.log("Using existing connection");
    return;
  }

  try {
    console.log("Creating new MongoDB connection...");
    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
