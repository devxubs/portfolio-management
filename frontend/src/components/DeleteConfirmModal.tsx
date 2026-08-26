import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';
import { Project } from '../types';

interface DeleteConfirmModalProps {
  project: Project | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  project,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <div
        id="delete-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          id="delete-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 id="delete-modal-title" className="text-lg font-semibold text-zinc-100">
                Delete Project?
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-zinc-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">"{project.title}"</span>?
            </p>
            <p className="text-xs text-zinc-500">
              This action cannot be undone. The project record in{' '}
              <code className="text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">public.projects</code>{' '}
              and its stored image in{' '}
              <code className="text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">portfolio-projects</code>{' '}
              will be permanently removed.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              id="cancel-delete-btn"
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-lg shadow-rose-950/40 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
