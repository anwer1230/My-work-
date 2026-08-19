import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Zap,
  Lock,
  Globe,
  FileText,
  ShieldCheck,
  Radio,
  Server,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Smartphone,
  Send,
  Database,
  Eye,
} from 'lucide-react';
import {
  mtprotoService,
  TELEGRAM_DATACENTERS,
  TelegramDataCenter,
  MTProtoSequenceState,
  GapResolutionState,
  CloudDraft,
} from '../lib/mtprotoService';

interface MTProtoSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChatTitle?: string;
  activeChatId?: number | null;
}

export const MTProtoSyncModal: React.FC<MTProtoSyncModalProps> = ({
  isOpen,
  onClose,
  activeChatTitle,
  activeChatId,
}) => {
  const [activeTab, setActiveTab] = useState<'sequence' | 'drafts' | 'datacenters' | 'e2ee' | 'push'>('sequence');
  const [sequenceState, setSequenceState] = useState<MTProtoSequenceState>(mtprotoService.getSequenceState());
  const [gapState, setGapState] = useState<GapResolutionState>(mtprotoService.getGapState());
  const [activeDC, setActiveDC] = useState<TelegramDataCenter>(mtprotoService.getActiveDC());
  const [drafts, setDrafts] = useState<CloudDraft[]>(mtprotoService.getAllCloudDrafts());
  const [testDraftText, setTestDraftText] = useState('');
  const [isSimulatingGap, setIsSimulatingGap] = useState(false);
  const [syncLog, setSyncLog] = useState<Array<{ time: string; msg: string; type: 'info' | 'warn' | 'success' }>>([
    { time: new Date().toLocaleTimeString('ar-EG'), msg: 'تم إنشاء جلسة MTProto 2.0 المشفرة بنجاح عبر TLS 1.3', type: 'success' },
    { time: new Date().toLocaleTimeString('ar-EG'), msg: 'الاتصال المستمر مع خادم MTProto عبر WebSocket نشط (Keep-Alive 15s)', type: 'info' },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    // Refresh state periodically & subscribe to MTProto events
    const unsubscribe = mtprotoService.subscribe((event, data) => {
      if (event === 'sequence_updated' || event === 'connected') {
        setSequenceState(mtprotoService.getSequenceState());
        setGapState(mtprotoService.getGapState());
      } else if (event === 'gap_detected') {
        setGapState(data);
        addLog(`⚠️ تم اكتشاف فجوة في تسلسل الرسائل! PTS المتوقع: ${data.expectedPts}، المستلم: ${data.receivedPts}. جارٍ الانتظار (500ms)...`, 'warn');
      } else if (event === 'gap_resolving') {
        setGapState(data);
        addLog(`🔄 جارٍ استدعاء updates.getDifference لجلب التحديثات المفقودة من السحابة...`, 'info');
      } else if (event === 'gap_resolved') {
        setSequenceState(data.sequenceState);
        setGapState(data.gapState);
        addLog(`✅ تم إكمال المزامنة الفجوية واكتفاء المتسلسلة بنجاح عند PTS: ${data.sequenceState.pts}`, 'success');
      } else if (event === 'draft_updated' || event === 'draft_cleared') {
        setDrafts(mtprotoService.getAllCloudDrafts());
      } else if (event === 'dc_changed') {
        setActiveDC(data.dc);
        addLog(`🌐 تم تحويل التوجيه السحابي إلى مركز البيانات: ${data.dc.name} (${data.migrationCode})`, 'info');
      } else if (event === 'keep_alive_ping') {
        setSequenceState(mtprotoService.getSequenceState());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'success') => {
    setSyncLog((prev) => [
      { time: new Date().toLocaleTimeString('ar-EG'), msg, type },
      ...prev.slice(0, 19),
    ]);
  };

  if (!isOpen) return null;

  const handleSimulateGap = () => {
    setIsSimulatingGap(true);
    addLog('🧪 بدء محاكاة وصول حزمة بفجوة تسلسلية (+4 PTS)...', 'info');
    mtprotoService.simulateGapArrival(4);
    setTimeout(() => {
      setIsSimulatingGap(false);
    }, 1200);
  };

  const handleSaveTestDraft = () => {
    if (!activeChatId || !testDraftText.trim()) return;
    mtprotoService.saveCloudDraft(activeChatId, testDraftText);
    setDrafts(mtprotoService.getAllCloudDrafts());
    addLog(`📝 تم حفظ واستدعاء updateDraftMessage للمحادثة "${activeChatTitle || 'محادثة'}" عبر السحابة`, 'success');
    setTestDraftText('');
  };

  const handleSwitchDC = async (dcId: number) => {
    try {
      const newDc = await mtprotoService.switchDC(dcId);
      setActiveDC(newDc);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 z-50 select-none overflow-y-auto dir-rtl">
      <div className="bg-slate-900 border border-sky-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100 my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-2xl text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-white">
                  المزامنة السحابية وبنية MTProto 2.0 الفورية
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  سحابي 100%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إدارة التحديثات التسلسلية (PTS / QTS / SEQ)، معالجة الفجوات، المسودات السحابية ومراكز البيانات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Metrics Strip */}
        <div className="bg-slate-950/90 border-b border-slate-800/80 px-5 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs shrink-0">
          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">تسلسل المحادثات (PTS)</div>
              <div className="font-mono font-bold text-sky-400 text-sm">{sequenceState.pts}</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">التسلسل السري (QTS)</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">{sequenceState.qts}</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">تسلسل الحاوية (SEQ)</div>
              <div className="font-mono font-bold text-purple-400 text-sm">{sequenceState.seq}</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">المركز الحالي (Home DC)</div>
              <div className="font-bold text-amber-400 text-xs truncate">{activeDC.name.split(' - ')[0]} ({activeDC.pingMs}ms)</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 overflow-x-auto shrink-0 gap-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('sequence')}
            className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sequence'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>التسلسل ومعالجة الفجوات (PTS/SEQ)</span>
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'drafts'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>المسودات السحابية (Drafts)</span>
            {drafts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500 text-slate-950 font-bold">
                {drafts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('datacenters')}
            className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'datacenters'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>مراكز البيانات والتشفير (DC1 - DC5)</span>
          </button>

          <button
            onClick={() => setActiveTab('e2ee')}
            className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'e2ee'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>المحادثات السرية (Secret Chats)</span>
          </button>

          <button
            onClick={() => setActiveTab('push')}
            className={`px-4 py-3 font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'push'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>الاتصال الفوري والإشعارات</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
          {/* TAB 1: SEQUENCE & GAP RESOLUTION */}
          {activeTab === 'sequence' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-950/20 border border-sky-500/20 rounded-2xl space-y-2">
                <h3 className="font-bold text-sky-400 flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4" />
                  <span>آلية التسلسل الزمني الفوري (PTS, QTS, SEQ & Gap Resolution)</span>
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  يمنع تليجرام فقدان أو تكرار أو عدم ترتيب الرسائل أثناء التنقل عبر الشبكات الضعيفة باستخدام الطوابع المتسلسلة:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs mr-2">
                  <li><strong className="text-sky-300">PTS (Persistent Timestamp):</strong> يُحدد تسلسل رسائل وأحداث المحادثات العادية والمجموعات.</li>
                  <li><strong className="text-emerald-300">QTS (Query Timestamp):</strong> يُحدد تسلسل أحداث المحادثات السرية المشفرة.</li>
                  <li><strong className="text-purple-300">SEQ (Sequence Number):</strong> يُسلسل حاويات الحزم البرمجية العامة للحساب.</li>
                </ul>
              </div>

              {/* Status Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">حالة معالجة الفجوات (Gap Handling):</span>
                    {gapState.hasGap ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 animate-pulse" />
                        اكتشاف فجوة!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        المتسلسلة مكتملة ومستقرة
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-[11px] space-y-1 text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                    <div>• PTS المتوقع القادم: <span className="text-sky-400 font-bold">{gapState.expectedPts}</span></div>
                    <div>• أحدث PTS مستلم: <span className="text-emerald-400 font-bold">{sequenceState.pts}</span></div>
                    <div>• وضع معالجة الفجوات: <span className="text-amber-400 font-bold">{gapState.status}</span></div>
                    <div>• آخر مزامنة سحابية: <span className="text-slate-400">{gapState.lastSyncTime}</span></div>
                  </div>

                  <button
                    onClick={handleSimulateGap}
                    disabled={isSimulatingGap || gapState.hasGap}
                    className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSimulatingGap ? 'animate-spin' : ''}`} />
                    <span>محاكاة وصول حزمة بفجوة (Simulate Gap & updates.getDifference)</span>
                  </button>
                </div>

                {/* Live MTProto Protocol Terminal */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col h-56">
                  <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-sky-400" />
                    <span>سجل بروتوكول المزامنة المباشر (MTProto Log):</span>
                  </div>
                  <div className="flex-1 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[10px] overflow-y-auto space-y-1.5 scrollbar-thin">
                    {syncLog.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-slate-500 shrink-0">[{log.time}]</span>
                        <span className={log.type === 'warn' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-sky-300'}>
                          {log.msg}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLOUD DRAFTS */}
          {activeTab === 'drafts' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-950/20 border border-sky-500/20 rounded-2xl space-y-2">
                <h3 className="font-bold text-sky-400 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  <span>المزامنة السحابية للمسودات (updateDraftMessage)</span>
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  عند كتابة أي نص في أي محادثة على أي جهاز (هاتف، لابتوب، أو متصفح)، يرسل التطبيق حدث <code className="text-sky-300 font-mono">updateDraftMessage</code> إلى السحابة فوراً. يظهر النص المكتوب تلقائياً على كافة أجهزتك الأخرى في نفس اللحظة.
                </p>
              </div>

              {/* Test Draft Controller */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200">
                  اختبار إنشاء مسودة سحابية فورية للمحادثة النشطة:
                  <span className="text-sky-400 font-bold mr-2">[{activeChatTitle || 'محادثة عامة'}]</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testDraftText}
                    onChange={(e) => setTestDraftText(e.target.value)}
                    placeholder="اكتب مسودة للاختبار (مثال: أهلاً بك، وسأقوم بالرد لاحقاً...)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleSaveTestDraft}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>مزامنة المسودة</span>
                  </button>
                </div>
              </div>

              {/* Active Drafts List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>المسودات المحفوظة سحابياً على جميع الأجهزة ({drafts.length}):</span>
                </div>

                {drafts.length === 0 ? (
                  <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800/80 text-center text-slate-500 text-xs">
                    لا توجد مسودات سحابية معلقة حالياً. اكتب نصاً في صندوق الرسائل ليتم حفظه تلقائياً!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {drafts.map((draft) => (
                      <div key={draft.chatId} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-sky-400">محادثة ID: #{draft.chatId}</span>
                          <span className="text-slate-400">{draft.device}</span>
                        </div>
                        <p className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs">
                          "{draft.text}"
                        </p>
                        <div className="text-[10px] text-slate-500 text-left">
                          تم التحديث: {new Date(draft.updatedAt).toLocaleTimeString('ar-EG')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DATACENTERS & ENCRYPTION */}
          {activeTab === 'datacenters' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-950/20 border border-sky-500/20 rounded-2xl space-y-2">
                <h3 className="font-bold text-sky-400 flex items-center gap-2 text-sm">
                  <Server className="w-4 h-4" />
                  <span>شبكة مراكز البيانات العالمية وتشفير MTProto 2.0</span>
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  يتم تشفير جميع المحادثات السحابية باستخدام AES-256-IGE و SHA-256 مع مفتاح auth_key بطول 2048 بت الناتج عن تبادل Diffie-Hellman. تتوزع بيانات حسابك على 5 مراكز بيانات عالمية (Data Centers).
                </p>
              </div>

              {/* DataCenters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TELEGRAM_DATACENTERS.map((dc) => {
                  const isCurrent = dc.id === activeDC.id;
                  return (
                    <div
                      key={dc.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                        isCurrent
                          ? 'bg-sky-950/40 border-sky-500/50 shadow-lg shadow-sky-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className={`w-4 h-4 ${isCurrent ? 'text-sky-400' : 'text-slate-500'}`} />
                          <span className="font-bold text-slate-200">{dc.name}</span>
                        </div>
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500 text-slate-950 font-bold">
                            Home DC الحالي
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSwitchDC(dc.id)}
                            className="text-[11px] text-sky-400 hover:text-sky-300 font-bold underline"
                          >
                            تحويل المركز
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                        <div>• الموقع: <span className="text-slate-200">{dc.location}</span></div>
                        <div>• عنوان IP: <span className="font-mono text-slate-300">{dc.ip}</span></div>
                        <div>• زمن الاستجابة: <span className="font-bold text-emerald-400">{dc.pingMs}ms</span></div>
                        <div>• المنفذ: <span className="font-mono text-slate-300">{dc.port} WSS</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Encryption Info Box */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>المعلمات الأمنية لجلسة الاتصال الحالية:</span>
                </div>
                <div className="font-mono text-[11px] space-y-1 text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                  <div>• auth_key: <span className="text-emerald-400">{mtprotoService.getAuthKey() || 'auth_key_2048_dh_8f910a2c'}</span></div>
                  <div>• Session ID: <span className="text-sky-400">{mtprotoService.getSessionKey()}</span></div>
                  <div>• خوارزمية التشفير: <span className="text-purple-400 font-bold">AES-256-IGE + HMAC-SHA256</span></div>
                  <div>• الحماية ضد الهجمات: <span className="text-slate-400">Replay Attack Protection + Salt Validation</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECRET CHATS E2EE */}
          {activeTab === 'e2ee' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2">
                <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
                  <Lock className="w-4 h-4" />
                  <span>استثناء المحادثات السرية (Secret Chats End-to-End Encryption)</span>
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  المحادثات السرية هي الاستثناء الوحيد في تليجرام. تعتمد التشفير الكامل من النهاية إلى النهاية (E2EE) بين الجهازين فقط، ولا تُحفظ مفاتيح التشفير على خوادم تليجرام إطلاقاً ولا تُقاد عبر السحابة.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>مميزات المحادثات السرية (Secret Chats)</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-xs list-disc list-inside">
                    <li>عدم حفظ المفاتيح على الخوادم السحابية.</li>
                    <li>مؤقت تدمير ذاتي للرسائل (Self-Destruct Timer).</li>
                    <li>منع إعادة التوجيه (Forwarding Disabled).</li>
                    <li>التخزين المحلي على ذاكرة المتصفح المشفرة (IndexedDB).</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    <span>مقارنة مع المحادثات السحابية (Cloud Chats)</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-xs list-disc list-inside">
                    <li>مزامنة فورية عبر كافة الأجهزة والمنصات.</li>
                    <li>تخزين مشفر بقوة على شبكة مراكز البيانات.</li>
                    <li>إمكانية استعادة الرسائل والوسائط في أي وقت.</li>
                    <li>تنسيق المسودات السحابية التناوبية.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PUSH & KEEP ALIVE */}
          {activeTab === 'push' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-950/20 border border-sky-500/20 rounded-2xl space-y-2">
                <h3 className="font-bold text-sky-400 flex items-center gap-2 text-sm">
                  <Radio className="w-4 h-4" />
                  <span>الإشعارات الفورية بروتوكول Keep-Alive & Push (FCM / APNs)</span>
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  عندما يكون التطبيق مفتوحاً، يحافظ على اتصال مباشر عبر WebSocket مع خادم MTProto وتصل الرسائل بـ 0ms تأخير. وعندما يكون مغلقاً، يعتمد على خدمات FCM / APNs عبر VAPID لتنبيه المتصفح محلياً.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">حالة اتصال MTProto WebSocket المباشر:</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    متصل ونشط (Connected)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">فترة إشارة Keep-Alive:</div>
                    <div className="font-bold text-sky-400 mt-1">كل 15 ثانية (Ping/Pong)</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">خدمة الإشعارات الخلفية:</div>
                    <div className="font-bold text-emerald-400 mt-1">VAPID / Web Push PWA</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام مزامنة MTProto 2.0 نشط على كافة القنوات والسحابة</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
