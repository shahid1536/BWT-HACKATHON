import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Document',
  message = 'Are you sure you want to permanently delete this document and its file? This action cannot be undone.',
  itemName = '',
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-bg-surface border border-bg-border rounded-xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-status-expired-bg border border-status-expired/30 text-status-expired flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text-primary">
              {title}
            </h3>
            {itemName && (
              <p className="mt-1 text-xs font-medium text-text-secondary truncate">
                Target: <span className="text-text-primary">{itemName}</span>
              </p>
            )}
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-bg-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-status-expired text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
