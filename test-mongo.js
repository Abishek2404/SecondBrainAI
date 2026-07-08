import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Connected");
  process.exit(0);
}).catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
