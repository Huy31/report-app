'use client';

import React, { useState } from 'react';
import { Send, X, MessageSquare, Clock, User as UserIcon } from 'lucide-react';
import { useAppStore } from '@/data/store';
import { WorkReport } from '@/data/initialData';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: WorkReport | null;
}

export default function CommentModal({ isOpen, onClose, report }: CommentModalProps) {
  const { addComment, currentUser, reports } = useAppStore();
  const [commentText, setCommentText] = useState('');

  if (!isOpen || !report) return null;

  // Find latest report data from store to keep comments reactive
  const currentReport = reports.find((r) => r.id === report.id) || report;
  const comments = currentReport.comments || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(currentReport.id, commentText);
    setCommentText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Helper to format date
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '21/09/2026 17:13';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${mins}`;
    } catch {
      return '21/09/2026 17:13';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Cyan banner exactly matching user screenshot */}
        <div
          style={{
            backgroundColor: '#5bc0de',
            color: '#ffffff',
            padding: '12px 20px',
            fontSize: '17px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <span>Bình luận báo cáo - {currentReport.authorName}</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {/* Cột 1: Thông tin báo cáo (Bên trái) */}
          <div
            style={{
              flex: '1 1 450px',
              padding: '24px 28px',
              borderRight: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1e293b',
                margin: 0,
                paddingBottom: '4px',
              }}
            >
              Thông tin báo cáo
            </h3>

            {/* Họ và tên */}
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Họ và tên</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                {currentReport.authorName}
              </div>
            </div>

            {/* Nội dung báo cáo */}
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                Nội dung báo cáo
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '4px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {currentReport.currentWork || 'Không có nội dung'}
              </div>
            </div>

            {/* Công việc tuần sau */}
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                Công việc tuần sau
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '4px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {currentReport.nextWork || 'Không có nội dung'}
              </div>
            </div>

            {/* Đề xuất */}
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Đề xuất</div>
              <div style={{ fontSize: '13.5px', color: '#1e293b' }}>
                {currentReport.proposal || 'N/A'}
              </div>
            </div>

            {/* Ngày chỉnh sửa cuối */}
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                Ngày chỉnh sửa cuối
              </div>
              <div style={{ fontSize: '13.5px', color: '#1e293b' }}>
                {formatDateTime(currentReport.updatedAt || currentReport.createdAt)}
              </div>
            </div>
          </div>

          {/* Cột 2: Bình luận (Bên phải) */}
          <div
            style={{
              flex: '1 1 450px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Tiêu đề Bình luận (0) */}
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '20px',
                }}
              >
                Bình luận ({comments.length})
              </h3>

              {/* Danh sách bình luận / Trạng thái trống */}
              <div
                style={{
                  minHeight: '220px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {comments.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '200px',
                      color: '#6b7280',
                      fontSize: '13.5px',
                    }}
                  >
                    Chưa có bình luận
                  </div>
                ) : (
                  comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                      }}
                    >
                      {cmt.avatarUrl ? (
                        <img
                          src={cmt.avatarUrl}
                          alt={cmt.authorName}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#e0f2fe',
                            color: '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                            flexShrink: 0,
                          }}
                        >
                          {cmt.authorName.charAt(0)}
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                            {cmt.authorName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {formatDateTime(cmt.createdAt)}
                          </span>
                        </div>
                        <div
                          style={{
                            backgroundColor: '#f1f5f9',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#334155',
                            lineHeight: '1.5',
                            wordBreak: 'break-word',
                          }}
                        >
                          {cmt.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Phần dưới: Thêm bình luận + Nút Đóng */}
            <div style={{ marginTop: '24px' }}>
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '16px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  Thêm bình luận
                </div>

                <form
                  onSubmit={handleSend}
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: '8px',
                  }}
                >
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập bình luận của bạn..."
                    rows={2}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '13.5px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    style={{
                      backgroundColor: '#e5e7eb',
                      border: 'none',
                      borderRadius: '4px',
                      width: '48px',
                      cursor: commentText.trim() ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.15s',
                    }}
                    title="Gửi bình luận"
                  >
                    <Send
                      size={17}
                      color={commentText.trim() ? '#2563eb' : '#9ca3af'}
                      style={{ transform: 'rotate(0deg)' }}
                    />
                  </button>
                </form>
              </div>

              {/* Nút ĐÓNG matching Screenshot: Viền xanh dương, chữ ĐÓNG */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #38bdf8',
                    color: '#0284c7',
                    padding: '6px 20px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
