import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderArchive,
  ArrowRight,
  Shield,
  Clock,
  Tags,
  CheckCircle2,
  FileText,
  Lock,
  Search,
  Download,
  Eye,
  Sparkles,
  Layers,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const previewDocs = [
    {
      id: 1,
      title: 'International Passport',
      filename: 'passport_biometric_2025.pdf',
      type: 'PDF',
      typeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      category: 'Identity',
      expiry: 'Nov 14, 2028',
      status: 'valid',
      statusText: 'Valid',
      statusClass: 'bg-status-valid-bg text-accent-emerald border-accent-emerald/30',
      dotClass: 'bg-accent-emerald',
      size: '2.4 MB',
    },
    {
      id: 2,
      title: 'Health Insurance Policy',
      filename: 'family_health_policy.docx',
      type: 'DOC',
      typeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      category: 'Insurance',
      expiry: 'In 3 days',
      status: 'expiring_soon',
      statusText: 'Expiring Soon',
      statusClass: 'bg-status-urgent-bg text-status-urgent border-status-urgent/40',
      dotClass: 'bg-status-urgent animate-pulse',
      size: '840 KB',
    },
    {
      id: 3,
      title: "Driver's License (Renewed)",
      filename: 'drivers_license_front.png',
      type: 'PNG',
      typeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      category: 'Identity',
      expiry: 'Expired 12 days ago',
      status: 'expired',
      statusText: 'Expired',
      statusClass: 'bg-status-expired-bg text-status-expired border-status-expired/30',
      dotClass: 'bg-status-expired',
      size: '1.8 MB',
    },
    {
      id: 4,
      title: 'Apartment Lease Agreement',
      filename: 'lease_contract_signed.pdf',
      type: 'PDF',
      typeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      category: 'Legal',
      expiry: 'Aug 30, 2027',
      status: 'valid',
      statusText: 'Valid',
      statusClass: 'bg-status-valid-bg text-accent-emerald border-accent-emerald/30',
      dotClass: 'bg-accent-emerald',
      size: '4.1 MB',
    },
  ];

  const filteredPreviewDocs = activeTab === 'all'
    ? previewDocs
    : previewDocs.filter((d) => d.status === activeTab);

  return (
    <div className="min-h-screen bg-bg-main text-text-primary selection:bg-accent-lime selection:text-bg-main flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-bg-border/60 bg-bg-main/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-lime-dim border border-accent-lime/30 flex items-center justify-center text-accent-lime font-bold shadow-[0_0_15px_rgba(198,255,94,0.15)]">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-text-primary">
                DocuKeep
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-bg-elevated border border-bg-border text-accent-lime uppercase tracking-wider">
                Personal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#preview" className="hover:text-text-primary transition-colors">Product Preview</a>
            <a href="#workflow" className="hover:text-text-primary transition-colors">How It Works</a>
            <a href="#security" className="hover:text-text-primary transition-colors">Security</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-lime text-bg-main font-semibold text-xs sm:text-sm hover:bg-accent-lime-hover transition-colors shadow-sm"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-accent-lime text-bg-main font-semibold text-xs sm:text-sm hover:bg-accent-lime-hover transition-colors shadow-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden border-b border-bg-border/40">
          {/* Restrained emerald background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] bg-accent-emerald/10 blur-[140px] pointer-events-none rounded-full" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-accent-lime/5 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Nexora-inspired pill indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-surface border border-bg-border text-xs text-text-secondary mb-6 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
              <span>Intelligent Personal Records & Expiry Management</span>
              <span className="text-bg-border">|</span>
              <span className="text-accent-emerald font-medium">Zero Cloud Leak</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary leading-[1.1]">
              Your documents, <span className="text-accent-lime">organized.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Keep important files in one place and stay ahead of expiry dates. Secure local storage, automated validity timelines, and smart document categories.
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-accent-lime text-bg-main font-semibold text-sm hover:bg-accent-lime-hover transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,94,0.2)]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <a
                href="#preview"
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-bg-surface border border-bg-border text-text-secondary hover:text-text-primary hover:border-zinc-700 font-medium text-sm transition-colors text-center"
              >
                Explore Live Preview
              </a>
            </div>

            {/* Feature Highlights Pills */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-text-secondary">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface/80 border border-bg-border">
                <Shield className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Private Local Storage</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface/80 border border-bg-border">
                <Clock className="w-3.5 h-3.5 text-status-urgent" />
                <span>Calendar-Precise Expiry Alerts</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface/80 border border-bg-border">
                <Layers className="w-3.5 h-3.5 text-accent-lime" />
                <span>Multi-Format: PDF, Word, Images</span>
              </div>
            </div>
          </div>

          {/* Interactive Product Preview Showcase */}
          <div id="preview" className="mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-bg-border bg-bg-surface shadow-2xl overflow-hidden">
              {/* Window Header */}
              <div className="px-4 py-3 border-b border-bg-border bg-bg-secondary flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="ml-2 font-mono text-[11px] text-text-secondary">docukeep://vault/records</span>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1.5 bg-bg-main p-1 rounded-lg border border-bg-border text-[11px]">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeTab === 'all'
                        ? 'bg-bg-elevated text-accent-lime font-medium'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    All Records (4)
                  </button>
                  <button
                    onClick={() => setActiveTab('expiring_soon')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeTab === 'expiring_soon'
                        ? 'bg-status-urgent-bg text-status-urgent font-medium'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    Expiring Soon
                  </button>
                  <button
                    onClick={() => setActiveTab('expired')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeTab === 'expired'
                        ? 'bg-status-expired-bg text-status-expired font-medium'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    Expired
                  </button>
                </div>
              </div>

              {/* Document List Preview */}
              <div className="p-4 sm:p-6 bg-bg-main/70 overflow-x-auto">
                <div className="rounded-lg border border-bg-border overflow-hidden bg-bg-surface">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-bg-border text-text-muted bg-bg-secondary/60 font-medium">
                        <th className="py-3 px-4">Document</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Expiry Date</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bg-border/60 text-text-secondary">
                      {filteredPreviewDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-bg-hover/60 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-text-primary">
                            <div className="flex items-center gap-2.5">
                              <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${doc.typeBg}`}>
                                {doc.type}
                              </span>
                              <div>
                                <p className="text-text-primary font-medium">{doc.title}</p>
                                <p className="text-[11px] text-text-muted">{doc.filename} • {doc.size}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-bg-main border border-bg-border text-text-secondary">
                              {doc.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-text-primary font-medium">
                            {doc.expiry}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] ${doc.statusClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${doc.dotClass}`} />
                              <span>{doc.statusText}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                title="Inspect details"
                                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-main"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                title="Download"
                                className="p-1 rounded text-text-muted hover:text-accent-emerald hover:bg-bg-main"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Features (Priority 2 Requirement) */}
        <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-bg-border/40">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-accent-lime uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
              Engineered for personal clarity
            </h2>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Everything required to safeguard critical records, maintain categorization, and avoid unexpected expirations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 sm:p-7 rounded-xl bg-bg-surface border border-bg-border hover:border-zinc-700 transition-all duration-200">
              <div className="p-2.5 w-fit rounded-lg bg-zinc-800 text-accent-lime border border-bg-border mb-5">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">
                Document Storage
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Securely upload PDF certificates, identity records, insurance policies, and receipts with private local disk isolation and ownership access controls.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 sm:p-7 rounded-xl bg-bg-surface border border-bg-border hover:border-zinc-700 transition-all duration-200">
              <div className="p-2.5 w-fit rounded-lg bg-zinc-800 text-accent-emerald border border-bg-border mb-5">
                <Tags className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">
                Smart Categories
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Organize documents into structured categories like Identity, Financial, Medical, and Insurance, or create customized labels tailored to your life.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 sm:p-7 rounded-xl bg-bg-surface border border-bg-border hover:border-zinc-700 transition-all duration-200">
              <div className="p-2.5 w-fit rounded-lg bg-zinc-800 text-status-urgent border border-bg-border mb-5">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">
                Expiry Tracking
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Automatically categorize files into Expiring Soon and Expired views based on calendar timelines, giving you ample runway before renewals are overdue.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Workflow Section */}
        <section id="workflow" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-bg-border/40">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-semibold text-accent-emerald uppercase tracking-wider">
              Simple Workflow
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              How DocuKeep Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-bg-surface border border-bg-border rounded-xl p-6 relative">
              <span className="font-mono text-3xl font-bold text-accent-lime/20 mb-3 block">01</span>
              <h3 className="text-sm font-semibold text-text-primary mb-1.5">Upload & Record</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Drag and drop your document file (PDF, Word, or Image). Add optional issue and expiration dates.
              </p>
            </div>

            <div className="bg-bg-surface border border-bg-border rounded-xl p-6 relative">
              <span className="font-mono text-3xl font-bold text-accent-emerald/20 mb-3 block">02</span>
              <h3 className="text-sm font-semibold text-text-primary mb-1.5">Intelligent Categorization</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Assign to built-in sectors (Identity, Medical, Legal) or create custom categories on the fly.
              </p>
            </div>

            <div className="bg-bg-surface border border-bg-border rounded-xl p-6 relative">
              <span className="font-mono text-3xl font-bold text-status-urgent/20 mb-3 block">03</span>
              <h3 className="text-sm font-semibold text-text-primary mb-1.5">Track & Stay Ahead</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                View instant urgency badges on your dashboard. Filter expiring records before deadlines pass.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Isolation Section */}
        <section id="security" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-accent-lime/5 blur-[120px] pointer-events-none" />

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-main border border-bg-border text-xs text-accent-emerald mb-4">
                <Lock className="w-3.5 h-3.5" />
                <span>Private Local Isolation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Built with strict ownership protection
              </h2>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                Every uploaded file is stored in a private directory isolated from the public web. Documents can only be downloaded or previewed with authenticated user credentials verified on the backend.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Check className="w-4 h-4 text-accent-lime" />
                  Bcrypt hashed credentials
                </span>
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Check className="w-4 h-4 text-accent-lime" />
                  JWT session security
                </span>
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Check className="w-4 h-4 text-accent-lime" />
                  Permanent file cleanup upon deletion
                </span>
              </div>

              <div className="mt-8">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-lime text-bg-main font-semibold text-xs sm:text-sm hover:bg-accent-lime-hover transition-colors shadow-sm"
                >
                  <span>Launch DocuKeep</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Consistent Minimal Footer */}
      <footer className="border-t border-bg-border py-8 bg-bg-secondary text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FolderArchive className="w-4 h-4 text-accent-lime" />
            <span className="font-semibold text-text-primary">DocuKeep</span>
            <span>— Personal Document Organizer</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-accent-emerald">
              <span className="w-2 h-2 rounded-full bg-accent-emerald inline-block" />
              System Online
            </span>
            <span>Local & Private Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
