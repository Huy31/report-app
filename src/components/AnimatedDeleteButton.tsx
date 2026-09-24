'use client';

import React, { useState } from 'react';
import styles from './AnimatedDeleteButton.module.css';

interface AnimatedDeleteButtonProps {
  onDelete: () => void;
  label?: string;
  itemName?: string;
  size?: 'sm' | 'md';
}

export default function AnimatedDeleteButton({
  onDelete,
  label = 'Delete',
  itemName,
  size = 'md',
}: AnimatedDeleteButtonProps) {
  // Current animation frame: 1 through 8
  const [frame, setFrame] = useState<number>(1);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    setIsDeleting(true);

    // Frame 1 -> 2: Squish horizontally (T = 0ms)
    setFrame(2);

    // Frame 2 -> 3: Rebound back to normal (T = 160ms)
    setTimeout(() => {
      setFrame(3);
    }, 160);

    // Frame 3 -> 4: Lid opens, text slides diagonally into trash can (T = 320ms)
    setTimeout(() => {
      setFrame(4);
    }, 320);

    // Frame 4 -> 5: Lid slams shut, text is gone, trash can centered (T = 680ms)
    setTimeout(() => {
      setFrame(5);
    }, 680);

    // Frame 5 -> 6: Trash can wobbles/tilts left (T = 880ms)
    setTimeout(() => {
      setFrame(6);
    }, 880);

    // Frame 6 -> 7: Trash can wobbles/tilts right (T = 1060ms)
    setTimeout(() => {
      setFrame(7);
    }, 1060);

    // Frame 7 -> 8: Trash can settles upright in center (T = 1240ms)
    setTimeout(() => {
      setFrame(8);
    }, 1240);

    // Finish: invoke onDelete callback (T = 1460ms)
    setTimeout(() => {
      onDelete();
      // Reset state if component remains mounted
      setTimeout(() => {
        setIsDeleting(false);
        setFrame(1);
      }, 350);
    }, 1460);
  };

  // Determine classes based on current frame
  const getButtonClass = () => {
    const classes = [styles.deleteBtn];
    if (frame === 2) classes.push(styles.frameSquish);
    if (frame === 3) classes.push(styles.frameRebound);
    if (frame >= 5) classes.push(styles.deleteBtnCentered);
    return classes.join(' ');
  };

  const getSvgClass = () => {
    const classes = [styles.trashSvg];
    if (frame === 6) classes.push(styles.trashTiltLeft);
    if (frame === 7) classes.push(styles.trashTiltRight);
    if (frame === 8) classes.push(styles.trashSettled);
    return classes.join(' ');
  };

  const getLidClass = () => {
    const classes = [styles.lidGroup];
    if (frame === 4) classes.push(styles.lidOpen);
    if (frame >= 5) classes.push(styles.lidClosed);
    return classes.join(' ');
  };

  const getTextClass = () => {
    if (frame === 4) return `${styles.deleteText} ${styles.textSucking}`;
    if (frame >= 5) return styles.textHidden;
    return styles.deleteText;
  };

  return (
    <button
      type="button"
      className={getButtonClass()}
      onClick={handleClick}
      disabled={isDeleting}
      title={itemName ? `Xóa ${itemName}` : 'Xóa'}
      aria-label="Xóa"
      style={size === 'sm' ? { height: '28px', minWidth: frame >= 5 ? '64px' : '82px', fontSize: '12px' } : undefined}
    >
      {/* SVG Trash Can matching the 8-frame storyboard */}
      <svg
        className={getSvgClass()}
        width="18"
        height="18"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lid Group (Handle + Horizontal Bar), pivots from top-left */}
        <g className={getLidClass()}>
          {/* Top handle */}
          <rect x="8.5" y="1.5" width="5" height="2" rx="1" fill="#ffffff" />
          {/* Main lid bar */}
          <rect x="3" y="4" width="16" height="2.5" rx="1.25" fill="#ffffff" />
        </g>

        {/* Bucket Body */}
        <path
          d="M4.6 7.5 H17.4 L16.2 19.2 C16.1 19.8 15.6 20.3 15 20.3 H7 C6.4 20.3 5.9 19.8 5.8 19.2 Z"
          fill="#ffffff"
        />

        {/* 3 Vertical Slits on the Bucket (colored #0000cc) */}
        <line x1="8.2" y1="10.5" x2="8.2" y2="17" stroke="#0000cc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="11" y1="10.5" x2="11" y2="17" stroke="#0000cc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13.8" y1="10.5" x2="13.8" y2="17" stroke="#0000cc" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* "Delete" Text */}
      <span className={getTextClass()}>{label}</span>
    </button>
  );
}
