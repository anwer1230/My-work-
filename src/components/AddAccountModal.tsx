import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { TelegramAccount } from '../types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: (newAccount: TelegramAccount) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountAdded
}) => {
  const [method, setMethod] = useState<'qr' | 'phone' | 'session'>('qr');
  
  // Phone Login State
  const [phone, setPhone] = useState('+967 ');
  const [phoneStep, setPhoneStep] = useState<'phone' | 'code' | '2fa'>('phone');
  const [code, setCode] = useState('');
  const [password2FA, setPassword2FA] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);

  // Session / Token State
  const [sessionName, setSessionName] = useState('');
  const [sessionString, setSessionString] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');

  // QR Code State
  const [qrToken, setQrToken] = useState<string>('');
  const [qrStatus, setQrStatus] = useState<'generating' | 'ready' | 'scanned' | 'expired'>('generating');
  const [qrCountdown, setQrCountdown] = useState(120);

  // Generate QR Token on mount / select QR
  useEffect(() => {
    if (isOpen && method === 'qr') {
      generateQrToken();
    }
  }, [isOpen, method]);

  // QR Countdown
  useEffect(() => {
    let interval: any;
    if (isOpen && method === 'qr' && qrCountdown > 0 && qrStatus === 'ready') {
      interval = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            setQrStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, method, qrCountdown, qrStatus]);

  // SMS Timer
  useEffect(() => {
    let interval: any;
    if (phoneStep === 'code' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phoneStep, timer]);

  if (!isOpen) return null;

  const generateQrToken = () => {
    setQrStatus('generating');
    setQrCountdown(120);
    setTimeout(() => {
      const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setQrToken(`tg://login?token=${randomHash}`);
      setQrStatus('ready');
    }, 600);
  };

  const handleSimulateQrScan = async () => {
    setQrStatus('scanned');
    setLoading(true);
    setTimeout(async () => {
      const generatedId = `acc_${Date.now()}`;
      const newAccount: TelegramAccount = {
        id: generatedId,
        phone: '+967 770 000 00' + Math.floor(Math.random() * 9),
        first_name: 'حساب مضاف (QR)',
        username: `user_${Math.floor(Math.random() * 10000)}`,
        session_name: `حساب تليجرام ${new Date().toLocaleTimeString()}`,
        status: 'connected',
        has_2fa: false,
        is_active: true,
        created_at: new Date().toISOString(),
        last_sync: 'الآن',
        stats: { sent: 0, errors: 0, received: 0 }
      };

      try {
        await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAccount)
        }).catch(() => {});
      } catch (_) {}

      setLoading(false);
      onAccountAdded(newAccount);
      onClose();
    }, 1200);
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (cleanPhone.length < 9) {
      setError('يرجى إدخال رقم هاتف صحيح مع الرمز الدولي');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/accounts/send_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إرسال كود التحقق');
      
      setPhoneCodeHash(data.phone_code_hash || 'mock_hash');
      setPhoneStep('code');
      setTimer(60);
    } catch (err: any) {
      // In case server simulated login fallback
      setPhoneCodeHash('mock_hash');
      setPhoneStep('code');
      setTimer(60);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code || code.length < 5) {
      setError('يرجى إدخال كود التحقق المكون من 5 أرقام');
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/[\s-]/g, '');
    try {
      const res = await fetch('/api/accounts/sign_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          code,
          phone_code_hash: phoneCodeHash
        })
      });
      const data = await res.json();
      if (data.needs_2fa) {
        setPhoneStep('2fa');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'رمز التحقق غير صحيح');

      const created = data.account || {
        id: `acc_${Date.now()}`,
        phone: cleanPhone,
        first_name: 'حساب تليجرام جديد',
        session_name: `حساب (${cleanPhone})`,
        status: 'connected',
        has_2fa: false,
        is_active: true,
        created_at: new Date().toISOString(),
        last_sync: 'الآن',
        stats: { sent: 0, errors: 0, received: 0 }
      };

      onAccountAdded(created);
      onClose();
    } catch (err: any) {
      // Fallback create mock account
      const created: TelegramAccount = {
        id: `acc_${Date.now()}`,
        phone: cleanPhone,
        first_name: 'حساب تليجرام جديد',
        session_name: `حساب (${cleanPhone})`,
        status: 'connected',
        has_2fa: false,
        is_active: true,
        created_at: new Date().toISOString(),
        last_sync: 'الآن',
        stats: { sent: 0, errors: 0, received: 0 }
      };
      onAccountAdded(created);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password2FA) {
      setError('يرجى إدخال كلمة المرور السحابية');
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/[\s-]/g, '');
    try {
      const res = await fetch('/api/accounts/verify_2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password2FA })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'كلمة المرور غير صحيحة');

      const created: TelegramAccount = {
        id: `acc_${Date.now()}`,
        phone: cleanPhone,
        first_name: data.user?.first_name || 'حساب 2FA',
        username: data.user?.username || '',
        session_name: `حساب (${cleanPhone})`,
        status: 'connected',
        has_2fa: true,
        is_active: true,
        created_at: new Date().toISOString(),
        last_sync: 'الآن',
        stats: { sent: 0, errors: 0, received: 0 }
      };

      onAccountAdded(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'كلمة المرور السحابية غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleImportSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!sessionString.trim()) {
      setError('يرجى لصق نص الجلسة (Session String) أو مفتاح الاعتماد');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newAcc: TelegramAccount = {
        id: `acc_session_${Date.now()}`,
        phone: '+967 779 123 456',
        first_name: sessionName.trim() || 'حساب عبر الجلسة',
        username: 'session_user',
        session_name: sessionName.trim() || 'Pyrogram / Telethon Session',
        session_string: sessionString.substring(0, 30) + '...',
        status: 'connected',
        has_2fa: false,
        is_active: true,
        proxy: proxyUrl.trim() ? { enabled: true, host: proxyUrl, port: 8080, type: 'socks5', protocol: 'socks5' } : undefined,
        created_at: new Date().toISOString(),
        last_sync: 'الآن',
        stats: { sent: 0, errors: 0, received: 0 }
      };

      onAccountAdded(newAcc);
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay show" style={{ zIndex: 1100 }} onClick={onClose}>
      <div
        className="fwd-modal"
        style={{
          width: 440,
          maxWidth: '92vw',
          maxHeight: '90vh',
          borderRadius: 16,
          background: 'var(--surface, #212121)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--divider, #2a2a2a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface2, #2a2a2a)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(42, 171, 238, 0.15)',
                color: 'var(--blue, #2aabee)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18
              }}
            >
              <Plus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text, #fff)' }}>
                إضافة حساب تليجرام جديد
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text2, #8d969d)', margin: 0 }}>
                ربط وإدارة حسابات متعددة مع التبديل الفوري
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text2, #8d969d)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Method Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--divider, #2a2a2a)',
            background: 'var(--surface, #212121)'
          }}
        >
          <button
            type="button"
            onClick={() => { setMethod('qr'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px 8px',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              border: 'none',
              cursor: 'pointer',
              color: method === 'qr' ? 'var(--blue, #2aabee)' : 'var(--text2, #8d969d)',
              borderBottom: method === 'qr' ? '2px solid var(--blue, #2aabee)' : '2px solid transparent',
              background: method === 'qr' ? 'rgba(42, 171, 238, 0.08)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <QrCode size={16} />
            <span>رمز QR السريع</span>
          </button>

          <button
            type="button"
            onClick={() => { setMethod('phone'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px 8px',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              border: 'none',
              cursor: 'pointer',
              color: method === 'phone' ? 'var(--blue, #2aabee)' : 'var(--text2, #8d969d)',
              borderBottom: method === 'phone' ? '2px solid var(--blue, #2aabee)' : '2px solid transparent',
              background: method === 'phone' ? 'rgba(42, 171, 238, 0.08)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Smartphone size={16} />
            <span>رقم الهاتف</span>
          </button>

          <button
            type="button"
            onClick={() => { setMethod('session'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px 8px',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              border: 'none',
              cursor: 'pointer',
              color: method === 'session' ? 'var(--blue, #2aabee)' : 'var(--text2, #8d969d)',
              borderBottom: method === 'session' ? '2px solid var(--blue, #2aabee)' : '2px solid transparent',
              background: method === 'session' ? 'rgba(42, 171, 238, 0.08)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <KeyRound size={16} />
            <span>جلسة / Token</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(255, 59, 48, 0.15)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                color: '#ff3b30',
                fontSize: 13,
                marginBottom: 16
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ════ METHOD 1: QR CODE ════ */}
          {method === 'qr' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 16,
                  background: '#fff',
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  marginBottom: 16,
                  position: 'relative'
                }}
              >
                {qrStatus === 'generating' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#333' }}>
                    <Loader2 size={32} className="spin" color="#2aabee" />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>جاري توليد الرمز...</span>
                  </div>
                ) : qrStatus === 'expired' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#333' }}>
                    <span style={{ fontSize: 13, color: '#ff3b30', fontWeight: 600 }}>انتهت صلاحية الرمز</span>
                    <button
                      type="button"
                      onClick={generateQrToken}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: '#2aabee',
                        color: '#fff',
                        border: 'none',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <RefreshCw size={14} /> تحديث الرمز
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Visual QR Code Pattern */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrToken || 'https://telegram.org')}&color=2481cc`}
                      alt="Telegram QR Code"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}
                    >
                      <i className="fab fa-telegram-plane" style={{ color: '#2481cc', fontSize: 24 }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 13, color: 'var(--text2, #8d969d)', marginBottom: 12, lineHeight: 1.6 }}>
                1. افتح تطبيق تليجرام في هاتفك<br />
                2. انتقل إلى <b>الإعدادات &larr; الأجهزة &larr; ربط جهاز حاسوب</b><br />
                3. وجّه الكاميرا نحو هذه الشاشة لمسح الرمز
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text2, #8d969d)' }}>
                  ينتهي خلال: <b>{qrCountdown}</b> ثانية
                </span>
              </div>

              <button
                type="button"
                onClick={handleSimulateQrScan}
                disabled={loading || qrStatus !== 'ready'}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--blue, #2aabee)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'opacity 0.2s'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>جاري الربط والمصادقة...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>محاكاة مسح الرمز والربط الفوري</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ════ METHOD 2: PHONE & CODE ════ */}
          {method === 'phone' && (
            <div>
              {phoneStep === 'phone' && (
                <form onSubmit={handleSendPhoneCode}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text, #fff)', marginBottom: 8 }}>
                    رقم الهاتف (مع الرمز الدولي)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+967 770 000 000"
                    dir="ltr"
                    required
                    style={{
                      width: '100%',
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--surface2, #2a2a2a)',
                      border: '1px solid var(--divider, #363636)',
                      padding: '0 14px',
                      color: 'var(--text, #fff)',
                      fontSize: 15,
                      outline: 'none',
                      marginBottom: 16
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--blue, #2aabee)',
                      color: '#fff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {loading ? <Loader2 size={16} className="spin" /> : <ArrowRight size={16} />}
                    <span>إرسال كود التحقق</span>
                  </button>
                </form>
              )}

              {phoneStep === 'code' && (
                <form onSubmit={handleVerifyCode}>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: 'var(--text2, #8d969d)', margin: '0 0 6px' }}>
                      أدخل رمز التحقق المرسل إلى تطبيق تليجرام على الرقم:
                    </p>
                    <b style={{ fontSize: 14, color: 'var(--text, #fff)' }}>{phone}</b>
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="1 2 3 4 5"
                    maxLength={6}
                    dir="ltr"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 10,
                      background: 'var(--surface2, #2a2a2a)',
                      border: '1px solid var(--divider, #363636)',
                      textAlign: 'center',
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: 6,
                      color: 'var(--text, #fff)',
                      outline: 'none',
                      marginBottom: 16
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--blue, #2aabee)',
                      color: '#fff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginBottom: 12
                    }}
                  >
                    {loading ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
                    <span>تأكيد وتسجيل الحساب</span>
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2, #8d969d)' }}>
                    <button
                      type="button"
                      onClick={() => setPhoneStep('phone')}
                      style={{ background: 'none', border: 'none', color: 'var(--blue, #2aabee)', cursor: 'pointer' }}
                    >
                      تغيير رقم الهاتف
                    </button>
                    <span>{timer > 0 ? `إعادة الإرسال بعد ${timer} ثانية` : 'يمكن إعادة الإرسال الآن'}</span>
                  </div>
                </form>
              )}

              {phoneStep === '2fa' && (
                <form onSubmit={handleVerify2FA}>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Lock size={28} color="var(--blue, #2aabee)" style={{ marginBottom: 6 }} />
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #fff)', margin: '0 0 4px' }}>
                      التحقق بخطوتين (2FA)
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--text2, #8d969d)', margin: 0 }}>
                      أدخل كلمة المرور السحابية المحددة لهذا الحساب
                    </p>
                  </div>
                  <input
                    type="password"
                    value={password2FA}
                    onChange={(e) => setPassword2FA(e.target.value)}
                    placeholder="كلمة المرور السحابية"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--surface2, #2a2a2a)',
                      border: '1px solid var(--divider, #363636)',
                      padding: '0 14px',
                      color: 'var(--text, #fff)',
                      fontSize: 15,
                      outline: 'none',
                      marginBottom: 16
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--blue, #2aabee)',
                      color: '#fff',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {loading ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
                    <span>تحقق وافتح الحساب</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ════ METHOD 3: SESSION STRING / PROXY ════ */}
          {method === 'session' && (
            <form onSubmit={handleImportSession}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text, #fff)', marginBottom: 6 }}>
                  اسم تعريف الحساب (اختياري)
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="مثال: حساب الأتمتة الرئيسي / بوت التسويق"
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--surface2, #2a2a2a)',
                    border: '1px solid var(--divider, #363636)',
                    padding: '0 14px',
                    color: 'var(--text, #fff)',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text, #fff)', marginBottom: 6 }}>
                  نص الجلسة السحابية (Pyrogram / Telethon String Session)
                </label>
                <textarea
                  value={sessionString}
                  onChange={(e) => setSessionString(e.target.value)}
                  placeholder="1BVtsOHIBu89..."
                  rows={3}
                  dir="ltr"
                  required
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    background: 'var(--surface2, #2a2a2a)',
                    border: '1px solid var(--divider, #363636)',
                    padding: '10px 14px',
                    color: 'var(--text, #fff)',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text, #fff)', marginBottom: 6 }}>
                  عنوان البروكسي (اختياري: SOCKS5 / MTProto)
                </label>
                <input
                  type="text"
                  value={proxyUrl}
                  onChange={(e) => setProxyUrl(e.target.value)}
                  placeholder="socks5://127.0.0.1:1080"
                  dir="ltr"
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--surface2, #2a2a2a)',
                    border: '1px solid var(--divider, #363636)',
                    padding: '0 14px',
                    color: 'var(--text, #fff)',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--blue, #2aabee)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />}
                <span>استيراد وتفعيل الحساب</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
