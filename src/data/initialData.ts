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

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'password123',
    fullName: 'Quản trị viên Hệ thống',
    lastName: 'Quản trị viên',
    firstName: 'Hệ thống',
    alias: 'Admin',
    birthDate: '1980-01-01',
    gender: 'Nam',
    workPhone: '024.38544264',
    homePhone: '024.38544264',
    mobilePhone: '0901234567',
    email: 'admin@gmail.com',
    homeAddress: 'Trường ĐH Công nghệ GTVT, Hà Nội',
    phone: '0901234567',
    department: 'Ban Giám hiệu',
    role: 'admin',
    avatarUrl: '',
  },
  {
    id: 'user-1',
    username: 'NV001',
    password: 'password123',
    fullName: 'Nguyễn Công Hoan',
    lastName: 'Nguyễn Công',
    firstName: 'Hoan',
    alias: 'HoanNC',
    birthDate: '1995-04-12',
    gender: 'Nam',
    workPhone: '024.38544270',
    homePhone: '024.35521489',
    mobilePhone: '0912345678',
    email: 'hoannc@gmail.com',
    homeAddress: 'Hà Nội',
    phone: '0912345678',
    department: 'Khoa Công nghệ Thông tin',
    role: 'staff',
    avatarUrl: '',
  },
  {
    id: 'user-2',
    username: 'NV002',
    password: 'password123',
    fullName: 'Nguyễn Việt Hùng',
    lastName: 'Nguyễn Việt',
    firstName: 'Hùng',
    alias: 'HungNV',
    birthDate: '1996-08-20',
    gender: 'Nam',
    workPhone: '024.38544271',
    homePhone: '024.37762145',
    mobilePhone: '0987654321',
    email: 'hungnv@gmail.com',
    homeAddress: 'Hà Nội',
    phone: '0987654321',
    department: 'Phòng Quản trị Thiết bị',
    role: 'staff',
    avatarUrl: '',
  },
  {
    id: 'user-3',
    username: 'NV003',
    password: 'password123',
    fullName: 'TS. Nguyễn Văn An',
    lastName: 'TS. Nguyễn Văn',
    firstName: 'An',
    alias: 'AnNV',
    birthDate: '1982-05-15',
    gender: 'Nam',
    workPhone: '024.38544270',
    homePhone: '024.35521489',
    mobilePhone: '0912345678',
    email: 'annv@gmail.com',
    homeAddress: 'Số 54 Triều Khúc, Thanh Xuân, Hà Nội',
    phone: '0912345678',
    department: 'Khoa Công nghệ Thông tin',
    role: 'admin',
    avatarUrl: '',
  },
  {
    id: 'user-4',
    username: 'NV004',
    password: 'password123',
    fullName: 'ThS. Trần Thị Bích',
    lastName: 'ThS. Trần Thị',
    firstName: 'Bích',
    alias: 'BichTT',
    birthDate: '1986-11-20',
    gender: 'Nữ',
    workPhone: '024.38544271',
    homePhone: '024.37762145',
    mobilePhone: '0987654321',
    email: 'bichtt@gmail.com',
    homeAddress: 'Tập thể ĐH GTVT, Đống Đa, Hà Nội',
    phone: '0987654321',
    department: 'Khoa Công trình',
    role: 'lecturer',
    avatarUrl: '',
  }
];

export const INITIAL_REPORTS: WorkReport[] = [
  {
    id: 'rep-1',
    authorId: 'user-3',
    authorName: 'TS. Nguyễn Văn An',
    authorCode: 'NV003',
    department: 'Khoa Công nghệ Thông tin',
    dayOfWeek: 'Thứ Hai',
    date: '2026-09-21',
    weekNumber: 38,
    year: 2026,
    currentWork: 'Hoàn thành thẩm định đề cương chi tiết học phần Lập trình Web nâng cao; Họp Hội đồng Khoa học định kỳ tháng 9.',
    nextWork: 'Rà soát bài giảng thực hành Cloud Computing; Tiếp nhận hồ sơ đồ án tốt nghiệp.',
    proposal: 'Đề xuất trang bị thêm bộ lưu điện cho phòng lab',
    attachedFile: 'de_cuong_hoc_phan_v2.pdf',
    attachment: {
      name: 'de_cuong_hoc_phan_v2.pdf',
      size: 496844, // ~485 KB
      type: 'application/pdf',
      uploadedAt: '2026-09-21T08:30:00Z',
    },
    status: 'completed',
    createdAt: '2026-09-21T08:30:00Z',
  },
  {
    id: 'rep-2',
    authorId: 'user-1',
    authorName: 'Nguyễn Công Hoan',
    authorCode: 'NV001',
    department: 'Khoa Công nghệ Thông tin',
    dayOfWeek: 'Thứ Hai',
    date: '2026-09-21',
    weekNumber: 38,
    year: 2026,
    currentWork: `* Chỉnh sửa theo feedback: Thêm Animation mở đầu các screen, tinh chỉnh anim BG
* Communication
* Learning Report
* Portfolio
* Weekly Challenge
* Gallery
* MainMenu
* Attendance
* Dựng Animation phần Book`,
    nextWork: `* Tinh chỉnh UI các phần: Achievement, Portfolio, Attendance`,
    proposal: '',
    attachedFile: '',
    status: 'completed',
    createdAt: '2026-09-21T17:13:00Z',
  },
  {
    id: 'rep-3',
    authorId: 'user-2',
    authorName: 'Nguyễn Việt Hùng',
    authorCode: 'NV002',
    department: 'Phòng Quản trị Thiết bị',
    dayOfWeek: 'Thứ Hai',
    date: '2026-09-21',
    weekNumber: 38,
    year: 2026,
    currentWork: 'Khảo sát hiện trạng thiết bị phòng họp trực tuyến; Bảo trì định kỳ máy in cơ quan.',
    nextWork: 'Phối hợp đơn vị kỹ thuật nâng cấp đường truyền phòng máy.',
    proposal: '',
    attachedFile: '',
    status: 'in_progress',
    createdAt: '2026-09-21T07:45:00Z',
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-unreported-hung',
    type: 'warning',
    title: 'Nhắc nhở chưa nộp báo cáo',
    content: 'Nhân viên Nguyễn Việt Hùng chưa nộp báo cáo công việc ngày hôm qua (Thứ Hai, 21/09/2026).',
    timeAgo: '1 giờ trước',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'notif-1',
    type: 'create',
    title: 'Nộp báo cáo mới',
    content: 'TS. Nguyễn Văn An vừa nộp báo cáo công việc Tuần 38 (21/09/2026 - 27/09/2026).',
    timeAgo: 'Vừa xong',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'update',
    title: 'Cập nhật báo cáo',
    content: 'KTS. Lê Hoàng Nam đã chỉnh sửa nội dung báo cáo ngày Thứ Ba.',
    timeAgo: '15 phút trước',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'delete',
    title: 'Xóa báo cáo',
    content: 'Một báo cáo công việc nháp đã được xóa khỏi hệ thống.',
    timeAgo: '1 giờ trước',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
  }
];
