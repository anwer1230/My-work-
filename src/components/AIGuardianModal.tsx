import React, { useState } from 'react';

interface AIGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatTitle?: string;
  chatId?: string | number;
  lang?: 'ar' | 'en';
  onSaveConfig?: (config: any) => void;
}

export const AIGuardianModal: React.FC<AIGuardianModalProps> = ({
  isOpen,
  onClose,
  chatTitle = 'المجموعة',
  chatId,
  lang = 'ar',
  onSaveConfig,
}) => {
  const [enabled, setEnabled] = useState(true);
  const [screenJoinRequests, setScreenJoinRequests] = useState(true);
  const [blockSpamLinks, setBlockSpamLinks] = useState(true);
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [strictness, setStrictness] = useState<'low' | 'balanced' | 'strict'>('balanced');
  const [customRules, setCustomRules] = useState(
    '1. منع الإعلانات غير المصرح بها\n2. الحفاظ على الاحترام المتبادل\n3. منع الرسائل المكررة (Flood)'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const config = {
      chatId,
      enabled,
      screenJoinRequests,
      blockSpamLinks,
      profanityFilter,
      strictness,
      customRules,
    };
    onSaveConfig?.(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="ai-guardian-modal-backdrop"
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
        id="ai-guardian-modal-content"
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
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(168, 85, 247, 0.15))',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #38bdf8, #a855f7)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              <i className="fas fa-shield-virus" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#f8fafc' }}>
                {lang === 'ar' ? 'حارس المجموعة الذكي (AI Guardian)' : 'AI Group Guardian'}
              </div>
              <div style={{ fontSize: 11, color: '#38bdf8' }}>{chatTitle}</div>
            </div>
          </div>
          <button onClick={onClose} style={iconBtnStyle}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Master Toggle */}
          <div style={toggleRowStyle}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#f8fafc' }}>
                {lang === 'ar' ? 'تفعيل الحراسة الذكية للمجموعة' : 'Enable AI Group Guardian'}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {lang === 'ar' ? 'تشغيل المراقبة الآلية لطلبات الانضمام والرسائل' : 'Automate join screening and message filtering'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#38bdf8', cursor: 'pointer' }}
            />
          </div>

          {enabled && (
            <>
              {/* Screening Join Requests */}
              <div style={toggleRowStyle}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#f8fafc' }}>
                    {lang === 'ar' ? 'فحص طلبات الانضمام تلقائياً' : 'Auto-Screen Join Requests'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {lang === 'ar' ? 'رفض الحسابات الوهمية والبوتات المزعجة قبل دخولها' : 'Pre-screen fake accounts and bot swarms'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={screenJoinRequests}
                  onChange={(e) => setScreenJoinRequests(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>

              {/* Anti-Spam Links */}
              <div style={toggleRowStyle}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#f8fafc' }}>
                    {lang === 'ar' ? 'حظر الروابط الدعائية والمشبوهة' : 'Block Spam & Phishing Links'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {lang === 'ar' ? 'حذف الروابط المشبوهة وتحذير صاحبها تلقائياً' : 'Remove malicious links and auto-warn senders'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={blockSpamLinks}
                  onChange={(e) => setBlockSpamLinks(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>

              {/* Profanity Filter */}
              <div style={toggleRowStyle}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#f8fafc' }}>
                    {lang === 'ar' ? 'فلترة الكلمات المسيئة والمحتوى غير اللائق' : 'Profanity & Content Filter'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {lang === 'ar' ? 'تنقية المحادثات والحفاظ على بيئة نقية' : 'Maintain safe and respectful discussions'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profanityFilter}
                  onChange={(e) => setProfanityFilter(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>

              {/* Strictness Level */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                  {lang === 'ar' ? 'مستوى صرامة الذكاء الاصطناعي:' : 'AI Strictness Level:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {(['low', 'balanced', 'strict'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setStrictness(lvl)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: strictness === lvl ? 700 : 500,
                        background: strictness === lvl ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
                        border: strictness === lvl ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                        color: strictness === lvl ? '#38bdf8' : '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      {lvl === 'low'
                        ? lang === 'ar' ? 'مرن (Low)' : 'Low'
                        : lvl === 'balanced'
                        ? lang === 'ar' ? 'متوازن (Balanced)' : 'Balanced'
                        : lang === 'ar' ? 'صارم (Strict)' : 'Strict'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Group Prompt / Rules */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                  {lang === 'ar' ? 'قواعد وتعليمات المجموعة المخصصة للـ AI:' : 'Custom Group Rules for AI:'}
                </label>
                <textarea
                  value={customRules}
                  onChange={(e) => setCustomRules(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'var(--surface2, #0f172a)',
                    border: '1px solid var(--border, rgba(255,255,255,0.1))',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#f8fafc',
                    fontSize: 12,
                    resize: 'none',
                    lineHeight: 1.5,
                  }}
                  placeholder={lang === 'ar' ? 'اكتب قواعد المجموعة هنا...' : 'Enter group rules...'}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            background: 'var(--surface2, #0f172a)',
            borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
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
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
              border: 'none',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {savedSuccess ? (
              <>
                <i className="fas fa-check" />
                <span>{lang === 'ar' ? 'تم الحفظ!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <i className="fas fa-shield-alt" />
                <span>{lang === 'ar' ? 'حفظ وتفعيل الحارس' : 'Save & Activate'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 10,
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
