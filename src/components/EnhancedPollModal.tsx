import React, { useState } from 'react';

interface PollOptionInput {
  id: string;
  text: string;
  linkUrl?: string;
}

interface EnhancedPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
  onCreatePoll: (pollData: {
    question: string;
    options: { text: string; linkUrl?: string; votes: number }[];
    isAnonymous: boolean;
    allowsMultipleAnswers: boolean;
    isQuiz: boolean;
    correctOptionId?: string;
  }) => void;
}

export const EnhancedPollModal: React.FC<EnhancedPollModalProps> = ({
  isOpen,
  onClose,
  lang = 'ar',
  onCreatePoll,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOptionInput[]>([
    { id: '1', text: '', linkUrl: '' },
    { id: '2', text: '', linkUrl: '' },
  ]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [allowsMultipleAnswers, setAllowsMultipleAnswers] = useState(false);
  const [isQuiz, setIsQuiz] = useState(false);
  const [correctOptionId, setCorrectOptionId] = useState<string>('1');

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length >= 10) return;
    setOptions([...options, { id: String(Date.now()), text: '', linkUrl: '' }]);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx: number, field: 'text' | 'linkUrl', val: string) => {
    const next = [...options];
    next[idx][field] = val;
    setOptions(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    const validOptions = options.filter((o) => o.text.trim().length > 0);
    if (validOptions.length < 2) return;

    onCreatePoll({
      question: question.trim(),
      options: validOptions.map((o) => ({
        text: o.text.trim(),
        linkUrl: o.linkUrl?.trim() || undefined,
        votes: 0,
      })),
      isAnonymous,
      allowsMultipleAnswers: isQuiz ? false : allowsMultipleAnswers,
      isQuiz,
      correctOptionId: isQuiz ? correctOptionId : undefined,
    });

    onClose();
  };

  return (
    <div
      id="enhanced-poll-modal-backdrop"
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
        id="enhanced-poll-modal-content"
        style={{
          width: '100%',
          maxWidth: 540,
          background: 'var(--surface, #1e293b)',
          border: '1px solid var(--border, rgba(255,255,255,0.12))',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--surface2, #0f172a)',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
              }}
            >
              <i className="fas fa-poll-h" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#f8fafc' }}>
                {lang === 'ar' ? 'إنشاء استطلاع رأي متقدم' : 'Create Enhanced Poll'}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {lang === 'ar' ? 'يدعم الروابط والتوقيت الدقيق' : 'Supports option links & timestamps'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={iconBtnStyle}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Question Input */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              {lang === 'ar' ? 'سؤال الاستطلاع:' : 'Poll Question:'}
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={lang === 'ar' ? 'اطرح سؤالاً...' : 'Ask a question...'}
              style={inputStyle}
            />
          </div>

          {/* Options with Links */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              {lang === 'ar' ? 'خيارات الاستطلاع مع الروابط التوضيحية:' : 'Poll Options with Attached Links:'}
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map((opt, idx) => (
                <div
                  key={opt.id}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', width: 20 }}>{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                      placeholder={lang === 'ar' ? `الخيار ${idx + 1}` : `Option ${idx + 1}`}
                      style={{ ...inputStyle, padding: '6px 10px', fontSize: 13 }}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        style={{ ...iconBtnStyle, color: '#ef4444' }}
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    )}
                  </div>

                  {/* Optional URL for this option (Telegram 12.8 feature) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 28 }}>
                    <i className="fas fa-link" style={{ fontSize: 11, color: '#38bdf8' }} />
                    <input
                      type="url"
                      value={opt.linkUrl || ''}
                      onChange={(e) => handleOptionChange(idx, 'linkUrl', e.target.value)}
                      placeholder={lang === 'ar' ? 'رابط توضيحي لهذا الخيار (اختياري)...' : 'Optional link URL for context...'}
                      style={{ ...inputStyle, padding: '4px 8px', fontSize: 11, color: '#38bdf8' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                style={{
                  marginTop: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px dashed rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <i className="fas fa-plus" />
                <span>{lang === 'ar' ? 'إضافة خيار إضافي' : 'Add Option'}</span>
              </button>
            )}
          </div>

          {/* Settings / Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#38bdf8' }}
              />
              <span>{lang === 'ar' ? 'تصويت سري وغير معلن (Anonymous)' : 'Anonymous Voting'}</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={allowsMultipleAnswers}
                disabled={isQuiz}
                onChange={(e) => setAllowsMultipleAnswers(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#38bdf8' }}
              />
              <span>{lang === 'ar' ? 'السماح بإجابات متعددة' : 'Multiple Answers'}</span>
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={isQuiz}
                onChange={(e) => setIsQuiz(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#a855f7' }}
              />
              <span>{lang === 'ar' ? 'وضع الاختبار / المسابقة (Quiz Mode)' : 'Quiz Mode'}</span>
            </label>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                border: 'none',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {lang === 'ar' ? 'نشر الاستطلاع' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface2, #0f172a)',
  border: '1px solid var(--border, rgba(255,255,255,0.12))',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#f8fafc',
  fontSize: 14,
  outline: 'none',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 13,
  color: '#e2e8f0',
  cursor: 'pointer',
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
