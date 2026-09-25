'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  WorkReport,
  ReportComment,
  AppNotification,
  INITIAL_USERS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
} from './initialData';
import {
  fetchUsersFromSupabase,
  fetchReportsFromSupabase,
  fetchNotificationsFromSupabase,
  insertUserToSupabase,
  updateUserInSupabase,
  insertReportToSupabase,
  updateReportInSupabase,
  deleteReportFromSupabase,
  insertCommentToSupabase,
  insertNotificationToSupabase,
  markAllNotificationsReadInSupabase,
  clearNotificationsInSupabase,
} from './supabaseService';
import { createClient } from '@/utils/supabase/client';
import { getDayOfWeekOrder, getCurrentRealtimeWeek } from '@/utils/dateUtils';

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  icon?: string;
}

/**
 * Sorts an array of reports by:
 * 1. year ascending
 * 2. weekNumber ascending
 * 3. dayOfWeek order: Thứ Hai (1) -> Thứ Ba (2) -> Thứ Tư (3) -> Thứ Năm (4) -> Thứ Sáu (5) -> Thứ Bảy (6) -> Chủ Nhật (7)
 * 4. createdAt/date ascending
 * 5. id fallback
 */
export const sortReportsByDay = (reps: WorkReport[]): WorkReport[] => {
  return [...reps].sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    if (a.weekNumber !== b.weekNumber) {
      return a.weekNumber - b.weekNumber;
    }
    const orderA = getDayOfWeekOrder(a.dayOfWeek, a.date);
    const orderB = getDayOfWeekOrder(b.dayOfWeek, b.date);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    const timeA = new Date(a.createdAt || a.date || 0).getTime();
    const timeB = new Date(b.createdAt || b.date || 0).getTime();
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return (a.id || '').localeCompare(b.id || '');
  });
};

interface AppStoreContextType {
  // Auth
  currentUser: User | null;
  isInitialized: boolean;
  users: User[];
  login: (emailInput: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: Omit<User, 'id'>) => Promise<{ success: boolean; message: string; needConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;

  // Reports
  reports: WorkReport[];
  addReport: (report: Omit<WorkReport, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'authorCode' | 'department'>) => void;
  updateReport: (id: string, updatedData: Partial<WorkReport>) => void;
  deleteReport: (id: string) => void;
  addComment: (reportId: string, content: string) => void;

  // Filter State
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;

  // Notifications & Animations
  notifications: AppNotification[];
  unreadCount: number;
  bellTriggerKey: number; // Tăng lên mỗi khi cần lắc chuông & ping ripple
  markAllNotificationsRead: () => void;
  clearNotificationHistory: () => void;
  notifyUnreportedStaff: (targetDate?: string) => void;

  // Toast
  toast: ToastData | null;
  closeToast: () => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'danger' | 'info', icon?: string) => void;

