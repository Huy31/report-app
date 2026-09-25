'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  LogOut,
  X,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppStore } from '@/data/store';
import UttLogo from './UttLogo';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onOpenStatsModal: () => void;
  onOpenProfileModal: () => void;
}

export default function Sidebar({
  isMobileOpen,
  onMobileClose,
  onOpenStatsModal,
  onOpenProfileModal,
}: SidebarProps) {
  const { currentUser, logout, sidebarTheme, setSidebarTheme } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  const isLight = sidebarTheme === 'light';
  const W = collapsed ? '64px' : '260px';

  /* ── Nav item helper ── */
  const NavButton = ({
    icon,
    label,
    color,
    onClick,
    active,
  }: {
    icon: React.ReactNode;
    label: string;
    color?: string;
    onClick: () => void;
    active?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '12px',
        padding: collapsed ? '10px 0' : '10px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: '8px',
        color: active ? '#ffffff' : (color || (isLight ? '#334155' : '#cbd5e1')),
        fontSize: '13.5px',
        fontWeight: active ? 700 : 500,
        textAlign: 'left',
        width: '100%',
        backgroundColor: active ? '#a11f24' : 'transparent',
        boxShadow: active ? '0 2px 6px rgba(161, 31, 36, 0.4)' : 'none',
        transition: 'all 0.15s',
        cursor: 'pointer',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        border: 'none',
      }}
      onMouseOver={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = isLight ? '#f1f5f9' : '#334155';
      }}
      onMouseOut={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Sidebar wrapper — controls width animation; no overflow:hidden so toggle btn is visible */}
      <div
        className="sidebar-wrapper"
        style={{
          width: W,
          minWidth: W,
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          zIndex: 1060,
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Sidebar Container */}
        <aside
          className="app-sidebar"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: isLight ? '#ffffff' : '#1e293b',
            color: isLight ? '#0f172a' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: isLight ? '2px 0 12px rgba(0, 0, 0, 0.06)' : '2px 0 8px rgba(0, 0, 0, 0.15)',
            borderRight: isLight ? '1px solid #e2e8f0' : 'none',
            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
          }}
        >
          {/* Responsive CSS */}
          <style>{`
          @media (max-width: 991px) {
            .sidebar-wrapper {
              width: 0 !important;
              min-width: 0 !important;
              position: fixed !important;
              height: 0 !important;
              pointer-events: none !important;
            }
            .desktop-collapse-btn {
              display: none !important;
            }
            .app-sidebar {
              position: fixed !important;
              top: 0;
              bottom: 0;
              left: 0;
              width: 280px !important;
              max-width: 85vw !important;
              height: 100vh !important;
              pointer-events: auto !important;
              z-index: 1100 !important;
              transform: ${isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
              transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
          }
          @media (min-width: 992px) {
            .mobile-close-btn { display: none !important; }
          }
        `}</style>

          {/* ── Header ── */}
          <div
            style={{
              padding: collapsed ? '16px 0' : '16px 20px',
              borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              backgroundColor: isLight ? '#f8fafc' : '#0f172a',
              flexShrink: 0,
              transition: 'padding 0.25s, background-color 0.2s, border-color 0.2s',
            }}
          >
            {!collapsed && <UttLogo size="sm" variant={isLight ? 'light' : 'dark'} />}
            {collapsed && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#2b2d6e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/utt-logo.png"
                  alt="UTT"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                />
              </div>
            )}
            {/* Mobile close btn */}
            {!collapsed && (
              <button
                type="button"
                onClick={onMobileClose}
                className="mobile-close-btn"
                aria-label="Đóng menu"
                style={{
                  color: isLight ? '#64748b' : '#94a3b8',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* ── User Badge ── */}
          {currentUser && (
            <div
              style={{
                padding: collapsed ? '12px 0' : '14px 20px',
                borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : '12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                backgroundColor: isLight ? '#ffffff' : '#1e293b',
                transition: 'padding 0.25s, background-color 0.2s, border-color 0.2s',
                flexShrink: 0,
                overflow: 'hidden',
              }}
              title={collapsed ? currentUser.fullName : undefined}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '15px',
                  flexShrink: 0,
                  border: isLight ? '2px solid #fed7aa' : '2px solid #fdba74',
                  overflow: 'hidden',
                }}
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  currentUser.fullName.charAt(currentUser.fullName.lastIndexOf(' ') + 1) || 'U'
                )}
              </div>
              {!collapsed && (
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: isLight ? '#0f172a' : '#f8fafc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentUser.fullName}
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: isLight ? '#ea580c' : '#fb923c',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '2px',
                    }}
                  >
                    Mã NV: {currentUser.username}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <nav style={{ flex: 1, padding: collapsed ? '16px 8px' : '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', transition: 'padding 0.25s' }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: isLight ? '#94a3b8' : '#64748b',
                  padding: '4px 12px',
                  fontWeight: 700,
                }}
              >
                Trang chủ
              </div>
            )}

            <NavButton
              icon={<LayoutDashboard size={18} color="#ffffff" />}
              label="Báo Cáo Công Việc"
              onClick={() => { }}
              active
            />
            <NavButton
              icon={<Users size={18} color={isLight ? '#0284c7' : '#38bdf8'} />}
              label="Thống Kê Chưa Báo Cáo"
              onClick={() => { onOpenStatsModal(); if (isMobileOpen) onMobileClose(); }}
            />
            <NavButton
              icon={<UserCheck size={18} color={isLight ? '#16a34a' : '#4ade80'} />}
              label="Hồ Sơ Nhân Sự"
              onClick={() => { onOpenProfileModal(); if (isMobileOpen) onMobileClose(); }}
            />
          </nav>

          {/* ── Footer ── */}
          <div
            style={{
              padding: collapsed ? '14px 8px' : '14px 16px',
              borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              flexShrink: 0,
              backgroundColor: isLight ? '#f8fafc' : 'transparent',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          >
            {/* ── Theme Switcher ── */}
            <div>
              {!collapsed && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: isLight ? '#64748b' : '#94a3b8',
                    marginBottom: '6px',
                    padding: '0 2px',
                  }}
                >
                  <span>Giao diện</span>
                  <span style={{ fontSize: '10.5px', fontWeight: 600, color: isLight ? '#ea580c' : '#fb923c' }}>
                    {isLight ? 'Sáng' : 'Tối'}
                  </span>
                </div>
              )}

              {!collapsed ? (
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: isLight ? '#e2e8f0' : '#0f172a',
                    borderRadius: '8px',
                    padding: '3px',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                    gap: '3px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSidebarTheme('light')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: isLight ? 700 : 500,
                      backgroundColor: isLight ? '#ffffff' : 'transparent',
                      color: isLight ? '#a11f24' : '#94a3b8',
                      boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    title="Chuyển sang giao diện Sáng"
                  >
                    <Sun size={14} color={isLight ? '#ea580c' : '#94a3b8'} />
                    <span>Sáng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarTheme('dark')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: !isLight ? 700 : 500,
                      backgroundColor: !isLight ? '#334155' : 'transparent',
                      color: !isLight ? '#f8fafc' : '#64748b',
                      boxShadow: !isLight ? '0 1px 3px rgba(0,0,0,0.25)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    title="Chuyển sang giao diện Tối"
                  >
                    <Moon size={14} color={!isLight ? '#38bdf8' : '#64748b'} />
                    <span>Tối</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSidebarTheme(isLight ? 'dark' : 'light')}
                  title={isLight ? 'Đổi sang giao diện Tối' : 'Đổi sang giao diện Sáng'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '36px',
                    borderRadius: '8px',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                    backgroundColor: isLight ? '#ffffff' : '#0f172a',
                    color: isLight ? '#ea580c' : '#38bdf8',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {isLight ? <Sun size={17} /> : <Moon size={17} />}
                </button>
              )}
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={() => { logout(); if (isMobileOpen) onMobileClose(); }}
              title={collapsed ? 'Đăng Xuất' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: collapsed ? 0 : '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                color: isLight ? '#dc2626' : '#f87171',
                backgroundColor: isLight ? '#fee2e2' : '#451a1a',
                border: isLight ? '1px solid #fecaca' : 'none',
                fontSize: '13px',
                fontWeight: 600,
                width: '100%',
                cursor: 'pointer',
                transition: 'background-color 0.15s, color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isLight ? '#fca5a5' : '#5c2222')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = isLight ? '#fee2e2' : '#451a1a')}
            >
              <LogOut size={16} />
              {!collapsed && <span>Đăng Xuất</span>}
            </button>

            {!collapsed && (
              <div style={{ textAlign: 'center', fontSize: '10.5px', color: isLight ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                © 2026 EGOV • ĐH CÔNG NGHỆ GTVT
              </div>
            )}
          </div>

        </aside>

        {/* ── Collapse Toggle Button — outside aside so not clipped ── */}
        <button
          type="button"
          className="desktop-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          style={{
            position: 'absolute',
            top: '72px',
            right: '-13px',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: isLight ? '#ffffff' : '#0f172a',
            border: isLight ? '2px solid #cbd5e1' : '2px solid #334155',
            color: isLight ? '#64748b' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1070,
            transition: 'background-color 0.15s, color 0.15s',
            boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.3)',
            flexShrink: 0,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = isLight ? '#f8fafc' : '#1e3a5f';
            e.currentTarget.style.color = isLight ? '#ea580c' : '#38bdf8';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = isLight ? '#ffffff' : '#0f172a';
            e.currentTarget.style.color = isLight ? '#64748b' : '#94a3b8';
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </>
  );
}
