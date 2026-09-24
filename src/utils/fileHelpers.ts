import { ReportAttachment, WorkReport } from '@/data/initialData';

/**
 * Định dạng kích thước file từ byte sang KB, MB, GB dễ nhìn
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) {
    return '0 KB';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));

  return `${val} ${sizes[i] || 'KB'}`;
}

/**
 * Trích xuất phần mở rộng của file
 */
export function getFileExtension(filename?: string): string {
  if (!filename) return '';
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()?.toUpperCase() || '';
}

export type FileCategory = 'pdf' | 'word' | 'excel' | 'image' | 'archive' | 'code' | 'text' | 'other';

export interface FileMetadataDisplay {
  category: FileCategory;
  label: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  iconColor: string;
  isImage: boolean;
  isPdf: boolean;
  isText: boolean;
}

/**
 * Phân tích metadata, màu sắc và thông điệp hiển thị cho file
 */
export function getFileMetaDisplay(filename?: string, mimeType?: string): FileMetadataDisplay {
  const ext = getFileExtension(filename).toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  // 1. PDF
  if (ext === 'pdf' || mime.includes('pdf')) {
    return {
      category: 'pdf',
      label: 'Tài liệu PDF',
      badgeBg: '#fef2f2',
      badgeColor: '#dc2626',
      badgeBorder: '#fecaca',
      iconColor: '#ef4444',
      isImage: false,
      isPdf: true,
      isText: false,
    };
  }

  // 2. Word (.doc, .docx)
  if (['doc', 'docx'].includes(ext) || mime.includes('word') || mime.includes('officedocument.wordprocessingml')) {
    return {
      category: 'word',
      label: 'Văn bản Word (.docx)',
      badgeBg: '#eff6ff',
      badgeColor: '#2563eb',
      badgeBorder: '#bfdbfe',
      iconColor: '#3b82f6',
      isImage: false,
      isPdf: false,
      isText: false,
    };
  }

  // 3. Excel (.xls, .xlsx, .csv)
  if (['xls', 'xlsx', 'csv'].includes(ext) || mime.includes('excel') || mime.includes('spreadsheet')) {
    return {
      category: 'excel',
      label: 'Bảng tính Excel (.xlsx)',
      badgeBg: '#f0fdf4',
      badgeColor: '#16a34a',
      badgeBorder: '#bbf7d0',
      iconColor: '#22c55e',
      isImage: false,
      isPdf: false,
      isText: false,
    };
  }

  // 4. Image
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext) || mime.startsWith('image/')) {
    return {
      category: 'image',
      label: `Hình ảnh (${ext.toUpperCase() || 'IMG'})`,
      badgeBg: '#faf5ff',
      badgeColor: '#9333ea',
      badgeBorder: '#e9d5ff',
      iconColor: '#a855f7',
      isImage: true,
      isPdf: false,
      isText: false,
    };
  }

  // 5. Archive (zip, rar, 7z, tar, gz)
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
    return {
      category: 'archive',
      label: `Tệp nén (${ext.toUpperCase()})`,
      badgeBg: '#fffbeb',
      badgeColor: '#d97706',
      badgeBorder: '#fde68a',
      iconColor: '#f59e0b',
      isImage: false,
      isPdf: false,
      isText: false,
    };
  }

  // 6. Code & Text
  if (['txt', 'md', 'json', 'js', 'ts', 'tsx', 'html', 'css', 'sql'].includes(ext) || mime.startsWith('text/')) {
    return {
      category: 'text',
      label: `Tài liệu văn bản / Mã nguồn (.${ext})`,
      badgeBg: '#f8fafc',
      badgeColor: '#475569',
      badgeBorder: '#cbd5e1',
      iconColor: '#64748b',
      isImage: false,
      isPdf: false,
      isText: true,
    };
  }

  // Default / Other
  return {
    category: 'other',
    label: ext ? `Tập tin .${ext.toUpperCase()}` : 'Tập tin đính kèm',
    badgeBg: '#f1f5f9',
    badgeColor: '#0369a1',
    badgeBorder: '#bae6fd',
    iconColor: '#0284c7',
    isImage: false,
    isPdf: false,
    isText: false,
  };
}

/**
 * Tương thích ngược: Lấy thông tin đính kèm từ WorkReport.
 * Nếu đã có `report.attachment`, trả về nguyên vẹn.
 * Nếu chỉ có chuỗi `report.attachedFile`, tự tạo metadata hợp lý.
 */
export function resolveReportAttachment(report: WorkReport): ReportAttachment | null {
  if (report.attachment && report.attachment.name) {
    return report.attachment;
  }

  if (report.attachedFile && report.attachedFile.trim() !== '') {
    const ext = getFileExtension(report.attachedFile).toLowerCase();
    let guessedMime = 'application/octet-stream';
    let guessedSize = 345 * 1024; // Mặc định 345 KB cho báo cáo mẫu

    if (ext === 'pdf') {
      guessedMime = 'application/pdf';
      guessedSize = 496844;
    } else if (['doc', 'docx'].includes(ext)) {
      guessedMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      guessedSize = 256000;
    } else if (['xls', 'xlsx'].includes(ext)) {
      guessedMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      guessedSize = 185000;
    } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
      guessedMime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      guessedSize = 650000;
    }

    return {
      name: report.attachedFile,
      size: guessedSize,
      type: guessedMime,
      uploadedAt: report.createdAt,
    };
  }

  return null;
}

/**
 * Tải xuống file đính kèm:
 * - Nếu có URL thực (Data URL base64 hoặc URL file), kích hoạt thẻ a download.
 * - Nếu không có URL (file mẫu khởi tạo), tự sinh mock Blob có nội dung phù hợp để tải về ngay.
 */
export function downloadAttachment(attachment: ReportAttachment, authorName?: string): void {
  const fileName = attachment.name || 'tap_tin_dinh_kem';

  if (attachment.url) {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Tạo mock Blob nếu không có URL lưu sẵn
  const meta = getFileMetaDisplay(fileName, attachment.type);
  let blob: Blob;

  if (meta.isImage) {
    // Tạo SVG canvas dạng ảnh placeholder
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#0284c7"/>
      <circle cx="400" cy="300" r="120" fill="#38bdf8" opacity="0.5"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#ffffff" font-weight="bold">
        ${fileName}
      </text>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#e0f2fe">
        Người tải: ${authorName || 'Hệ thống'} | Báo cáo UTT
      </text>
    </svg>`;
    blob = new Blob([svg], { type: 'image/svg+xml' });
  } else {
    // Tạo file text mô tả thông tin đính kèm
    const textContent = `==========================================================
TRƯỜNG ĐẠI HỌC CÔNG NGHỆ GIAO THÔNG VẬN TẢI (UTT)
HỆ THỐNG BÁO CÁO CÔNG VIỆC HẰNG NGÀY
==========================================================

TÊN TẬP TIN: ${attachment.name}
LOẠI TẬP TIN: ${attachment.type}
DUNG LƯỢNG: ${formatFileSize(attachment.size)} (${attachment.size} bytes)
NGÀY TẢI LÊN: ${attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleString('vi-VN') : 'N/A'}
NGƯỜI BÁO CÁO: ${authorName || 'Nhân viên UTT'}

----------------------------------------------------------
Ghi chú: Đây là tệp tin đính kèm được xuất từ hệ thống báo cáo công việc.
==========================================================`;
    blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  }

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
