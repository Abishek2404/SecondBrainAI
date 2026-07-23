import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { connectDB } from "../src/server/db";
import apiRoutes from "../src/server/routes";
import { errorHandler } from "../src/server/middlewares/error";
import { protect } from "../src/server/middlewares/auth";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Mount API Routes
app.use("/api", apiRoutes);

// Authenticated file serving
app.get("/uploads/:filename", async (req: any, res: any, next: any) => {
  try {
    const filename = req.params.filename;
    const filePath = process.env.VERCEL ? path.join("/tmp/uploads", filename) : path.join(process.cwd(), "uploads", filename);
    
    // If it's an avatar, allow public access
    if (filename.startsWith('avatar-')) {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }
      return res.sendFile(filePath);
    }
    
    // Otherwise require authentication
    protect(req, res, async () => {
      try {
        const Document = mongoose.model("Document");
        const document: any = await Document.findOne({ url: `/uploads/${filename}` });
        
        if (!document) {
          return res.status(404).json({ error: "File not found" });
        }

        if (document.user.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
          return res.status(403).json({ error: "Unauthorized access to file" });
        }
        
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: "File not found on disk" });
        }

        res.sendFile(filePath);
      } catch(e) {
        next(e);
      }
    });
  } catch (error) {
    next(error);
  }
});

// Health Route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// RAG / AI Chat Mock Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let retries = 3;
    let response;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: message }]
            }
          ]
        });
        break;
      } catch (error: any) {
        if (attempt === retries - 1) throw error;
        const errorStr = String(error);
        if (errorStr.includes('429') || errorStr.includes('503') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('UNAVAILABLE')) {
          console.warn(`chat rate limit/503 hit, retrying attempt ${attempt + 1} in 5s...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }

    res.json({ reply: response?.text || "I'm sorry, I couldn't generate a response." });

  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

// Error handler middleware
app.use(errorHandler);

// We define a wrapper that ensures the DB is connected before handling the request
export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (error) {
    console.error("Vercel DB Connection Error:", error);
  }
  return app(req, res);
}
