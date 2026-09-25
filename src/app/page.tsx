'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FilterBar from '@/components/FilterBar';
import ReportTable from '@/components/ReportTable';
import Toast from '@/components/Toast';
import FloatingChat from '@/components/FloatingChat';
import CreateReportModal from '@/components/modals/CreateReportModal';
import UnreportedStatsModal from '@/components/modals/UnreportedStatsModal';
import ProfileModal from '@/components/modals/ProfileModal';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import CommentModal from '@/components/modals/CommentModal';
import { WorkReport } from '@/data/initialData';
import { useAppStore } from '@/data/store';
import { FileCheck, Users, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { reports, users, selectedWeek, selectedYear, showToast, currentUser, isInitialized, theme } = useAppStore();
  const isDark = theme === 'dark';

  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<WorkReport | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [commentingReport, setCommentingReport] = useState<WorkReport | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // Authentication Guard: require user to log in manually
  useEffect(() => {
    if (isInitialized && !currentUser) {
      router.replace('/login');
    }
  }, [isInitialized, currentUser, router]);

  if (!isInitialized || !currentUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#ea580c',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div style={{ color: '#94a3b8', fontSize: '13px' }}>Đang xác thực tài khoản...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleEdit = (report: WorkReport) => {
    setEditingReport(report);
    setIsCreateModalOpen(true);
  };

  const handleComment = (report: WorkReport) => {
    setCommentingReport(report);
    setIsCommentModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingReport(null);
    setIsCreateModalOpen(true);
  };

  // Quick stats calculation
  const weekReports = reports.filter((r) => r.weekNumber === selectedWeek && r.year === selectedYear);
  const completedCount = weekReports.filter((r) => r.status === 'completed').length;
  const inProgressCount = weekReports.filter((r) => r.status === 'in_progress').length;
  const totalUsers = users.length;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: isDark ? '#0b1120' : '#f8fafc',
        color: isDark ? '#f8fafc' : '#0f172a',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      {/* 1. Sidebar */}
      <Sidebar
        isMobileOpen={isSidebarMobileOpen}
        onMobileClose={() => setIsSidebarMobileOpen(false)}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* 2. Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', overflowX: 'hidden' }}>
        <Header
          onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenChangePassword={() => setIsChangePassModalOpen(true)}
        />

        <main className="dashboard-main" style={{ flex: 1, padding: '16px 20px', maxWidth: '1600px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <style>{`
            @media (max-width: 768px) {
              .dashboard-main {
                padding: 12px 10px !important;
              }
            }
          `}</style>

          {/* Filter Bar */}
          <FilterBar onCreateNewReport={handleCreateNew} />

          {/* Report Table */}
          <ReportTable onEditReport={handleEdit} onCommentReport={handleComment} />
        </main>
      </div>

      {/* Modals */}
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        reportToEdit={editingReport}
      />

      <UnreportedStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isChangePassModalOpen}
        onClose={() => setIsChangePassModalOpen(false)}
      />

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        report={commentingReport}
      />

      {/* Floating Elements */}
      <Toast />
      <FloatingChat />
    </div>
  );
}

// Icon helper
function CheckCircle2({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
