'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, CalendarOff, Bell } from 'lucide-react';
import { useAppStore } from '@/data/store';

interface UnreportedStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnreportedStatsModal({ isOpen, onClose }: UnreportedStatsModalProps) {
  const { users, reports, showToast, notifyUnreportedStaff } = useAppStore();

  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [hasQueried, setHasQueried] = useState(false);
  const [search, setSearch] = useState('');

  /* ─── helpers ─────────────────────────────────────────── */
  const formatDD_MM_YYYY = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  /** Lấy tất cả ngày làm việc (T2–T6) trong khoảng [from, to] */
  const getWorkingDays = (from: string, to: string): string[] => {
    const days: string[] = [];
    const cur = new Date(from + 'T00:00:00');
    const end = new Date(to + 'T00:00:00');
    while (cur <= end) {
      const dow = cur.getDay();
      if (dow !== 0 && dow !== 6) {
        days.push(cur.toISOString().split('T')[0]);
      }
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  };

  /* ─── computed ─────────────────────────────────────────── */
  const workingDays = useMemo(
    () => getWorkingDays(fromDate, toDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromDate, toDate]
  );

  /** Với mỗi user: ngày nào trong khoảng mà họ KHÔNG nộp báo cáo */
  const unreportedData = useMemo(() => {
    return users
      .map((user) => {
        const reportedDates = new Set(
          reports
            .filter((r) => r.authorId === user.id && r.date >= fromDate && r.date <= toDate)
            .map((r) => r.date)
        );
        const missedDays = workingDays.filter((d) => !reportedDates.has(d));
        return { user, missedDays, count: missedDays.length };
      })
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count); // sắp xếp giảm dần
  }, [users, reports, workingDays, fromDate, toDate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return unreportedData;
    return unreportedData.filter((d) =>
      d.user.fullName.toLowerCase().includes(q)
    );
  }, [unreportedData, search]);

  if (!isOpen) return null;

  /* ─── handlers ─────────────────────────────────────────── */
  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showToast('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc!', 'warning', '⚠️');
      return;
    }
    if (fromDate > toDate) {
      showToast('Ngày bắt đầu phải trước ngày kết thúc!', 'warning', '⚠️');
      return;
    }
    setSearch('');
    setHasQueried(true);
    showToast(
      `Đã thống kê từ ${formatDD_MM_YYYY(fromDate)} đến ${formatDD_MM_YYYY(toDate)}`,
      'info',
      '📊'
    );
  };

  /* ─── render ────── */
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
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
          maxWidth: '860px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
            Thống kê nhân sự chưa báo cáo
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* Date range form */}
          <form onSubmit={handleQuery}>
            {/* Từ ngày */}
            <div
              style={{
                position: 'relative',
                border: '1px solid #94a3b8',
                borderRadius: '4px',
                padding: '10px 14px 8px',
                marginBottom: '16px',
              }}
            >
              <label
                style={{
                  position: 'absolute',
                  top: '-9px',
                  left: '10px',
                  backgroundColor: '#ffffff',
                  padding: '0 4px',
                  fontSize: '11.5px',
                  color: '#475569',
                  fontWeight: 500,
                }}
              >
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  color: '#0f172a',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Đến ngày */}
            <div
              style={{
                position: 'relative',
                border: '1px solid #94a3b8',
                borderRadius: '4px',
                padding: '10px 14px 8px',
                marginBottom: '18px',
              }}
            >
              <label
                style={{
                  position: 'absolute',
                  top: '-9px',
                  left: '10px',
                  backgroundColor: '#ffffff',
                  padding: '0 4px',
                  fontSize: '11.5px',
                  color: '#475569',
                  fontWeight: 500,
                }}
              >
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  color: '#0f172a',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1976d2',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.6px',
                marginBottom: '24px',
                transition: 'background-color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1565c0')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1976d2')}
            >
              XEM THỐNG KÊ
            </button>
          </form>

          {/* ── Results ── */}
          {hasQueried && (
            <>
              {/* Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                  Kết quả thống kê:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => notifyUnreportedStaff(toDate || '2026-09-21')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fdba74',
                      color: '#ea580c',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ffedd5')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fff7ed')}
                    title="Gửi thông báo nhắc nhở đến chuông thông báo hệ thống"
                  >
                    <Bell size={14} />
                    <span>Gửi nhắc nhở</span>
                  </button>

                  <div style={{ position: 'relative' }}>
                    <Search
                      size={14}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '7px 12px 7px 30px',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#334155',
                        width: '200px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13.5px',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: '#334155',
                        width: '180px',
                      }}
                    >
                      Nhân viên
                    </th>
                    <th
                      style={{
                        padding: '10px 12px',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: '#334155',
                        width: '120px',
                      }}
                    >
                      Số ngày chưa báo cáo
                    </th>
                    <th
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: '#334155',
                      }}
                    >
                      Ngày chưa báo cáo
                    </th>
                    <th
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: '#334155',
                        width: '160px',
                      }}
                    >
                      Ngày nghỉ phép
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: '40px 20px',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#16a34a',
                          }}
                        >
                          <CalendarOff size={32} color="#16a34a" />
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>
                            {search
                              ? 'Không tìm thấy nhân viên phù hợp.'
                              : '🎉 Tất cả nhân viên đã nộp báo cáo trong giai đoạn này!'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr
                        key={item.user.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          verticalAlign: 'top',
                        }}
                      >
                        {/* Tên nhân viên */}
                        <td
                          style={{
                            padding: '12px',
                            fontWeight: 500,
                            color: '#0f172a',
                            verticalAlign: 'middle',
                          }}
                        >
                          {item.user.fullName}
                        </td>

                        {/* Số ngày badge */}
                        <td
                          style={{
                            padding: '12px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor: '#ef4444',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '14px',
                              flexShrink: 0,
                            }}
                          >
                            {item.count}
                          </span>
                        </td>

                        {/* Ngày chưa báo cáo — pill outline */}
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '5px',
                            }}
                          >
                            {item.missedDays.map((d) => (
                              <span
                                key={d}
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '12px',
                                  color: '#334155',
                                  backgroundColor: '#ffffff',
                                  fontWeight: 500,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {formatDD_MM_YYYY(d)}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Ngày nghỉ phép — empty column (extensible) */}
                        <td
                          style={{
                            padding: '12px',
                            verticalAlign: 'middle',
                            color: '#94a3b8',
                            fontSize: '12px',
                          }}
                        >
                          —
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 20px',
              borderRadius: '4px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
