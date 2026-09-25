'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Save, UploadCloud, File, Trash2, Eye, Paperclip } from 'lucide-react';
import { useAppStore } from '@/data/store';
import { WorkReport, ReportAttachment } from '@/data/initialData';
import { getWeeksInYear, AVAILABLE_YEARS, getDayOfWeekOrder, formatDayOfWeek, getDateOfDayInWeek, DAYS_OF_WEEK_LIST, getCurrentRealtimeWeek } from '@/utils/dateUtils';
import { formatFileSize, getFileMetaDisplay, resolveReportAttachment } from '@/utils/fileHelpers';
import RichTextEditor from '../RichTextEditor';
import AttachmentDetailModal from './AttachmentDetailModal';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportToEdit?: WorkReport | null;
}

export default function CreateReportModal({
  isOpen,
  onClose,
  reportToEdit,
}: CreateReportModalProps) {
  const { addReport, updateReport, selectedWeek, selectedYear, selectedDay } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [year, setYear] = useState<number>(selectedYear || getCurrentRealtimeWeek().year);
  const [weekNumber, setWeekNumber] = useState<number>(selectedWeek || getCurrentRealtimeWeek().weekNumber);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Thứ Hai');

  // Dynamically compute all weeks for selected year
  const weeks = useMemo(() => getWeeksInYear(year), [year]);
  const [currentWork, setCurrentWork] = useState<string>('');
  const [nextWork, setNextWork] = useState<string>('');
  const [proposal, setProposal] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<string>('');
  const [attachment, setAttachment] = useState<ReportAttachment | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (reportToEdit) {
      setYear(reportToEdit.year);
      setWeekNumber(reportToEdit.weekNumber);
      setDayOfWeek(formatDayOfWeek(reportToEdit.dayOfWeek) || 'Thứ Hai');
      setCurrentWork(reportToEdit.currentWork || '');
      setNextWork(reportToEdit.nextWork || '');
      setProposal(reportToEdit.proposal || '');
      const existingAttachment = resolveReportAttachment(reportToEdit);
      setAttachment(existingAttachment);
      setAttachedFile(reportToEdit.attachedFile || existingAttachment?.name || '');
    } else {
      const realtime = getCurrentRealtimeWeek();
      setYear(selectedYear || realtime.year);
      setWeekNumber(selectedWeek || realtime.weekNumber);
      const daysMap = ['Thứ Hai', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const todayDay = daysMap[new Date().getDay()];
      const initialDay = selectedDay && selectedDay !== 'Tất cả' && selectedDay !== 'Chủ Nhật' ? selectedDay : todayDay;
      setDayOfWeek(initialDay);
      setCurrentWork('');
      setNextWork('');
      setProposal('');
      setAttachedFile('');
      setAttachment(null);
    }
    setError('');
  }, [reportToEdit, isOpen, selectedWeek, selectedYear, selectedDay]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Đọc data URL cho file <= 3.5MB để lưu trữ & xem trước
    if (file.size <= 3.5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        const newAtt: ReportAttachment = {
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          url: reader.result as string,
          lastModified: file.lastModified,
          uploadedAt: new Date().toISOString(),
        };
        setAttachment(newAtt);
        setAttachedFile(file.name);
      };
      reader.readAsDataURL(file);
    } else {
      const newAtt: ReportAttachment = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString(),
      };
      setAttachment(newAtt);
      setAttachedFile(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentWork.trim()) {
      setError('Vui lòng nhập nội dung báo cáo!');
      return;
    }

    if (!nextWork.trim()) {
      setError('Vui lòng nhập công việc tuần sau (ngày mai)!');
      return;
    }

    const reportDate = getDateOfDayInWeek(year, weekNumber, dayOfWeek);

    if (reportToEdit) {
      updateReport(reportToEdit.id, {
        dayOfWeek,
        date: reportDate,
        year,
        weekNumber,
        currentWork: currentWork.trim(),
        nextWork: nextWork.trim(),
        proposal: proposal.trim(),
        attachedFile: attachment ? attachment.name : '',
        attachment: attachment || undefined,
      });
    } else {
      addReport({
        dayOfWeek,
        date: reportDate,
        weekNumber,
        year,
        currentWork: currentWork.trim(),
        nextWork: nextWork.trim(),
        proposal: proposal.trim(),
        attachedFile: attachment ? attachment.name : '',
        attachment: attachment || undefined,
        status: 'completed',
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '95%',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header: Cyan banner exactly matching Screenshot 1 */}
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
          <span>Tạo báo cáo</span>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '20px 24px',
            maxHeight: 'calc(90vh - 60px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#ffffff',
          }}
        >
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#dc2626',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {/* Row 1: Chọn năm & Tuần báo cáo & Chọn thứ */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 140px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Chọn năm
              </label>
              <select
                value={year}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  setYear(newYear);
                  const newWeeks = getWeeksInYear(newYear);
                  if (weekNumber > newWeeks.length) {
                    setWeekNumber(newWeeks.length);
                  }
                }}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '2 1 240px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Tuần báo cáo
              </label>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {weeks.map((w) => (
                  <option key={w.weekNumber} value={w.weekNumber}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Chọn thứ
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {DAYS_OF_WEEK_LIST.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Nội dung báo cáo * */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#262626',
                marginBottom: '6px',
              }}
            >
              Nội dung báo cáo<span style={{ color: '#e11d48', marginLeft: '2px' }}>*</span>
            </label>
            <RichTextEditor
              value={currentWork}
              onChange={setCurrentWork}
              minHeight="110px"
              placeholder=""
            />
          </div>

          {/* Row 3: File đính kèm */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#262626',
                marginBottom: '8px',
              }}
            >
              File đính kèm
            </label>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                  transition: 'background-color 0.15s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1565c0')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1976d2')}
              >
                <UploadCloud size={18} />
                <span>TẢI FILE ĐÍNH KÈM</span>
              </button>

              {attachedFile && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    color: '#0f172a',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <File size={16} color="#0284c7" />
                  <span style={{ fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachedFile}
                  </span>

                  {attachment?.size ? (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {formatFileSize(attachment.size)}
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px 4px',
                      cursor: 'pointer',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                    title="Xem trước và chi tiết file đính kèm"
                  >
                    <Eye size={15} />
                    <span>Xem thông tin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile('');
                      setAttachment(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px 4px',
                      cursor: 'pointer',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Gỡ file đính kèm"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Công việc tuần sau (ngày mai) * */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#262626',
                marginBottom: '6px',
              }}
            >
              Công việc tuần sau (ngày mai)<span style={{ color: '#e11d48', marginLeft: '2px' }}>*</span>
            </label>
            <RichTextEditor
              value={nextWork}
              onChange={setNextWork}
              minHeight="110px"
              placeholder=""
            />
          </div>

          {/* Row 5: Đề xuất */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#262626',
                marginBottom: '6px',
              }}
            >
              Đề xuất
            </label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              style={{
                width: '100%',
                minHeight: '85px',
                padding: '10px 14px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13.5px',
                outline: 'none',
                fontFamily: 'inherit',
                color: '#1f2937',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Row 6: Important notes */}
          <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#1f2937', marginTop: '2px' }}>
            <div style={{ fontWeight: 700 }}>
              Kí hiệu <span style={{ color: '#e11d48' }}>*</span> là nội dung không được bỏ trống!
            </div>
            <div style={{ fontWeight: 700, color: '#111827' }}>
              Lưu ý: Mỗi ngày cần viết báo cáo vì dữ liệu hiển thị theo ngày tạo báo cáo. Hôm nay không thể tạo báo cáo bù cho hôm qua.
            </div>
          </div>

          {/* Row 7: Action Buttons (Lưu báo cáo - green & Đóng - red) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '10px',
            }}
          >
            <button
              type="submit"
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#166534')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
            >
              <Save size={16} color="#ffffff" strokeWidth={2.2} />
              <span>Lưu báo cáo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
            >
              Đóng
            </button>
          </div>
        </form>
      </div>

      {/* Modal xem trước & chi tiết file đính kèm */}
      <AttachmentDetailModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        report={reportToEdit || null}
        attachmentOverride={attachment}
      />
    </div>
  );
}
