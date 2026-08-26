import React from 'react';
import { motion } from 'motion/react';
import { X, ExternalLink, Github, Sparkles, Tag, Layers, Calendar } from 'lucide-react';
import Markdown from 'react-markdown';
import { Project } from '../types';

interface ProjectPreviewModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

export const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({
  project,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !project) return null;

  return (
    <div
      id="preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id="preview-modal-dialog"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl my-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                project.status === 'published'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {project.status}
            </span>
            {project.featured && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Featured
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cover image banner */}
          {project.image_url && (
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Title & Short Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-100">{project.title}</h2>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium rounded-lg">
                {project.category}
              </span>
            </div>
            <p className="text-sm text-zinc-400">{project.short_description}</p>
          </div>

          {/* Tech stack */}
          {project.technologies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Technologies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(project.live_url || project.github_url) && (
            <div className="flex items-center gap-3 pt-2">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Preview
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  Source Code
                </a>
              )}
            </div>
          )}

          {/* Markdown Details & Architecture */}
          {project.description && (
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Project Details & Architecture
              </h4>
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-sm text-zinc-200 leading-relaxed prose prose-invert max-w-none">
                <Markdown>{project.description}</Markdown>
              </div>
            </div>
          )}

          {/* Metadata footer info */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-4 border-t border-zinc-800">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Created {new Date(project.created_at).toLocaleDateString()}
            </span>
            <span>Display Order: #{project.display_order}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(project);
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
          >
            Edit Project
          </button>
        </div>
      </motion.div>
    </div>
  );
};
