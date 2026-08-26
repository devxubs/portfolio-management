import {
   Project,
   CreateProjectDTO,
   UpdateProjectDTO,
} from "../types/project.types";
import { getSupabaseClient } from "./supabase.client";
import { storageService } from "./storage.service";
import crypto from "crypto";

// In-memory fallback store to ensure the application is immediately operational out-of-the-box
let inMemoryProjects: Project[] = [
   {
      id: "proj-devx-001",
      title: "DevX Business Platform",
      slug: "devx-business-platform",
      short_description:
         "Modern business management platform with automated analytics and real-time CRM sync.",
      description: `## Overview\nDevX Business Platform is an enterprise-grade SaaS solution designed to unify multi-channel customer interactions, sales automation, and real-time financial tracking.\n\n### Key Architectural Features\n- **Microservices Engine**: Built with Express and Node.js for ultra-low latency event streaming.\n- **Real-time Synchronization**: Supabase realtime channels and PostgreSQL triggers for zero-lag CRM updates.\n- **Modern UI**: React 19, Tailwind CSS, and optimized data tables capable of rendering 10,000+ data rows with 60fps virtualization.\n\n### Technical Challenges & Solutions\n- Solved high-volume webhook ingestion bottleneck using redis queuing and idempotent database transactions.\n- Reduced asset payload size by 65% through WebP image optimization and lazy module splitting.`,
      image_url:
         "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      image_path: "covers/devx-business-platform.webp",
      category: "Web App",
      technologies: [
         "React",
         "TypeScript",
         "Node.js",
         "Express",
         "Tailwind CSS",
         "Supabase",
         "PostgreSQL",
      ],
      live_url: "https://devx-platform.example.com",
      github_url: "https://github.com/devxub/devx-business-platform",
      featured: true,
      status: "published",
      display_order: 1,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
   },
   {
      id: "proj-shop-002",
      title: "Aura Commerce Suite",
      slug: "aura-commerce-suite",
      short_description:
         "High-performance headless e-commerce engine with AI-driven product recommendations.",
      description: `## Architectural Highlights\n- **Headless Storefront**: Next.js & React with server-side rendering for optimal Core Web Vitals.\n- **Stripe & Supabase**: Webhook-driven payment pipeline with instant inventory reservations.\n- **Search & Filtering**: Sub-millisecond faceted search with PostgreSQL full-text search indexes.`,
      image_url:
         "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80",
      image_path: "covers/aura-commerce-suite.webp",
      category: "E-commerce",
      technologies: [
         "Next.js",
         "React",
         "TypeScript",
         "Tailwind CSS",
         "PostgreSQL",
         "Stripe",
         "Docker",
      ],
      live_url: "https://aura-shop.example.com",
      github_url: "https://github.com/devxub/aura-commerce",
      featured: true,
      status: "published",
      display_order: 2,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
   },
   {
      id: "proj-pos-003",
      title: "OmniPOS Cloud Terminal",
      slug: "omnipos-cloud-terminal",
      short_description:
         "Offline-first point of sale terminal with automatic background sync and hardware telemetry.",
      description: `## System Architecture\nDesigned for mission-critical retail environments where network dropouts cannot halt transactions.\n\n- **Local-first Cache**: Local IndexedDB mirror with automatic sync reconciliation to Supabase.\n- **Hardware Integrations**: WebUSB & Bluetooth thermal receipt printing and barcode scanner drivers.`,
      image_url:
         "https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=1200&q=80",
      image_path: "covers/omnipos-cloud-terminal.webp",
      category: "Dashboard",
      technologies: [
         "React",
         "TypeScript",
         "Tailwind CSS",
         "Node.js",
         "Supabase",
         "Prisma",
      ],
      live_url: "https://omnipos.example.com",
      github_url: null,
      featured: false,
      status: "draft",
      display_order: 3,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
   },
];

export class ProjectService {
   private generateSlug(title: string): string {
      return title
         .toLowerCase()
         .trim()
         .replace(/[^a-z0-9\s-]/g, "")
         .replace(/[\s-]+/g, "-");
   }

