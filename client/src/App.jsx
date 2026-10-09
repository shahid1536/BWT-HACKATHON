import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import ExpiringSoonPage from './pages/ExpiringSoonPage';
import ExpiredDocumentsPage from './pages/ExpiredDocumentsPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DocumentModal from './components/DocumentModal';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

import { categoryApi, documentApi, dashboardApi } from './services/api';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center text-text-secondary text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-lime animate-ping" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Authenticated Layout Shell
const AuthenticatedShell = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Expiry notification counters for sidebar
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);

  // Global Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Trigger refresh across views
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Fetch categories & expiry counters
  const fetchGlobalData = async () => {
    try {
      const [catsRes, statsRes] = await Promise.all([
        categoryApi.getAll(),
        dashboardApi.getStats(),
      ]);

      if (catsRes.data.success) {
        setCategories(catsRes.data.categories || []);
      }
      if (statsRes.data.success) {
        setExpiringSoonCount(statsRes.data.stats.expiringSoon || 0);
        setExpiredCount(statsRes.data.stats.expiredDocuments || 0);
      }
    } catch (err) {
      console.error('Error fetching global layout data:', err);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [refreshKey]);

  // Page titles and descriptions based on pathname
  const getPageMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard Overview', subtitle: 'At-a-glance summary of your personal records' };
      case '/documents':
        return { title: 'All Documents', subtitle: 'Search, filter, and organize your document library' };
      case '/categories':
        return { title: 'Categories', subtitle: 'Manage custom categories and file distribution' };
      case '/expiring-soon':
        return { title: 'Expiring Soon', subtitle: 'Documents requiring renewal within 7 calendar days' };
      case '/expired':
        return { title: 'Expired Documents', subtitle: 'Documents past their recorded expiration date' };
      case '/settings':
        return { title: 'Settings', subtitle: 'Manage profile and account security' };
      default:
        return { title: 'DocuKeep', subtitle: 'Personal Document Organizer' };
    }
  };

  const pageMeta = getPageMeta();

  // Document Operations
  const handleOpenUpload = () => {
    setDocToEdit(null);
    setIsUploadModalOpen(true);
  };

  const handleEditDocument = (doc) => {
    setDocToEdit(doc);
    setIsUploadModalOpen(true);
  };

  const handleSaveDocument = async (formData, id) => {
    if (id) {
      await documentApi.update(id, formData);
    } else {
      await documentApi.create(formData);
    }
    triggerRefresh();
  };

  const handleQuickCreateCategory = async (name) => {
    const res = await categoryApi.create({ name });
    if (res.data.success) {
      setCategories((prev) => [...prev, res.data.category]);
      return res.data.category;
    }
  };

  const handleDownload = (doc) => {
    window.open(documentApi.getDownloadUrl(doc._id), '_blank');
  };

  const handlePromptDelete = (doc) => {
    setDeletingDoc(doc);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    try {
      setIsDeleting(true);
      await documentApi.delete(deletingDoc._id);
      setDeletingDoc(null);
      if (previewDoc?._id === deletingDoc._id) {
        setPreviewDoc(null);
      }
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        expiringSoonCount={expiringSoonCount}
        expiredCount={expiredCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenUpload={handleOpenUpload}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  onOpenUpload={handleOpenUpload}
                  onPreviewDocument={(doc) => setPreviewDoc(doc)}
                  refreshTrigger={refreshKey}
                />
              }
            />
            <Route
              path="/documents"
              element={
                <DocumentsPage
                  categories={categories}
                  onOpenUpload={handleOpenUpload}
                  onEditDocument={handleEditDocument}
                  onPreviewDocument={(doc) => setPreviewDoc(doc)}
                  onDeleteDocument={handlePromptDelete}
                  onDownloadDocument={handleDownload}
                  refreshTrigger={refreshKey}
                />
              }
            />
            <Route
              path="/categories"
              element={
                <CategoriesPage
                  onCategoryChanged={triggerRefresh}
                />
              }
            />
            <Route
              path="/expiring-soon"
              element={
                <ExpiringSoonPage
                  onPreviewDocument={(doc) => setPreviewDoc(doc)}
                  onDownloadDocument={handleDownload}
                  onEditDocument={handleEditDocument}
                  onDeleteDocument={handlePromptDelete}
                  refreshTrigger={refreshKey}
                />
              }
            />
            <Route
              path="/expired"
              element={
                <ExpiredDocumentsPage
                  onPreviewDocument={(doc) => setPreviewDoc(doc)}
                  onDownloadDocument={handleDownload}
                  onEditDocument={handleEditDocument}
                  onDeleteDocument={handlePromptDelete}
                  refreshTrigger={refreshKey}
                />
              }
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Document Upload / Edit Modal */}
      <DocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setDocToEdit(null);
        }}
        onSave={handleSaveDocument}
        documentToEdit={docToEdit}
        categories={categories}
        onCreateCategory={handleQuickCreateCategory}
      />

      {/* Global Document Details / Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onEdit={(doc) => {
          setPreviewDoc(null);
          handleEditDocument(doc);
        }}
        onDownload={handleDownload}
      />

      {/* Global Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        itemName={deletingDoc?.title}
        message="This document and its uploaded physical file will be permanently deleted from secure server storage. This action cannot be reversed."
        isDeleting={isDeleting}
      />
    </div>
  );
};

// Root App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AuthenticatedShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
