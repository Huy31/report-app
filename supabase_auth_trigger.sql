-- ========================================================
-- FILE: supabase_auth_trigger.sql
-- HỆ THỐNG BÁO CÁO CÔNG VIỆC TRƯỜNG ĐH CÔNG NGHỆ GTVT (UTT)
-- Trigger tự động đồng bộ auth.users -> public.users khi đăng ký
-- ========================================================

-- 1. Bỏ ràng buộc NOT NULL cho cột password trong bảng public.users
-- (Mật khẩu thật được Supabase Auth mã hóa bảo mật chuẩn Bcrypt tại schema auth.users)
ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;

-- 2. Đảm bảo ràng buộc UNIQUE cho email trong public.users để không bị trùng lặp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- 3. Cập nhật các khóa ngoại để hỗ trợ ON UPDATE CASCADE
ALTER TABLE public.work_reports DROP CONSTRAINT IF EXISTS work_reports_author_id_fkey;
ALTER TABLE public.work_reports 
  ADD CONSTRAINT work_reports_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.users(id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.report_comments DROP CONSTRAINT IF EXISTS report_comments_author_id_fkey;
ALTER TABLE public.report_comments 
  ADD CONSTRAINT report_comments_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.users(id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications 
  ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Tạo hàm xử lý tự động khi có User mới đăng ký trong Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Thêm mới bản ghi vào public.users với id tương ứng từ auth.users
  INSERT INTO public.users (
    id,
    email,
    username,
    full_name,
    phone,
    department,
    role,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    new.id::text,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'username', 
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'fullName', 
      split_part(new.email, '@', 1)
    ),
    COALESCE(new.raw_user_meta_data->>'phone', NULL),
    COALESCE(new.raw_user_meta_data->>'department', 'Trường ĐH Công nghệ GTVT'),
    COALESCE(new.raw_user_meta_data->>'role', 'staff'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    department = EXCLUDED.department,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Gắn Trigger vào bảng auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
