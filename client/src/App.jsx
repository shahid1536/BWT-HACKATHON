import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
  useOutletContext,
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
import NotFoundPage from './pages/NotFoundPage';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DocumentModal from './components/DocumentModal';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

import { categoryApi, documentApi, dashboardApi } from './services/api';

// Protected Route Guard
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

// Authenticated Layout Shell (renders Sidebar, Topbar, Outlet for nested routes, and global Modals)
const AuthenticatedLayout = () => {
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

  // Shared context passed to child routes via Outlet
  const outletContext = {
    categories,
    refreshKey,
    triggerRefresh,
    handleOpenUpload,
    handleEditDocument,
    handleSaveDocument,
    handleDownload,
    handlePromptDelete,
    setPreviewDoc,
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex">
      {/* Sidebar Navigation */}
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
          <Outlet context={outletContext} />
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

// Route wrapper helpers that connect Outlet context to page components
const DashboardRoute = () => {
  const ctx = useOutletContext();
  return (
    <DashboardPage
      onOpenUpload={ctx.handleOpenUpload}
      onPreviewDocument={(doc) => ctx.setPreviewDoc(doc)}
      refreshTrigger={ctx.refreshKey}
    />
  );
};

const DocumentsRoute = () => {
  const ctx = useOutletContext();
  return (
    <DocumentsPage
      categories={ctx.categories}
      onOpenUpload={ctx.handleOpenUpload}
      onEditDocument={ctx.handleEditDocument}
      onPreviewDocument={(doc) => ctx.setPreviewDoc(doc)}
      onDeleteDocument={ctx.handlePromptDelete}
      onDownloadDocument={ctx.handleDownload}
      refreshTrigger={ctx.refreshKey}
    />
  );
};

const CategoriesRoute = () => {
  const ctx = useOutletContext();
  return <CategoriesPage onCategoryChanged={ctx.triggerRefresh} />;
};

const ExpiringSoonRoute = () => {
  const ctx = useOutletContext();
  return (
    <ExpiringSoonPage
      onPreviewDocument={(doc) => ctx.setPreviewDoc(doc)}
      onDownloadDocument={ctx.handleDownload}
      onEditDocument={ctx.handleEditDocument}
      onDeleteDocument={ctx.handlePromptDelete}
      refreshTrigger={ctx.refreshKey}
    />
  );
};

const ExpiredDocumentsRoute = () => {
  const ctx = useOutletContext();
  return (
    <ExpiredDocumentsPage
      onPreviewDocument={(doc) => ctx.setPreviewDoc(doc)}
      onDownloadDocument={ctx.handleDownload}
      onEditDocument={ctx.handleEditDocument}
      onDeleteDocument={ctx.handlePromptDelete}
      refreshTrigger={ctx.refreshKey}
    />
  );
};

// Root App Component
const App = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Application Routes with Shared Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardRoute />} />
            <Route path="/documents" element={<DocumentsRoute />} />
            <Route path="/categories" element={<CategoriesRoute />} />
            <Route path="/expiring-soon" element={<ExpiringSoonRoute />} />
            <Route path="/expired" element={<ExpiredDocumentsRoute />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Sensible 404 Fallback for Unmatched Routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
