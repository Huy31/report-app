'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, User as UserIcon } from 'lucide-react';
import { useAppStore } from '@/data/store';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { currentUser, updateProfile } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [alias, setAlias] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('Nam');
  const [workPhone, setWorkPhone] = useState('');
  const [homePhone, setHomePhone] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [email, setEmail] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [fileName, setFileName] = useState<string>('No file chosen');

  // Sync state when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser) {
      let initialLastName = currentUser.lastName || '';
      let initialFirstName = currentUser.firstName || '';
      if (!initialLastName && !initialFirstName && currentUser.fullName) {
        const parts = currentUser.fullName.trim().split(' ');
        if (parts.length > 1) {
          initialFirstName = parts.pop() || '';
          initialLastName = parts.join(' ');
        } else {
          initialFirstName = currentUser.fullName;
        }
      }

      setLastName(initialLastName);
      setFirstName(initialFirstName);
      setAlias(currentUser.alias || '');
      setBirthDate(currentUser.birthDate || '');
      setGender(currentUser.gender || 'Nam');
      setWorkPhone(currentUser.workPhone || '');
      setHomePhone(currentUser.homePhone || '');
      setMobilePhone(currentUser.mobilePhone || currentUser.phone || '');
      setEmail(currentUser.email || '');
      setHomeAddress(currentUser.homeAddress || '');
      setAvatarPreview(currentUser.avatarUrl || '');
      setFileName(currentUser.avatarUrl ? 'avatar_uploaded.jpg' : 'No file chosen');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedFullName = `${lastName} ${firstName}`.trim();
    updateProfile({
      lastName,
      firstName,
      fullName: combinedFullName || currentUser.fullName,
      alias,
      birthDate,
      gender,
      workPhone,
      homePhone,
      mobilePhone,
      phone: mobilePhone || currentUser.phone,
      email,
      homeAddress,
      avatarUrl: avatarPreview,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '95%',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header: Cyan banner exactly matching image 1 */}
        <div
          style={{
            backgroundColor: '#5bc0de',
            color: '#ffffff',
            padding: '12px 20px',
            fontSize: '17px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <span>Thông tin cá nhân</span>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '20px 24px',
            maxHeight: 'calc(90vh - 60px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Avatar Section */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#262626',
                marginBottom: '8px',
              }}
            >
              Ảnh đại diện
            </label>

            {/* Avatar Circle Frame */}
            <div
              style={{
                width: '105px',
                height: '105px',
                borderRadius: '50%',
                border: '1px solid #d5d9de',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Ảnh đại diện"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <UserIcon size={46} color="#cbd5e1" strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* File Input Selector styled to match screenshot */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div
              onClick={handleChooseFileClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                height: '36px',
                width: '100%',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = '#9ca3af')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
            >
              <button
                type="button"
                tabIndex={-1}
                style={{
                  height: '100%',
                  padding: '0 14px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRight: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                Choose File
              </button>
              <span
                style={{
                  padding: '0 14px',
                  fontSize: '13px',
                  color: fileName === 'No file chosen' ? '#64748b' : '#0f172a',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fileName}
              </span>
            </div>
          </div>

          {/* Row 1: Họ đệm * & Tên * */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Họ đệm <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ flex: '1 1 320px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Tên <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Row 2: Bí danh (50%) & Ngày sinh (25%) & Giới tính (25%) */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 320px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Bí danh
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ flex: '1 1 150px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Ngày sinh
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ flex: '1 1 150px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          {/* Row 3: Điện thoại cơ quan & Điện thoại nhà riêng & Di động */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Điện thoại cơ quan
              </label>
              <input
                type="tel"
                value={workPhone}
                onChange={(e) => setWorkPhone(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Điện thoại nhà riêng
              </label>
              <input
                type="tel"
                value={homePhone}
                onChange={(e) => setHomePhone(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Di động
              </label>
              <input
                type="tel"
                value={mobilePhone}
                onChange={(e) => setMobilePhone(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Row 4: Thư điện tử & Nhà riêng */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Thư điện tử
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ flex: '1 1 320px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#262626',
                  marginBottom: '6px',
                }}
              >
                Nhà riêng
              </label>
              <input
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Action Buttons: Lưu (Dark maroon) & Đóng (Salmon red) exactly matching image 1 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '16px',
            }}
          >
            <button
              type="submit"
              style={{
                backgroundColor: '#7a0b0e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '7px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#60080b')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#7a0b0e')}
            >
              <Save size={15} color="#ffffff" strokeWidth={2.2} />
              <span>Lưu</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ea5455',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '7px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#d63f40')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ea5455')}
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
