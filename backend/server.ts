import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import projectRoutes from "./server/routes/project.routes";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;

// CORS
app.use(
   cors({
      origin: "https://portfolio-management-wheat-six.vercel.app/",
      credentials: true,
   }),
);

// Body parsers
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Health check
app.get("/api/health", (_req, res) => {
   res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
   });
});

// API routes
app.use("/api", projectRoutes);

// 404 handler
app.use((_req, res) => {
   res.status(404).json({
      success: false,
      message: "Route not found",
   });
});

// Global error handler
app.use(
   (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
   ) => {
      console.error("Server Error:", err);

      res.status(500).json({
         success: false,
         message: "Internal server error",
      });
   },
);

// Start server
app.listen(PORT, "0.0.0.0", () => {
   console.log(`Backend server running on port ${PORT}`);
});
