'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

const STORAGE_KEYS = {
  CHAT_DATE: 'utt_chat_daily_date_v1',
  CHAT_MSGS: 'utt_chat_daily_msgs_v1',
};

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper formatting current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  // Daily automated dialog check & initialization
  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem(STORAGE_KEYS.CHAT_DATE);
      const savedMsgs = localStorage.getItem(STORAGE_KEYS.CHAT_MSGS);

      if (savedDate === today && savedMsgs) {
        // Cùng một ngày: khôi phục lịch sử chat trong ngày
        try {
          const parsed = JSON.parse(savedMsgs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch {
          // parse error fallback
        }
      }

      // Ngày mới (hoặc lần đầu mở): Tự động khởi tạo đoạn hội thoại chào ngày mới
      const botQuestion: ChatMessage = {
        id: `msg-${Date.now()}-1`,
        sender: 'bot',
        text: 'Hôm nay của bạn thế nào?',
        time: getCurrentTime(),
      };

      setMessages([botQuestion]);
      setHasUnread(true);

      let t2: ReturnType<typeof setTimeout> | undefined;

      // Sau 800ms: Hệ thống tự động đáp: "Ngày hôm nay của tôi tràn đầy năng lượng"
      const t1 = setTimeout(() => {
        const autoUserReply: ChatMessage = {
          id: `msg-${Date.now()}-2`,
          sender: 'user',
          text: 'Ngày hôm nay của tôi tràn đầy năng lượng',
          time: getCurrentTime(),
        };

        // Sau tiếp 800ms: Bot tiếp tục gửi lời chúc tràn đầy năng lượng
        t2 = setTimeout(() => {
          const botEncourage: ChatMessage = {
            id: `msg-${Date.now()}-3`,
            sender: 'bot',
            text: 'Tuyệt vời! Chúc bạn có một ngày làm việc tràn đầy năng lượng và hoàn thành xuất sắc mọi mục tiêu nhé! ✨💪',
            time: getCurrentTime(),
          };

          setMessages((prev) => {
            const fullMsgs = [...prev, botEncourage];
            localStorage.setItem(STORAGE_KEYS.CHAT_DATE, today);
            localStorage.setItem(STORAGE_KEYS.CHAT_MSGS, JSON.stringify(fullMsgs));
            return fullMsgs;
          });
        }, 800);

        setMessages((prev) => {
          const updated = [...prev, autoUserReply];
          localStorage.setItem(STORAGE_KEYS.CHAT_DATE, today);
          localStorage.setItem(STORAGE_KEYS.CHAT_MSGS, JSON.stringify(updated));
          return updated;
        });
      }, 800);

      return () => {
        clearTimeout(t1);
        if (t2) clearTimeout(t2);
      };
    } catch (e) {
      console.error('Error initializing daily chat:', e);
    }
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: getCurrentTime(),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');

    // Save to storage
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEYS.CHAT_DATE, today);
    localStorage.setItem(STORAGE_KEYS.CHAT_MSGS, JSON.stringify(newMsgs));

    setTimeout(() => {
      let botReply = 'Cảm ơn chia sẻ của bạn! Chúc bạn một ngày làm việc thật hiệu quả và ngập tràn niềm vui nhé! 🌟';
      const lower = userText.toLowerCase();

      if (lower.includes('thời hạn') || lower.includes('hạn nộp') || lower.includes('khi nào')) {
        botReply = 'Quy định: Cán bộ, nhân viên hoàn thành nộp báo cáo trước 17h00 ngày Thứ Sáu hàng tuần.';
      } else if (lower.includes('chuông') || lower.includes('thông báo')) {
        botReply = 'Khi có báo cáo mới hoặc cập nhật, chuông thông báo trên thanh tiêu đề sẽ rung lắc để cập nhật tức thì.';
      } else if (lower.includes('báo cáo') || lower.includes('tạo')) {
        botReply = 'Bạn có thể bấm vào nút "Tạo Báo Cáo Mới" màu xanh lá cây ở thanh công cụ phía trên để nộp báo cáo tuần nhé!';
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        sender: 'bot',
        text: botReply,
        time: getCurrentTime(),
      };

      setMessages((prev) => {
        const updated = [...prev, botMsg];
        localStorage.setItem(STORAGE_KEYS.CHAT_MSGS, JSON.stringify(updated));
        return updated;
      });
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#ea580c',
          color: '#ffffff',
          boxShadow: '0 4px 18px rgba(234, 88, 12, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 850,
          border: '2.5px solid #ffffff',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 22px rgba(234, 88, 12, 0.55)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 18px rgba(234, 88, 12, 0.45)';
        }}
        title="Trợ lý ảo UTT"
        aria-label="Mở Trợ lý Hỗ trợ"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}

        {/* Unread indicator */}
        {!isOpen && hasUnread && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '13px',
              height: '13px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '2px solid #ffffff',
              boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
              animation: 'pulse 1.5s infinite',
            }}
          />
        )}
      </button>

      {/* Floating Chat Box */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '86px',
            left: '20px',
            width: '330px',
            maxWidth: 'calc(100vw - 40px)',
            height: '430px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 860,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'chatSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <style>{`
            @keyframes chatSlideIn {
              from { opacity: 0; transform: translateY(12px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.9; }
              50% { transform: scale(1.15); opacity: 1; }
              100% { transform: scale(0.95); opacity: 0.9; }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#ea580c',
              backgroundImage: 'linear-gradient(135deg, #ea580c, #c2410c)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={17} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, lineHeight: 1.2 }}>Trợ Lý Trực Tuyến</div>
                <div style={{ fontSize: '10.5px', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                  <span>Sẵn sàng hỗ trợ</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                color: '#ffffff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.9,
              }}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#f8fafc',
            }}
          >
            {/* Daily greeting banner */}
            <div
              style={{
                textAlign: 'center',
                margin: '2px 0 6px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  color: '#64748b',
                  backgroundColor: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={12} color="#ea580c" />
                Hôm nay, {new Date().toLocaleDateString('vi-VN')}
              </span>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    backgroundColor: m.sender === 'user' ? '#a11f24' : '#ffffff',
                    color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                    padding: '9px 13px',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '12.5px',
                    lineHeight: '1.45',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                    border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    wordBreak: 'break-word',
                  }}
                >
                  {m.text}
                </div>
                {m.time && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#94a3b8',
                      marginTop: '3px',
                      padding: '0 4px',
                    }}
                  >
                    {m.time}
                  </span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            style={{
              display: 'flex',
              borderTop: '1px solid #e2e8f0',
              padding: '8px 10px',
              backgroundColor: '#ffffff',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '12.5px',
                backgroundColor: '#f8fafc',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#ea580c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                backgroundColor: input.trim() ? '#ea580c' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'background-color 0.15s',
              }}
              aria-label="Gửi tin nhắn"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
