import { createClient } from '@/utils/supabase/client';
import { User, WorkReport, AppNotification, ReportComment } from './initialData';

const supabase = createClient();

/* ─── USERS ─────────────────────────────────────────────── */
export async function fetchUsersFromSupabase(): Promise<User[] | null> {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
    if (error || !data) return null;

    return data.map((u: any) => ({
      id: u.id,
      username: u.username,
      password: u.password,
      fullName: u.full_name,
      lastName: u.last_name || undefined,
      firstName: u.first_name || undefined,
      alias: u.alias || undefined,
      birthDate: u.birth_date || undefined,
      gender: u.gender || 'Nam',
      phone: u.phone || '',
      mobilePhone: u.mobile_phone || undefined,
      workPhone: u.work_phone || undefined,
      homePhone: u.home_phone || undefined,
      homeAddress: u.home_address || undefined,
      department: u.department || 'Trường ĐH Công nghệ GTVT',
      role: u.role || 'staff',
      avatarUrl: u.avatar_url || '',
      email: u.email,
    }));
  } catch {
    return null;
  }
}

export async function insertUserToSupabase(user: User): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').insert({
      id: user.id,
      username: user.username,
      password: user.password,
      email: user.email,
      full_name: user.fullName,
      last_name: user.lastName || null,
      first_name: user.firstName || null,
      alias: user.alias || null,
      birth_date: user.birthDate && user.birthDate.trim() ? user.birthDate : null,
      gender: user.gender || 'Nam',
      phone: user.phone || null,
      mobile_phone: user.mobilePhone || null,
      work_phone: user.workPhone || null,
      home_phone: user.homePhone || null,
      home_address: user.homeAddress || null,
      department: user.department || 'Trường ĐH Công nghệ GTVT',
      role: user.role || 'staff',
      avatar_url: user.avatarUrl || null,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function updateUserInSupabase(id: string, user: Partial<User>): Promise<boolean> {
  try {
    const payload: any = {};
    if (user.fullName !== undefined) payload.full_name = user.fullName;
    if (user.lastName !== undefined) payload.last_name = user.lastName;
    if (user.firstName !== undefined) payload.first_name = user.firstName;
    if (user.alias !== undefined) payload.alias = user.alias;
    if (user.birthDate !== undefined) {
      payload.birth_date = user.birthDate && user.birthDate.trim() ? user.birthDate : null;
    }
    if (user.gender !== undefined) payload.gender = user.gender;
    if (user.phone !== undefined) payload.phone = user.phone;
    if (user.mobilePhone !== undefined) payload.mobile_phone = user.mobilePhone;
    if (user.workPhone !== undefined) payload.work_phone = user.workPhone;
    if (user.homePhone !== undefined) payload.home_phone = user.homePhone;
    if (user.homeAddress !== undefined) payload.home_address = user.homeAddress;
    if (user.department !== undefined) payload.department = user.department;
    if (user.avatarUrl !== undefined) payload.avatar_url = user.avatarUrl;
    if (user.password !== undefined) payload.password = user.password;
    if (user.email !== undefined) payload.email = user.email;

    const { error } = await supabase.from('users').update(payload).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/* ─── WORK REPORTS ───────────────────────────────────────── */
export async function fetchReportsFromSupabase(): Promise<WorkReport[] | null> {
  try {
    const { data, error } = await supabase
      .from('work_reports')
      .select('*, report_comments(*), report_attachments(*)')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((r: any) => ({
      id: r.id,
      authorId: r.author_id,
      authorName: r.author_name,
      authorCode: r.author_code,
      department: r.department || undefined,
      dayOfWeek: r.day_of_week,
      date: r.report_date,
      weekNumber: r.week_number,
      year: r.year,
      currentWork: r.current_work,
      nextWork: r.next_work || '',
      proposal: r.proposal || '',
      attachedFile: r.attached_file || '',
      status: r.status || 'completed',
      createdAt: r.created_at,
      updatedAt: r.updated_at || undefined,
      comments: r.report_comments
        ? r.report_comments.map((c: any) => ({
            id: c.id,
            reportId: c.report_id,
            authorId: c.author_id,
            authorName: c.author_name,
            authorAvatar: c.author_avatar || undefined,
            content: c.content,
            createdAt: c.created_at,
          }))
        : [],
      attachment:
        r.report_attachments && r.report_attachments.length > 0
          ? {
              name: r.report_attachments[0].file_name,
              size: Number(r.report_attachments[0].file_size),
              type: r.report_attachments[0].file_type,
              url: r.report_attachments[0].file_url,
              uploadedAt: r.report_attachments[0].uploaded_at,
            }
          : undefined,
    }));
  } catch {
    return null;
  }
}

export async function insertReportToSupabase(report: WorkReport): Promise<boolean> {
  try {
    const { error } = await supabase.from('work_reports').insert({
      id: report.id,
      author_id: report.authorId,
      author_name: report.authorName,
      author_code: report.authorCode,
      department: report.department || null,
      day_of_week: report.dayOfWeek,
      report_date: report.date,
      week_number: report.weekNumber,
      year: report.year,
      current_work: report.currentWork,
      next_work: report.nextWork || null,
      proposal: report.proposal || null,
      attached_file: report.attachedFile || null,
      status: report.status || 'completed',
      created_at: report.createdAt || new Date().toISOString(),
    });

    if (!error && report.attachment) {
      await supabase.from('report_attachments').insert({
        report_id: report.id,
        file_name: report.attachment.name,
        file_size: report.attachment.size,
        file_type: report.attachment.type,
        file_url: report.attachment.url || '',
        uploaded_at: report.attachment.uploadedAt || new Date().toISOString(),
      });
    }

    return !error;
  } catch {
    return false;
  }
}

export async function updateReportInSupabase(id: string, report: Partial<WorkReport>): Promise<boolean> {
  try {
    const payload: any = {};
    if (report.currentWork !== undefined) payload.current_work = report.currentWork;
    if (report.nextWork !== undefined) payload.next_work = report.nextWork;
    if (report.proposal !== undefined) payload.proposal = report.proposal;
    if (report.attachedFile !== undefined) payload.attached_file = report.attachedFile;
    if (report.status !== undefined) payload.status = report.status;
    if (report.dayOfWeek !== undefined) payload.day_of_week = report.dayOfWeek;
    if (report.date !== undefined) payload.report_date = report.date;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('work_reports').update(payload).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteReportFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('work_reports').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/* ─── COMMENTS ───────────────────────────────────────────── */
export async function insertCommentToSupabase(comment: ReportComment): Promise<boolean> {
  try {
    const { error } = await supabase.from('report_comments').insert({
      id: comment.id,
      report_id: comment.reportId,
      author_id: comment.authorId,
      author_name: comment.authorName,
      author_avatar: comment.avatarUrl || null,
      content: comment.content,
      created_at: comment.createdAt || new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/* ─── NOTIFICATIONS ──────────────────────────────────────── */
export async function fetchNotificationsFromSupabase(): Promise<AppNotification[] | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      content: n.content,
      timeAgo: 'Vừa xong',
      createdAt: n.created_at,
      read: Boolean(n.is_read),
    }));
  } catch {
    return null;
  }
}

export async function insertNotificationToSupabase(notif: AppNotification): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').insert({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      content: notif.content,
      is_read: notif.read,
      created_at: notif.createdAt || new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function markAllNotificationsReadInSupabase(): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    return !error;
  } catch {
    return false;
  }
}

export async function clearNotificationsInSupabase(): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').delete().neq('id', '___');
    return !error;
  } catch {
    return false;
  }
}
