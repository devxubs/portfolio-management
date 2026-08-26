import React, { useState, useEffect, useCallback } from "react";

import { Layers, Database, ShieldCheck, LogOut } from "lucide-react";

import { Project } from "./types";
import { api } from "./services/api";

import { ProjectList } from "./components/ProjectList";
import { ProjectForm } from "./components/ProjectForm";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { ProjectPreviewModal } from "./components/ProjectPreviewModal";
import { SupabaseStatusModal } from "./components/SupabaseStatusModal";
import { ToastContainer, ToastMessage } from "./components/Toast";

import AdminLogin from "./components/AdminLogin";

// Same values used in AdminLogin
const ADMIN_EMAIL = "devxub@gmail.com";
const ADMIN_PASSWORD = "jubayer606";

const ADMIN_CODE = btoa(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`);

export default function App() {
   // ============================================
   // AUTH STATE
   // ============================================

   const [isLoggedIn, setIsLoggedIn] = useState(
      localStorage.getItem("admin_code") === ADMIN_CODE,
   );

   // ============================================
   // PROJECT STATES
   // ============================================

   const [projects, setProjects] = useState<Project[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   const [isFormOpen, setIsFormOpen] = useState(false);

   const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

   const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

   const [projectToPreview, setProjectToPreview] = useState<Project | null>(
      null,
   );

   const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

   const [isDeleting, setIsDeleting] = useState(false);

   // ============================================
   // TOAST
   // ============================================

   const [toasts, setToasts] = useState<ToastMessage[]>([]);

   const showToast = useCallback(
      (type: "success" | "error" | "info", message: string) => {
         const id = Math.random().toString(36).substring(2, 9);

         setToasts((prev) => [
            ...prev,
            {
               id,
               type,
               message,
            },
         ]);
      },
      [],
   );

   const dismissToast = useCallback((id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
   }, []);

   // ============================================
   // LOAD PROJECTS
   // ============================================

   const loadProjects = useCallback(async () => {
      try {
         setIsLoading(true);

         const data = await api.getProjects();

         setProjects(data);
      } catch (err: any) {
         showToast("error", err?.message || "Failed to load projects");
      } finally {
         setIsLoading(false);
      }
   }, [showToast]);

   useEffect(() => {
      if (isLoggedIn) {
         loadProjects();
      }
   }, [isLoggedIn, loadProjects]);

   // ============================================
   // ADD PROJECT
   // ============================================

   const handleOpenAdd = () => {
      setProjectToEdit(null);
      setIsFormOpen(true);
   };

   // ============================================
   // EDIT PROJECT
   // ============================================

   const handleOpenEdit = (project: Project) => {
      setProjectToEdit(project);
      setIsFormOpen(true);
   };

   // ============================================
   // PREVIEW PROJECT
   // ============================================

   const handleOpenPreview = (project: Project) => {
      setProjectToPreview(project);
   };

   // ============================================
   // DELETE PROJECT
   // ============================================

   const handleOpenDelete = (project: Project) => {
      setProjectToDelete(project);
   };

   const handleConfirmDelete = async () => {
      if (!projectToDelete) return;

      try {
         setIsDeleting(true);

         await api.deleteProject(projectToDelete.id);

         setProjects((prev) =>
            prev.filter((project) => project.id !== projectToDelete.id),
         );

         showToast(
            "success",
            `Deleted project "${projectToDelete.title}" and cleared storage image`,
         );

         setProjectToDelete(null);
      } catch (err: any) {
         showToast("error", err?.message || "Failed to delete project");
      } finally {
         setIsDeleting(false);
      }
   };

   // ============================================
   // PROJECT SAVED
   // ============================================

   const handleProjectSaved = (saved: Project) => {
      setProjects((prev) => {
         const exists = prev.some((project) => project.id === saved.id);

         if (exists) {
            return prev.map((project) =>
               project.id === saved.id ? saved : project,
            );
         }

         return [saved, ...prev];
      });
   };

   // ============================================
   // REORDER
   // ============================================

   const handleReorder = async (reordered: Project[]) => {
      setProjects(reordered);

      try {
         await api.reorderProjects(
            reordered.map((project) => ({
               id: project.id,
               display_order: project.display_order,
            })),
         );

         showToast("info", "Project display order updated");
      } catch {
         showToast("error", "Failed to save project order");

         loadProjects();
      }
   };

   // ============================================
   // LOGOUT
   // ============================================

   const handleLogout = () => {
      localStorage.removeItem("admin_code");

      setIsLoggedIn(false);
   };

   // ============================================
   // LOGIN PAGE
   // ============================================

   if (!isLoggedIn) {
      return (
         <AdminLogin
         // onLogin={() => {
         //    setIsLoggedIn(true);
         // }}
         />
      );
   }

   // ============================================
   // ADMIN DASHBOARD
   // ============================================

   return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
         {/* Top Navigation */}
         <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
               {/* Logo */}
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                     <Layers className="w-4 h-4" />
                  </div>

                  <div>
                     <span className="font-bold text-sm tracking-tight text-white block">
                        Portfolio Admin
                     </span>

                     <span className="text-[10px] text-zinc-400 block -mt-0.5">
                        Project Management System
                     </span>
                  </div>
               </div>

               {/* Right Side */}
               <div className="flex items-center gap-2 sm:gap-3">
                  {/* Supabase Status */}
                  <button
                     onClick={() => setIsStatusModalOpen(true)}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 transition-colors shadow-sm cursor-pointer group"
                     title="Check Supabase Connection & RLS status"
                  >
                     <Database className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />

                     <span className="font-mono text-zinc-200">
                        Supabase Status
                     </span>

                     <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </button>

                  {/* Storage */}
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400">
                     <ShieldCheck className="w-3 h-3 text-indigo-400" />

                     <span className="font-mono">portfolio-projects</span>
                  </div>

                  {/* Logout */}
                  <button
                     onClick={handleLogout}
                     className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-400 transition hover:bg-red-500/20 cursor-pointer"
                  >
                     <LogOut className="w-3.5 h-3.5" />

                     <span className="hidden sm:inline">Logout</span>
                  </button>
               </div>
            </div>
         </header>

         {/* Main */}
         <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProjectList
               projects={projects}
               isLoading={isLoading}
               onAddProject={handleOpenAdd}
               onEditProject={handleOpenEdit}
               onDeleteProject={handleOpenDelete}
               onPreviewProject={handleOpenPreview}
               onReorder={handleReorder}
            />
         </main>

         {/* Supabase Status */}
         <SupabaseStatusModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            onRefreshProjects={loadProjects}
         />

         {/* Add / Edit */}
         {isFormOpen && (
            <ProjectForm
               projectToEdit={projectToEdit}
               onClose={() => setIsFormOpen(false)}
               onSaved={handleProjectSaved}
               showToast={showToast}
            />
         )}

         {/* Delete */}
         <DeleteConfirmModal
            project={projectToDelete}
            isOpen={!!projectToDelete}
            isDeleting={isDeleting}
            onClose={() => setProjectToDelete(null)}
            onConfirm={handleConfirmDelete}
         />

         {/* Preview */}
         <ProjectPreviewModal
            project={projectToPreview}
            isOpen={!!projectToPreview}
            onClose={() => setProjectToPreview(null)}
            onEdit={(project) => {
               setProjectToPreview(null);
               handleOpenEdit(project);
            }}
         />

         {/* Toast */}
         <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
   );
}
