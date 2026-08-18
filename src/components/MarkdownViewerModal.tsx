import React, { useState } from 'react';

interface MarkdownViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  fileName?: string;
  lang?: 'ar' | 'en';
}

export const MarkdownViewerModal: React.FC<MarkdownViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  fileName = 'document.md',
  lang = 'ar',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple and safe markdown parsing into formatted blocks
  const renderFormattedMarkdown = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // close code block
          elements.push(
            <div
              key={`code-${index}`}
              style={{
                background: '#090d16',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '12px 14px',
                margin: '10px 0',
                fontFamily: 'monospace',
                fontSize: 13,
                color: '#38bdf8',
                overflowX: 'auto',
                position: 'relative',
              }}
            >
              {codeLang && (
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>
                  {codeLang}
                </div>
              )}
              <pre style={{ margin: 0 }}>{codeBuffer.join('\n')}</pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${index}`} style={{ fontSize: 22, fontWeight: 800, margin: '16px 0 8px', color: '#f8fafc' }}>
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${index}`} style={{ fontSize: 18, fontWeight: 700, margin: '14px 0 6px', color: '#38bdf8' }}>
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${index}`} style={{ fontSize: 15, fontWeight: 600, margin: '12px 0 4px', color: '#e2e8f0' }}>
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        // Blockquote
        elements.push(
          <blockquote
            key={`quote-${index}`}
            style={{
              borderLeft: lang === 'ar' ? 'none' : '3px solid #38bdf8',
              borderRight: lang === 'ar' ? '3px solid #38bdf8' : 'none',
              background: 'rgba(56, 189, 248, 0.08)',
              padding: '8px 12px',
              borderRadius: 4,
              margin: '8px 0',
              color: '#cbd5e1',
              fontStyle: 'italic',
            }}
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Bullet list
        elements.push(
          <div key={`li-${index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '4px 0', paddingLeft: 8 }}>
            <span style={{ color: '#38bdf8' }}>•</span>
            <span style={{ color: '#e2e8f0' }}>{line.replace(/^[-*]\s/, '')}</span>
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={`space-${index}`} style={{ height: 8 }} />);
      } else {
        // Regular paragraph
        elements.push(
          <p key={`p-${index}`} style={{ margin: '4px 0', lineHeight: 1.6, color: '#e2e8f0' }}>
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div
      id="md-viewer-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        id="md-viewer-modal-content"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '85vh',
          background: 'var(--surface, #1e293b)',
          border: '1px solid var(--border, rgba(255,255,255,0.12))',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
            background: 'var(--surface2, #0f172a)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="fas fa-file-alt" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>{title || fileName}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Telegram In-App Markdown Document</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleCopy}
              title={lang === 'ar' ? 'نسخ النص الكامل' : 'Copy Full Text'}
              style={iconBtnStyle}
            >
              <i className={copied ? 'fas fa-check text-emerald-400' : 'fas fa-copy'} />
            </button>
            <button
              onClick={handleDownload}
              title={lang === 'ar' ? 'تنزيل الملف (.md)' : 'Download .md File'}
              style={iconBtnStyle}
            >
              <i className="fas fa-download" />
            </button>
            <button onClick={onClose} title={lang === 'ar' ? 'إغلاق' : 'Close'} style={iconBtnStyle}>
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            fontSize: 14,
          }}
        >
          {renderFormattedMarkdown(content)}
        </div>
      </div>
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: 'none',
  borderRadius: 8,
  width: 32,
  height: 32,
  color: 'var(--text2, #94a3b8)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
};
