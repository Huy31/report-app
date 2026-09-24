-- ========================================================
-- FILE: supabase_seed.sql
-- HỆ THỐNG BÁO CÁO CÔNG VIỆC TRƯỜNG ĐH CÔNG NGHỆ GTVT (UTT)
-- Script khởi tạo bảng và nạp dữ liệu mẫu ban đầu (Mock Data)
-- Chạy script này tại tab SQL Editor trong Supabase Dashboard
-- ========================================================

-- 1. BẢNG USERS (Tài khoản & Nhân viên)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,         -- Mã nhân viên: NV001, NV002...
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,            -- Email: hoannc@gmail.com...
    full_name TEXT NOT NULL,
    last_name TEXT,
    first_name TEXT,
    alias TEXT,
    birth_date DATE,
    gender TEXT DEFAULT 'Nam',
    phone TEXT,
    mobile_phone TEXT,
    work_phone TEXT,
    home_phone TEXT,
    home_address TEXT,
    department TEXT DEFAULT 'Trường ĐH Công nghệ GTVT',
    role TEXT DEFAULT 'staff',             -- admin, staff, lecturer
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BẢNG WORK_REPORTS (Báo cáo công việc)
CREATE TABLE IF NOT EXISTS public.work_reports (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_code TEXT NOT NULL,             -- Mã NV: NV001
    department TEXT,
    day_of_week TEXT NOT NULL,             -- Thứ Hai, Thứ Ba...
    report_date DATE NOT NULL,             -- Ngày cụ thể (YYYY-MM-DD)
    week_number INT4 NOT NULL,             -- Số tuần trong năm (1 - 53)
    year INT4 NOT NULL,                    -- Năm (VD: 2026)
    current_work TEXT NOT NULL,            -- Nội dung công việc hôm nay
    next_work TEXT,                        -- Công việc ngày mai / tuần sau
    proposal TEXT,                         -- Đề xuất, kiến nghị
    attached_file TEXT,                    -- Tên file đính kèm nếu có
    status TEXT DEFAULT 'completed',       -- completed, in_progress, pending
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BẢNG REPORT_ATTACHMENTS (Tệp đính kèm)
CREATE TABLE IF NOT EXISTS public.report_attachments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    report_id TEXT NOT NULL REFERENCES public.work_reports(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INT8 NOT NULL,               -- Dung lượng bytes
    file_type TEXT NOT NULL,               -- MIME type (pdf, docx, png...)
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BẢNG REPORT_COMMENTS (Bình luận / Phản hồi)
CREATE TABLE IF NOT EXISTS public.report_comments (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL REFERENCES public.work_reports(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BẢNG NOTIFICATIONS (Thông báo hệ thống)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',     -- warning, info, create, update, delete
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- BẬT ROW LEVEL SECURITY (RLS) VÀ CẤP QUYỀN ĐỌC GHI CHO ỨNG DỤNG
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all users" ON public.users;
CREATE POLICY "Allow all users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all reports" ON public.work_reports;
CREATE POLICY "Allow all reports" ON public.work_reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all attachments" ON public.report_attachments;
CREATE POLICY "Allow all attachments" ON public.report_attachments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all comments" ON public.report_comments;
CREATE POLICY "Allow all comments" ON public.report_comments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all notifications" ON public.notifications;
CREATE POLICY "Allow all notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- XÓA DỮ LIỆU CŨ TRƯỚC KHI NẠP DỮ LIỆU MẪU MỚI
TRUNCATE TABLE public.notifications, public.report_comments, public.report_attachments, public.work_reports, public.users CASCADE;

-- ========================================================
-- NẠP DỮ LIỆU MẪU (SEED MOCK DATA)
-- ========================================================

-- 1. Thêm danh sách nhân viên mẫu
INSERT INTO public.users (
    id, username, password, email, full_name, last_name, first_name, alias, 
    birth_date, gender, work_phone, home_phone, mobile_phone, home_address, 
    department, role, avatar_url
) VALUES 
(
    'user-admin',
    'admin',
    'password123',
    'admin@gmail.com',
    'Quản trị viên Hệ thống',
    'Quản trị viên',
    'Hệ thống',
    'Admin',
    '1980-01-01',
    'Nam',
    '024.38544264',
    '024.38544264',
    '0901234567',
    'Trường ĐH Công nghệ GTVT, Hà Nội',
    'Ban Giám hiệu',
    'admin',
    ''
),
(
    'user-hoan',
    'NV001',
    'password123',
    'hoannc@gmail.com',
    'Nguyễn Công Hoan',
    'Nguyễn Công',
    'Hoan',
    'HoanNC',
    '1995-04-12',
    'Nam',
    '024.38544270',
    '024.35521489',
    '0912345678',
    'Hà Nội',
    'Khoa Công nghệ Thông tin',
    'staff',
    ''
),
(
    'user-hung',
    'NV002',
    'password123',
    'hungnv@gmail.com',
    'Nguyễn Việt Hùng',
    'Nguyễn Việt',
    'Hùng',
    'HungNV',
    '1996-08-20',
    'Nam',
    '024.38544271',
    '024.37762145',
    '0987654321',
    'Hà Nội',
    'Phòng Quản trị Thiết bị',
    'staff',
    ''
),
(
    'user-1',
    'NV003',
    'password123',
    'annv@gmail.com',
    'TS. Nguyễn Văn An',
    'TS. Nguyễn Văn',
    'An',
    'AnNV',
    '1982-05-15',
    'Nam',
    '024.38544270',
    '024.35521489',
    '0912345678',
    'Số 54 Triều Khúc, Thanh Xuân, Hà Nội',
    'Khoa Công nghệ Thông tin',
    'admin',
    ''
),
(
    'user-2',
    'NV004',
    'password123',
    'bichtt@gmail.com',
    'ThS. Trần Thị Bích',
    'ThS. Trần Thị',
    'Bích',
    'BichTT',
    '1986-11-20',
    'Nữ',
    '024.38544271',
    '024.37762145',
    '0987654321',
    'Tập thể ĐH GTVT, Đống Đa, Hà Nội',
    'Khoa Công trình',
    'lecturer',
    ''
);

-- 2. Thêm báo cáo công việc mẫu
INSERT INTO public.work_reports (
    id, author_id, author_name, author_code, department, day_of_week, 
    report_date, week_number, year, current_work, next_work, proposal, 
    attached_file, status, created_at
) VALUES 
(
    'rep-hoan-1',
    'user-hoan',
    'Nguyễn Công Hoan',
    'NV001',
    'Khoa Công nghệ Thông tin',
    'Thứ Hai',
    '2026-09-21',
    38,
    2026,
    '* Chỉnh sửa theo feedback: Thêm Animation mở đầu các screen, tinh chỉnh anim BG
* Communication
* Learning Report
* Portfolio
* Weekly Challenge
* Gallery
* MainMenu
* Attendance
* Dựng Animation phần Book',
    '* Tinh chỉnh UI các phần: Achievement, Portfolio, Attendance',
    '',
    '',
    'completed',
    '2026-09-21 17:13:00+07'
),
(
    'rep-1',
    'user-1',
    'TS. Nguyễn Văn An',
    'NV003',
    'Khoa Công nghệ Thông tin',
    'Thứ Hai',
    '2026-09-21',
    38,
    2026,
    'Hoàn thành thẩm định đề cương chi tiết học phần Lập trình Web nâng cao; Họp Hội đồng Khoa học định kỳ tháng 9.',
    'Rà soát bài giảng thực hành Cloud Computing; Tiếp nhận hồ sơ đồ án tốt nghiệp.',
    'Đề xuất trang bị thêm bộ lưu điện cho phòng lab',
    'de_cuong_hoc_phan_v2.pdf',
    'completed',
    '2026-09-21 08:30:00+07'
),
(
    'rep-3',
    'user-hung',
    'Nguyễn Việt Hùng',
    'NV002',
    'Phòng Quản trị Thiết bị',
    'Thứ Hai',
    '2026-09-21',
    38,
    2026,
    'Khảo sát hiện trạng thiết bị phòng họp trực tuyến; Bảo trì định kỳ máy in cơ quan.',
    'Phối hợp đơn vị kỹ thuật nâng cấp đường truyền phòng máy.',
    '',
    '',
    'in_progress',
    '2026-09-21 07:45:00+07'
);

-- 3. Thêm tệp đính kèm cho báo cáo rep-1
INSERT INTO public.report_attachments (
    report_id, file_name, file_size, file_type, file_url, uploaded_at
) VALUES (
    'rep-1',
    'de_cuong_hoc_phan_v2.pdf',
    496844,
    'application/pdf',
    'https://raw.githubusercontent.com/Huy31/report-app/main/public/de_cuong_hoc_phan_v2.pdf',
    '2026-09-21 08:30:00+07'
);

-- 4. Thêm thông báo hệ thống mẫu
INSERT INTO public.notifications (
    id, user_id, type, title, content, is_read, created_at
) VALUES 
(
    'notif-unreported-hung',
    'user-hung',
    'warning',
    'Nhắc nhở chưa nộp báo cáo',
    'Nhân viên Nguyễn Việt Hùng chưa nộp báo cáo công việc ngày hôm qua (Thứ Hai, 21/09/2026).',
    false,
    now() - interval '1 hour'
),
(
    'notif-1',
    NULL,
    'create',
    'Nộp báo cáo mới',
    'TS. Nguyễn Văn An vừa nộp báo cáo công việc Tuần 38 (21/09/2026 - 27/09/2026).',
    false,
    now()
),
(
    'notif-2',
    NULL,
    'update',
    'Cập nhật báo cáo',
    'KTS. Lê Hoàng Nam đã chỉnh sửa nội dung báo cáo ngày Thứ Ba.',
    false,
    now() - interval '15 minutes'
),
(
    'notif-3',
    NULL,
    'delete',
    'Xóa báo cáo',
    'Một báo cáo công việc nháp đã được xóa khỏi hệ thống.',
    true,
    now() - interval '1 hour'
);
