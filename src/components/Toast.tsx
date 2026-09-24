'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useAppStore } from '@/data/store';

export default function Toast() {
  const { toast, closeToast } = useAppStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        closeToast();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, closeToast]);

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: '#f0fdf4',
          border: '#bbf7d0',
          color: '#15803d',
          icon: <CheckCircle2 size={20} color="#16a34a" />,
        };
      case 'warning':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          color: '#b45309',
          icon: <AlertTriangle size={20} color="#d97706" />,
        };
      case 'danger':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          color: '#b91c1c',
          icon: <XCircle size={20} color="#dc2626" />,
        };
      default:
        return {
          bg: '#eff6ff',
          border: '#bfdbfe',
          color: '#1d4ed8',
          icon: <Info size={20} color="#2563eb" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '400px',
        minWidth: '280px',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      <div style={{ flexShrink: 0 }}>
        {toast.icon ? <span style={{ fontSize: '20px' }}>{toast.icon}</span> : style.icon}
      </div>
      <div style={{ flex: 1, fontSize: '13.5px', fontWeight: 600, color: style.color }}>
        {toast.message}
      </div>
      <button
        type="button"
        onClick={closeToast}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: style.color,
          opacity: 0.7,
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Đóng thông báo"
      >
        <X size={16} />
      </button>
    </div>
  );
}
