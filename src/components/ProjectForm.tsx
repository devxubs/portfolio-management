import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
   X,
   Upload,
   Image as ImageIcon,
   Check,
   Plus,
   Trash2,
   ExternalLink,
   Github,
   Layers,
   Sparkles,
   Eye,
   FileText,
   Loader2,
   HelpCircle,
   RefreshCw,
} from "lucide-react";
import Markdown from "react-markdown";
import {
   Project,
   ProjectFormData,
   PREDEFINED_CATEGORIES,
   POPULAR_TECHNOLOGIES,
} from "../types";
import { api } from "../services/api";

interface ProjectFormProps {
   projectToEdit: Project | null;
   onClose: () => void;
   onSaved: (project: Project) => void;
   showToast: (type: "success" | "error" | "info", message: string) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
   projectToEdit,
   onClose,
   onSaved,
   showToast,
}) => {
   const isEditing = !!projectToEdit;

   // Form State
   const [formData, setFormData] = useState<ProjectFormData>({
      title: "",
      slug: "",
      short_description: "",
      description: "",
      image_url: "",
      image_path: "",
      category: "Web App",
      custom_category: "",
      technologies: [],
      live_url: "",
      github_url: "",
      featured: false,
      status: "published",
      display_order: 1,
   });

   const [customTechInput, setCustomTechInput] = useState("");
   const [isCustomCategory, setIsCustomCategory] = useState(false);
   const [isUploadingImage, setIsUploadingImage] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [previewTab, setPreviewTab] = useState<"write" | "preview">("write");
   const [errors, setErrors] = useState<{ [key: string]: string }>({});

   const fileInputRef = useRef<HTMLInputElement>(null);

   // Initialize form when editing
   useEffect(() => {
      if (projectToEdit) {
         const isPredefined = PREDEFINED_CATEGORIES.includes(
            projectToEdit.category as any,
         );
         setFormData({
            title: projectToEdit.title,
            slug: projectToEdit.slug,
            short_description: projectToEdit.short_description,
            description: projectToEdit.description || "",
            image_url: projectToEdit.image_url,
            image_path: projectToEdit.image_path,
            category: isPredefined ? projectToEdit.category : "Other",
            custom_category: isPredefined ? "" : projectToEdit.category,
            technologies: [...projectToEdit.technologies],
            live_url: projectToEdit.live_url || "",
            github_url: projectToEdit.github_url || "",
            featured: projectToEdit.featured,
            status: projectToEdit.status,
            display_order: projectToEdit.display_order,
         });
         setIsCustomCategory(!isPredefined);
      } else {
         // Defaults for new project
         setFormData({
            title: "",
            slug: "",
            short_description: "",
            description: "",
            image_url: "",
            image_path: "",
            category: "Web App",
            custom_category: "",
            technologies: ["React", "TypeScript", "Tailwind CSS"],
            live_url: "",
            github_url: "",
            featured: false,
            status: "published",
            display_order: 1,
         });
         setIsCustomCategory(false);
      }
   }, [projectToEdit]);

   const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      const generatedSlug = title
         .toLowerCase()
         .trim()
         .replace(/[^a-z0-9\s-]/g, "")
         .replace(/[\s-]+/g, "-");

      setFormData((prev) => ({
         ...prev,
         title,
         // If user hasn't custom edited slug, sync it with title
         slug: generatedSlug,
      }));

      if (errors.title) {
         setErrors((prev) => ({ ...prev, title: "" }));
      }
   };

   const handleFileUpload = async (file: File) => {
      const allowedTypes = [
         "image/jpeg",
         "image/jpg",
         "image/png",
         "image/webp",
         "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
         showToast(
            "error",
            "Unsupported format. Please upload PNG, JPG, JPEG, WebP, or SVG.",
         );
         return;
      }

      try {
         setIsUploadingImage(true);
         const res = await api.uploadImage(file);
         setFormData((prev) => ({
            ...prev,
            image_url: res.image_url,
            image_path: res.image_path,
         }));
         showToast(
            "success",
            "Project image uploaded to portfolio-projects bucket!",
         );
      } catch (err: any) {
         showToast("error", err.message || "Image upload failed");
      } finally {
         setIsUploadingImage(false);
      }
   };

   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
         handleFileUpload(e.dataTransfer.files[0]);
      }
   };

   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
   };

   const handleRemoveImage = () => {
      setFormData((prev) => ({
         ...prev,
         image_url: "",
         image_path: "",
      }));
   };

   // Technologies management
   const togglePopularTech = (tech: string) => {
      setFormData((prev) => {
         const exists = prev.technologies.includes(tech);
         if (exists) {
            return {
               ...prev,
               technologies: prev.technologies.filter((t) => t !== tech),
            };
         } else {
            return { ...prev, technologies: [...prev.technologies, tech] };
         }
      });
   };

   const addCustomTech = () => {
      const trimmed = customTechInput.trim();
      if (!trimmed) return;
      if (!formData.technologies.includes(trimmed)) {
         setFormData((prev) => ({
            ...prev,
            technologies: [...prev.technologies, trimmed],
         }));
      }
      setCustomTechInput("");
   };

   const removeTech = (techToRemove: string) => {
      setFormData((prev) => ({
         ...prev,
         technologies: prev.technologies.filter((t) => t !== techToRemove),
      }));
   };

   // Submit validation and execution
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: { [key: string]: string } = {};

      if (!formData.title.trim()) {
         newErrors.title = "Project title is required";
      }

      if (!formData.short_description.trim()) {
         newErrors.short_description = "Short description is required";
      }

      if (Object.keys(newErrors).length > 0) {
         setErrors(newErrors);
         showToast("error", "Please fill in all required fields.");
         return;
      }

      const finalCategory =
         isCustomCategory && formData.custom_category.trim()
            ? formData.custom_category.trim()
            : formData.category;

      const payload: Partial<Project> = {
         title: formData.title.trim(),
         slug:
            formData.slug.trim() ||
            formData.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
         short_description: formData.short_description.trim(),
         description: formData.description.trim(),
         image_url: formData.image_url.trim(),
         image_path: formData.image_path.trim(),
         category: finalCategory,
         technologies: formData.technologies,
         live_url: formData.live_url.trim() || null,
         github_url: formData.github_url.trim() || null,
         featured: formData.featured,
         status: formData.status,
         display_order: Number(formData.display_order) || 1,
      };

      try {
         setIsSubmitting(true);
         let saved: Project;
         if (isEditing && projectToEdit) {
            saved = await api.updateProject(projectToEdit.id, payload);
            showToast("success", `Updated project "${saved.title}"`);
         } else {
            saved = await api.createProject(payload);

            showToast("success", `Created project "${saved.title}"`);
         }
         onSaved(saved);
         onClose();
      } catch (err: any) {
         showToast("error", err.message || "Failed to save project");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div
         id="project-form-modal-backdrop"
         className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
         onClick={onClose}
      >
         <motion.div
            id="project-form-container"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl my-auto bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
         >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 sticky top-0 z-10">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                     <Layers className="w-5 h-5" />
                  </div>
                  <div>
                     <h2
                        id="project-form-title"
                        className="text-lg font-semibold text-zinc-100"
                     >
                        {isEditing
                           ? `Edit Project: ${projectToEdit.title}`
                           : "Add New Project"}
                     </h2>
                     <p className="text-xs text-zinc-400">
                        Configure full project metadata, images, and public
                        showcase parameters
                     </p>
                  </div>
               </div>
               <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  aria-label="Close modal"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Scrollable Form Body */}
            <form
               onSubmit={handleSubmit}
               className="flex-1 overflow-y-auto p-6 space-y-6"
            >
               {/* SECTION 1: Project Information */}
               <div
                  id="section-project-info"
                  className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-5 space-y-4"
               >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
                     <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Project Information
                     </h3>
                     <span className="text-xs text-zinc-500">
                        Required fields
                     </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Title */}
                     <div className="space-y-1.5">
                        <label
                           htmlFor="project-title-input"
                           className="block text-xs font-medium text-zinc-300"
                        >
                           Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                           id="project-title-input"
                           type="text"
                           placeholder="e.g. DevX Business Platform"
                           value={formData.title}
                           onChange={handleTitleChange}
                           className={`w-full px-3.5 py-2.5 bg-zinc-900 border rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                              errors.title
                                 ? "border-rose-500/60"
                                 : "border-zinc-700/60"
                           }`}
                        />
                        {errors.title && (
                           <p className="text-xs text-rose-400">
                              {errors.title}
                           </p>
                        )}
                     </div>

                     {/* Slug */}
                     <div className="space-y-1.5">
                        <label
                           htmlFor="project-slug-input"
                           className="block text-xs font-medium text-zinc-300"
                        >
                           Slug (URL Identifier)
                        </label>
                        <input
                           id="project-slug-input"
                           type="text"
                           placeholder="devx-business-platform"
                           value={formData.slug}
                           onChange={(e) =>
                              setFormData({ ...formData, slug: e.target.value })
                           }
                           className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                     </div>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5">
                     <label
                        htmlFor="project-short-desc-input"
                        className="block text-xs font-medium text-zinc-300"
                     >
                        Short Description{" "}
                        <span className="text-rose-400">*</span>
                     </label>
                     <textarea
                        id="project-short-desc-input"
                        rows={2}
                        placeholder="Modern business management platform with automated analytics and real-time CRM sync."
                        value={formData.short_description}
                        onChange={(e) => {
                           setFormData({
                              ...formData,
                              short_description: e.target.value,
                           });
                           if (errors.short_description) {
                              setErrors((prev) => ({
                                 ...prev,
                                 short_description: "",
                              }));
                           }
                        }}
                        className={`w-full px-3.5 py-2.5 bg-zinc-900 border rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none ${
                           errors.short_description
                              ? "border-rose-500/60"
                              : "border-zinc-700/60"
                        }`}
                     />
                     {errors.short_description && (
                        <p className="text-xs text-rose-400">
                           {errors.short_description}
                        </p>
                     )}
                  </div>

                  {/* Category selection */}
                  <div className="space-y-2">
                     <label className="block text-xs font-medium text-zinc-300">
                        Category
                     </label>
                     <div className="flex flex-wrap gap-2">
                        {PREDEFINED_CATEGORIES.map((cat) => {
                           const isSelected =
                              !isCustomCategory && formData.category === cat;
                           return (
                              <button
                                 key={cat}
                                 type="button"
                                 onClick={() => {
                                    setIsCustomCategory(false);
                                    setFormData({ ...formData, category: cat });
                                 }}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    isSelected
                                       ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                                       : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                                 }`}
                              >
                                 {cat}
                              </button>
                           );
                        })}
                        <button
                           type="button"
                           onClick={() => setIsCustomCategory(true)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isCustomCategory
                                 ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                                 : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                           }`}
                        >
                           + Custom Category
                        </button>
                     </div>

                     {isCustomCategory && (
                        <div className="pt-2">
                           <input
                              id="custom-category-input"
                              type="text"
                              placeholder="Enter custom category name (e.g. AI / Machine Learning)"
                              value={formData.custom_category}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    custom_category: e.target.value,
                                 })
                              }
                              className="w-full max-w-sm px-3.5 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                           />
                        </div>
                     )}
                  </div>
               </div>

               {/* SECTION 2: Project Image */}
               <div
                  id="section-project-image"
                  className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-5 space-y-4"
               >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
                     <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Project Image
                     </h3>
                     <span className="text-xs text-zinc-500">
                        Bucket:{" "}
                        <code className="text-emerald-400 font-mono">
                           portfolio-projects
                        </code>
                     </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                     {/* Preview Area */}
                     <div className="md:col-span-5 flex flex-col items-center">
                        <div className="w-full aspect-video rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden relative flex items-center justify-center group">
                           {formData.image_url ? (
                              <>
                                 <img
                                    src={formData.image_url}
                                    alt="Project cover preview"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                 />
                                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                       type="button"
                                       onClick={() =>
                                          fileInputRef.current?.click()
                                       }
                                       className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs flex items-center gap-1 shadow-md"
                                       title="Replace Image"
                                    >
                                       <RefreshCw className="w-3.5 h-3.5" />
                                       Replace
                                    </button>
                                    <button
                                       type="button"
                                       onClick={handleRemoveImage}
                                       className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs flex items-center gap-1 shadow-md"
                                       title="Remove Image"
                                    >
                                       <Trash2 className="w-3.5 h-3.5" />
                                       Remove
                                    </button>
                                 </div>
                              </>
                           ) : (
                              <div className="text-center p-6 space-y-2">
                                 <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto" />
                                 <p className="text-xs text-zinc-500">
                                    No cover image uploaded
                                 </p>
                              </div>
                           )}
                        </div>

                        {formData.image_path && (
                           <p className="text-[11px] text-zinc-500 mt-2 truncate w-full text-center">
                              Path:{" "}
                              <span className="text-zinc-400">
                                 {formData.image_path}
                              </span>
                           </p>
                        )}
                     </div>

                     {/* Upload Dropzone */}
                     <div className="md:col-span-7 space-y-3">
                        <div
                           onDrop={handleDrop}
                           onDragOver={handleDragOver}
                           onClick={() => fileInputRef.current?.click()}
                           className="w-full border-2 border-dashed border-zinc-700/80 hover:border-indigo-500/70 rounded-xl p-6 text-center cursor-pointer transition-colors bg-zinc-900/50 hover:bg-zinc-900/80"
                        >
                           <input
                              ref={fileInputRef}
                              id="project-image-file-input"
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                 if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(e.target.files[0]);
                                 }
                              }}
                           />

                           {isUploadingImage ? (
                              <div className="flex flex-col items-center py-2 space-y-2">
                                 <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                 <p className="text-xs text-zinc-300 font-medium">
                                    Uploading to Supabase Storage...
                                 </p>
                              </div>
                           ) : (
                              <div className="space-y-2">
                                 <div className="w-10 h-10 rounded-full bg-zinc-800 text-indigo-400 mx-auto flex items-center justify-center">
                                    <Upload className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="text-xs font-medium text-zinc-200">
                                       Click to browse or drag and drop image
                                       here
                                    </p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">
                                       Supported formats: PNG, JPG, JPEG, WebP,
                                       SVG (Max 10MB)
                                    </p>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Direct Image URL input as fallback */}
                        <div className="space-y-1">
                           <label
                              htmlFor="project-image-url-input"
                              className="block text-[11px] font-medium text-zinc-400"
                           >
                              Or direct image URL
                           </label>
                           <input
                              id="project-image-url-input"
                              type="url"
                              placeholder="https://images.unsplash.com/..."
                              value={formData.image_url}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    image_url: e.target.value,
                                    image_path:
                                       formData.image_path || "external/url",
                                 })
                              }
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* SECTION 3: Technologies Used */}
               <div
                  id="section-technologies"
                  className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-5 space-y-4"
               >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
                     <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        Technologies Used
                     </h3>
                     <span className="text-xs text-zinc-500">
                        {formData.technologies.length} selected
                     </span>
                  </div>

                  {/* Selected tags */}
                  <div className="space-y-2">
                     <label className="block text-xs font-medium text-zinc-400">
                        Active Project Stack:
                     </label>
                     {formData.technologies.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl min-h-[44px]">
                           {formData.technologies.map((tech) => (
                              <span
                                 key={tech}
                                 className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700/80 shadow-sm"
                              >
                                 {tech}
                                 <button
                                    type="button"
                                    onClick={() => removeTech(tech)}
                                    className="text-zinc-400 hover:text-rose-400 transition-colors"
                                    aria-label={`Remove ${tech}`}
                                 >
                                    <X className="w-3 h-3" />
                                 </button>
                              </span>
                           ))}
                        </div>
                     ) : (
                        <div className="p-3 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl text-xs text-zinc-500 italic">
                           No technologies selected yet. Pick from the popular
                           stack below or add custom.
                        </div>
                     )}
                  </div>

                  {/* Popular quick-select */}
                  <div className="space-y-2">
                     <label className="block text-xs font-medium text-zinc-400">
                        Select Popular Technologies:
                     </label>
                     <div className="flex flex-wrap gap-1.5">
                        {POPULAR_TECHNOLOGIES.map((tech) => {
                           const isSelected =
                              formData.technologies.includes(tech);
                           return (
                              <button
                                 key={tech}
                                 type="button"
                                 onClick={() => togglePopularTech(tech)}
                                 className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
                                    isSelected
                                       ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium"
                                       : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                                 }`}
                              >
                                 {isSelected && (
                                    <Check className="w-3 h-3 text-cyan-400" />
                                 )}
                                 {tech}
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  {/* Add Custom Tech input */}
                  <div className="flex items-center gap-2 max-w-sm">
                     <input
                        id="custom-tech-input"
                        type="text"
                        placeholder="Add custom tech (e.g. Bun, Trpc)"
                        value={customTechInput}
                        onChange={(e) => setCustomTechInput(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomTech();
                           }
                        }}
                        className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                     />
                     <button
                        type="button"
                        onClick={addCustomTech}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition-colors border border-zinc-700"
                     >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                     </button>
                  </div>
               </div>

               {/* SECTION 4: Project Links */}
               <div
                  id="section-project-links"
                  className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-5 space-y-4"
               >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
                     <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Project Links
                     </h3>
                     <span className="text-xs text-zinc-500">
                        Optional fields
                     </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Live URL */}
                     <div className="space-y-1.5">
                        <label
                           htmlFor="project-live-url-input"
                           className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                        >
                           <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                           Live Demo URL
                        </label>
                        <input
                           id="project-live-url-input"
                           type="url"
                           placeholder="https://myproject.dev"
                           value={formData.live_url}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 live_url: e.target.value,
                              })
                           }
                           className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                     </div>

                     {/* GitHub URL */}
                     <div className="space-y-1.5">
                        <label
                           htmlFor="project-github-url-input"
                           className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                        >
                           <Github className="w-3.5 h-3.5 text-zinc-400" />
                           GitHub Repository URL
                        </label>
                        <input
                           id="project-github-url-input"
                           type="url"
                           placeholder="https://github.com/username/project"
                           value={formData.github_url}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 github_url: e.target.value,
                              })
                           }
                           className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                     </div>
                  </div>
               </div>

               {/* SECTION 5: Project Details & Architecture */}
               <div
                  id="section-details-architecture"
                  className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-5 space-y-4"
               >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
                     <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        Project Details & Architecture
                     </h3>
                     <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                        <button
                           type="button"
                           onClick={() => setPreviewTab("write")}
                           className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                              previewTab === "write"
                                 ? "bg-zinc-800 text-zinc-100"
                                 : "text-zinc-400 hover:text-zinc-200"
                           }`}
                        >
                           <FileText className="w-3.5 h-3.5" />
                           Write
                        </button>
                        <button
                           type="button"
                           onClick={() => setPreviewTab("preview")}
                           className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                              previewTab === "preview"
                                 ? "bg-zinc-800 text-zinc-100"
                                 : "text-zinc-400 hover:text-zinc-200"
                           }`}
                        >
                           <Eye className="w-3.5 h-3.5" />
                           Markdown Preview
                        </button>
                     </div>
                  </div>

                  {previewTab === "write" ? (
                     <div className="space-y-1.5">
                        <textarea
                           id="project-description-textarea"
                           rows={8}
                           placeholder={`Provide extended architecture overview, key technical challenges solved, or case study highlights...\n\nExample:\n## Architecture Overview\n- Backend microservices in Node.js\n- Real-time PostgreSQL streaming with Supabase\n\n### Technical Challenges & Solutions\n- Solved concurrency bottlenecks with optimistic UI caching.`}
                           value={formData.description}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 description: e.target.value,
                              })
                           }
                           className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                        />
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                           <HelpCircle className="w-3 h-3" />
                           Supports full Markdown formatting (headings, code
                           blocks, lists, bold).
                        </p>
                     </div>
                  ) : (
                     <div
                        id="markdown-preview-box"
                        className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl min-h-[180px] max-h-[300px] overflow-y-auto text-zinc-200 text-sm prose prose-invert max-w-none"
                     >
                        {formData.description.trim() ? (
                           <div className="space-y-2">
                              <Markdown>{formData.description}</Markdown>
                           </div>
                        ) : (
                           <p className="text-zinc-500 italic">
                              No description written yet.
                           </p>
                        )}
                     </div>
                  )}
               </div>

               {/* SECTION 6: Visibility & Showcase Status */}
               <div
                  id="section-visibility"
                  className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-5 space-y-4"
               >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
                     <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Visibility & Showcase Status
                     </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                     {/* Publishing Status */}
                     <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-300">
                           Publishing Status
                        </label>
                        <div className="flex items-center gap-2">
                           <button
                              type="button"
                              onClick={() =>
                                 setFormData({
                                    ...formData,
                                    status: "published",
                                 })
                              }
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                                 formData.status === "published"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                              }`}
                           >
                              Published
                           </button>
                           <button
                              type="button"
                              onClick={() =>
                                 setFormData({ ...formData, status: "draft" })
                              }
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                                 formData.status === "draft"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                              }`}
                           >
                              Draft
                           </button>
                        </div>
                     </div>

                     {/* Featured Project Switch */}
                     <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-300">
                           Featured in Showcase
                        </label>
                        <button
                           type="button"
                           onClick={() =>
                              setFormData({
                                 ...formData,
                                 featured: !formData.featured,
                              })
                           }
                           className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                              formData.featured
                                 ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                                 : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                           }`}
                        >
                           <Sparkles
                              className={`w-3.5 h-3.5 ${
                                 formData.featured
                                    ? "text-indigo-400"
                                    : "text-zinc-500"
                              }`}
                           />
                           {formData.featured ? "Featured Project" : "Standard"}
                        </button>
                     </div>

                     {/* Display Order */}
                     <div className="space-y-2">
                        <label
                           htmlFor="project-display-order-input"
                           className="block text-xs font-medium text-zinc-300"
                        >
                           Display Order
                        </label>
                        <input
                           id="project-display-order-input"
                           type="number"
                           min="1"
                           max="999"
                           value={formData.display_order}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 display_order:
                                    parseInt(e.target.value, 10) || 1,
                              })
                           }
                           className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                     </div>
                  </div>
               </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60 sticky bottom-0 z-10">
               <button
                  id="cancel-project-form-btn"
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
               >
                  Cancel
               </button>
               <button
                  id="save-project-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-950/40 disabled:opacity-50"
               >
                  {isSubmitting ? (
                     <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Supabase...</span>
                     </>
                  ) : (
                     <>
                        <Check className="w-4 h-4" />
                        <span>
                           {isEditing ? "Update Project" : "Add Project"}
                        </span>
                     </>
                  )}
               </button>
            </div>
         </motion.div>
      </div>
   );
};
