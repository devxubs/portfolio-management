import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import projectRoutes from "./server/routes/project.routes";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;

// CORS

const allowedOrigins = (process.env.FRONTEND_URL || "")
   .split(",")
   .map((origin) => origin.trim())
   .filter(Boolean);

app.use(
   cors({
      origin: (origin, callback) => {
         // Allow requests without an Origin header
         // such as Postman/server-to-server requests.
         if (!origin) {
            return callback(null, true);
         }

         if (allowedOrigins.includes(origin)) {
            return callback(null, true);
         }

         return callback(new Error(`CORS blocked: ${origin}`), false);
      },
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
