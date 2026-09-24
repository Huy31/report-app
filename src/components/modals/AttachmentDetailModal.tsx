'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { WorkReport, ReportAttachment } from '@/data/initialData';
import {
  formatFileSize,
  getFileExtension,
  getFileMetaDisplay,
  resolveReportAttachment,
  downloadAttachment,
} from '@/utils/fileHelpers';

interface AttachmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: WorkReport | null;
  attachmentOverride?: ReportAttachment | null;
}

export default function AttachmentDetailModal({
  isOpen,
  onClose,
  report,
  attachmentOverride,
}: AttachmentDetailModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);

  const attachment: ReportAttachment | null =
    attachmentOverride || (report ? resolveReportAttachment(report) : null);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Extract text from data URL for text/code files
  useEffect(() => {
    if (!isOpen || !attachment?.url) {
      setTextContent(null);
      return;
    }
    const meta = getFileMetaDisplay(attachment.name, attachment.type);
    if (meta.isText && attachment.url.startsWith('data:')) {
      try {
        const base64 = attachment.url.split(',')[1];
        const decoded = atob(base64);
        setTextContent(decoded);
      } catch {
        setTextContent(null);
      }
    } else {
      setTextContent(null);
    }
  }, [isOpen, attachment?.url, attachment?.name, attachment?.type]);

  if (!isOpen || !attachment) return null;

  const meta = getFileMetaDisplay(attachment.name, attachment.type);
  const ext = getFileExtension(attachment.name);
  const hasUrl = !!attachment.url;

  // Render file icon based on category
  const renderIcon = (size = 40) => {
    switch (meta.category) {
      case 'pdf':    return <FileText  size={size} color={meta.iconColor} />;
      case 'word':   return <FileText  size={size} color={meta.iconColor} />;
      case 'excel':  return <FileSpreadsheet size={size} color={meta.iconColor} />;
      case 'image':  return <ImageIcon size={size} color={meta.iconColor} />;
      case 'archive':return <FileArchive size={size} color={meta.iconColor} />;
      case 'text':
      case 'code':   return <FileCode  size={size} color={meta.iconColor} />;
      default:       return <File      size={size} color={meta.iconColor} />;
    }
  };

  // ——— Render Content ———
  const renderContent = () => {
    // 1. Image preview
    if (meta.isImage && hasUrl) {
      return (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
            minHeight: '300px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.url}
            alt={attachment.name}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      );
    }

    // 2. PDF preview via iframe
    if (meta.isPdf && hasUrl) {
      return (
        <iframe
          src={attachment.url}
          title={attachment.name}
          style={{
            flex: 1,
            width: '100%',
            minHeight: '70vh',
            border: 'none',
            display: 'block',
            borderRadius: '0 0 12px 12px',
          }}
        />
      );
    }

    // 3. Text / code preview
    if (meta.isText && hasUrl && textContent !== null) {
      return (
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#0f172a',
            borderRadius: '0 0 12px 12px',
            padding: '20px 24px',
            maxHeight: '70vh',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontFamily: '"Cascadia Code", "Fira Code", "Consolas", monospace',
              fontSize: '13px',
              lineHeight: '1.7',
              color: '#e2e8f0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {textContent}
          </pre>
        </div>
      );
    }

    // 4. Cannot preview — show placeholder card
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '0 0 12px 12px',
          padding: '48px 32px',
          gap: '16px',
          minHeight: '260px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            backgroundColor: meta.badgeBg,
            border: `2px solid ${meta.badgeBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderIcon(44)}
        </div>

        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              margin: '0 0 6px 0',
              fontSize: '15px',
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            {attachment.name}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={14} color="#f59e0b" />
            Không thể xem trực tiếp định dạng{' '}
            <strong style={{ color: meta.badgeColor }}>.{ext || attachment.type}</strong> trong trình duyệt.
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Tải xuống để mở bằng ứng dụng phù hợp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadAttachment(attachment, report?.authorName)}
          style={{
            marginTop: '4px',
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
        >
          <Download size={17} />
          Tải xuống tập tin
        </button>
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: meta.isImage || meta.isPdf ? '860px' : '640px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 25px 60px -10px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '90vh',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#f8fafc',
            flexShrink: 0,
          }}
        >
          {/* File icon badge */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '7px',
              backgroundColor: meta.badgeBg,
              border: `1px solid ${meta.badgeBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {renderIcon(20)}
          </div>

          {/* File name + size */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#0f172a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {attachment.name}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: meta.badgeBg,
                  color: meta.badgeColor,
                  fontWeight: 700,
                  fontSize: '10.5px',
                  border: `1px solid ${meta.badgeBorder}`,
                }}
              >
                {ext || 'FILE'}
              </span>
              {attachment.size ? (
                <span>{formatFileSize(attachment.size)}</span>
              ) : null}
              {report && (
                <span style={{ color: '#94a3b8' }}>
                  · {report.authorName} · {report.dayOfWeek} {report.date}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => downloadAttachment(attachment, report?.authorName)}
              title="Tải xuống file"
              style={{
                background: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                backgroundColor: '#ffffff',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0284c7';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#0284c7';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#334155';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <Download size={14} />
              <span>Tải xuống</span>
            </button>

            <button
              onClick={onClose}
              title="Đóng (ESC)"
              style={{
                background: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.borderColor = '#fca5a5';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── File Content ── */}
        {renderContent()}
      </div>
    </div>
  );
}
