import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { connectDB } from "./src/server/db";
import apiRoutes from "./src/server/routes";
import { errorHandler } from "./src/server/middlewares/error";
import { protect } from "./src/server/middlewares/auth";

// Load environment variables
dotenv.config();

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  const app = express();
  const PORT = 3000;

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
      const filePath = path.join(process.cwd(), "uploads", filename);
      
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handler middleware
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
