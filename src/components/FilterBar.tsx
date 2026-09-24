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
  } = useAppStore();

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

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: '12px',
        marginBottom: '16px',
      }}
    >
      {/* 1. Chọn năm */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '4px',
          }}
        >
          Chọn năm
        </label>
        <select
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
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            fontWeight: 500,
            color: '#1e293b',
            backgroundColor: '#ffffff',
            outline: 'none',
            minWidth: '130px',
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

      {/* 2. Chọn tuần xem báo cáo */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '4px',
          }}
        >
          Chọn tuần xem báo cáo
        </label>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          style={{
            height: '36px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            fontWeight: 500,
            color: '#1e293b',
            backgroundColor: '#ffffff',
            outline: 'none',
            minWidth: '280px',
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

      {/* 3. Chọn thứ */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '4px',
          }}
        >
          Chọn thứ
        </label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          style={{
            height: '36px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            fontWeight: 500,
            color: '#1e293b',
            backgroundColor: '#ffffff',
            outline: 'none',
            minWidth: '150px',
            cursor: 'pointer',
          }}
        >
          {daysOfWeek.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Action Buttons matching Screenshot 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
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

        {/* Nút + Tạo báo cáo (Gold/Yellow) */}
        <button
          type="button"
          onClick={onCreateNewReport}
          style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '4px',
            backgroundColor: '#d97706',
            color: '#1f2937',
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

        {/* Nút ▲ Lưu ý (Dark Navy) */}
        <button
          type="button"
          onClick={handleNoticeClick}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '4px',
            backgroundColor: '#1e293b',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
        >
          <AlertTriangle size={15} color="#fbbf24" />
          <span>Lưu ý</span>
        </button>
      </div>
    </div>
  );
}
