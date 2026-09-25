'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, User, KeyRound, LogOut, ChevronDown, UserCircle, Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/data/store';
import UttLogo from './UttLogo';
import RealtimeClock from './RealtimeClock';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenProfile: () => void;
  onOpenChangePassword: () => void;
}

export default function Header({
  onToggleSidebar,
  onOpenProfile,
  onOpenChangePassword,
}: HeaderProps) {
  const router = useRouter();
  const { currentUser, logout, theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [userDropdownOpen]);

  return (
    <header
      style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        boxShadow: isDark ? '0 1px 4px rgba(0, 0, 0, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        gap: '16px',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .header-ticker {
          display: flex;
          align-items: center;
          background: ${isDark ? 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(90deg, #f0f4ff 0%, #e8eeff 100%)'};
          border: 1px solid ${isDark ? '#334155' : '#c7d2fe'};
          border-radius: 9999px;
          overflow: hidden;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
          height: 34px;
          position: relative;
          margin: 0 16px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, ${isDark ? '0.2' : '0.04'});
          mask-image: linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%);
        }
        .header-ticker:hover .header-ticker-inner {
          animation-play-state: paused;
        }
        .header-ticker-inner {
          display: inline-block;
          animation: marquee-scroll 24s linear infinite;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 600;
          color: ${isDark ? '#cbd5e1' : '#2b2d6e'};
          padding-left: 20px;
        }
        .header-ticker-inner .ticker-sep {
          margin: 0 20px;
          color: ${isDark ? '#f87171' : '#a11f24'};
          font-weight: 900;
        }
        @media (max-width: 1100px) {
          .header-ticker { display: none !important; }
        }
        @media (max-width: 768px) {
          .clock-container { display: none !important; }
          .header-user-info { display: none !important; }
        }
        .hamburger-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background-color: ${isDark ? '#0f172a' : '#f1f5f9'};
          color: ${isDark ? '#f8fafc' : '#1e293b'};
          border: 1px solid ${isDark ? '#334155' : '#cbd5e1'};
        }
        @media (max-width: 991px) {
          .hamburger-btn { display: flex !important; }
        }
      `}</style>

      {/* Left section: Hamburger & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hamburger-btn"
          aria-label="Mở Menu"
          title="Mở Menu điều hướng"
        >
          <Menu size={22} />
        </button>

        <UttLogo size="sm" variant={isDark ? 'dark' : 'light'} />
      </div>

      {/* Center section: Animated Marquee Ticker */}
      <div className="header-ticker" aria-label="Thông báo hệ thống">
        <span className="header-ticker-inner">
          🏫 Hệ thống Báo cáo Công việc — Trường ĐH Công nghệ GTVT (UTT)
          <span className="ticker-sep">✦</span>
          📋 Nộp báo cáo trước 17:00 mỗi ngày làm việc
          <span className="ticker-sep">✦</span>
          📊 Theo dõi &amp; quản lý tiến độ công việc
          <span className="ticker-sep">✦</span>
          ✨ Chúc Nhân viên một ngày làm việc hiệu quả!
          <span className="ticker-sep">✦</span>
        </span>
      </div>
      {/* Right section: Clock, Theme Switcher, Notification Bell, User profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div className="clock-container">
          <RealtimeClock />
        </div>

        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Chuyển sang giao diện Sáng (Light)' : 'Chuyển sang giao diện Tối (Dark)'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            color: isDark ? '#fbbf24' : '#ea580c',
            cursor: 'pointer',
            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f8fafc';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#0f172a' : '#ffffff';
            e.currentTarget.style.transform = 'none';
          }}
          aria-label="Chuyển đổi giao diện Sáng / Tối"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Animated Bell Component */}
        <NotificationBell />

        {/* User Menu */}
        {currentUser ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px',
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                cursor: 'pointer',
                transition: 'background-color 0.2s, border-color 0.2s',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#a11f24',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  overflow: 'hidden',
                  flexShrink: 0,
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
              <div className="header-user-info" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#f8fafc' : '#1e293b' }}>
                  {currentUser.fullName}
                </span>
                <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  {currentUser.email}
                </span>
              </div>
              <ChevronDown size={14} color={isDark ? '#94a3b8' : '#64748b'} />
            </button>

            {/* Dropdown menu */}
            {userDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderRadius: '10px',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  animation: 'popoverFade 0.2s ease',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: isDark ? '1px solid #334155' : '1px solid #f1f5f9',
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#a11f24',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      overflow: 'hidden',
                      flexShrink: 0,
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
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: isDark ? '#f8fafc' : '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {currentUser.fullName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600, marginTop: '1px' }}>
                      Mã NV: {currentUser.username}
                    </div>
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: isDark ? '#94a3b8' : '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '1px',
                      }}
                    >
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenProfile();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: isDark ? '#f8fafc' : '#334155',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f1f5f9')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <UserCircle size={16} color="#0284c7" />
                    <span>Hồ sơ nhân sự</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenChangePassword();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: isDark ? '#f8fafc' : '#334155',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f1f5f9')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <KeyRound size={16} color="#ea580c" />
                    <span>Đổi mật khẩu</span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: isDark ? '#334155' : '#f1f5f9', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      router.push('/login');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#f87171',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#451a1a' : '#fef2f2')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={16} color="#f87171" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>
            Đăng Nhập
          </Link>
        )}
      </div>
    </header>
  );
}
