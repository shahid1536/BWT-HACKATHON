import React from 'react';
import { Eye, Download, Edit3, Trash2, Calendar } from 'lucide-react';
import FileTypeIcon from './FileTypeIcon';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateUtils';
import { formatFileSize } from '../utils/formatters';

const DocumentCard = ({
  doc,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-xl p-4 transition-all duration-150 hover:border-zinc-700">
      <div className="flex items-start gap-3">
        <FileTypeIcon
          mimeType={doc.mimeType}
          filename={doc.originalFilename}
          className="w-5 h-5 flex-shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onPreview(doc)}
              className="font-medium text-sm text-text-primary hover:text-accent-lime cursor-pointer truncate"
              title={doc.title}
            >
              {doc.title}
            </h3>
            <StatusBadge expiryDate={doc.expiryDate} size="small" />
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
            <span className="px-2 py-0.5 rounded bg-bg-main border border-bg-border text-text-secondary">
              {doc.category}
            </span>
            <span>•</span>
            <span>{formatFileSize(doc.fileSize)}</span>
          </div>

          {doc.description && (
            <p className="mt-2 text-xs text-text-secondary line-clamp-2">
              {doc.description}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-bg-border/60 flex items-center justify-between text-xs">
            <div className="text-text-muted">
              {doc.expiryDate ? (
                <span>Expires: <strong className="text-text-secondary font-medium">{formatDate(doc.expiryDate)}</strong></span>
              ) : (
                <span>No expiry date</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPreview(doc)}
                title="Preview"
                className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-bg-main"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDownload(doc)}
                title="Download"
                className="p-1.5 rounded text-text-secondary hover:text-accent-emerald hover:bg-bg-main"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(doc)}
                title="Edit"
                className="p-1.5 rounded text-text-secondary hover:text-accent-lime hover:bg-bg-main"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(doc)}
                title="Delete"
                className="p-1.5 rounded text-text-secondary hover:text-status-expired hover:bg-bg-main"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
