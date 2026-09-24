'use client';

import React from 'react';
import Image from 'next/image';

interface UttLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export default function UttLogo({ size = 'md', showText = true, variant = 'light' }: UttLogoProps) {
  const heights = {
    sm: 36,
    md: 48,
    lg: 72,
  };

  const h = heights[size];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
      <div
        style={{
          position: 'relative',
          height: `${h}px`,
          width: `${Math.round(h * 1.5)}px`,
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#2b2d6e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(43, 45, 110, 0.25)',
          flexShrink: 0,
        }}
      >
        <img
          src="/utt-logo.png"
          alt="UTT Logo"
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            padding: '2px 4px',
          }}
        />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span
            style={{
              fontSize: size === 'sm' ? '10px' : size === 'md' ? '11px' : '13px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: variant === 'dark' ? '#cbd5e1' : '#a11f24',
              textTransform: 'uppercase',
            }}
          >
            Trường Đại Học
          </span>
          <span
            style={{
              fontSize: size === 'sm' ? '12px' : size === 'md' ? '14px' : '18px',
              fontWeight: 900,
              letterSpacing: '0.2px',
              color: '#ea580c',
              textTransform: 'uppercase',
            }}
          >
            Công Nghệ GTVT
          </span>

        </div>
      )}
    </div>
  );
}
