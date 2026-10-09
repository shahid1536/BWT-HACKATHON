import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import DocumentTable from '../components/DocumentTable';
import DocumentCard from '../components/DocumentCard';
import { documentApi } from '../services/api';

const ExpiringSoonPage = ({
  onPreviewDocument,
  onDownloadDocument,
  onEditDocument,
  onDeleteDocument,
  refreshTrigger,
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpiringSoon = async () => {
    try {
      setLoading(true);
      setError('');
      // Query documents with status expiring_soon sorted urgent first
      const res = await documentApi.getAll({
        status: 'expiring_soon',
        sortBy: 'expiryDate',
        order: 'asc',
      });
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching expiring soon:', err);
      setError('Failed to load expiring documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiringSoon();
  }, [refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Informative Header Banner */}
      <div className="bg-bg-surface border border-bg-border rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2.5 rounded-lg bg-status-urgent-bg text-status-urgent border border-status-urgent/30 flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Documents Expiring Within 7 Days
          </h2>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            These documents require immediate attention or renewal. They are ordered with the closest deadlines first.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-status-expired-bg border border-status-expired/30 text-status-expired text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-text-muted space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-accent-lime" />
          <p className="text-xs">Checking expiry records...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 rounded-xl bg-bg-surface border border-bg-border text-center max-w-md mx-auto my-8 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-bg-main border border-bg-border mx-auto flex items-center justify-center text-accent-emerald">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">
            No Documents Expiring Soon
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            You have no documents expiring in the next 7 days. Your records are currently in good standing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-text-muted px-1">
            <span>{documents.length} {documents.length === 1 ? 'document' : 'documents'} requiring renewal</span>
          </div>

          <div className="hidden md:block">
            <DocumentTable
              documents={documents}
              onPreview={onPreviewDocument}
              onDownload={onDownloadDocument}
              onEdit={onEditDocument}
              onDelete={onDeleteDocument}
            />
          </div>

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

export default ExpiringSoonPage;
