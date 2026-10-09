import React, { useState, useEffect } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Folder,
  AlertCircle,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { categoryApi } from '../services/api';

const CategoriesPage = ({ onCategoryChanged }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add category state
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit category state
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Delete category confirmation state
  const [deletingCat, setDeletingCat] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await categoryApi.getAll();
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setError('');
      setSuccess('');
      const res = await categoryApi.create({ name: newCatName.trim() });
      if (res.data.success) {
        setCategories([...categories, res.data.category]);
        setNewCatName('');
        setIsAdding(false);
        setSuccess('Category added successfully.');
        if (onCategoryChanged) onCategoryChanged();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = async (catId) => {
    if (!editingName.trim()) return;

    try {
      setError('');
      setSuccess('');
      const res = await categoryApi.update(catId, { name: editingName.trim() });
      if (res.data.success) {
        setCategories(
          categories.map((c) =>
            c._id === catId ? { ...c, name: res.data.category.name } : c
          )
        );
        setEditingId(null);
        setEditingName('');
        setSuccess('Category updated.');
        if (onCategoryChanged) onCategoryChanged();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category.');
    }
  };

  const handleDelete = async (cat) => {
    try {
      setError('');
      setSuccess('');
      const res = await categoryApi.delete(cat._id);
      if (res.data.success) {
        setCategories(categories.filter((c) => c._id !== cat._id));
        setDeletingCat(null);
        setSuccess(res.data.message || 'Category deleted.');
        if (onCategoryChanged) onCategoryChanged();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
      setDeletingCat(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Add Action */}
      <div className="bg-bg-surface border border-bg-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Document Categories
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
            Organize documents into dedicated groups. Deleting a category reassigns its documents to 'Other'.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent-lime text-bg-main hover:bg-accent-lime-hover font-semibold text-xs sm:text-sm transition-colors shadow-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Category</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 rounded-lg bg-status-expired-bg border border-status-expired/30 text-status-expired text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-status-valid-bg border border-accent-emerald/30 text-accent-emerald text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Category Form Card */}
      {isAdding && (
        <div className="bg-bg-surface border border-accent-lime/40 rounded-xl p-4">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              autoFocus
              placeholder="e.g. Real Estate, Warranties, Tax Forms"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none w-full"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewCatName('');
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-accent-lime text-bg-main hover:bg-accent-lime-hover text-xs font-semibold"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-bg-surface border border-bg-border rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-bg-main border border-bg-border text-accent-lime flex-shrink-0">
                  <Folder className="w-4 h-4" />
                </div>

                {editingId === cat._id ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="px-2 py-1 rounded bg-bg-main border border-bg-border text-xs text-text-primary focus:border-accent-lime focus:outline-none w-full"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(cat._id)}
                      className="p-1 rounded text-accent-lime hover:bg-bg-main"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded text-text-secondary hover:bg-bg-main"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm text-text-primary truncate" title={cat.name}>
                      {cat.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {cat.isDefault ? 'Default Category' : 'Custom Category'}
                    </p>
                  </div>
                )}
              </div>

              {editingId !== cat._id && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 rounded text-text-secondary hover:text-accent-lime hover:bg-bg-main"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!cat.isDefault && (
                    <button
                      onClick={() => setDeletingCat(cat)}
                      className="p-1.5 rounded text-text-secondary hover:text-status-expired hover:bg-bg-main"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-bg-border/60 flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-text-muted" />
                <span>
                  {cat.documentCount} {cat.documentCount === 1 ? 'document' : 'documents'}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal for Category */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-bg-surface border border-bg-border rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-text-primary">
              Delete "{deletingCat.name}" category?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              If any documents are assigned to this category, they will be automatically reassigned to the default <strong>'Other'</strong> category.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-bg-border">
              <button
                onClick={() => setDeletingCat(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingCat)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-status-expired text-white hover:bg-red-600 transition-colors"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
