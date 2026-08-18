import React, { useState } from 'react';

interface RichFormattingToolbarProps {
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  textareaRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  lang?: 'ar' | 'en';
  onAIAssist?: (promptType: 'polish' | 'translate' | 'formal' | 'summarize') => void;
}

export const RichFormattingToolbar: React.FC<RichFormattingToolbarProps> = ({
  inputText,
  setInputText,
  textareaRef,
  lang = 'ar',
  onAIAssist,
}) => {
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showCodeLangMenu, setShowCodeLangMenu] = useState(false);

  const applyFormat = (prefix: string, suffix: string = prefix, defaultPlaceholder = '') => {
    const el = textareaRef?.current;
    if (!el) {
      setInputText((prev) => `${prev}${prefix}${defaultPlaceholder || (lang === 'ar' ? 'نص' : 'text')}${suffix}`);
      return;
    }

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const selected = inputText.substring(start, end) || defaultPlaceholder || (lang === 'ar' ? 'نص' : 'text');
    const replacement = `${prefix}${selected}${suffix}`;

    const newText = inputText.substring(0, start) + replacement + inputText.substring(end);
    setInputText(newText);

    setTimeout(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }
    }, 20);
  };

  const insertCodeBlock = (language: string) => {
    applyFormat(`\`\`\`${language}\n`, '\n```', '// code here');
    setShowCodeLangMenu(false);
  };

  const insertLink = () => {
    const url = prompt(lang === 'ar' ? 'أدخل رابط URL:' : 'Enter URL:');
    if (!url) return;
    applyFormat('[', `](${url})`, lang === 'ar' ? 'عنوان الرابط' : 'Link title');
  };

  return (
    <div
      id="rich-formatting-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        background: 'var(--surface2, #0f172a)',
        borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
        borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        position: 'relative',
      }}
    >
      {/* Bold */}
      <button
        type="button"
        className="fmt-btn"
        title={lang === 'ar' ? 'عريض (Ctrl+B)' : 'Bold (Ctrl+B)'}
        onClick={() => applyFormat('**', '**')}
        style={btnStyle}
      >
        <i className="fas fa-bold" />
      </button>

      {/* Italic */}
      <button
        type="button"
        className="fmt-btn"
        title={lang === 'ar' ? 'مائل (Ctrl+I)' : 'Italic (Ctrl+I)'}
        onClick={() => applyFormat('_', '_')}
        style={btnStyle}
      >
        <i className="fas fa-italic" />
      </button>

      {/* Strikethrough */}
      <button
        type="button"
        className="fmt-btn"
        title={lang === 'ar' ? 'مشطوب' : 'Strikethrough'}
        onClick={() => applyFormat('~', '~')}
        style={btnStyle}
      >
        <i className="fas fa-strikethrough" />
      </button>

      {/* Inline Code */}
      <button
        type="button"
        className="fmt-btn"
        title={lang === 'ar' ? 'كود مضمن' : 'Inline Code'}
        onClick={() => applyFormat('`', '`')}
        style={btnStyle}
      >
        <i className="fas fa-code" />
      </button>

      {/* Code Block with languages */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className="fmt-btn"
          title={lang === 'ar' ? 'كتلة برمجية (Code Block)' : 'Code Block'}
          onClick={() => setShowCodeLangMenu(!showCodeLangMenu)}
          style={{ ...btnStyle, background: showCodeLangMenu ? 'rgba(56, 189, 248, 0.2)' : undefined }}
        >
          <i className="fas fa-file-code" />
          <i className="fas fa-chevron-down" style={{ fontSize: 8, marginLeft: 2 }} />
        </button>

        {showCodeLangMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: 6,
              background: 'var(--surface, #1e293b)',
              border: '1px solid var(--border, rgba(255,255,255,0.12))',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              padding: 4,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              zIndex: 60,
              minWidth: 160,
            }}
          >
            {['javascript', 'python', 'json', 'typescript', 'html', 'bash', 'sql', 'cpp'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => insertCodeBlock(l)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text, #f8fafc)',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible Quote */}
      <button
        type="button"
        className="fmt-btn"
        title={lang === 'ar' ? 'اقتباس قابل للطي (Collapsible Quote)' : 'Collapsible Quote'}
        onClick={() => applyFormat('> ', '', lang === 'ar' ? 'نص الاقتباس هنا' : 'Quoted text here')}
        style={btnStyle}
      >
        <i className="fas fa-quote-right" />
      </button>

      {/* Spoiler (Hidden text) */}
      <button
        type="button"
        className="fmt-btn"
        title={lang === 'ar' ? 'نص مخفي (Spoiler)' : 'Spoiler'}
        onClick={() => applyFormat('||', '||', lang === 'ar' ? 'نص مخفي' : 'Hidden text')}
        style={{ ...btnStyle, color: '#eab308' }}
      >
        <i className="fas fa-eye-slash" />
      </button>

      {/* Heading */}
      <button
        type="button"
        className="fmt-btn"
        title={lang === 'ar' ? 'عنوان (Heading)' : 'Heading'}
        onClick={() => applyFormat('### ', '', lang === 'ar' ? 'عنوان رئيسي' : 'Heading')}
        style={btnStyle}
      >
        <i className="fas fa-heading" />
      </button>

      {/* Link */}
      <button
        type="button"
        className="fmt-btn"
        title={lang === 'ar' ? 'إدراج رابط' : 'Insert Link'}
        onClick={insertLink}
        style={btnStyle}
      >
        <i className="fas fa-link" />
      </button>

      <div style={{ flex: 1 }} />

      {/* AI Assistant Button (Telegram 12.9 Style) */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          id="ai-assistant-fmt-btn"
          title={lang === 'ar' ? 'المساعد الذكي للرسائل (AI Assistant)' : 'AI Writing Assistant'}
          onClick={() => setShowAiMenu(!showAiMenu)}
          style={{
            ...btnStyle,
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(56, 189, 248, 0.2))',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            fontWeight: 600,
            gap: 4,
            padding: '3px 8px',
          }}
        >
          <i className="fas fa-wand-magic-sparkles" style={{ color: '#c084fc' }} />
          <span style={{ fontSize: 11 }}>AI</span>
        </button>

        {showAiMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: 6,
              background: 'var(--surface, #1e293b)',
              border: '1px solid var(--border, rgba(255,255,255,0.12))',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              zIndex: 60,
              minWidth: 170,
            }}
          >
            <button
              type="button"
              onClick={() => {
                onAIAssist?.('polish');
                setShowAiMenu(false);
              }}
              style={aiMenuItemStyle}
            >
              <i className="fas fa-sparkles" style={{ color: '#38bdf8' }} />
              <span>{lang === 'ar' ? 'تحسين وتصحيح النص' : 'Improve & Polish'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAIAssist?.('translate');
                setShowAiMenu(false);
              }}
              style={aiMenuItemStyle}
            >
              <i className="fas fa-language" style={{ color: '#10b981' }} />
              <span>{lang === 'ar' ? 'ترجمة النص (En/Ar)' : 'Translate Text'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAIAssist?.('formal');
                setShowAiMenu(false);
              }}
              style={aiMenuItemStyle}
            >
              <i className="fas fa-user-tie" style={{ color: '#f59e0b' }} />
              <span>{lang === 'ar' ? 'صياغة رسمية / احترافية' : 'Make Formal'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAIAssist?.('summarize');
                setShowAiMenu(false);
              }}
              style={aiMenuItemStyle}
            >
              <i className="fas fa-compress-alt" style={{ color: '#a855f7' }} />
              <span>{lang === 'ar' ? 'تلخيص المسودة' : 'Summarize'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  padding: '4px 8px',
  color: 'var(--text2, #94a3b8)',
  fontSize: 12,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
};

const aiMenuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: 'transparent',
  border: 'none',
  color: 'var(--text, #f8fafc)',
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
};
