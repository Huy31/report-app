'use client';

import React, { useMemo } from 'react';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/data/store';
import { getWeeksInYear, AVAILABLE_YEARS } from '@/utils/dateUtils';

interface FilterBarProps {
  onCreateNewReport: () => void;
  onShowNotice?: () => void;
}

export default function FilterBar({ onCreateNewReport, onShowNotice }: FilterBarProps) {
  const {
    selectedWeek,
    setSelectedWeek,
    selectedYear,
    setSelectedYear,
    selectedDay,
    setSelectedDay,
    showToast,
    theme,
  } = useAppStore();

  const isDark = theme === 'dark';

  // Dynamically compute all weeks for the selected year
  const weeks = useMemo(() => getWeeksInYear(selectedYear), [selectedYear]);

  const daysOfWeek = ['Tất cả', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  const handlePrevWeek = () => {
    setSelectedWeek(Math.max(1, selectedWeek - 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek(Math.min(weeks.length, selectedWeek + 1));
  };

  const handleNoticeClick = () => {
    if (onShowNotice) {
      onShowNotice();
    } else {
      showToast('Lưu ý: Mỗi ngày cần viết báo cáo vì dữ liệu hiển thị theo ngày tạo báo cáo. Hôm nay không thể tạo báo cáo bù cho hôm qua.', 'warning', '⚠️');
    }
  };

  const labelColor = isDark ? '#cbd5e1' : '#1f2937';
  const selectBg = isDark ? '#1e293b' : '#ffffff';
  const selectColor = isDark ? '#f8fafc' : '#1e293b';
  const selectBorder = isDark ? '1px solid #334155' : '1px solid #cbd5e1';

  return (
    <div className="filter-bar-container">
      <style>{`
        .filter-bar-container {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 16px;
        }
        .filter-field {
          display: flex;
          flex-direction: column;
        }
        .filter-actions-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .filter-bar-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .filter-field-year {
            grid-column: 1 / 2;
          }
          .filter-field-day {
            grid-column: 2 / 3;
          }
          .filter-field-week {
            grid-column: 1 / 3;
          }
          .filter-select {
            width: 100% !important;
            min-width: 0 !important;
          }
          .filter-actions-group {
            grid-column: 1 / 3;
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 8px !important;
          }
          .filter-action-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 0 8px !important;
            font-size: 12.5px !important;
          }
        }
      `}</style>

      {/* 1. Chọn năm */}
      <div className="filter-field filter-field-year">
        <label
          style={{
            display: 'block',
            fontSize: '12.5px',
            fontWeight: 700,
            color: labelColor,
            marginBottom: '4px',
          }}
        >
          Chọn năm
        </label>
        <select
          className="filter-select"
          value={selectedYear}
          onChange={(e) => {
            const newYear = Number(e.target.value);
            setSelectedYear(newYear);
            const newWeeks = getWeeksInYear(newYear);
            if (selectedWeek > newWeeks.length) {
              setSelectedWeek(newWeeks.length);
            }
          }}
          style={{
            height: '36px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: selectBorder,
            fontSize: '13px',
            fontWeight: 500,
            color: selectColor,
            backgroundColor: selectBg,
            outline: 'none',
            minWidth: '130px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
          }}
        >
          {AVAILABLE_YEARS.map((y) => (
            <option key={y} value={y}>
              Năm {y}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Chọn thứ */}
      <div className="filter-field filter-field-day">
        <label
          style={{
            display: 'block',
            fontSize: '12.5px',
            fontWeight: 700,
            color: labelColor,
            marginBottom: '4px',
          }}
        >
          Chọn thứ
        </label>
        <select
          className="filter-select"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          style={{
            height: '36px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: selectBorder,
            fontSize: '13px',
            fontWeight: 500,
            color: selectColor,
            backgroundColor: selectBg,
            outline: 'none',
            minWidth: '140px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
          }}
        >
          {daysOfWeek.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Chọn tuần xem báo cáo */}
      <div className="filter-field filter-field-week">
        <label
          style={{
            display: 'block',
            fontSize: '12.5px',
            fontWeight: 700,
            color: labelColor,
            marginBottom: '4px',
          }}
        >
          Chọn tuần xem báo cáo
        </label>
        <select
          className="filter-select"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          style={{
            height: '36px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: selectBorder,
            fontSize: '13px',
            fontWeight: 500,
            color: selectColor,
            backgroundColor: selectBg,
            outline: 'none',
            minWidth: '280px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
          }}
        >
          {weeks.map((w) => (
            <option key={w.weekNumber} value={w.weekNumber}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Action Buttons */}
      <div className="filter-actions-group">
        <button
          type="button"
          className="filter-action-btn"
          onClick={handlePrevWeek}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '4px',
            backgroundColor: '#b91c1c',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#991b1b')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
        >
          <span>&lt; Tuần trước</span>
        </button>

        {/* Nút Tuần sau > */}
        <button
          type="button"
          className="filter-action-btn"
          onClick={handleNextWeek}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '4px',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
        >
          <span>Tuần sau &gt;</span>
        </button>

        {/* Nút + Tạo báo cáo */}
        <button
          type="button"
          className="filter-action-btn"
          onClick={onCreateNewReport}
          style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '4px',
            backgroundColor: '#d97706',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b45309')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d97706')}
        >
          <PlusCircle size={16} />
          <span>Tạo báo cáo</span>
        </button>

        {/* Nút ▲ Lưu ý */}
        <button
          type="button"
          className="filter-action-btn"
          onClick={handleNoticeClick}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '4px',
            backgroundColor: isDark ? '#334155' : '#1e293b',
            color: '#ffffff',
            border: isDark ? '1px solid #475569' : 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#475569' : '#0f172a')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#1e293b')}
        >
          <AlertTriangle size={15} color="#fbbf24" />
          <span>Lưu ý</span>
        </button>
      </div>
    </div>
  );
}
