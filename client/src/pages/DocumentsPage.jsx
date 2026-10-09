import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  RefreshCw,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';
import DocumentTable from '../components/DocumentTable';
import DocumentCard from '../components/DocumentCard';
import { documentApi } from '../services/api';

const DocumentsPage = ({
  categories = [],
  onOpenUpload,
  onEditDocument,
  onPreviewDocument,
  onDeleteDocument,
  onDownloadDocument,
  refreshTrigger,
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search & Sort states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search: search.trim() || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        order,
      };

      const res = await documentApi.getAll(params);
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [categoryFilter, statusFilter, sortBy, order, refreshTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Search, Category Filter, Status Filter, Sort */}
      <div className="bg-bg-surface border border-bg-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by title, notes, or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-lg bg-bg-main border border-bg-border text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-800 text-text-secondary hover:text-text-primary hover:bg-zinc-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* New Document Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent-lime text-bg-main hover:bg-accent-lime-hover font-semibold text-xs sm:text-sm transition-colors shadow-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Filters and Sorting Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-bg-border/60 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-bg-main border border-bg-border rounded-lg px-2.5 py-1.5">
            <span className="text-text-muted">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-text-primary font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-bg-surface text-text-primary">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name} className="bg-bg-surface text-text-primary">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-bg-main border border-bg-border rounded-lg px-2.5 py-1.5">
            <span className="text-text-muted">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-text-primary font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-bg-surface text-text-primary">All Statuses</option>
              <option value="valid" className="bg-bg-surface text-text-primary">Valid (&gt; 30 days)</option>
              <option value="expiring_month" className="bg-bg-surface text-text-primary">Expiring This Month</option>
              <option value="expiring_soon" className="bg-bg-surface text-text-primary">Expiring Soon (≤ 7 days)</option>
              <option value="expired" className="bg-bg-surface text-text-primary">Expired</option>
              <option value="no_expiry" className="bg-bg-surface text-text-primary">No Expiry Date</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-bg-main border border-bg-border rounded-lg px-2.5 py-1.5 ml-auto">
            <span className="text-text-muted">Sort:</span>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
              }}
              className="bg-transparent text-text-primary font-medium focus:outline-none cursor-pointer"
            >
              <option value="createdAt-desc" className="bg-bg-surface text-text-primary">Newest Added</option>
              <option value="createdAt-asc" className="bg-bg-surface text-text-primary">Oldest Added</option>
              <option value="expiryDate-asc" className="bg-bg-surface text-text-primary">Expiry Date (Urgent First)</option>
              <option value="expiryDate-desc" className="bg-bg-surface text-text-primary">Expiry Date (Latest First)</option>
              <option value="title-asc" className="bg-bg-surface text-text-primary">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-lg bg-status-expired-bg border border-status-expired/30 text-status-expired text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center text-text-muted space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-accent-lime" />
          <p className="text-xs">Loading document records...</p>
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-xl bg-bg-surface border border-bg-border text-center max-w-lg mx-auto my-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-bg-main border border-bg-border mx-auto flex items-center justify-center text-accent-lime">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">
            No matching documents found
          </h2>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            {search || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No documents matched your search and filter criteria. Try adjusting your filters.'
              : 'Your library is currently empty. Upload your first document to begin.'}
          </p>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-lime text-bg-main font-semibold text-xs hover:bg-accent-lime-hover transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        /* Document Views: Table on Desktop, Cards on Mobile */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-text-muted px-1">
            <span>Showing {documents.length} {documents.length === 1 ? 'document' : 'documents'}</span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <DocumentTable
              documents={documents}
              onPreview={onPreviewDocument}
              onDownload={onDownloadDocument}
              onEdit={onEditDocument}
              onDelete={onDeleteDocument}
            />
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                onPreview={onPreviewDocument}
                onDownload={onDownloadDocument}
                onEdit={onEditDocument}
                onDelete={onDeleteDocument}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
