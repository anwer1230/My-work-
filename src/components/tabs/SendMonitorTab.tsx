import React, { useState, useEffect, useRef } from 'react';

interface SendMonitorTabProps {
  onBack?: () => void;
  initialMessage?: string;
  initialGroups?: string[];
  initialWatchWords?: string[];
}

export const SendMonitorTab: React.FC<SendMonitorTabProps> = ({
  onBack,
  initialMessage = '',
  initialGroups = [],
  initialWatchWords = [],
}) => {
  // State management matching exact HTML specifications
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isMonitoringPaused, setIsMonitoringPaused] = useState(false);
  const [messageText, setMessageText] = useState(() => {
    try {
      const saved = localStorage.getItem('tg_tab_send_msg');
      if (saved !== null) return saved;
    } catch (_) {}
    return initialMessage;
  });
  const [groupsInput, setGroupsInput] = useState(() => {
    try {
      const saved = localStorage.getItem('tg_tab_send_groups');
      if (saved !== null) return saved;
    } catch (_) {}
    return initialGroups.join('\n');
  });
  const [allGroupsSelected, setAllGroupsSelected] = useState(() => {
    try {
      return localStorage.getItem('tg_tab_send_all_grps') === 'true';
    } catch (_) {
      return false;
    }
  });
  const [sendType, setSendType] = useState<'manual' | 'scheduled'>(() => {
    try {
      const saved = localStorage.getItem('tg_tab_send_type');
      if (saved === 'scheduled' || saved === 'manual') return saved;
    } catch (_) {}
    return 'manual';
  });
  const [sendSmart, setSendSmart] = useState<'smart' | 'normal'>('smart');
  const [intervalMinutes, setIntervalMinutes] = useState(25);
  const [scheduleDuration, setScheduleDuration] = useState(0);
  const [watchWords, setWatchWords] = useState(() => {
    try {
      const saved = localStorage.getItem('tg_tab_send_watchwords');
      if (saved !== null) return saved;
    } catch (_) {}
    return initialWatchWords.join('\n');
  });
  const [selectedOption, setSelectedOption] = useState<'salam' | 'skip' | 'smart' | 'always' | 'off'>('salam');
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; data: string; type: string }>>([]);
  const [isSending, setIsSending] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tg_tab_send_msg', messageText);
      localStorage.setItem('tg_tab_send_groups', groupsInput);
      localStorage.setItem('tg_tab_send_all_grps', String(allGroupsSelected));
      localStorage.setItem('tg_tab_send_type', sendType);
      localStorage.setItem('tg_tab_send_watchwords', watchWords);
    } catch (_) {}
  }, [messageText, groupsInput, allGroupsSelected, sendType, watchWords]);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; message: string }>>([
    {
      id: 'init',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: '● النظام جاهز',
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      ...prev.slice(-49),
      { id: `${Date.now()}_${Math.random()}`, time, message: msg },
    ]);
  };

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
      setTimeout(() => ctx.close(), 300);
    } catch (e) {
      // Ignored if browser blocks autoplay
    }
  };

  // Scroll log automatically
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  // Initialize and load saved settings / status
  useEffect(() => {
    addLog('🚀 واجهة الإرسال والمراقبة جاهزة');

    // Fetch initial status
    fetch('/api/get_login_status')
      .then((r) => r.json())
      .then((data) => {
        if (data.is_running) {
          setIsMonitoring(true);
          addLog('🔄 المراقبة تعمل بالفعل');
        }
      })
      .catch(() => {});

    fetch('/api/get_stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.sent !== undefined) {
          addLog(`📊 مرسل: ${data.sent} | أخطاء: ${data.errors || 0}`);
        }
      })
      .catch(() => {});

    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.settings) {
          if (data.settings.message) setMessageText(data.settings.message);
          if (data.settings.groups && data.settings.groups.length > 0) {
            setGroupsInput(data.settings.groups.join('\n'));
          }
          if (data.settings.watch_words && data.settings.watch_words.length > 0) {
            setWatchWords(data.settings.watch_words.join('\n'));
          }
          if (data.settings.interval_seconds) {
            setIntervalMinutes(Math.floor(data.settings.interval_seconds / 60) || 25);
          }
          if (data.settings.schedule_duration_hours) {
            setScheduleDuration(data.settings.schedule_duration_hours);
          }
          if (data.settings.sanitize_mode) {
            setSelectedOption(data.settings.sanitize_mode);
          }
          if (data.settings.send_type) {
            setSendType(data.settings.send_type);
          }
        }
      })
      .catch(() => {});

    // Listen to real-time events via EventSource SSE
    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'log_update' && payload.data?.message) {
          addLog(payload.data.message);
        } else if (payload.type === 'new_alert' && payload.data) {
          addLog(`🚨 تنبيه: "${payload.data.keyword}" في ${payload.data.group}`);
          playBeep();
        } else if (payload.type === 'monitoring_status' && payload.data?.is_running !== undefined) {
          setIsMonitoring(payload.data.is_running);
        }
      } catch (e) {}
    };

    return () => {
      es.close();
    };
  }, []);

  // Handlers matching the prompt
  const toggleAllGroups = () => {
    const nextVal = !allGroupsSelected;
    setAllGroupsSelected(nextVal);
    addLog(nextVal ? '✅ تفعيل الإرسال لكل المجموعات' : '⏹ إلغاء اختيار الكل');
  };

  const selectOption = (val: 'salam' | 'skip' | 'smart' | 'always' | 'off') => {
    setSelectedOption(val);
    const names: Record<string, string> = {
      salam: 'ذكي (salam)',
      skip: 'تخطي',
      smart: 'ذكية',
      always: 'تنقية',
      off: 'معطل',
    };
    addLog(`🛡️ وضع: ${names[val] || val}`);
  };

  const toggleSchedule = (type: 'manual' | 'scheduled') => {
    setSendType(type);
    addLog(type === 'scheduled' ? '⏰ تفعيل الإرسال المجدول' : '📌 الإرسال اليدوي');
  };

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        addLog(`⚠️ ${file.name} > 10MB، تم تخطيها`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImages((prev) => [
            ...prev,
            { name: file.name, data: e.target!.result as string, type: file.type },
          ]);
          addLog(`📷 رفع: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    addLog('🗑️ حذف صورة');
  };

  const saveSettings = async () => {
    const data = {
      message: messageText,
      groups: groupsInput,
      watch_words: watchWords,
      send_type: sendType,
      interval_seconds: (intervalMinutes || 25) * 60,
      schedule_duration_hours: scheduleDuration || 0,
      sanitize_mode: selectedOption,
      smart_send: sendSmart,
    };

    try {
      const res = await fetch('/api/save_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      addLog(result.success ? '✅ تم حفظ الإعدادات' : '❌ فشل الحفظ: ' + (result.message || 'خطأ'));
    } catch (err: any) {
      addLog('❌ خطأ: ' + err.message);
    }
  };

  const sendNow = async () => {
    const msg = messageText.trim();
    const grps = groupsInput.trim();
    const sendToAll = allGroupsSelected;

    if (!msg && uploadedImages.length === 0) {
      addLog('⚠️ اكتب رسالة أو ارفع صورة');
      return;
    }
    if (!sendToAll && !grps) {
      addLog('⚠️ حدد المجموعات أو اختر "كل المجموعات"');
      return;
    }

    setIsSending(true);
    addLog('⏳ جاري الإرسال...');

    try {
      const res = await fetch('/api/send_now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          groups: grps,
          send_to_all: sendToAll,
          images: uploadedImages,
          action: selectedOption,
          smart_send: sendSmart,
        }),
      });
      const data = await res.json();
      addLog(data.success ? '✅ ' + data.message : '❌ ' + (data.message || 'فشل الإرسال'));
      if (data.success) {
        setUploadedImages([]);
      }
    } catch (err: any) {
      addLog('❌ خطأ: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const startMonitoring = async () => {
    try {
      const res = await fetch('/api/start_monitoring', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsMonitoring(true);
        setIsMonitoringPaused(false);
        addLog('🚀 بدأت المراقبة');
      } else {
        addLog('❌ فشل البدء: ' + (data.message || 'خطأ'));
      }
    } catch (err: any) {
      addLog('❌ خطأ: ' + err.message);
    }
  };

  const togglePauseResumeMonitoring = async () => {
    if (isMonitoringPaused) {
      // Resume
      setIsMonitoringPaused(false);
      setIsMonitoring(true);
      await fetch('/api/start_monitoring', { method: 'POST' }).catch(() => {});
      addLog('▶️ تم استئناف المراقبة');
    } else {
      // Pause
      setIsMonitoringPaused(true);
      await fetch('/api/stop_monitoring', { method: 'POST' }).catch(() => {});
      addLog('⏸️ تم إيقاف المراقبة مؤقتاً');
    }
  };

  const stopMonitoring = async () => {
    try {
      const res = await fetch('/api/stop_monitoring', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsMonitoring(false);
        setIsMonitoringPaused(false);
        addLog('⏹ توقفت المراقبة تماماً');
      }
    } catch (err: any) {
      addLog('❌ خطأ: ' + err.message);
    }
  };

  const stopScheduledSend = () => {
    if (window.confirm('⚠️ إيقاف الإرسال المجدول فوراً؟')) {
      stopMonitoring();
    }
  };

  return (
    <div
      dir="rtl"
      className="w-full flex justify-center bg-[#f5f7fa] py-3 px-2 sm:px-4 text-[#1e2a3a] font-sans antialiased select-none rounded-2xl"
    >
      <div className="w-full max-w-[480px] bg-white min-h-[90vh] p-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.06)] border border-[#e9edf2] flex flex-col gap-2.5">
        
        {/* Header */}
        <div className="flex items-center gap-3 py-2 border-b border-[#e9edf2]">
          {onBack && (
            <button
              className="bg-transparent border-none text-[#5a6b7c] text-2xl cursor-pointer p-1 hover:text-blue-500 transition-colors leading-none"
              onClick={onBack}
              title="رجوع"
            >
              ‹
            </button>
          )}
          <h2 className="text-[#1e2a3a] text-lg m-0 font-semibold flex items-center gap-2">
            <span>📤</span> الإرسال والمراقبة
          </h2>
        </div>

        {/* حالة المراقبة */}
        <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2] flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full inline-block transition-colors ${
              isMonitoring
                ? 'bg-[#28a745] animate-[pulse_1.5s_infinite]'
                : 'bg-[#adb5bd]'
            }`}
          />
          <span className="text-sm font-medium text-[#1e2a3a]">
            {isMonitoring ? 'المراقبة: تعمل ✅' : 'المراقبة: متوقفة'}
          </span>
        </div>

        {/* الرسالة */}
        <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2]">
          <span className="text-[#5a6b7c] text-[13px] block mb-1 font-medium">📝 الرسالة</span>
          <textarea
            id="messageText"
            rows={3}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="اكتب الرسالة..."
            className="w-full p-2.5 rounded-lg border border-[#d9e0e8] bg-white text-[#1e2a3a] text-sm outline-none focus:border-[#2a92e7] focus:ring-2 focus:ring-[#2a92e7]/15 transition-all resize-y"
          />
        </div>

        {/* رفع الصور */}
        <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2]">
          <span className="text-[#5a6b7c] text-[13px] block mb-1 font-medium">📷 إضافة صور</span>
          <div
            className="border-2 border-dashed border-[#cdd5df] rounded-xl p-4 text-center cursor-pointer transition-all bg-[#fafbfc] hover:border-[#2a92e7] hover:bg-[#f0f7ff]"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fas fa-cloud-upload-alt text-3xl text-[#6c7a8a] mb-1.5 block" />
            <div className="text-[#2d3e4f] text-[13px] font-medium">اضغط لاختيار الصور</div>
            <div className="text-[#6c7a8a] text-[11px]">يدعم: JPG, PNG, GIF, WebP</div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImages(e.target.files)}
            />
          </div>

          {/* Image preview */}
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {uploadedImages.map((img, i) => (
                <div
                  key={i}
                  className="w-[60px] h-[60px] rounded-lg overflow-hidden relative bg-[#e9edf2] border border-[#d9e0e8]"
                >
                  <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#dc3545] text-white border-none text-[10px] flex items-center justify-center cursor-pointer shadow"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    title="حذف"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* المجموعات */}
        <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2]">
          <span className="text-[#5a6b7c] text-[13px] block mb-1 font-medium">👥 المجموعات</span>
          <textarea
            id="groupsInput"
            rows={3}
            value={groupsInput}
            onChange={(e) => setGroupsInput(e.target.value)}
            disabled={allGroupsSelected}
            placeholder="ضع روابط المجموعات (https://t.me/group أو t.me/+invite أو @username) أو أسماء المجموعات (كل مجموعة في سطر)..."
            className="w-full p-2.5 rounded-lg border border-[#d9e0e8] bg-white text-[#1e2a3a] text-sm outline-none focus:border-[#2a92e7] focus:ring-2 focus:ring-[#2a92e7]/15 transition-all disabled:opacity-50 disabled:bg-[#f1f3f6]"
          />
          <div className="flex items-center gap-2.5 mt-2">
            <div
              className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative shrink-0 ${
                allGroupsSelected ? 'bg-[#2a92e7]' : 'bg-[#cdd5df]'
              }`}
              onClick={toggleAllGroups}
            >
              <div
                className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                  allGroupsSelected ? '-translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-[#2d3e4f] text-[13px] font-medium">
              {allGroupsSelected ? '✅ تم اختيار كل المجموعات' : 'اختيار كل المجموعات'}
            </span>
          </div>
        </div>

        {/* نوع الإرسال + خيار إضافي (ذكي/عادي) */}
        <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2]">
          <span className="text-[#5a6b7c] text-[13px] block mb-1 font-medium">⏰ نوع الإرسال</span>
          <select
            id="sendType"
            value={sendType}
            onChange={(e) => toggleSchedule(e.target.value as any)}
            className="w-full p-2.5 rounded-lg border border-[#d9e0e8] bg-white text-[#1e2a3a] text-sm outline-none focus:border-[#2a92e7]"
          >
            <option value="manual">يدوي</option>
            <option value="scheduled">مجدول</option>
          </select>

          {/* الخيار الجديد: نوع الإرسال (ذكي/عادي) */}
          <div className="flex gap-3 items-center mt-2 flex-wrap">
            <span className="text-[13px] text-[#5a6b7c] font-medium">نوع الإرسال:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-[13px] text-[#2d3e4f] cursor-pointer">
                <input
                  type="radio"
                  name="sendSmart"
                  value="smart"
                  checked={sendSmart === 'smart'}
                  onChange={() => setSendSmart('smart')}
                  className="accent-[#2a92e7] w-4 h-4 cursor-pointer"
                />
                <span>ذكي</span>
              </label>
              <label className="flex items-center gap-1.5 text-[13px] text-[#2d3e4f] cursor-pointer">
                <input
                  type="radio"
                  name="sendSmart"
                  value="normal"
                  checked={sendSmart === 'normal'}
                  onChange={() => setSendSmart('normal')}
                  className="accent-[#2a92e7] w-4 h-4 cursor-pointer"
                />
                <span>عادي</span>
              </label>
            </div>
          </div>
        </div>

        {/* خيارات المجدول */}
        {sendType === 'scheduled' && (
          <div className="space-y-2">
            <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2]">
              <span className="text-[#5a6b7c] text-[13px] block mb-1 font-medium">⏱️ الفترة (دقائق)</span>
              <input
                type="number"
                min={1}
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-lg border border-[#d9e0e8] bg-white text-[#1e2a3a] text-sm outline-none focus:border-[#2a92e7]"
              />
            </div>
            <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2]">
              <span className="text-[#5a6b7c] text-[13px] block mb-1 font-medium">⏹️ يتوقف بعد (ساعات)</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={scheduleDuration}
                onChange={(e) => setScheduleDuration(parseFloat(e.target.value) || 0)}
                placeholder="0 = بدون حد"
                className="w-full p-2.5 rounded-lg border border-[#d9e0e8] bg-white text-[#1e2a3a] text-sm outline-none focus:border-[#2a92e7]"
              />
              <div className="text-[11px] text-[#6c7a8a] mt-1">0 = يعمل حتى إيقاف يدوي</div>
            </div>
            <div className="bg-[#fff5f5] rounded-xl p-3.5 border border-[#dc3545]">
              <button
                className="w-full p-2.5 bg-[#dc3545] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                onClick={stopScheduledSend}
              >
                <i className="fas fa-stop-circle" />
                <span>إيقاف الإرسال المجدول</span>
              </button>
            </div>
          </div>
        )}

        {/* كلمات المراقبة */}
        <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2]">
          <span className="text-[#5a6b7c] text-[13px] block mb-1 font-medium">🔑 كلمات المراقبة</span>
          <textarea
            id="watchWords"
            rows={2}
            value={watchWords}
            onChange={(e) => setWatchWords(e.target.value)}
            placeholder="كلمة في كل سطر..."
            className="w-full p-2.5 rounded-lg border border-[#d9e0e8] bg-white text-[#1e2a3a] text-sm outline-none focus:border-[#2a92e7] transition-all resize-y"
          />
        </div>

        {/* وضع الحماية */}
        <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2]">
          <span className="text-[#5a6b7c] text-[13px] block mb-1.5 font-medium">🛡️ وضع المجموعات المحمية</span>
          <div className="grid grid-cols-2 gap-1.5">
            
            {/* salam */}
            <div
              className={`flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer border-2 transition-all ${
                selectedOption === 'salam'
                  ? 'border-[#2a92e7] bg-[#e9f2fb]'
                  : 'border-[#d9e0e8]'
              }`}
              onClick={() => selectOption('salam')}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedOption === 'salam' ? 'border-[#2a92e7]' : 'border-[#adb5bd]'
                }`}
              >
                {selectedOption === 'salam' && <div className="w-2 h-2 rounded-full bg-[#2a92e7]" />}
              </div>
              <div>
                <div className="text-xs text-[#1e2a3a] font-semibold">🤖 ذكي (salam)</div>
                <div className="text-[10px] text-[#6c7a8a]">أرسل السلام ثم عدّل</div>
              </div>
            </div>

            {/* skip */}
            <div
              className={`flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer border-2 transition-all ${
                selectedOption === 'skip'
                  ? 'border-[#2a92e7] bg-[#e9f2fb]'
                  : 'border-[#d9e0e8]'
              }`}
              onClick={() => selectOption('skip')}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedOption === 'skip' ? 'border-[#2a92e7]' : 'border-[#adb5bd]'
                }`}
              >
                {selectedOption === 'skip' && <div className="w-2 h-2 rounded-full bg-[#2a92e7]" />}
              </div>
              <div>
                <div className="text-xs text-[#1e2a3a] font-semibold">⏭️ تخطي</div>
                <div className="text-[10px] text-[#6c7a8a]">لا ترسل للمحمية</div>
              </div>
            </div>

            {/* smart */}
            <div
              className={`flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer border-2 transition-all ${
                selectedOption === 'smart'
                  ? 'border-[#2a92e7] bg-[#e9f2fb]'
                  : 'border-[#d9e0e8]'
              }`}
              onClick={() => selectOption('smart')}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedOption === 'smart' ? 'border-[#2a92e7]' : 'border-[#adb5bd]'
                }`}
              >
                {selectedOption === 'smart' && <div className="w-2 h-2 rounded-full bg-[#2a92e7]" />}
              </div>
              <div>
                <div className="text-xs text-[#1e2a3a] font-semibold">🧠 ذكية</div>
                <div className="text-[10px] text-[#6c7a8a]">تنقية الرسالة</div>
              </div>
            </div>

            {/* always */}
            <div
              className={`flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer border-2 transition-all ${
                selectedOption === 'always'
                  ? 'border-[#2a92e7] bg-[#e9f2fb]'
                  : 'border-[#d9e0e8]'
              }`}
              onClick={() => selectOption('always')}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedOption === 'always' ? 'border-[#2a92e7]' : 'border-[#adb5bd]'
                }`}
              >
                {selectedOption === 'always' && <div className="w-2 h-2 rounded-full bg-[#2a92e7]" />}
              </div>
              <div>
                <div className="text-xs text-[#1e2a3a] font-semibold">🛡️ تنقية</div>
                <div className="text-[10px] text-[#6c7a8a]">حذف الروابط دائماً</div>
              </div>
            </div>

            {/* off */}
            <div
              className={`col-span-2 flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer border-2 transition-all ${
                selectedOption === 'off'
                  ? 'border-[#dc3545] bg-[#fff5f5]'
                  : 'border-[#d9e0e8]'
              }`}
              onClick={() => selectOption('off')}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedOption === 'off' ? 'border-[#dc3545]' : 'border-[#adb5bd]'
                }`}
              >
                {selectedOption === 'off' && <div className="w-2 h-2 rounded-full bg-[#dc3545]" />}
              </div>
              <div>
                <div className="text-xs text-[#dc3545] font-semibold">🚫 معطّل</div>
                <div className="text-[10px] text-[#6c7a8a]">أرسل كما هي (خطر حظر)</div>
              </div>
            </div>

          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            className="w-full py-2.5 px-4 bg-[#2a92e7] hover:bg-blue-600 active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            onClick={sendNow}
            disabled={isSending}
          >
            <i className={`fas ${isSending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} />
            <span>{isSending ? 'جاري...' : 'إرسال الآن'}</span>
          </button>

          <button
            className="w-full py-2.5 px-4 bg-[#28a745] hover:bg-green-600 active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            onClick={saveSettings}
          >
            <i className="fas fa-save" />
            <span>حفظ</span>
          </button>

          {!isMonitoring ? (
            <button
              className="w-full py-2.5 px-4 bg-[#ffc107] hover:bg-amber-500 active:scale-[0.98] text-[#1e2a3a] font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm col-span-2"
              onClick={startMonitoring}
            >
              <i className="fas fa-play" />
              <span>بدء المراقبة التلقائية</span>
            </button>
          ) : (
            <>
              <button
                className={`w-full py-2.5 px-4 active:scale-[0.98] font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isMonitoringPaused
                    ? 'bg-[#28a745] hover:bg-green-600 text-white'
                    : 'bg-[#ffc107] hover:bg-amber-500 text-[#1e2a3a]'
                }`}
                onClick={togglePauseResumeMonitoring}
              >
                <i className={`fas ${isMonitoringPaused ? 'fa-play' : 'fa-pause'}`} />
                <span>{isMonitoringPaused ? '▶️ استئناف المراقبة' : '⏸️ إيقاف مؤقت'}</span>
              </button>

              <button
                className="w-full py-2.5 px-4 bg-[#dc3545] hover:bg-red-700 active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                onClick={stopMonitoring}
              >
                <i className="fas fa-stop" />
                <span>⏹️ إيقاف كامل</span>
              </button>
            </>
          )}
        </div>

        {/* سجل العمليات */}
        <div className="bg-[#f8f9fc] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e9edf2] mt-1">
          <span className="text-[#5a6b7c] text-[13px] block mb-1 font-medium">📋 سجل العمليات</span>
          <div
            ref={logBoxRef}
            className="bg-[#f1f3f6] rounded-lg p-2.5 min-h-[100px] max-h-[150px] overflow-y-auto text-[13px] text-[#2d3e4f] space-y-1 font-mono"
          >
            {logs.map((item) => (
              <div key={item.id} className="py-0.5 border-b border-black/[0.03] text-xs">
                <span className="text-[#6c7a8a] ml-1">[{item.time}]</span>
                <span>{item.message}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
