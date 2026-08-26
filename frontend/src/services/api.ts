import { Project } from "../types";

export interface ApiResponse<T> {
   success: boolean;
   data?: T;
   error?: string;
   message?: string;
}

export interface UploadResponse {
   success: boolean;
   image_url?: string;
   image_path?: string;
   error?: string;
}

export const api = {
   async getProjects(): Promise<Project[]> {
      const response = await fetch("/api/projects");
      if (!response.ok) {
         throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const json: ApiResponse<Project[]> = await response.json();
      if (!json.success || !json.data) {
         throw new Error(json.error || "Failed to fetch projects");
      }
      return json.data;
   },

   async getProject(id: string): Promise<Project> {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
         throw new Error(`Failed to fetch project: ${response.statusText}`);
      }
      const json: ApiResponse<Project> = await response.json();
      if (!json.success || !json.data) {
         throw new Error(json.error || "Project not found");
      }
      return json.data;
   },

   async createProject(project: Partial<Project>): Promise<Project> {
      const response = await fetch("/api/projects", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(project),
      });

      const json: ApiResponse<Project> = await response.json();
      if (!response.ok || !json.success || !json.data) {
         throw new Error(json.error || "Failed to create project");
      }
      return json.data;
   },

   async updateProject(
      id: string,
      project: Partial<Project>,
   ): Promise<Project> {
      const response = await fetch(`/api/projects/${id}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(project),
      });

      const json: ApiResponse<Project> = await response.json();
      if (!response.ok || !json.success || !json.data) {
         throw new Error(json.error || "Failed to update project");
      }
      return json.data;
   },

   async deleteProject(id: string): Promise<void> {
      const response = await fetch(`/api/projects/${id}`, {
         method: "DELETE",
      });

      const json: ApiResponse<void> = await response.json();
      if (!response.ok || !json.success) {
         throw new Error(json.error || "Failed to delete project");
      }
   },

   async uploadImage(
      file: File,
   ): Promise<{ image_url: string; image_path: string }> {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
         method: "POST",
         body: formData,
      });

      const json: UploadResponse = await response.json();
      if (
         !response.ok ||
         !json.success ||
         !json.image_url ||
         !json.image_path
      ) {
         throw new Error(
            json.error || "Failed to upload image to Supabase Storage",
         );
      }

      return {
         image_url: json.image_url,
         image_path: json.image_path,
      };
   },

   async reorderProjects(
      items: { id: string; display_order: number }[],
   ): Promise<void> {
      const response = await fetch("/api/projects/reorder", {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ items }),
      });

      const json: ApiResponse<void> = await response.json();
      if (!response.ok || !json.success) {
         throw new Error(json.error || "Failed to reorder projects");
      }
   },
};
