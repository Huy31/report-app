'use client';

import { useEffect, useState } from 'react';
import { getMinutesUntilDeadline } from './dateUtils';

/**
 * Theo dõi realtime hạn chót tạo báo cáo (18:30 giờ VN, Thứ Hai - Thứ Sáu).
 * - isLocked: đã quá hạn, không được tạo báo cáo mới
 * - minutesLeft: số phút còn lại (null nếu hôm nay là cuối tuần)
 */
export function useReportDeadline(refreshMs = 30_000) {
  const [minutesLeft, setMinutesLeft] = useState<number | null>(() => getMinutesUntilDeadline());

  useEffect(() => {
    const tick = () => setMinutesLeft(getMinutesUntilDeadline());
    tick();
    const timer = setInterval(tick, refreshMs);
    return () => clearInterval(timer);
  }, [refreshMs]);

  const isLocked = minutesLeft !== null && minutesLeft <= 0;
  return { isLocked, minutesLeft };
}
