'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAppStore } from '@/data/store';
import RegisterModal from '@/components/modals/RegisterModal';

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser, isInitialized } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isInitialized && currentUser) {
      router.replace('/');
    }
  }, [isInitialized, currentUser, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = login(email, password);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.message || 'Đăng nhập không thành công!');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top brand banner */}
        <div
          style={{
            backgroundColor: '#2b2d6e',
            padding: '28px 24px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: '4px solid #ea580c',
          }}
        >
          <div
            style={{
              height: '84px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <img
              src="/utt-logo.png"
              alt="Logo Trường ĐH Công nghệ GTVT"
              style={{
                maxHeight: '100%',
                maxWidth: '220px',
                objectFit: 'contain',
              }}
            />
          </div>

          <h1
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginTop: '6px',
            }}
          >
            Hệ Thống Báo Cáo Công Việc
          </h1>
          <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
            Trường Đại học Công nghệ Giao thông Vận tải
          </p>
        </div>

        {/* Form body */}
        <div style={{ padding: '24px 28px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: '#dc2626',
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email đăng nhập
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="email"
                  placeholder="VD: Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Mật khẩu
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '11px',
                    color: '#94a3b8',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '14.5px',
                marginTop: '4px',
                backgroundColor: '#a11f24',
              }}
            >
              <LogIn size={18} />
              <span>ĐĂNG NHẬP HỆ THỐNG</span>
            </button>
          </form>

          {/* Register trigger */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Chưa có tài khoản nhân viên? </span>
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              style={{
                fontSize: '13px',
                color: '#ea580c',
                fontWeight: 700,
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Đăng ký tài khoản ngay
            </button>
          </div>
        </div>

        {/* Footer info */}
        {/* <div
          style={{
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: '11px',
            color: '#94a3b8',
          }}
        >
          Hệ thống xác thực một cửa E-GOV UTT • Hotline HT: 024.38544264
        </div> */}
      </div>

      {/* Register Modal */}
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
}
