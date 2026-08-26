import { Request, Response } from "express";
import { projectService } from "../services/project.service";
import { storageService } from "../services/storage.service";
import { CreateProjectDTO, UpdateProjectDTO } from "../types/project.types";

export class ProjectController {
   async getAllProjects(req: Request, res: Response): Promise<void> {
      try {
         const projects = await projectService.getAll();
         res.json({ success: true, data: projects });
      } catch (error: any) {
         console.error("Error fetching projects:", error);
         res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch projects",
         });
      }
   }

   async getProjectById(req: Request, res: Response): Promise<void> {
      try {
         const { id } = req.params;
         const project = await projectService.getById(id);

         if (!project) {
            res.status(404).json({
               success: false,
               error: "Project not found",
            });
            return;
         }

         res.json({ success: true, data: project });
      } catch (error: any) {
         console.error("Error fetching project:", error);
         res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch project",
         });
      }
   }

   async createProject(req: Request, res: Response): Promise<void> {
      try {
         const body = req.body as CreateProjectDTO;

         if (!body.title || !body.title.trim()) {
            res.status(400).json({
               success: false,
               error: "Project title is required",
            });
            return;
         }

         if (!body.short_description || !body.short_description.trim()) {
            res.status(400).json({
               success: false,
               error: "Short description is required",
            });
            return;
         }

         const project = await projectService.create(body);
         res.status(201).json({ success: true, data: project });
      } catch (error: any) {
         console.error("Error creating project:", error);
         res.status(500).json({
            success: false,
            error: error.message || "Failed to create project",
         });
      }
   }

   async updateProject(req: Request, res: Response): Promise<void> {
      try {
         const { id } = req.params;
         const body = req.body as UpdateProjectDTO;

         const project = await projectService.update(id, body);

         if (!project) {
            res.status(404).json({
               success: false,
               error: "Project not found",
            });
            return;
         }

         res.json({ success: true, data: project });
      } catch (error: any) {
         console.error("Error updating project:", error);
         res.status(500).json({
            success: false,
            error: error.message || "Failed to update project",
         });
      }
   }

   async deleteProject(req: Request, res: Response): Promise<void> {
      try {
         const { id } = req.params;
         const success = await projectService.delete(id);

         if (!success) {
            res.status(404).json({
               success: false,
               error: "Project not found or already deleted",
            });
            return;
         }

         res.json({ success: true, message: "Project deleted successfully" });
      } catch (error: any) {
         console.error("Error deleting project:", error);
         res.status(500).json({
            success: false,
            error: error.message || "Failed to delete project",
         });
      }
   }

   async uploadImage(req: Request, res: Response): Promise<void> {
      try {
         if (!req.file) {
            res.status(400).json({
               success: false,
               error: "No image file uploaded",
            });
            return;
         }

         const { buffer, originalname, mimetype } = req.file;
         const uploadResult = await storageService.uploadImage(
            buffer,
            originalname,
            mimetype,
         );

         res.json({
            success: true,
            image_url: uploadResult.image_url,
            image_path: uploadResult.image_path,
         });
      } catch (error: any) {
         console.error("Image upload failed:", error);
         res.status(500).json({
            success: false,
            error: error.message || "Image upload failed",
         });
      }
   }

   async reorderProjects(req: Request, res: Response): Promise<void> {
      try {
         const { items } = req.body as {
            items: { id: string; display_order: number }[];
         };

         if (!Array.isArray(items)) {
            res.status(400).json({
               success: false,
               error: "Items array is required",
            });
            return;
         }

         await projectService.reorder(items);
         res.json({
            success: true,
            message: "Projects reordered successfully",
         });
      } catch (error: any) {
         console.error("Error reordering projects:", error);
         res.status(500).json({
            success: false,
            error: error.message || "Failed to reorder projects",
         });
      }
   }

   async getSupabaseStatus(req: Request, res: Response): Promise<void> {
      try {
         const supabaseUrl = process.env.SUPABASE_URL;
         const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
         const anonKey = process.env.SUPABASE_ANON_KEY;
         const supabaseKey = serviceRoleKey || anonKey;

         if (!supabaseUrl || !supabaseKey) {
            res.json({
               configured: false,
               message:
                  "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured in .env file",
               has_url: !!supabaseUrl,
               has_key: !!supabaseKey,
            });
            return;
         }

         const { getSupabaseClient } =
            await import("../services/supabase.client");
         const supabase = getSupabaseClient();

         if (!supabase) {
            res.json({
               configured: false,
               message:
                  "Failed to initialize Supabase client. Check your URL format.",
            });
            return;
         }

         const { data, error, count } = await supabase
            .from("projects")
            .select("*", { count: "exact" });

         if (error) {
            res.json({
               configured: true,
               connected: false,
               error: error.message,
               code: error.code,
               details: error.details,
               hint: error.hint,
               key_type: serviceRoleKey ? "service_role" : "anon",
               note:
                  error.code === "42501" ||
                  error.message?.includes("violates row-level security")
                     ? "RLS is blocking queries. Please disable RLS or add Policies in Supabase."
                     : error.message,
            });
            return;
         }

         res.json({
            configured: true,
            connected: true,
            table: "projects",
            key_type: serviceRoleKey ? "service_role" : "anon",
            row_count: count ?? (data ? data.length : 0),
            data: data || [],
         });
      } catch (err: any) {
         res.status(500).json({
            configured: false,
            error: err.message,
         });
      }
   }
}

export const projectController = new ProjectController();
