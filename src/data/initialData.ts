export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role: 'admin' | 'staff' | 'lecturer';
  avatarUrl?: string;
  lastName?: string;       // Họ đệm
  firstName?: string;      // Tên
  alias?: string;          // Bí danh
  birthDate?: string;      // Ngày sinh (YYYY-MM-DD)
  gender?: string;         // Giới tính
  workPhone?: string;      // Điện thoại cơ quan
  homePhone?: string;      // Điện thoại nhà riêng
  mobilePhone?: string;    // Di động
  homeAddress?: string;    // Nhà riêng
}

export interface ReportComment {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface ReportAttachment {
  name: string;
  size: number;          // Dung lượng tính theo bytes
  type: string;          // MIME type (ví dụ: application/pdf, image/png, etc.)
  url?: string;          // Data URL hoặc đường dẫn file để tải/xem trước
  uploadedAt: string;    // Thời gian đính kèm (ISO)
  lastModified?: number; // Timestamp chỉnh sửa gần nhất của file
}

export interface WorkReport {
  id: string;
  authorId: string;
  authorName: string;
  authorCode: string;
  department?: string;
  dayOfWeek: string; // "Thứ Hai", "Thứ Ba", ...
  date: string;      // YYYY-MM-DD
  weekNumber: number;
  year: number;
  currentWork: string; // HTML/Markdown formatted or rich text
  nextWork: string;
  proposal?: string;   // Đề xuất
  attachedFile?: string; // File đính kèm (tên file)
  attachment?: ReportAttachment; // Thông tin chi tiết của file đính kèm
  status: 'completed' | 'in_progress' | 'pending';
  createdAt: string;
  updatedAt?: string;
  comments?: ReportComment[];
}

export interface AppNotification {
  id: string;
  type: 'create' | 'update' | 'delete' | 'warning' | 'info';
  title: string;
  content: string;
  timeAgo: string;
  createdAt: string;
  read: boolean;
}

export const MOCK_STAFF_USER: User = {
  id: 'user-mock-staff',
  username: 'NV001',
  password: 'password123',
  fullName: 'Nguyễn Cảnh Hoàn',
  email: 'hoannc@gmail.com',
  phone: '0987654321',
  department: 'Khoa Công nghệ Thông tin',
  role: 'staff',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  lastName: 'Nguyễn Cảnh',
  firstName: 'Hoàn',
  birthDate: '1995-05-15',
  gender: 'Nam',
  workPhone: '024.38544264',
  mobilePhone: '0987654321',
  homeAddress: '54 Triều Khúc, Thanh Xuân, Hà Nội',
};

export const INITIAL_USERS: User[] = [MOCK_STAFF_USER];

export const INITIAL_REPORTS: WorkReport[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

