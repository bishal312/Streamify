import mongoose from "mongoose";

export const connectDB = async ()=>{
  try {
    const conn =await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully...");
  } catch (error) {
    console.log("Error occors while connecting to MongoDB", error);
    process.exit(1);
  }
}