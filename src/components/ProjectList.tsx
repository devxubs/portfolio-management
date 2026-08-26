import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Github,
  Sparkles,
  Layers,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onPreviewProject: (project: Project) => void;
  onReorder: (reordered: Project[]) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onPreviewProject,
  onReorder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'published'
          ? p.status === 'published'
          : statusFilter === 'draft'
          ? p.status === 'draft'
          : statusFilter === 'featured'
          ? p.featured
          : true;

      const matchesCategory = categoryFilter === 'all' ? true : p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  // Move project up or down in order
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const copy = [...projects];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Reassign display_order sequentially
    const updated = copy.map((p, idx) => ({
      ...p,
      display_order: idx + 1,
    }));

    onReorder(updated);
  };

  return (
    <div id="project-management-view" className="w-full space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 id="page-title" className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-400" />
            Project Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage portfolio projects, cover assets, tech stacks, and showcase status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="add-project-btn"
            type="button"
            onClick={onAddProject}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-950/40 hover:shadow-indigo-900/50 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-projects-input"
            type="text"
            placeholder="Search projects, categories, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status Filter */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'published'
                  ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('featured')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                statusFilter === 'featured'
                  ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Featured
            </button>
          </div>

          {/* Category Dropdown Filter */}
          {categories.length > 0 && (
            <select
              id="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter projects by category"
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div
        id="projects-table-container"
        className="border border-zinc-800/80 bg-zinc-950/70 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">Order</th>
                <th className="py-3.5 px-4 w-24">Image</th>
                <th className="py-3.5 px-4 min-w-[200px]">Project</th>
                <th className="py-3.5 px-4 min-w-[120px]">Category</th>
                <th className="py-3.5 px-4 min-w-[180px]">Technologies</th>
                <th className="py-3.5 px-4 min-w-[110px]">Status</th>
                <th className="py-3.5 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs">Loading projects from Supabase...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FolderOpen className="w-10 h-10 text-zinc-600" />
                      <div>
                        <p className="text-sm font-medium text-zinc-300">No projects found</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                            ? 'Try clearing your filters or search query'
                            : 'Get started by creating your first portfolio project'}
                        </p>
                      </div>
                      {!searchQuery && statusFilter === 'all' && (
                        <button
                          type="button"
                          onClick={onAddProject}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add First Project
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project, index) => {
                  const isFirst = index === 0;
                  const isLast = index === filteredProjects.length - 1;

                  return (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-zinc-900/50 transition-colors"
                    >
                      {/* Display Order & Reorder Controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono text-xs text-zinc-500 font-semibold w-5">
                            {project.display_order}
                          </span>
                          <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleMove(index, 'up')}
                              disabled={isFirst}
                              className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                              title="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(index, 'down')}
                              disabled={isLast}
                              className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                              title="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Thumbnail */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => onPreviewProject(project)}
                          className="w-16 h-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer relative group/thumb shrink-0"
                        >
                          {project.image_url ? (
                            <img
                              src={project.image_url}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Layers className="w-4 h-4" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </td>

                      {/* Project Title, Slug & Links */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onPreviewProject(project)}
                              className="font-semibold text-zinc-100 hover:text-indigo-400 transition-colors text-left text-sm"
                            >
                              {project.title}
                            </button>
                            {project.featured && (
                              <span
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                title="Featured Project"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                            <span className="font-mono text-zinc-400">/{project.slug}</span>
                            {project.live_url && (
                              <a
                                href={project.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-zinc-300 inline-flex items-center gap-0.5"
                                title="Live Demo"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                Demo
                              </a>
                            )}
                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-zinc-300 inline-flex items-center gap-0.5"
                                title="GitHub Repository"
                              >
                                <Github className="w-2.5 h-2.5" />
                                Repo
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {project.category}
                        </span>
                      </td>

                      {/* Technologies preview */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[260px]">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 border border-zinc-800/80 text-zinc-400"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium text-zinc-500 bg-zinc-900 border border-zinc-800"
                              title={project.technologies.slice(3).join(', ')}
                            >
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {project.status === 'published' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onPreviewProject(project)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                            title="Preview Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditProject(project)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition-colors"
                            title="Edit Project"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProject(project)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/40 border-t border-zinc-800/80 text-xs text-zinc-500">
          <span>
            Total Projects: <strong className="text-zinc-300 font-semibold">{projects.length}</strong>
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {projects.filter((p) => p.status === 'published').length} Published
            </span>
            <span className="flex items-center gap-1 text-amber-400/90">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {projects.filter((p) => p.status === 'draft').length} Drafts
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
