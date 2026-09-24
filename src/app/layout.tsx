import type { Metadata } from 'next';
import './globals.css';
import { AppStoreProvider } from '@/data/store';

export const metadata: Metadata = {
  title: 'Cổng Báo Cáo Công Việc E-GOV • Trường ĐH Công Nghệ GTVT (UTT)',
  description: 'Hệ thống báo cáo công việc hàng tuần trực tuyến của Trường Đại học Công nghệ Giao thông Vận tải (UTT)',
  icons: {
    icon: '/utt-logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/utt-logo.png" />
      </head>
      <body>
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
