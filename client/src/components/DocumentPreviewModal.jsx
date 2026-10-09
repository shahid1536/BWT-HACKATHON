import React from 'react';
import { X, Download, Edit3, Calendar, FileText, Tag, Clock, HardDrive } from 'lucide-react';
import StatusBadge from './StatusBadge';
import FileTypeIcon from './FileTypeIcon';
import { formatDate } from '../utils/dateUtils';
import { formatFileSize } from '../utils/formatters';
import { documentApi } from '../services/api';

const DocumentPreviewModal = ({
  isOpen,
  onClose,
  doc,
  onEdit,
  onDownload,
}) => {
  if (!isOpen || !doc) return null;

  const isPdf = doc.mimeType?.includes('pdf') || doc.originalFilename?.toLowerCase().endsWith('.pdf');
  const isImage = doc.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg)$/i.test(doc.originalFilename);
  const previewUrl = documentApi.getPreviewUrl(doc._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-bg-surface border border-bg-border rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-bg-border flex items-center justify-between bg-bg-surface">
          <div className="flex items-center gap-3 min-w-0">
            <FileTypeIcon
              mimeType={doc.mimeType}
              filename={doc.originalFilename}
              className="w-5 h-5 flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary truncate">
                {doc.title}
              </h2>
              <p className="text-xs text-text-muted truncate">
                {doc.originalFilename} ({formatFileSize(doc.fileSize)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(doc)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-main border border-bg-border hover:border-accent-emerald text-text-primary hover:text-accent-emerald text-xs font-medium transition-colors"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(doc);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-main border border-bg-border hover:border-accent-lime text-text-primary hover:text-accent-lime text-xs font-medium transition-colors"
                title="Edit document details"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split between details and preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-bg-main border border-bg-border text-xs">
            <div>
              <span className="text-text-muted block mb-1">Category</span>
              <span className="font-medium text-text-primary px-2 py-0.5 rounded bg-bg-surface border border-bg-border inline-block">
                {doc.category}
              </span>
            </div>

            <div>
              <span className="text-text-muted block mb-1">Status</span>
              <StatusBadge expiryDate={doc.expiryDate} showDays={true} />
            </div>

            <div>
              <span className="text-text-muted block mb-1">Issue Date</span>
              <span className="font-medium text-text-primary">
                {formatDate(doc.issueDate)}
              </span>
            </div>

            <div>
              <span className="text-text-muted block mb-1">Expiry Date</span>
              <span className="font-medium text-text-primary">
                {doc.expiryDate ? formatDate(doc.expiryDate) : 'No expiry date'}
              </span>
            </div>
          </div>

          {/* Description / Notes if any */}
          {doc.description && (
            <div className="p-4 rounded-xl bg-bg-main border border-bg-border text-xs">
              <span className="text-text-muted block mb-1.5 font-medium">Notes & Description</span>
              <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
                {doc.description}
              </p>
            </div>
          )}

          {/* Preview Canvas */}
          <div className="border border-bg-border rounded-xl overflow-hidden bg-bg-main min-h-[380px] flex items-center justify-center">
            {isPdf ? (
              <iframe
                src={`${previewUrl}#toolbar=0`}
                className="w-full h-[520px] border-0"
                title={`Preview of ${doc.title}`}
              />
            ) : isImage ? (
              <div className="p-4 max-h-[520px] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt={doc.title}
                  className="max-h-[480px] w-auto max-w-full rounded object-contain"
                />
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <FileText className="w-12 h-12 mx-auto text-text-muted" />
                <p className="text-sm font-medium text-text-primary">
                  Preview not available in browser for this file type
                </p>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  This document is securely stored. Click the download button below to view it in your local desktop application.
                </p>
                <button
                  onClick={() => onDownload(doc)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-lime text-bg-main font-semibold text-xs hover:bg-accent-lime-hover transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {doc.originalFilename}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
