'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function RealtimeClock() {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      setTimeStr(`${dayName}, ${day}/${month}/${year} ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeStr) {
    return null;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '9999px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        fontSize: '12.5px',
        fontWeight: 600,
        color: '#334155',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
      title="Thời gian thực hệ thống"
    >
      <Clock size={14} color="#ea580c" />
      <span>{timeStr}</span>
    </div>
  );
}
