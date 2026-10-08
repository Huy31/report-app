-- Hạn chót tạo báo cáo mới: 18:30 (giờ Việt Nam), chỉ áp dụng Thứ Hai - Thứ Sáu.
-- Thứ Bảy & Chủ Nhật không giới hạn. Chỉ chặn INSERT (tạo mới), không chặn UPDATE (chỉnh sửa).
-- Chạy lại file này an toàn (idempotent).

CREATE OR REPLACE FUNCTION public.enforce_report_deadline()
RETURNS trigger AS $$
DECLARE
  vn_now TIMESTAMP := now() AT TIME ZONE 'Asia/Ho_Chi_Minh';
BEGIN
  -- ISODOW: 1 = Thứ Hai ... 6 = Thứ Bảy, 7 = Chủ Nhật
  IF EXTRACT(ISODOW FROM vn_now) <= 5 AND vn_now::time >= TIME '18:30' THEN
    RAISE EXCEPTION 'REPORT_DEADLINE_PASSED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_report_deadline ON public.work_reports;
CREATE TRIGGER trg_report_deadline
BEFORE INSERT ON public.work_reports
FOR EACH ROW EXECUTE FUNCTION public.enforce_report_deadline();
