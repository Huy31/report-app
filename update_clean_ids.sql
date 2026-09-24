-- ========================================================
-- FILE: update_clean_ids.sql
-- SCRIPT CHUẨN HÓA VÀ LÀM ĐẸP TOÀN BỘ ID TRONG SUPABASE
-- Chạy script này tại tab SQL Editor trong Supabase Dashboard
-- ========================================================

-- Tạm thời gỡ ràng buộc khóa ngoại để cập nhật ID an toàn
ALTER TABLE public.work_reports DROP CONSTRAINT IF EXISTS work_reports_author_id_fkey;
ALTER TABLE public.report_comments DROP CONSTRAINT IF EXISTS report_comments_author_id_fkey;
ALTER TABLE public.report_comments DROP CONSTRAINT IF EXISTS report_comments_report_id_fkey;
ALTER TABLE public.report_attachments DROP CONSTRAINT IF EXISTS report_attachments_report_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- 1. Cập nhật Bảng Users: Chuyển các ID cũ và ID Date.now() sang user-1..5
UPDATE public.users SET id = 'user-1' WHERE username = 'NV001';
UPDATE public.users SET id = 'user-2' WHERE username = 'NV002';
UPDATE public.users SET id = 'user-3' WHERE username = 'NV003';
UPDATE public.users SET id = 'user-4' WHERE username = 'NV004';
UPDATE public.users SET id = 'user-5' WHERE username = 'NV005' OR id LIKE 'user-1790%';

-- 2. Cập nhật Bảng Work Reports (author_id):
UPDATE public.work_reports SET author_id = 'user-1' WHERE author_code = 'NV001' OR author_id = 'user-hoan';
UPDATE public.work_reports SET author_id = 'user-2' WHERE author_code = 'NV002' OR author_id = 'user-hung';
UPDATE public.work_reports SET author_id = 'user-3' WHERE author_code = 'NV003' OR author_id = 'user-1';
UPDATE public.work_reports SET author_id = 'user-4' WHERE author_code = 'NV004' OR author_id = 'user-2';
UPDATE public.work_reports SET author_id = 'user-5' WHERE author_code = 'NV005' OR author_id LIKE 'user-1790%';

-- 3. Cập nhật ID báo cáo sang rep-1, rep-2, rep-3, rep-4
-- Đổi rep-hoan-1 -> rep-2
UPDATE public.report_attachments SET report_id = 'rep-2' WHERE report_id = 'rep-hoan-1';
UPDATE public.report_comments SET report_id = 'rep-2' WHERE report_id = 'rep-hoan-1';
UPDATE public.work_reports SET id = 'rep-2' WHERE id = 'rep-hoan-1';

-- Đổi rep-1790... -> rep-4
UPDATE public.report_attachments SET report_id = 'rep-4' WHERE report_id LIKE 'rep-1790%';
UPDATE public.report_comments SET report_id = 'rep-4' WHERE report_id LIKE 'rep-1790%';
UPDATE public.work_reports SET id = 'rep-4' WHERE id LIKE 'rep-1790%';

-- 4. Cập nhật Bảng Notifications
UPDATE public.notifications SET user_id = 'user-2' WHERE user_id = 'user-hung';
UPDATE public.notifications SET user_id = 'user-1' WHERE user_id = 'user-hoan';

-- Khôi phục lại toàn bộ khóa ngoại
ALTER TABLE public.work_reports ADD CONSTRAINT work_reports_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.report_comments ADD CONSTRAINT report_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.report_comments ADD CONSTRAINT report_comments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.work_reports(id) ON DELETE CASCADE;
ALTER TABLE public.report_attachments ADD CONSTRAINT report_attachments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.work_reports(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
