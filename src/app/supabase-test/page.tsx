import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function SupabaseTestPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: users, error } = await supabase.from('users').select('*').limit(5);

  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1>Supabase Connection Test</h1>
      {error ? (
        <div style={{ color: 'red', marginTop: '16px' }}>
          <strong>Lỗi kết nối hoặc chưa tạo bảng:</strong>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : (
        <div style={{ color: 'green', marginTop: '16px' }}>
          <strong>✅ Kết nối Supabase thành công!</strong>
          <pre>{JSON.stringify(users, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
