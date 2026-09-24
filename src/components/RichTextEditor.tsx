'use client';

import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Link2,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Outdent,
  Indent,
  ChevronDown,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  minHeight = '110px',
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [formatBlock, setFormatBlock] = useState('Paragraph');

  const applyWrap = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = prefix + (selectedText || 'nội dung') + suffix;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 8));
    }, 50);
  };

  const applyBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText) {
      const lines = selectedText.split('\n');
      const bulleted = lines.map((l) => (l.startsWith('* ') ? l : `* ${l}`)).join('\n');
      const newValue = value.substring(0, start) + bulleted + value.substring(end);
      onChange(newValue);
    } else {
      const prefix = value.endsWith('\n') || value === '' ? '* ' : '\n* ';
      onChange(value + prefix);
    }
  };

  const applyNumbered = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText) {
      const lines = selectedText.split('\n');
      const numbered = lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
      const newValue = value.substring(0, start) + numbered + value.substring(end);
      onChange(newValue);
    } else {
      const prefix = value.endsWith('\n') || value === '' ? '1. ' : '\n1. ';
      onChange(value + prefix);
    }
  };

  const applyChecklist = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const prefix = value.endsWith('\n') || value === '' ? '[ ] ' : '\n[ ] ';
    onChange(value + prefix);
  };

  const applyQuote = () => {
    applyWrap('> ', '\n');
  };

  const applyLink = () => {
    const url = prompt('Nhập đường link liên kết (URL):', 'https://');
    if (url) {
      applyWrap('[', `](${url})`);
    }
  };

  const applyTable = () => {
    const tableTemplate = '\n| Tiêu đề 1 | Tiêu đề 2 |\n|---|---|\n| Nội dung 1 | Nội dung 2 |\n';
    onChange(value + tableTemplate);
  };

  const applyIndent = (type: 'in' | 'out') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (type === 'in') {
      onChange(value + '  ');
    }
  };

  return (
    <div
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        width: '100%',
      }}
    >
      {/* Rich Text Toolbar exactly matching Screenshot 1 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '4px',
          padding: '4px 8px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          minHeight: '38px',
        }}
      >
        {/* Paragraph dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={formatBlock}
            onChange={(e) => setFormatBlock(e.target.value)}
            style={{
              fontSize: '13px',
              color: '#374151',
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              cursor: 'pointer',
              padding: '4px 20px 4px 6px',
              appearance: 'none',
              fontWeight: 500,
            }}
          >
            <option value="Paragraph">Paragraph</option>
            <option value="Heading 1">Heading 1</option>
            <option value="Heading 2">Heading 2</option>
            <option value="Heading 3">Heading 3</option>
          </select>
          <ChevronDown size={14} color="#6b7280" style={{ position: 'absolute', right: '4px', pointerEvents: 'none' }} />
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '18px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />

        {/* Bold */}
        <button
          type="button"
          onClick={() => applyWrap('**')}
          title="Đậm (B)"
          style={{
            padding: '4px 7px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 800,
            color: '#1f2937',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => applyWrap('*')}
          title="Nghiêng (I)"
          style={{
            padding: '4px 7px',
            borderRadius: '4px',
            fontSize: '14px',
            fontStyle: 'italic',
            fontWeight: 600,
            color: '#1f2937',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'serif',
          }}
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => applyWrap('<u>', '</u>')}
          title="Gạch chân (U)"
          style={{
            padding: '4px 7px',
            borderRadius: '4px',
            fontSize: '14px',
            textDecoration: 'underline',
            fontWeight: 600,
            color: '#1f2937',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          U
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '18px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />

        {/* Link */}
        <button
          type="button"
          onClick={applyLink}
          title="Chèn liên kết"
          style={{ padding: '4px 6px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Link2 size={16} />
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={() => {
            const imgUrl = prompt('Nhập URL hình ảnh:');
            if (imgUrl) onChange(value + `\n![Hình ảnh](${imgUrl})\n`);
          }}
          title="Chèn ảnh"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '4px 6px',
            color: '#374151',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ImageIcon size={16} />
          <ChevronDown size={11} color="#6b7280" />
        </button>

        {/* Video */}
        <button
          type="button"
          onClick={() => {
            const vidUrl = prompt('Nhập link video:');
            if (vidUrl) onChange(value + `\n[Video](${vidUrl})\n`);
          }}
          title="Chèn video"
          style={{ padding: '4px 6px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Video size={16} />
        </button>

        {/* Table */}
        <button
          type="button"
          onClick={applyTable}
          title="Chèn bảng"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '4px 6px',
            color: '#374151',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <TableIcon size={16} />
          <ChevronDown size={11} color="#6b7280" />
        </button>

        {/* Quote */}
        <button
          type="button"
          onClick={applyQuote}
          title="Trích dẫn"
          style={{ padding: '4px 6px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Quote size={16} />
        </button>

        {/* Separator */}
        <div style={{ width: '1px', height: '18px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />

        {/* Bullet list */}
        <button
          type="button"
          onClick={applyBullet}
          title="Danh sách gạch đầu dòng"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '4px 6px',
            color: '#374151',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <List size={16} />
          <ChevronDown size={11} color="#6b7280" />
        </button>

        {/* Numbered list */}
        <button
          type="button"
          onClick={applyNumbered}
          title="Danh sách số thứ tự"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '4px 6px',
            color: '#374151',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ListOrdered size={16} />
          <ChevronDown size={11} color="#6b7280" />
        </button>

        {/* Checklist */}
        <button
          type="button"
          onClick={applyChecklist}
          title="Danh sách kiểm tra (Checklist)"
          style={{ padding: '4px 6px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <CheckSquare size={16} />
        </button>

        {/* Outdent */}
        <button
          type="button"
          onClick={() => applyIndent('out')}
          title="Giảm thụt lề"
          style={{ padding: '4px 6px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Outdent size={16} />
        </button>

        {/* Indent */}
        <button
          type="button"
          onClick={() => applyIndent('in')}
          title="Tăng thụt lề"
          style={{ padding: '4px 6px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Indent size={16} />
        </button>
      </div>

      {/* Editor Content Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight,
          padding: '10px 14px',
          border: 'none',
          outline: 'none',
          fontSize: '13.5px',
          lineHeight: '1.6',
          fontFamily: 'inherit',
          color: '#1f2937',
          backgroundColor: '#ffffff',
          resize: 'vertical',
          boxSizing: 'border-box',
          display: 'block',
        }}
      />
    </div>
  );
}
