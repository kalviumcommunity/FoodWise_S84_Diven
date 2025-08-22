import mongoose from "mongoose";

export async function connectToDatabase(mongoUri) {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.warn("MongoDB connection failed. Continuing without DB.", error.message);
  }
}


