'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, PlusCircle, RefreshCw, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAppStore } from '@/data/store';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    bellTriggerKey,
    markAllNotificationsRead,
    clearNotificationHistory,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Trigger bell swing and ripple animation whenever bellTriggerKey increments
  useEffect(() => {
    if (bellTriggerKey > 0) {
      setIsRinging(true);
      const timer = setTimeout(() => {
        setIsRinging(false);
      }, 950);
      return () => clearTimeout(timer);
    }
  }, [bellTriggerKey]);

  // Click & Touch outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'create':
        return (
          <div className={`${styles.notifIconWrap} ${styles.iconCreate}`}>
            <PlusCircle size={16} />
          </div>
        );
      case 'update':
        return (
          <div className={`${styles.notifIconWrap} ${styles.iconUpdate}`}>
            <RefreshCw size={16} />
          </div>
        );
      case 'delete':
        return (
          <div className={`${styles.notifIconWrap} ${styles.iconDelete}`}>
            <XCircle size={16} />
          </div>
        );
      case 'warning':
        return (
          <div className={`${styles.notifIconWrap} ${styles.iconWarning}`}>
            <AlertTriangle size={16} />
          </div>
        );
      default:
        return (
          <div className={`${styles.notifIconWrap} ${styles.iconCreate}`}>
            <Info size={16} />
          </div>
        );
    }
  };

  return (
    <div className={styles.bellWrapper} ref={popoverRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo hệ thống"
        aria-label="Thông báo"
      >
        <div className={isRinging ? styles.bellIconRing : ''}>
          <Bell size={20} color={isRinging ? '#ea580c' : '#334155'} />
        </div>

        {unreadCount > 0 && (
          <div className={styles.badgeContainer}>
            <div className={`${styles.ripple} ${isRinging ? styles.rippleActive : ''}`} />
            <div className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</div>
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.popover}>
            <div className={styles.popoverHeader}>
              <div className={styles.popoverTitle}>
                <Bell size={16} color="#a11f24" />
                <span>Thông báo ({notifications.length})</span>
              </div>
              <div className={styles.popoverActions}>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className={styles.actionLink}
                    onClick={markAllNotificationsRead}
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <CheckCheck size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Đã đọc
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className={`${styles.actionLink} ${styles.actionLinkDanger}`}
                    onClick={clearNotificationHistory}
                    title="Xóa toàn bộ thông báo"
                  >
                    <Trash2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Xóa
                  </button>
                )}
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setIsOpen(false)}
                  title="Đóng thông báo"
                  aria-label="Đóng"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

          <ul className={styles.notifList}>
            {notifications.length === 0 ? (
              <li className={styles.emptyState}>Không có thông báo nào</li>
            ) : (
              notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`${styles.notifItem} ${!notif.read ? styles.notifItemUnread : ''}`}
                >
                  {getIcon(notif.type)}
                  <div className={styles.notifContent}>
                    <div className={styles.notifItemTitle}>{notif.title}</div>
                    <div className={styles.notifItemBody}>{notif.content}</div>
                    <span className={styles.notifTime}>{notif.timeAgo}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        </>
      )}
    </div>
  );
}
