import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files,
  Clock,
  CalendarX2,
  Tags,
  Upload,
  ArrowRight,
  Eye,
  Download,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FileTypeIcon from '../components/FileTypeIcon';
import StatusBadge from '../components/StatusBadge';
import { dashboardApi, documentApi } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import { formatFileSize } from '../utils/formatters';

const DashboardPage = ({
  onOpenUpload,
  onPreviewDocument,
  refreshTrigger,
}) => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    expiringSoon: 0,
    expiredDocuments: 0,
    categoriesUsed: 0,
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [approachingDocs, setApproachingDocs] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, recentRes, expiryRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentDocuments(),
        dashboardApi.getExpiry(),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (recentRes.data.success) {
        setRecentDocs(recentRes.data.documents || []);
      }
      if (expiryRes.data.success) {
        setApproachingDocs(expiryRes.data.approachingExpiry || []);
        setCategorySummary(expiryRes.data.categorySummary || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard metrics. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const handleDownload = async (doc) => {
    try {
      window.open(documentApi.getDownloadUrl(doc._id), '_blank');
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-bg-surface border border-bg-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-xl bg-bg-surface border border-bg-border" />
          <div className="h-72 rounded-xl bg-bg-surface border border-bg-border" />
        </div>
      </div>
    );
  }

  const isCompletelyEmpty = stats.totalDocuments === 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-status-expired-bg border border-status-expired/30 text-status-expired text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 MongoDB Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={Files}
          helper="Stored in your library"
          variant="lime"
          onClick={() => navigate('/documents')}
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          icon={Clock}
          helper="Due within 7 days"
          variant={stats.expiringSoon > 0 ? 'warning' : 'default'}
          onClick={() => navigate('/expiring-soon')}
        />
        <StatCard
          title="Expired Documents"
          value={stats.expiredDocuments}
          icon={CalendarX2}
          helper="Past expiration date"
          variant={stats.expiredDocuments > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/expired')}
        />
        <StatCard
          title="Categories Used"
          value={stats.categoriesUsed}
          icon={Tags}
          helper="Active organizational groups"
          variant="default"
          onClick={() => navigate('/categories')}
        />
      </div>

      {/* Empty State when 0 documents exist */}
      {isCompletelyEmpty ? (
        <div className="p-10 rounded-xl bg-bg-surface border border-bg-border text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-bg-main border border-bg-border mx-auto flex items-center justify-center text-accent-lime">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">
            No documents uploaded yet
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            DocuKeep organizes your IDs, contracts, policies, and certificates, warning you before they expire.
          </p>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent-lime text-bg-main font-semibold text-xs hover:bg-accent-lime-hover transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Your First Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Recently Added & Approaching Expiry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Approaching Expiry Section (if any approaching or expired) */}
            {approachingDocs.length > 0 && (
              <div className="bg-bg-surface border border-bg-border rounded-xl p-5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-bg-border">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-status-urgent" />
                    <h2 className="text-sm font-semibold text-text-primary">
                      Approaching Expiry & Attention Required
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/expiring-soon')}
                    className="text-xs text-accent-lime hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-bg-border/60">
                  {approachingDocs.map((doc) => (
                    <div
                      key={doc._id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-bg-hover/40 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileTypeIcon
                          mimeType={doc.mimeType}
                          filename={doc.originalFilename}
                          className="w-4 h-4"
                        />
                        <div className="min-w-0">
                          <p
                            onClick={() => onPreviewDocument(doc)}
                            className="text-xs font-medium text-text-primary hover:text-accent-lime cursor-pointer truncate"
                          >
                            {doc.title}
                          </p>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            {doc.category} • Expiry: {formatDate(doc.expiryDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge expiryDate={doc.expiryDate} showDays={true} size="small" />
                        <button
                          onClick={() => onPreviewDocument(doc)}
                          className="p-1 rounded text-text-secondary hover:text-text-primary"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Added Documents */}
            <div className="bg-bg-surface border border-bg-border rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-bg-border">
                <h2 className="text-sm font-semibold text-text-primary">
                  Recently Added Documents
                </h2>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-xs text-accent-lime hover:underline flex items-center gap-1 font-medium"
                >
                  <span>All documents</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-bg-border/60">
                {recentDocs.map((doc) => (
                  <div
                    key={doc._id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-bg-hover/40 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileTypeIcon
                        mimeType={doc.mimeType}
                        filename={doc.originalFilename}
                        className="w-4 h-4"
                      />
                      <div className="min-w-0">
                        <p
                          onClick={() => onPreviewDocument(doc)}
                          className="text-xs font-medium text-text-primary hover:text-accent-lime cursor-pointer truncate"
                        >
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Added {formatDate(doc.createdAt)} • {formatFileSize(doc.fileSize)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-bg-main border border-bg-border text-text-secondary">
                        {doc.category}
                      </span>
                      <StatusBadge expiryDate={doc.expiryDate} size="small" />
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1 rounded text-text-secondary hover:text-accent-emerald"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Category Summary */}
          <div className="space-y-6">
            <div className="bg-bg-surface border border-bg-border rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-bg-border">
                <h2 className="text-sm font-semibold text-text-primary">
                  Category Breakdown
                </h2>
                <button
                  onClick={() => navigate('/categories')}
                  className="text-xs text-text-secondary hover:text-accent-lime font-medium"
                >
                  Manage
                </button>
              </div>

              {categorySummary.length === 0 ? (
                <p className="text-xs text-text-muted">No categorized files yet.</p>
              ) : (
                <div className="space-y-3">
                  {categorySummary.map((item) => {
                    const percentage = Math.round(
                      (item.count / (stats.totalDocuments || 1)) * 100
                    );
                    return (
                      <div key={item.category} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-text-primary">
                            {item.category}
                          </span>
                          <span className="text-text-muted">
                            {item.count} {item.count === 1 ? 'doc' : 'docs'} ({percentage}%)
                          </span>
                        </div>
                        {/* Restrained horizontal distribution bar */}
                        <div className="h-1.5 w-full bg-bg-main rounded-full overflow-hidden border border-bg-border/60">
                          <div
                            className="h-full bg-accent-lime rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Upload Helper Card */}
            <div className="bg-bg-surface border border-bg-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Quick Action
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Add an upcoming ID card, vehicle insurance, or lease contract before renewal deadlines pass.
              </p>
              <button
                onClick={onOpenUpload}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-bg-main border border-bg-border hover:border-accent-lime text-text-primary hover:text-accent-lime text-xs font-semibold transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