   async getAll(): Promise<Project[]> {
      const supabase = getSupabaseClient();
      if (supabase) {
         try {
            const { data, error } = await supabase
               .from("projects")
               .select("*")
               .order("display_order", { ascending: true })
               .order("created_at", { ascending: false });

            if (!error && data && data.length > 0) {
               return data as Project[];
            }
         } catch (err) {
            console.warn("Supabase fetch failed, using memory store:", err);
         }
      }

      return [...inMemoryProjects].sort((a, b) => {
         if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
         }
         return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
         );
      });
   }

   async getById(id: string): Promise<Project | null> {
      const supabase = getSupabaseClient();
      if (supabase) {
         try {
            const { data, error } = await supabase
               .from("projects")
               .select("*")
               .eq("id", id)
               .single();

            if (!error && data) {
               return data as Project;
            }
         } catch (err) {
            console.warn(`Supabase getById(${id}) failed:`, err);
         }
      }

      const found = inMemoryProjects.find((p) => p.id === id);
      return found || null;
   }

   async create(dto: CreateProjectDTO): Promise<Project> {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const slug =
         dto.slug && dto.slug.trim() !== ""
            ? dto.slug.trim()
            : this.generateSlug(dto.title);

      const newProject: Project = {
         id,
         title: dto.title.trim(),
         slug,
         short_description: dto.short_description.trim(),
         description: dto.description || "",
         image_url: dto.image_url || "",
         image_path: dto.image_path || "",
         category: dto.category || "Web App",
         technologies: Array.isArray(dto.technologies) ? dto.technologies : [],
         live_url:
            dto.live_url && dto.live_url.trim() !== ""
               ? dto.live_url.trim()
               : null,
         github_url:
            dto.github_url && dto.github_url.trim() !== ""
               ? dto.github_url.trim()
               : null,
         featured: Boolean(dto.featured),
         status: dto.status === "published" ? "published" : "draft",
         display_order: Number.isFinite(dto.display_order)
            ? dto.display_order
            : inMemoryProjects.length + 1,
         created_at: now,
         updated_at: now,
      };
      console.log("Supabase ");

      const supabase = getSupabaseClient();
      if (supabase) {
         try {
            const { data, error } = await supabase
               .from("projects")
               .insert([newProject])
               .select()
               .single();

            if (!error && data) {
               inMemoryProjects.unshift(data as Project);

               return data as Project;
            } else if (error) {
               console.warn(
                  "Supabase insert failed, storing in memory:",
                  error.message,
               );
            }
         } catch (err) {
            console.warn("Supabase create exception:", err);
         }
      }

      inMemoryProjects.unshift(newProject);
      return newProject;
   }

   async update(id: string, dto: UpdateProjectDTO): Promise<Project | null> {
      const existing = await this.getById(id);
      if (!existing) {
         return null;
      }

      // Check if image is being replaced
      if (
         dto.image_path &&
         existing.image_path &&
         dto.image_path !== existing.image_path
      ) {
         // Remove old image in background
         storageService.deleteImage(existing.image_path).catch((err) => {
            console.warn("Failed to delete replaced image:", err);
         });
      }

      const now = new Date().toISOString();
      const updatedSlug =
         dto.slug !== undefined
            ? dto.slug.trim() || this.generateSlug(dto.title || existing.title)
            : dto.title && dto.title !== existing.title
              ? this.generateSlug(dto.title)
              : existing.slug;

      const updatedProject: Project = {
         ...existing,
         ...dto,
         slug: updatedSlug,
         title: dto.title !== undefined ? dto.title.trim() : existing.title,
         short_description:
            dto.short_description !== undefined
               ? dto.short_description.trim()
               : existing.short_description,
         description:
            dto.description !== undefined
               ? dto.description
               : existing.description,
         image_url:
            dto.image_url !== undefined ? dto.image_url : existing.image_url,
         image_path:
            dto.image_path !== undefined ? dto.image_path : existing.image_path,
         category:
            dto.category !== undefined ? dto.category : existing.category,
         technologies:
            dto.technologies !== undefined
               ? dto.technologies
               : existing.technologies,
         live_url:
            dto.live_url !== undefined
               ? dto.live_url && dto.live_url.trim() !== ""
                  ? dto.live_url.trim()
                  : null
               : existing.live_url,
         github_url:
            dto.github_url !== undefined
               ? dto.github_url && dto.github_url.trim() !== ""
                  ? dto.github_url.trim()
                  : null
               : existing.github_url,
         featured:
            dto.featured !== undefined
               ? Boolean(dto.featured)
               : existing.featured,
         status: dto.status !== undefined ? dto.status : existing.status,
         display_order:
            dto.display_order !== undefined
               ? Number(dto.display_order)
               : existing.display_order,
         updated_at: now,
      };

      const supabase = getSupabaseClient();
      if (supabase) {
         try {
            const { data, error } = await supabase
               .from("projects")
               .update(updatedProject)
               .eq("id", id)
               .select()
               .single();

            if (!error && data) {
               const idx = inMemoryProjects.findIndex((p) => p.id === id);
               if (idx !== -1) inMemoryProjects[idx] = data as Project;
               return data as Project;
            }
         } catch (err) {
            console.warn(`Supabase update for ${id} failed:`, err);
         }
      }

      const idx = inMemoryProjects.findIndex((p) => p.id === id);
      if (idx !== -1) {
         inMemoryProjects[idx] = updatedProject;
      }
      return updatedProject;
   }

   async delete(id: string): Promise<boolean> {
      const existing = await this.getById(id);
      if (!existing) {
         return false;
      }

      // Delete image from storage
      if (existing.image_path) {
         try {
            await storageService.deleteImage(existing.image_path);
         } catch (err) {
            console.warn(
               "Failed to delete image during project deletion:",
               err,
            );
         }
      }

      const supabase = getSupabaseClient();
      if (supabase) {
         try {
            const { error } = await supabase
               .from("projects")
               .delete()
               .eq("id", id);

            if (error) {
               console.warn("Supabase delete failed:", error);
            }
         } catch (err) {
            console.warn("Supabase delete exception:", err);
         }
      }

      inMemoryProjects = inMemoryProjects.filter((p) => p.id !== id);
      return true;
   }

   async reorder(
      items: { id: string; display_order: number }[],
   ): Promise<boolean> {
      for (const item of items) {
         const idx = inMemoryProjects.findIndex((p) => p.id === item.id);
         if (idx !== -1) {
            inMemoryProjects[idx].display_order = item.display_order;
         }
      }

      const supabase = getSupabaseClient();
      if (supabase) {
         try {
            for (const item of items) {
               await supabase
                  .from("projects")
                  .update({
                     display_order: item.display_order,
                     updated_at: new Date().toISOString(),
                  })
                  .eq("id", item.id);
            }
         } catch (err) {
            console.warn("Supabase reorder update failed:", err);
         }
      }

      return true;
   }
}

export const projectService = new ProjectService();
