import { Router } from "express";
import multer from "multer";
import { projectController } from "../controllers/project.controller";

const router = Router();

// Configure Multer memory storage for direct buffer upload to Supabase Storage
const upload = multer({
   storage: multer.memoryStorage(),
   limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
   },
   fileFilter: (_req, file, cb) => {
      const allowedMimes = [
         "image/jpeg",
         "image/jpg",
         "image/png",
         "image/webp",
         "image/svg+xml",
      ];
      if (allowedMimes.includes(file.mimetype.toLowerCase())) {
         cb(null, true);
      } else {
         cb(
            new Error(
               "Invalid image type. Only PNG, JPG, JPEG, WebP, and SVG are supported.",
            ),
         );
      }
   },
});

// Image upload endpoints
router.post("/upload", upload.single("image"), (req, res) =>
   projectController.uploadImage(req, res),
);
router.post("/projects/upload", upload.single("image"), (req, res) =>
   projectController.uploadImage(req, res),
);

// Project CRUD routes
router.get("/supabase/status", (req, res) =>
   projectController.getSupabaseStatus(req, res),
);
router.get("/projects", (req, res) =>
   projectController.getAllProjects(req, res),
);
router.get("/projects/:id", (req, res) =>
   projectController.getProjectById(req, res),
);
router.post("/projects", (req, res) =>
   projectController.createProject(req, res),
);
router.put("/projects/reorder", (req, res) =>
   projectController.reorderProjects(req, res),
);
router.put("/projects/:id", (req, res) =>
   projectController.updateProject(req, res),
);
router.delete("/projects/:id", (req, res) =>
   projectController.deleteProject(req, res),
);

export default router;
