import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, File, AlertCircle, Check } from 'lucide-react';
import { toInputDateFormat } from '../utils/dateUtils';
import { formatFileSize } from '../utils/formatters';

const DocumentModal = ({
  isOpen,
  onClose,
  onSave,
  documentToEdit = null,
  categories = [],
  onCreateCategory,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick category creation toggle inside modal
  const [isCreatingNewCat, setIsCreatingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (documentToEdit) {
        setTitle(documentToEdit.title || '');
        setCategory(documentToEdit.category || (categories[0]?.name || ''));
        setDescription(documentToEdit.description || '');
        setIssueDate(toInputDateFormat(documentToEdit.issueDate));
        setExpiryDate(toInputDateFormat(documentToEdit.expiryDate));
        setSelectedFile(null);
      } else {
        setTitle('');
        setCategory(categories[0]?.name || 'Identity');
        setDescription('');
        setIssueDate('');
        setExpiryDate('');
        setSelectedFile(null);
      }
      setIsCreatingNewCat(false);
      setNewCatName('');
      setError('');
    }
  }, [isOpen, documentToEdit, categories]);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      if (onCreateCategory) {
        const created = await onCreateCategory(newCatName.trim());
        setCategory(created.name);
        setIsCreatingNewCat(false);
        setNewCatName('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a document title.');
      return;
    }

    if (!category.trim()) {
      setError('Please select or provide a category.');
      return;
    }

    if (!documentToEdit && !selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    if (issueDate && expiryDate) {
      const issueTime = new Date(issueDate).getTime();
      const expiryTime = new Date(expiryDate).getTime();
      if (expiryTime < issueTime) {
        setError('Expiry date cannot be earlier than the issue date.');
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', category.trim());
    formData.append('description', description.trim());
    if (issueDate) formData.append('issueDate', issueDate);
    if (expiryDate) formData.append('expiryDate', expiryDate);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      setIsSubmitting(true);
      await onSave(formData, documentToEdit?._id);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'An error occurred while saving the document.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-bg-surface border border-bg-border rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-bg-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">
            {documentToEdit ? 'Edit Document' : 'Upload New Document'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-status-expired-bg border border-status-expired/30 text-status-expired text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Document Title <span className="text-accent-lime">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Passport, Health Insurance Policy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Category <span className="text-accent-lime">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewCat(!isCreatingNewCat)}
                className="text-xs text-accent-lime hover:underline"
              >
                {isCreatingNewCat ? 'Choose existing' : '+ Add custom category'}
              </button>
            </div>

            {isCreatingNewCat ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-3 py-2 rounded-lg bg-zinc-800 text-text-primary hover:bg-zinc-700 text-xs font-medium border border-bg-border"
                >
                  Save
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary focus:border-accent-lime focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dates: Issue & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Issue Date <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary focus:border-accent-lime focus:outline-none [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Expiry Date <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary focus:border-accent-lime focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Notes or Description <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Add key notes, policy numbers, or renewal information..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none resize-none"
            />
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Document File{' '}
              {documentToEdit ? (
                <span className="text-text-muted font-normal">
                  (Leave empty to keep existing file)
                </span>
              ) : (
                <span className="text-accent-lime">*</span>
              )}
            </label>

            {/* Existing File Notice (Edit mode) */}
            {documentToEdit && !selectedFile && (
              <div className="p-2.5 mb-2 rounded-lg bg-bg-main border border-bg-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate text-text-secondary">
                  <File className="w-4 h-4 text-accent-emerald flex-shrink-0" />
                  <span className="truncate">{documentToEdit.originalFilename}</span>
                  <span>({formatFileSize(documentToEdit.fileSize)})</span>
                </div>
                <span className="text-[11px] text-text-muted">Current file</span>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-accent-lime bg-accent-lime/5'
                  : 'border-bg-border hover:border-zinc-600 bg-bg-main/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-sm text-accent-lime font-medium">
                  <File className="w-4 h-4" />
                  <span className="truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-xs text-text-muted">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud className="w-6 h-6 mx-auto text-text-muted" />
                  <p className="text-xs font-medium text-text-primary">
                    <span className="text-accent-lime">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[11px] text-text-muted">
                    PDF, JPG, PNG, DOCX up to 15MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-bg-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-accent-lime text-bg-main hover:bg-accent-lime-hover transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : documentToEdit
                ? 'Save Changes'
                : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;
