'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, MessageSquare, Trash2, FileText, File } from 'lucide-react';
import { useAppStore } from '@/data/store';
import { WorkReport } from '@/data/initialData';
import { resolveReportAttachment, getFileMetaDisplay, getFileExtension, formatFileSize } from '@/utils/fileHelpers';
import { getDayOfWeekOrder, formatDayOfWeek } from '@/utils/dateUtils';
import AnimatedDeleteButton from './AnimatedDeleteButton';
import AttachmentDetailModal from './modals/AttachmentDetailModal';

interface ReportTableProps {
  onEditReport: (report: WorkReport) => void;
  onCommentReport?: (report: WorkReport) => void;
}

export default function ReportTable({ onEditReport, onCommentReport }: ReportTableProps) {
  const { reports, deleteReport, selectedWeek, selectedYear, selectedDay, showToast, currentUser } = useAppStore();
  const [selectedAttachmentReport, setSelectedAttachmentReport] = useState<WorkReport | null>(null);

  // Filter reports according to selected week, year, and day
  const filteredReports = reports.filter((report) => {
    const matchWeek = report.weekNumber === selectedWeek;
    const matchYear = report.year === selectedYear;
    const matchDay = selectedDay === 'Tất cả' || report.dayOfWeek === selectedDay;
    return matchWeek && matchYear && matchDay;
  });

  // Sort reports according to day of week order:
  // Thứ Hai (1) -> Thứ Ba (2) -> Thứ Tư (3) -> Thứ Năm (4) -> Thứ Sáu (5) -> Thứ Bảy (6) -> Chủ Nhật (7)
  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      const orderA = getDayOfWeekOrder(a.dayOfWeek, a.date);
      const orderB = getDayOfWeekOrder(b.dayOfWeek, b.date);

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // If on the same day, sort chronologically by createdAt / date (earlier reports first)
      const timeA = new Date(a.createdAt || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || 0).getTime();
      if (timeA !== timeB) {
        return timeA - timeB;
      }

      return (a.id || '').localeCompare(b.id || '');
    });
  }, [filteredReports]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa báo cáo của "${name}" không?`)) {
      deleteReport(id);
    }
  };

  const handleComment = (authorName: string) => {
    showToast(`Mở hộp thoại phản hồi cho báo cáo của ${authorName}`, 'info', '💬');
  };

  // Format date time helper
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

  // Format content as clean bullet lines
  const renderFormattedLines = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').filter((l) => l.trim() !== '');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ fontSize: '13px', lineHeight: '1.5', color: '#1e293b' }}>
            {line}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
        <table
          style={{
            width: '100%',
            minWidth: '880px',
            borderCollapse: 'collapse',
            fontSize: '13px',
            textAlign: 'left',
          }}
        >
          {/* Header matching Screenshot 2: Deep wine red/maroon background */}
          <thead>
            <tr
              style={{
                backgroundColor: '#7a0b0e',
                color: '#ffffff',
                borderBottom: '1px solid #60080b',
              }}
            >
              <th style={{ width: '55px', padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>
                Thứ
              </th>
              <th style={{ width: '160px', padding: '10px 12px', fontWeight: 700 }}>
                Họ và tên
              </th>
              <th style={{ minWidth: '280px', padding: '10px 12px', fontWeight: 700 }}>
                Nội dung báo cáo
              </th>
              <th style={{ width: '110px', padding: '10px 12px', fontWeight: 700 }}>
                File đính kèm
              </th>
              <th style={{ minWidth: '240px', padding: '10px 12px', fontWeight: 700 }}>
                Công việc ngày mai/tuần sau
              </th>
              <th style={{ width: '110px', padding: '10px 12px', fontWeight: 700 }}>
                Đề xuất
              </th>
              <th style={{ width: '130px', padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                Ngày tạo
              </th>
              <th style={{ width: '155px', padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedReports.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  <FileText size={36} color="#cbd5e1" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ fontWeight: 600 }}>Không có báo cáo nào cho tuần/thứ đã chọn.</p>
                </td>
              </tr>
            ) : (
              sortedReports.map((report) => {
                const isOwner = Boolean(
                  currentUser && (
                    report.authorId === currentUser.id ||
                    (report.authorCode && currentUser.username && report.authorCode.toLowerCase() === currentUser.username.toLowerCase())
                  )
                );
                const canModify = Boolean(isOwner || currentUser?.role === 'admin');

                return (
                <tr
                  key={report.id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                  }}
                >
                  <td
                    style={{
                      backgroundColor: '#38bdf8',
                      color: '#ffffff',
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '12px 6px',
                      fontSize: '12.5px',
                      lineHeight: '1.3',
                    }}
                  >
                    {formatDayOfWeek(report.dayOfWeek)}
                  </td>

                  {/* Họ và tên */}
                  <td
                    style={{
                      padding: '12px',
                      fontWeight: 600,
                      color: '#0f172a',
                      fontSize: '13.5px',
                    }}
                  >
                    {report.authorName}
                  </td>

                  {/* Nội dung báo cáo */}
                  <td style={{ padding: '12px', borderLeft: '1px solid #f1f5f9' }}>
                    {renderFormattedLines(report.currentWork)}
                  </td>

                  {/* File đính kèm */}
                  <td style={{ padding: '12px', borderLeft: '1px solid #f1f5f9' }}>
                    {(() => {
                      const att = resolveReportAttachment(report);
                      if (!att || !att.name) return null;
                      const meta = getFileMetaDisplay(att.name, att.type);
                      const ext = getFileExtension(att.name);

                      return (
                        <button
                          type="button"
                          onClick={() => setSelectedAttachmentReport(report)}
                          title={`Xem thông tin chi tiết: ${att.name} (${formatFileSize(att.size)})\nNhấn để xem thông tin và tải file`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: meta.badgeColor,
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: meta.badgeBg,
                            padding: '5px 9px',
                            borderRadius: '5px',
                            border: `1px solid ${meta.badgeBorder}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'left',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
                            e.currentTarget.style.filter = 'brightness(0.96)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                            e.currentTarget.style.filter = 'none';
                          }}
                        >
                          <File size={13} color={meta.iconColor} />
                          <span
                            style={{
                              maxWidth: '85px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {att.name}
                          </span>
                          {ext && (
                            <span
                              style={{
                                fontSize: '9.5px',
                                fontWeight: 700,
                                padding: '1px 3px',
                                borderRadius: '3px',
                                backgroundColor: '#ffffff',
                                border: `1px solid ${meta.badgeBorder}`,
                                lineHeight: 1,
                              }}
                            >
                              {ext}
                            </span>
                          )}
                        </button>
                      );
                    })()}
                  </td>

                  {/* Công việc ngày mai/tuần sau */}
                  <td style={{ padding: '12px', borderLeft: '1px solid #f1f5f9' }}>
                    {renderFormattedLines(report.nextWork)}
                  </td>

                  {/* Đề xuất */}
                  <td style={{ padding: '12px', borderLeft: '1px solid #f1f5f9', color: '#475569', fontSize: '12.5px' }}>
                    {report.proposal || ''}
                  </td>

                  {/* Ngày tạo: 2 ô nhãn màu xanh và đỏ matching Screenshot 2 */}
                  <td
                    style={{
                      padding: '12px 8px',
                      borderLeft: '1px solid #f1f5f9',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                      <div
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid #fde047',
                          backgroundColor: '#fefce8',
                          color: '#854d0e',
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDateTime(report.createdAt)}
                      </div>

                      {/* Box 2 (Pink/red border box) */}
                      <div
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid #fca5a5',
                          backgroundColor: '#fef2f2',
                          color: '#b91c1c',
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDateTime(report.updatedAt || report.createdAt)}
                      </div>
                    </div>
                  </td>

                  {/* Thao tác: Edit (vàng), Comment (cam), Delete (xám) */}
                  <td
                    style={{
                      padding: '12px 6px',
                      borderLeft: '1px solid #f1f5f9',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {/* Edit: Chỉ hiển thị nếu là báo cáo cá nhân hoặc quản trị viên */}
                      {canModify && (
                        <button
                          type="button"
                          onClick={() => onEditReport(report)}
                          title="Chỉnh sửa báo cáo"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#eab308',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                      )}

                      {/* Comment: Mọi người đều có thể trao đổi/bình luận */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onCommentReport) {
                            onCommentReport(report);
                          } else {
                            handleComment(report.authorName);
                          }
                        }}
                        title={`Bình luận báo cáo của ${report.authorName} (${report.comments?.length || 0})`}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f97316',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                        }}
                      >
                        <MessageSquare size={15} />
                        {(report.comments?.length || 0) > 0 && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '-6px',
                              backgroundColor: '#ea580c',
                              color: '#fff',
                              borderRadius: '9999px',
                              fontSize: '9px',
                              fontWeight: 700,
                              minWidth: '13px',
                              height: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 2px',
                            }}
                          >
                            {report.comments?.length}
                          </span>
                        )}
                      </button>

                      {/* Animated Delete Button: Chỉ hiển thị nếu là báo cáo cá nhân hoặc quản trị viên */}
                      {canModify && (
                        <AnimatedDeleteButton
                          size="sm"
                          label="Delete"
                          itemName={`báo cáo của ${report.authorName}`}
                          onDelete={() => deleteReport(report.id)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* File Viewer Modal — mở khi bấm vào file đính kèm */}
      <AttachmentDetailModal
        isOpen={!!selectedAttachmentReport}
        onClose={() => setSelectedAttachmentReport(null)}
        report={selectedAttachmentReport}
      />
    </div>
  );
}
