import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import projectRoutes from "./server/routes/project.routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

async function startServer() {
   const app = express();
   const PORT = 3000;

   app.use(
      cors({
         origin: process.env.FRONTEND_URL,
         credentials: true,
      }),
   );

   // JSON and URL-encoded body parser
   app.use(express.json({ limit: "20mb" }));
   app.use(express.urlencoded({ extended: true, limit: "20mb" }));

   // API Routes
   app.get("/api/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
   });

   app.use("/api", projectRoutes);

   // Vite middleware for development vs static build for production
   if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
         server: { middlewareMode: true },
         appType: "spa",
      });
      app.use(vite.middlewares);
   } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
         res.sendFile(path.join(distPath, "index.html"));
      });
   }

   app.listen(PORT, "0.0.0.0", () => {
      console.log(
         `Portfolio Project Management server running on http://localhost:${PORT}`,
      );
   });
}

startServer().catch((err) => {
   console.error("Failed to start server:", err);
   process.exit(1);
});