  // Reset
  resetToDefault: () => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'egov_utt_users_v3',
  CURRENT_USER: 'egov_utt_current_user_v3',
  REPORTS: 'egov_utt_reports_v3',
  NOTIFICATIONS: 'egov_utt_notifications_v3',
};

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  const supabase = useMemo(() => createClient(), []);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [reports, setReports] = useState<WorkReport[]>(() => sortReportsByDay(INITIAL_REPORTS));
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Khởi tạo tuần và năm theo thời gian thực (real-time)
  const initialRealtime = getCurrentRealtimeWeek();
  const [selectedWeek, setSelectedWeek] = useState<number>(initialRealtime.weekNumber);
  const [selectedYear, setSelectedYear] = useState<number>(initialRealtime.year);
  const [selectedDay, setSelectedDay] = useState<string>('Tất cả');

  const [bellTriggerKey, setBellTriggerKey] = useState<number>(0);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Load from storage on client mount
  useEffect(() => {
    try {
      // Tự động nhảy sang tuần và năm theo thời gian thực mỗi khi reload / mở trang
      const realtimeNow = getCurrentRealtimeWeek();
      setSelectedWeek(realtimeNow.weekNumber);
      setSelectedYear(realtimeNow.year);

      // Clear legacy localStorage auto-login key if exists
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

      // Xóa các key giao diện sáng tối và gỡ data-theme
      localStorage.removeItem('egov_utt_app_theme_v1');
      localStorage.removeItem('egov_utt_sidebar_theme_v1');
      if (typeof document !== 'undefined') {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.style.colorScheme = 'light';
      }

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) {
        try {
          const parsed: User[] = JSON.parse(savedUsers);
          const legacyMockUserIds = ['user-admin', 'user-1', 'user-2', 'user-3', 'user-4'];
          const cleanedUsers = parsed.filter((u) => !legacyMockUserIds.includes(u.id));
          setUsers(cleanedUsers);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleanedUsers));
        } catch {
          setUsers([]);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
        }
      } else {
        setUsers([]);
      }

      const sessionUser = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (sessionUser) {
        try {
          const u = JSON.parse(sessionUser);
          if (u.email && u.email.endsWith('@utt.edu.vn')) {
            u.email = u.email.replace(/@utt\.edu\.vn$/i, '@gmail.com');
            sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(u));
          }
          setCurrentUser(u);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }

      const savedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (savedReports) {
        try {
          const parsed: WorkReport[] = JSON.parse(savedReports);
          const legacyMockReportIds = ['rep-1', 'rep-2', 'rep-3'];
          const cleanedReports = parsed.filter((r) => !legacyMockReportIds.includes(r.id));
          setReports(sortReportsByDay(cleanedReports));
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(cleanedReports));
        } catch {
          setReports([]);
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
        }
      } else {
        setReports([]);
      }

      const savedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (savedNotifs) {
        try {
          const parsed: AppNotification[] = JSON.parse(savedNotifs);
          const legacyMockNotifIds = ['notif-unreported-hung', 'notif-1', 'notif-2', 'notif-3'];
          const cleanedNotifs = parsed.filter((n) => !legacyMockNotifIds.includes(n.id));
          setNotifications(cleanedNotifs);
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(cleanedNotifs));
        } catch {
          setNotifications([]);
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
        }
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error('Error loading from storage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync state with Supabase database when available
  useEffect(() => {
    let isMounted = true;

    async function syncSupabase() {
      try {
        const [remoteUsers, remoteReports, remoteNotifs] = await Promise.all([
          fetchUsersFromSupabase(),
          fetchReportsFromSupabase(),
          fetchNotificationsFromSupabase(),
        ]);

        if (!isMounted) return;

        if (remoteUsers !== null) {
          setUsers(remoteUsers);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(remoteUsers));
        }

        if (remoteReports !== null) {
          const sorted = sortReportsByDay(remoteReports);
          setReports(sorted);
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(sorted));
        }

        if (remoteNotifs !== null) {
          setNotifications(remoteNotifs);
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(remoteNotifs));
        }
      } catch (err) {
        console.warn('Could not sync with Supabase:', err);
      }
    }

    syncSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper chuyển đổi Supabase Auth User sang App User
  const buildUserFromAuth = (authUser: any, dbUser?: any): User => {
    if (dbUser) {
      return {
        id: String(dbUser.id || authUser.id),
        username: dbUser.username || authUser.user_metadata?.username || ('NV' + String(dbUser.id || '').padStart(3, '0')),
        password: '',
        fullName: dbUser.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Người dùng',
        email: dbUser.email || authUser.email || '',
        phone: dbUser.phone || authUser.user_metadata?.phone || '',
        department: dbUser.department || authUser.user_metadata?.department || 'Trường ĐH Công nghệ GTVT',
        role: dbUser.role || authUser.user_metadata?.role || 'staff',
        avatarUrl: dbUser.avatar_url || authUser.user_metadata?.avatar_url || '',
        lastName: dbUser.last_name || undefined,
        firstName: dbUser.first_name || undefined,
        birthDate: dbUser.birth_date || undefined,
        gender: dbUser.gender || 'Nam',
        homeAddress: dbUser.home_address || undefined,
        mobilePhone: dbUser.mobile_phone || undefined,
        workPhone: dbUser.work_phone || undefined,
        homePhone: dbUser.home_phone || undefined,
      };
    }

    const meta = authUser.user_metadata || {};
    return {
      id: authUser.id,
      username: meta.username || ('NV' + authUser.id.slice(0, 4).toUpperCase()),
      password: '',
      fullName: meta.full_name || meta.fullName || authUser.email?.split('@')[0] || 'Người dùng',
      email: authUser.email || '',
      phone: meta.phone || '',
      department: meta.department || 'Trường ĐH Công nghệ GTVT',
      role: meta.role || 'staff',
      avatarUrl: meta.avatar_url || '',
    };
  };

  // Đồng bộ phiên đăng nhập từ Supabase Auth
  useEffect(() => {
    let isMounted = true;

    async function syncAuthSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          let dbUser: any = null;
          try {
            const { data } = await supabase
              .from('users')
              .select('*')
              .eq('email', session.user.email)
              .maybeSingle();
            dbUser = data;
          } catch {}

          const resolvedUser = buildUserFromAuth(session.user, dbUser);
          setCurrentUser(resolvedUser);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(resolvedUser));
          }
        }
      } catch (err) {
        console.warn('Sync auth session error:', err);
      }
    }

    syncAuthSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        let dbUser: any = null;
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();
          dbUser = data;
        } catch {}

        const resolvedUser = buildUserFromAuth(session.user, dbUser);
        setCurrentUser(resolvedUser);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(resolvedUser));
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Sync to localStorage
  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
  };

  const saveReports = (newReports: WorkReport[]) => {
    const sorted = sortReportsByDay(newReports);
    setReports(sorted);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(sorted));
  };

  const saveNotifications = (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifs));
  };

  const showToast = (message: string, type: 'success' | 'warning' | 'danger' | 'info' = 'success', icon?: string) => {
    setToast({
      id: Date.now(),
      message,
      type,
      icon,
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  const triggerBellAndRipple = () => {
    setBellTriggerKey((prev) => prev + 1);
  };

  // Push new notification
  const addNotification = (type: 'create' | 'update' | 'delete' | 'warning' | 'info', title: string, content: string) => {
    const notifNumbers = notifications
      .map((n) => {
        const match = n.id.match(/^notif-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNotifNum = (notifNumbers.length > 0 ? Math.max(...notifNumbers) : 0) + 1;

    const newNotif: AppNotification = {
      id: `notif-${nextNotifNum}`,
      type,
      title,
      content,
      timeAgo: 'Vừa xong',
      createdAt: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...notifications];
    saveNotifications(updated);
    triggerBellAndRipple();
    insertNotificationToSupabase(newNotif).catch(console.error);
  };

  // Push notifications for unreported staff
  const notifyUnreportedStaff = (targetDate: string = new Date().toISOString().split('T')[0]) => {
    const unreported = users.filter((u) => {
      if (u.role === 'admin') return false;
      const hasCompleted = reports.some(
        (r) => r.authorId === u.id && r.date === targetDate && r.status === 'completed'
      );
      return !hasCompleted;
    });

    if (unreported.length === 0) {
      showToast('Tất cả nhân sự đã nộp báo cáo đầy đủ!', 'success', '🎉');
      return;
    }

    const currentNotifs = [...notifications];
    let addedCount = 0;

    unreported.forEach((u) => {
      const notifId = `notif-unreported-${u.id}-${targetDate}`;
      const existing = currentNotifs.find((n) => n.id === notifId);
      if (!existing) {
        const notifItem: AppNotification = {
          id: notifId,
          type: 'warning',
          title: 'Nhắc nhở chưa nộp báo cáo',
          content: `Nhân viên ${u.fullName} chưa nộp báo cáo công việc ngày ${targetDate}.`,
          timeAgo: 'Vừa xong',
          createdAt: new Date().toISOString(),
          read: false,
        };
        currentNotifs.unshift(notifItem);
        insertNotificationToSupabase(notifItem).catch(console.error);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      saveNotifications(currentNotifs);
      triggerBellAndRipple();
      showToast(`Đã gửi thông báo nhắc nhở đến ${addedCount} nhân sự chưa nộp báo cáo!`, 'warning', '🔔');
    } else {
      showToast('Đã có thông báo nhắc nhở cho các nhân sự trong danh sách.', 'info', 'ℹ️');
    }
  };

  // Auth methods với Supabase Auth
  const login = async (emailInput: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const cleanInput = emailInput.trim().toLowerCase();
    if (!cleanInput) {
      return { success: false, message: 'Vui lòng nhập email đăng nhập!' };
    }
    if (!password) {
      return { success: false, message: 'Vui lòng nhập mật khẩu!' };
    }

    let targetEmail = cleanInput;
    if (!targetEmail.includes('@')) {
      const foundInList = users.find(
        (u) => u.username.toLowerCase() === cleanInput || u.email.toLowerCase().startsWith(cleanInput + '@')
      );
      if (foundInList) {
        targetEmail = foundInList.email;
      } else {
        targetEmail = `${cleanInput}@gmail.com`;
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        const errMsg = error.message.toLowerCase();
        if (error.code === 'email_not_confirmed' || errMsg.includes('email not confirmed')) {
          return {
            success: false,
            message: 'Tài khoản chưa được xác nhận! Vui lòng kiểm tra email của bạn để bấm liên kết kích hoạt, hoặc tắt "Confirm email" trên Supabase Dashboard nếu muốn đăng nhập ngay.',
          };
        }
        if (errMsg.includes('invalid login credentials') || error.code === 'invalid_credentials') {
          return {
            success: false,
            message: 'Email hoặc mật khẩu không chính xác!',
          };
        }
        return {
          success: false,
          message: error.message || 'Đăng nhập không thành công!',
        };
      }

      if (!data.user) {
        return { success: false, message: 'Không thể xác thực thông tin tài khoản!' };
      }

      let dbUser: any = null;
      try {
        const { data: fetchedDbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', data.user.email)
          .maybeSingle();
        dbUser = fetchedDbUser;
      } catch (err) {
        console.warn('Could not query users table:', err);
      }

      const resolvedUser = buildUserFromAuth(data.user, dbUser);
      setCurrentUser(resolvedUser);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(resolvedUser));
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(resolvedUser));
      }

      showToast(`Đăng nhập thành công! Chào mừng ${resolvedUser.fullName}`, 'success', '👋');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Có lỗi xảy ra khi kết nối máy chủ!' };
    }
  };

  const register = async (userData: Omit<User, 'id'>): Promise<{ success: boolean; message: string; needConfirmation?: boolean }> => {
    const cleanEmail = userData.email.trim().toLowerCase();

    // Tự động cấp mã nhân viên tiếp theo nếu chưa có (NV001, NV002 -> NV003...)
    let finalUsername = userData.username ? userData.username.trim().toUpperCase() : '';
    if (!finalUsername) {
      const nvNumbers = users
        .map((u) => {
          const match = u.username.match(/^NV(\d+)$/i);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const nextNum = (nvNumbers.length > 0 ? Math.max(...nvNumbers) : 0) + 1;
      finalUsername = `NV${String(nextNum).padStart(3, '0')}`;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName.trim(),
            username: finalUsername,
            phone: userData.phone?.trim() || '',
            department: userData.department || 'Trường ĐH Công nghệ GTVT',
            role: userData.role || 'staff',
          },
        },
      });

      if (error) {
        const errLower = error.message.toLowerCase();
        if (errLower.includes('already registered') || error.code === 'user_already_exists') {
          return { success: false, message: 'Email này đã được đăng ký tài khoản trong hệ thống!' };
        }
        if (errLower.includes('password should be at least 6 characters')) {
          return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' };
        }
        if (errLower.includes('valid email') || error.code === 'email_address_invalid') {
          return { success: false, message: 'Địa chỉ email không hợp lệ!' };
        }
        if (error.code === 'over_email_send_rate_limit') {
          return { success: false, message: 'Thao tác gửi mail quá nhanh. Vui lòng thử lại sau ít phút!' };
        }
        return { success: false, message: error.message || 'Đăng ký không thành công!' };
      }

      if (!data.user) {
        return { success: false, message: 'Không thể tạo tài khoản người dùng!' };
      }

      if (data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          message: 'Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc dùng email khác.',
        };
      }

      const newUser: User = {
        ...userData,
        id: data.user.id,
        username: finalUsername,
        password: '',
        department: userData.department || 'Trường ĐH Công nghệ GTVT',
        role: userData.role || 'staff',
      };

      const updated = [...users.filter((u) => u.email !== cleanEmail), newUser];
      saveUsers(updated);
      insertUserToSupabase(newUser).catch(console.error);

      if (!data.session) {
        showToast('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt.', 'success', '📧');
        return {
          success: true,
          needConfirmation: true,
          message: 'Đăng ký thành công! Vui lòng kiểm tra hộp thư email (và thư mục Spam) để bấm liên kết xác nhận tài khoản trước khi đăng nhập.',
        };
      }

      showToast(`Đăng ký thành công! Mã nhân viên: ${newUser.username}`, 'success', '🎉');
      return {
        success: true,
        needConfirmation: false,
        message: `Đăng ký thành công! Mã nhân viên của bạn là ${newUser.username}. Bạn có thể đăng nhập ngay.`,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Có lỗi xảy ra khi đăng ký tài khoản!' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    showToast('Đã đăng xuất khỏi hệ thống', 'info', '🔒');
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }

    const newUsers = users.map((u) => (u.email === currentUser.email ? updatedUser : u));
    saveUsers(newUsers);

    supabase.auth.updateUser({
      data: {
        full_name: updatedUser.fullName,
        phone: updatedUser.phone,
        department: updatedUser.department,
        avatar_url: updatedUser.avatarUrl,
      },
    }).catch(console.error);

    updateUserInSupabase(currentUser.email, updatedUser).catch(console.error);
    showToast('Đã cập nhật thông tin cá nhân thành công!', 'success', '👤');
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập!' };

    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      return { success: false, message: error.message || 'Không thể đổi mật khẩu!' };
    }

    updateUserInSupabase(currentUser.email, { password: newPass }).catch(console.error);
    showToast('Đổi mật khẩu thành công!', 'success', '🔑');
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  // Report actions
  const addReport = (reportData: Omit<WorkReport, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'authorCode' | 'department'>) => {
    if (!currentUser) return;

    // Sinh ID báo cáo tuần tự ngắn gọn: rep-1, rep-2, rep-3, rep-4...
    const repNumbers = reports
      .map((r) => {
        const match = r.id.match(/^rep-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextRepNum = (repNumbers.length > 0 ? Math.max(...repNumbers) : 0) + 1;
    const newReportId = `rep-${nextRepNum}`;

    const newReport: WorkReport = {
      ...reportData,
      id: newReportId,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorCode: currentUser.username,
      department: currentUser.department,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReport, ...reports];
    saveReports(updated);
    insertReportToSupabase(newReport).catch(console.error);

    // Kích hoạt Bell Animation, Ripple và Notification, Toast
    addNotification(
      'create',
      'Nộp báo cáo mới thành công',
      `${currentUser.fullName} vừa nộp báo cáo ${newReport.dayOfWeek} (Tuần ${newReport.weekNumber}/${newReport.year}).`
    );
    showToast('🔔 Báo cáo công việc vừa được tạo thành công!', 'success', '✅');
  };

  const updateReport = (id: string, updatedData: Partial<WorkReport>) => {
    const target = reports.find((r) => r.id === id);
    const updated = reports.map((r) =>
      r.id === id
        ? {
            ...r,
            ...updatedData,
            updatedAt: new Date().toISOString(),
          }
        : r
    );
    saveReports(updated);
    updateReportInSupabase(id, updatedData).catch(console.error);

    // Kích hoạt Bell Animation, Ripple và Notification, Toast
    addNotification(
      'update',
      'Cập nhật báo cáo công việc',
      `Báo cáo ${target?.dayOfWeek || ''} của ${target?.authorName || 'nhân viên'} đã được cập nhật nội dung.`
    );
    showToast('📝 Báo cáo công việc đã được cập nhật thành công!', 'warning', '🔄');
  };

  const deleteReport = (id: string) => {
    const target = reports.find((r) => r.id === id);
    const updated = reports.filter((r) => r.id !== id);
    saveReports(updated);
    deleteReportFromSupabase(id).catch(console.error);

    // Kích hoạt Bell Animation, Ripple và Notification, Toast
    addNotification(
      'delete',
      'Xóa báo cáo công việc',
      `Báo cáo ${target?.dayOfWeek || ''} của ${target?.authorName || 'nhân viên'} đã được xóa khỏi hệ thống.`
    );
    showToast('🗑️ Báo cáo công việc đã được xóa khỏi hệ thống!', 'danger', '❌');
  };

  const addComment = (reportId: string, content: string) => {
    if (!content.trim()) return;
    const target = reports.find((r) => r.id === reportId);
    if (!target) return;

    // Sinh ID bình luận tuần tự ngắn gọn: cmt-1, cmt-2, cmt-3...
    const allComments = reports.flatMap((r) => r.comments || []);
    const cmtNumbers = allComments
      .map((c) => {
        const match = c.id.match(/^cmt-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextCmtNum = (cmtNumbers.length > 0 ? Math.max(...cmtNumbers) : 0) + 1;

    const newComment: ReportComment = {
      id: `cmt-${nextCmtNum}`,
      reportId,
      authorId: currentUser?.id || 'user-1',
      authorName: currentUser?.fullName || 'Nguyễn Công Hoan',
      avatarUrl: currentUser?.avatarUrl,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedReports = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          comments: [...(r.comments || []), newComment],
        };
      }
      return r;
    });

    saveReports(updatedReports);
    insertCommentToSupabase(newComment).catch(console.error);

    // Kích hoạt thông báo & toast
    addNotification(
      'update',
      'Bình luận mới về báo cáo',
      `${currentUser?.fullName || 'Một nhân viên'} vừa gửi bình luận về báo cáo của ${target.authorName}.`
    );
    showToast('💬 Đã gửi bình luận thành công!', 'success', '✨');
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    markAllNotificationsReadInSupabase().catch(console.error);
    showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'info', '✔️');
  };

  const clearNotificationHistory = () => {
    saveNotifications([]);
    clearNotificationsInSupabase().catch(console.error);
    showToast('Đã xóa toàn bộ lịch sử thông báo', 'info', '🧹');
  };

  const resetToDefault = () => {
    saveUsers(INITIAL_USERS);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    const realtimeNow = getCurrentRealtimeWeek();
    setSelectedWeek(realtimeNow.weekNumber);
    setSelectedYear(realtimeNow.year);
    setSelectedDay('Tất cả');
    saveReports(INITIAL_REPORTS);
    saveNotifications(INITIAL_NOTIFICATIONS);
    showToast('Đã khôi phục dữ liệu hệ thống mặc định!', 'info', '🔄');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppStoreContext.Provider
      value={{
        currentUser,
        isInitialized,
        users,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        reports,
        addReport,
        updateReport,
        deleteReport,
        addComment,
        selectedWeek,
        setSelectedWeek,
        selectedYear,
        setSelectedYear,
        selectedDay,
        setSelectedDay,
        notifications,
        unreadCount,
        bellTriggerKey,
        markAllNotificationsRead,
        clearNotificationHistory,
        notifyUnreportedStaff,
        toast,
        closeToast,
        showToast,
        resetToDefault,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
};
