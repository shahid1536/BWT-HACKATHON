import React from 'react';
import { Eye, Download, Edit3, Trash2, Calendar, FileText } from 'lucide-react';
import FileTypeIcon from './FileTypeIcon';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateUtils';
import { formatFileSize, truncateText } from '../utils/formatters';

const DocumentTable = ({
  documents = [],
  onPreview,
  onDownload,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto border border-bg-border rounded-xl bg-bg-surface">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-bg-border bg-bg-surface text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <th className="py-3.5 px-4 lg:px-6">Document</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4 hidden md:table-cell">Issue Date</th>
            <th className="py-3.5 px-4">Expiry Date</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 lg:px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bg-border">
          {documents.map((doc) => (
            <tr
              key={doc._id}
              className="hover:bg-bg-hover/60 transition-colors group"
            >
              {/* Document Title & File Info */}
              <td className="py-4 px-4 lg:px-6">
                <div className="flex items-center gap-3">
                  <FileTypeIcon
                    mimeType={doc.mimeType}
                    filename={doc.originalFilename}
                    className="w-5 h-5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p
                      onClick={() => onPreview(doc)}
                      className="font-medium text-text-primary hover:text-accent-lime cursor-pointer truncate max-w-xs transition-colors"
                      title={doc.title}
                    >
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                      <span className="truncate max-w-[140px]" title={doc.originalFilename}>
                        {doc.originalFilename}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="py-4 px-4">
                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-bg-main border border-bg-border text-text-secondary">
                  {doc.category}
                </span>
              </td>

              {/* Issue Date */}
              <td className="py-4 px-4 hidden md:table-cell text-xs text-text-secondary">
                {formatDate(doc.issueDate)}
              </td>

              {/* Expiry Date */}
              <td className="py-4 px-4 text-xs font-medium text-text-primary">
                {doc.expiryDate ? formatDate(doc.expiryDate) : (
                  <span className="text-text-muted">No expiry</span>
                )}
              </td>

              {/* Status */}
              <td className="py-4 px-4">
                <StatusBadge expiryDate={doc.expiryDate} showDays={false} />
              </td>

              {/* Actions */}
              <td className="py-4 px-4 lg:px-6 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onPreview(doc)}
                    title="View details & preview"
                    className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-main transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDownload(doc)}
                    title="Download document"
                    className="p-1.5 rounded-md text-text-secondary hover:text-accent-emerald hover:bg-bg-main transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(doc)}
                    title="Edit document"
                    className="p-1.5 rounded-md text-text-secondary hover:text-accent-lime hover:bg-bg-main transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(doc)}
                    title="Delete document"
                    className="p-1.5 rounded-md text-text-secondary hover:text-status-expired hover:bg-bg-main transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentTable;
