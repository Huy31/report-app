'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, HelpCircle } from 'lucide-react';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là trợ lý ảo hỗ trợ Cổng Báo cáo E-GOV UTT. Bạn có thắc mắc gì về quy định nộp báo cáo tuần không?',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let botReply = 'Cảm ơn câu hỏi của bạn. Hệ thống ghi nhận và bạn có thể nhấn vào "Tạo Báo Cáo Mới" để hoàn thành nhiệm vụ tuần này nhé!';
      const lower = userText.toLowerCase();
      if (lower.includes('thời hạn') || lower.includes('hạn nộp') || lower.includes('khi nào')) {
        botReply = 'Quy định: Nhân viên hoàn thành nộp báo cáo trước 17h00 ngày Thứ Sáu hàng tuần.';
      } else if (lower.includes('chuông') || lower.includes('thông báo')) {
        botReply = 'Khi bạn Tạo, Sửa hoặc Xóa báo cáo, chuông thông báo trên thanh tiêu đề sẽ lắc rung và phát xung sóng để cập nhật cho mọi người!';
      } else if (lower.includes('xóa') || lower.includes('thùng rác')) {
        botReply = 'Nút xóa báo cáo có hiệu ứng hoạt họa 8 khung hình đặc biệt: mở nắp, hút chữ vào trong và rung lắc tiêu hủy an toàn.';
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#ea580c',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 850,
          border: '2px solid #ffffff',
          transition: 'all 0.2s',
        }}
        title="Trợ lý hỗ trợ trực tuyến"
        aria-label="Mở Trợ lý Hỗ trợ"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            left: '24px',
            width: '320px',
            maxHeight: '420px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e2e8f0',
            zIndex: 860,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} />
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Hỗ Trợ Trực Tuyến UTT</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ color: '#ffffff', opacity: 0.8 }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: '280px',
              backgroundColor: '#f8fafc',
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: m.sender === 'user' ? '#a11f24' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  lineHeight: '1.4',
                  maxWidth: '85%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            style={{
              display: 'flex',
              borderTop: '1px solid #e2e8f0',
              padding: '6px',
              backgroundColor: '#ffffff',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              style={{
                flex: 1,
                padding: '8px 10px',
                border: 'none',
                outline: 'none',
                fontSize: '12.5px',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
