import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  Bot,
  Settings as SettingsIcon,
  Search,
  Zap,
  Award,
  BookOpen,
  Presentation,
  Send,
  Sparkles,
  Layers,
  BarChart3,
  CheckCircle,
  Play,
  FileText,
  Radio,
  ArrowRight,
  TrendingUp,
  Cpu,
  Flame,
  ShieldCheck,
  Bell,
  RefreshCw,
  Plus,
  FileUp,
  Brain,
  Edit3,
  CreditCard,
  Sliders
} from 'lucide-react';
import { Chat, UserProfile } from '../types';
import { AutomationTab } from './AutomationAIModal';
import { CardLoginModal } from './CardLoginModal';

interface EnjazProDashboardProps {
  userProfile: UserProfile;
  chats: Chat[];
  onSelectChat: (chatId: string | number) => void;
  selectedChatId: string | number | null;
  onOpenAutomation: (tab?: AutomationTab) => void;
  onOpenAcademic: () => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
  onOpenSystemMonitor: () => void;
  onLogout: () => void;
  onOpenDrawer?: () => void;
}

export const EnjazProDashboard: React.FC<EnjazProDashboardProps> = ({
  userProfile,
  chats,
  onSelectChat,
  selectedChatId,
  onOpenAutomation,
  onOpenAcademic,
  onOpenSettings,
  onOpenPrivacy,
  onOpenSystemMonitor,
  onLogout,
  onOpenDrawer,
}) => {
  // Navigation tabs: 'features' (المميزات) | 'academic' (التحليل الأكاديمي) | 'autoreply' (الرد الآلي) | 'chats' (المحادثات)
  const [activeMainView, setActiveMainView] = useState<'features' | 'academic' | 'autoreply'>('features');
  const [activeRailTab, setActiveRailTab] = useState<'chats' | 'groups' | 'ai' | 'settings' | 'features'>('features');
  const [mobileTab, setMobileTab] = useState<'chats' | 'features' | 'settings'>('features');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time counter & Stats
  const [messagesCount, setMessagesCount] = useState(1402);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);
  const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState(true);
  
  // Card Login Modal State
  const [isCardLoginOpen, setIsCardLoginOpen] = useState(false);

  // Academic Groq File State
  const [academicFile, setAcademicFile] = useState<File | null>(null);
  const [isAnalyzingGroq, setIsAnalyzingGroq] = useState(false);
  const [groqAnalysisResult, setGroqAnalysisResult] = useState<string | null>(null);

  // Auto Reply Rules
  const [replyRules, setReplyRules] = useState([
    {
      id: 1,
      tags: ['#سعر', '#تفاصيل', '#تكلفة'],
      text: 'أهلاً بك في مركز سرعة إنجاز! أسعار الخدمات والبحوث تبدأ من 50 ريال وفق متطلباتك، يمكنك إرسال التفاصيل أو الطلب المباشر عبر الرابط.',
      enabled: true,
    },
    {
      id: 2,
      tags: ['#بوربوينت', '#عروض_تقديمية', '#PPTX'],
      text: 'مرحباً! نقوم بإعداد عروض بوربوينت أكاديمية واحترافية متوافقة مع معايير الجامعات وتنسيق جذاب مع إرفاق الملاحظات للمقدم.',
      enabled: true,
    },
    {
      id: 3,
      tags: ['#SPSS', '#تحليل_إحصائي'],
      text: 'أهلاً بك! لدينا فريق متخصص في التحليل الإحصائي عبر SPSS وجداول الاستبانة مع التعليق وتفسير الفرضيات.',
      enabled: true,
    }
  ]);

  // Stories simulation
  const stories = [
    { id: 1, name: 'أبو مالك', initial: 'أ', border: 'border-[#00D1FF]' },
    { id: 2, name: 'سارة أبحاث', initial: 'س', border: 'border-purple-500' },
    { id: 3, name: 'دعم إنجاز', initial: 'إ', border: 'border-emerald-500' },
    { id: 4, name: 'مكتبة البحوث', initial: 'م', border: 'border-orange-500' },
  ];

  // Auto increment simulated message traffic
  useEffect(() => {
    const interval = setInterval(() => {
      setMessagesCount((prev) => prev + Math.floor(Math.random() * 2));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleGroqAnalyze = () => {
    setIsAnalyzingGroq(true);
    setGroqAnalysisResult(null);

    setTimeout(() => {
      setIsAnalyzingGroq(false);
      setGroqAnalysisResult(
        `✅ تم التلخيص والتحليل بواسطة محرك Groq AI (V3.5 Turbo):\n` +
        `• عنوان الدراسة: التحليل الاستراتيجي وتطوير الكفاءة التشغيلية 2026\n` +
        `• المنهجية: منهج وصفي تحليلي مع عينة استبانة (N=240)\n` +
        `• أبرز النتائج: زيادة الكفاءة بنسبة 34.2% عند تطبيق الأتمتة المباشرة وتخفيض زمن الاستجابة إلى 1.2 ثانية.\n` +
        `• التوثيق المقترح (APA 7th): Al-Otaibi, M. (2026). Strategic Optimization in Academic Computing. Journal of Educational Tech.`
      );
    }, 1500);
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.username && c.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen w-full flex overflow-hidden relative bg-[#121421] text-[#e5e2e1] select-none" dir="rtl">
      
      {/* ================= الإضاءة المحيطة (Ambient Glow) ================= */}
      <div className="ambient-glow -top-20 -right-20 pointer-events-none" />
      <div
        className="ambient-glow -bottom-20 -left-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(123, 97, 255, 0.06) 0%, rgba(18, 20, 33, 0) 70%)',
        }}
      />

      {/* ================= 1. شريط المجلدات (Folders Rail) ================= */}
      <aside className="hidden lg:flex flex-col items-center py-4 w-16 border-l border-white/10 bg-black/25 z-40 shrink-0 select-none">
        
        {/* Logo Bolt / Icon with Pulse Glow */}
        <div
          onClick={() => {
            setActiveMainView('features');
            setActiveRailTab('features');
          }}
          className="w-10 h-10 bg-gradient-to-tr from-[#00D1FF] to-blue-600 rounded-xl flex items-center justify-center mb-6 pulse-active cursor-pointer shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
          title="مركز سرعة إنجاز"
        >
          <span className="material-symbols-outlined text-slate-950 font-bold text-2xl">bolt</span>
        </div>

        {/* Action Navigation Icons */}
        <nav className="flex flex-col gap-4">
          <button
            onClick={() => {
              setActiveMainView('features');
              setActiveRailTab('features');
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              activeMainView === 'features' ? 'text-[#00D1FF] bg-white/5' : 'text-slate-400 hover:text-white'
            }`}
            title="الرئيسية والمميزات"
          >
            <span className="material-symbols-outlined text-2xl">forum</span>
          </button>

          <button
            onClick={() => {
              setActiveMainView('academic');
              setActiveRailTab('ai');
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              activeMainView === 'academic' ? 'text-[#00D1FF] bg-white/5' : 'text-slate-400 hover:text-white'
            }`}
            title="التحليل الأكاديمي (بينتو جريد)"
          >
            <span className="material-symbols-outlined text-2xl">psychology</span>
          </button>

          <button
            onClick={() => {
              setActiveMainView('autoreply');
              setActiveRailTab('groups');
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              activeMainView === 'autoreply' ? 'text-[#00D1FF] bg-white/5' : 'text-slate-400 hover:text-white'
            }`}
            title="إعدادات الرد الآلي"
          >
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
          </button>

          <button
            onClick={() => setIsCardLoginOpen(true)}
            className="p-2 text-yellow-400 hover:text-yellow-300 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="تفعيل بطاقة الشحن"
          >
            <span className="material-symbols-outlined text-2xl">key</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="الإعدادات"
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </nav>

        {/* Bottom Status Dot */}
        <div className="mt-auto flex flex-col items-center gap-3">
          <button
            onClick={onOpenSystemMonitor}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-[#00D1FF] transition-all"
            title="مراقبة النظام"
          >
            <span className="material-symbols-outlined text-lg">monitoring</span>
          </button>
        </div>
      </aside>

      {/* ================= 2. قائمة المحادثات (Sidebar الوسط) ================= */}
      <section className="w-80 lg:w-96 border-l border-white/10 flex flex-col bg-black/10 z-30 shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              {onOpenDrawer && (
                <button
                  onClick={onOpenDrawer}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-[#00D1FF] hover:bg-white/10 transition-colors"
                  title="القائمة الجانبية لتليجرام"
                >
                  <span className="material-symbols-outlined text-xl">menu</span>
                </button>
              )}
              <span className="text-xl font-bold text-white tracking-tight">المحادثات</span>
            </div>
            <button
              onClick={() => onOpenAutomation('send_monitor')}
              className="p-1.5 rounded-lg bg-white/5 text-[#00D1FF] hover:bg-white/10 transition-colors"
              title="مراقبة المجموعات"
            >
              <span className="material-symbols-outlined text-xl">edit_square</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="bg-white/5 rounded-full px-4 py-2 flex items-center gap-2 border border-white/10 focus-within:border-[#00D1FF] transition-all">
            <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المحادثات والرسائل..."
              className="bg-transparent outline-none text-xs text-white w-full placeholder-slate-400"
            />
          </div>
        </div>

        {/* Stories Bar (شريط القصص) */}
        <div className="flex gap-3 p-3 overflow-x-auto no-scrollbar border-b border-white/10 shrink-0">
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => onOpenAutomation('send_monitor')}
              className={`min-w-[54px] h-[54px] rounded-full border-2 ${story.border} p-0.5 cursor-pointer hover:scale-105 transition-transform shrink-0`}
              title={story.name}
            >
              <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center font-bold text-sm text-white">
                {story.initial}
              </div>
            </div>
          ))}
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          
          {/* Pinned / Active Match Item */}
          <div
            onClick={() => onOpenAutomation('send_monitor')}
            className="p-3 rounded-2xl flex items-center gap-3 sidebar-active cursor-pointer glass transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 shadow-md shadow-blue-500/20">
              م
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-bold text-white text-sm">مراقب المجموعات</span>
                <span className="text-[11px] text-slate-400">12:00 م</span>
              </div>
              <p className="text-xs text-[#00D1FF] truncate">تم العثور على 5 كلمات مفتاحية...</p>
            </div>
          </div>

          {filteredChats.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            const avatarInitial = chat.title.trim().charAt(0) || 'س';

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'sidebar-active glass'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                  {avatarInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-white text-sm truncate">{chat.title}</span>
                    <span className="text-[11px] text-slate-400">
                      {chat.last_message ? new Date(chat.last_message.date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'أمس'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {chat.last_message?.content.text || 'تم تفعيل الخدمة بنجاح'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 3. منطقة المحتوى الرئيسية (Main) ================= */}
      <main className="flex-1 relative flex flex-col overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#121421]/80 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className="font-bold text-base text-white">مركز سرعة إنجاز</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              متصل
            </span>
          </div>

          {/* Quick Sub-Navigation Pills */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveMainView('features')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainView === 'features' ? 'bg-[#00D1FF] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              الرئيسية والمميزات
            </button>
            <button
              onClick={() => setActiveMainView('academic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainView === 'academic' ? 'bg-[#00D1FF] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              التحليل الأكاديمي
            </button>
            <button
              onClick={() => setActiveMainView('autoreply')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainView === 'autoreply' ? 'bg-[#00D1FF] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              الرد الآلي
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCardLoginOpen(true)}
              className="glass px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-yellow-400 hover:bg-white/10 transition-all border-yellow-500/30"
            >
              <span className="material-symbols-outlined text-base">workspace_premium</span>
              <span>بطاقة الشحن</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
          </div>
        </header>

        {/* Content Body based on activeMainView */}
        <div className="flex-1 p-6 md:p-8">
          
          {/* VIEW 1: الرئيسية ولوحة المميزات البينتو */}
          {activeMainView === 'features' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              {/* Header Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">لوحة المميزات</h1>
                <p className="text-slate-400 text-sm mt-1">مرحباً بك في نظام "سرعة إنجاز" المتكامل لإدارة التليجرام والأتمتة الذكية</p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* كرت كبير: مراقب الكلمات المفتاحية */}
                <div
                  onClick={() => onOpenAutomation('send_monitor')}
                  className="md:col-span-2 glass p-6 relative overflow-hidden group hover:border-[#00D1FF]/50 transition-all cursor-pointer rounded-2xl shadow-xl shadow-black/20"
                >
                  <div className="flex justify-between items-start z-10 relative">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00D1FF] transition-colors flex items-center gap-2">
                        <span>مراقب الكلمات المفتاحية</span>
                        <span className="material-symbols-outlined text-sm text-[#00D1FF]">arrow_forward</span>
                      </h3>
                      <p className="text-slate-400 text-sm max-w-md">
                        النظام يعمل حالياً على مراقبة <span className="text-[#00D1FF] font-bold">45 مجموعة تليجرام</span> بحثاً عن طلبات الخدمات والأبحاث.
                      </p>
                    </div>
                    <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span>نشط الآن</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-end gap-1.5 h-16 w-full">
                    {[40, 65, 30, 85, 55, 95, 75, 60, 90, 100, 70, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/5 rounded-t-md relative overflow-hidden h-full flex items-end">
                        <div
                          className="w-full bg-[#00D1FF] rounded-t-md transition-all duration-700 group-hover:opacity-80"
                          style={{ height: `${h}%`, opacity: 0.2 + (i / 12) * 0.4 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* كرت الإحصائيات */}
                <div
                  onClick={() => onOpenAutomation('send_monitor')}
                  className="glass p-6 rounded-2xl flex flex-col justify-center items-center text-center gap-2 group hover:border-[#00D1FF]/50 transition-all cursor-pointer shadow-xl shadow-black/20"
                >
                  <span className="text-4xl sm:text-5xl font-black text-[#00D1FF] font-mono">
                    {messagesCount.toLocaleString('ar-EG')}
                  </span>
                  <span className="text-slate-400 text-sm font-semibold">رسالة مرسلة اليوم</span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    +18.4% نمو النشاط اليومي
                  </span>
                </div>

                {/* كرت: التحليل الأكاديمي */}
                <div
                  onClick={() => setActiveMainView('academic')}
                  className="glass p-6 rounded-2xl border-r-4 border-r-purple-500 group cursor-pointer hover:bg-purple-500/5 transition-all shadow-xl shadow-black/20"
                >
                  <span className="material-symbols-outlined text-purple-400 text-4xl mb-3">menu_book</span>
                  <h4 className="text-lg font-bold text-white">التحليل الأكاديمي</h4>
                  <p className="text-slate-400 text-sm mt-2">استخراج الجداول والبيانات وصياغة المراجع من ملفات PDF بذكاء.</p>
                </div>

                {/* كرت: منشئ العروض PPTX */}
                <div
                  onClick={onOpenAcademic}
                  className="glass p-6 rounded-2xl border-r-4 border-r-orange-500 group cursor-pointer hover:bg-orange-500/5 transition-all shadow-xl shadow-black/20"
                >
                  <span className="material-symbols-outlined text-orange-400 text-4xl mb-3">present_to_all</span>
                  <h4 className="text-lg font-bold text-white">عروض PPTX</h4>
                  <p className="text-slate-400 text-sm mt-2">تحويل النصوص والأفكار إلى شرائح احترافية فورياً.</p>
                </div>

                {/* كرت: الرد الذكي */}
                <div
                  onClick={() => setActiveMainView('autoreply')}
                  className="glass p-6 rounded-2xl border-r-4 border-r-emerald-500 group cursor-pointer hover:bg-emerald-500/5 transition-all shadow-xl shadow-black/20"
                >
                  <span className="material-symbols-outlined text-emerald-400 text-4xl mb-3">quickreply</span>
                  <h4 className="text-lg font-bold text-white">الرد الذكي</h4>
                  <p className="text-slate-400 text-sm mt-2">نظام تعلم ذاتي للرد على العملاء والطلاب بشكل طبيعي.</p>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 2: صفحة التحليل الأكاديمي (بينتو جريد ومحرك Groq AI) */}
          {activeMainView === 'academic' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">التحليل الأكاديمي المتقدم</h2>
                  <p className="text-slate-400 text-sm mt-0.5">معالجة وتلخيص الأوراق العلمية والبحوث بواسطة Groq AI V3.5 Turbo</p>
                </div>
                <button
                  onClick={() => setActiveMainView('features')}
                  className="text-xs text-[#00D1FF] hover:underline flex items-center gap-1"
                >
                  <span>العودة للرئيسية</span>
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* كرت التلخيص الذكي (Groq AI) */}
                <div className="md:col-span-2 glass p-6 rounded-2xl relative overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-[#00D1FF]">psychology</span>
                      <span>تلخيص ذكي (Groq AI)</span>
                    </h3>
                    <span className="text-[10px] bg-[#00D1FF]/20 text-[#00D1FF] px-2.5 py-1 rounded-md font-bold border border-[#00D1FF]/30">
                      V3.5 Turbo
                    </span>
                  </div>

                  {/* Drag & Drop Area */}
                  <label className="h-48 border-2 border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center bg-white/5 group hover:border-[#00D1FF]/50 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setAcademicFile(e.target.files[0]);
                      }}
                    />
                    <span className="material-symbols-outlined text-5xl text-slate-400 opacity-40 group-hover:scale-110 group-hover:text-[#00D1FF] transition-all">
                      upload_file
                    </span>
                    <p className="mt-2 text-sm text-slate-300 font-medium">
                      {academicFile ? `الملف المحدد: ${academicFile.name}` : 'اسحب ملف PDF هنا أو انقر للتصفح'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">يدعم ملفات PDF، DOCX، والرسائل الأكاديمية</p>
                  </label>

                  {groqAnalysisResult && (
                    <div className="mt-4 p-4 rounded-xl bg-blue-950/40 border border-[#00D1FF]/30 text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans">
                      {groqAnalysisResult}
                    </div>
                  )}

                  <button
                    onClick={handleGroqAnalyze}
                    disabled={isAnalyzingGroq}
                    className="w-full mt-6 bg-[#00D1FF] hover:bg-[#00D1FF]/90 active:scale-[0.99] text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAnalyzingGroq ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري المعالجة والتحليل عبر Groq AI...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                        <span>بدء المعالجة الذكية</span>
                      </>
                    )}
                  </button>
                </div>

                {/* كرت الإحصائيات الأكاديمية */}
                <div className="glass p-6 rounded-2xl flex flex-col justify-between shadow-2xl">
                  <div>
                    <h3 className="font-bold text-slate-300 text-base">المؤشرات الأكاديمية</h3>
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-4xl font-black text-[#00D1FF] font-mono">89%</span>
                        <span className="text-xs text-slate-400">دقة التحليل</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[89%] h-full bg-[#00D1FF]" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        بناءً على معالجة <span className="text-white font-bold">1,402 صفحة</span> بحثية ورسالة ماجستير هذا الشهر.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 space-y-2">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>مطابقة توثيق APA:</span>
                      <span className="text-emerald-400 font-bold">98.4%</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>استخراج الجداول بدقة:</span>
                      <span className="text-[#00D1FF] font-bold">94.1%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 3: صفحة إعدادات الرد الآلي (القواعد والتبديلات) */}
          {activeMainView === 'autoreply' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">إعدادات وقواعد الرد الآلي</h2>
                  <p className="text-slate-400 text-sm mt-0.5">تخصيص الردود الفورية للعملاء والطلاب حسب الكلمات والوسوم</p>
                </div>
                <button
                  onClick={() => setActiveMainView('features')}
                  className="text-xs text-[#00D1FF] hover:underline flex items-center gap-1"
                >
                  <span>العودة للرئيسية</span>
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
              </div>

              {/* Header Status Card with Toggle Switch */}
              <div className="glass p-5 rounded-2xl flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF]">
                    <span className="material-symbols-outlined text-2xl">smart_toy</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-white">تفعيل نظام الرد الآلي</h2>
                    <p className={`text-xs font-semibold ${isAutoReplyEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {isAutoReplyEnabled ? 'الخدمة نشطة ومستعدة للاستجابة الآن' : 'الخدمة متوقفة مؤقتاً'}
                    </p>
                  </div>
                </div>

                {/* مفتاح التبديل (Interactive Switch) */}
                <div
                  onClick={() => setIsAutoReplyEnabled(!isAutoReplyEnabled)}
                  className={`w-14 h-7 rounded-full relative p-1 cursor-pointer transition-colors duration-300 flex items-center ${
                    isAutoReplyEnabled ? 'bg-[#00D1FF]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-slate-950 rounded-full shadow-md transition-transform duration-300 ${
                      isAutoReplyEnabled ? 'translate-x-0' : '-translate-x-7'
                    }`}
                  />
                </div>
              </div>

              {/* قائمة القواعد التفاعلية */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-400">القواعد المبرمجة ({replyRules.length}):</span>
                  <button
                    onClick={() => onOpenAutomation('autoreply')}
                    className="text-xs text-[#00D1FF] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>+ إضافة قاعدة جديدة</span>
                  </button>
                </div>

                {replyRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="glass p-5 rounded-3xl border-r-4 border-[#00D1FF] relative shadow-lg hover:border-white/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-2">
                        {rule.tags.map((tag, tid) => (
                          <span key={tid} className="px-2.5 py-1 bg-white/5 text-[#00D1FF] rounded-lg text-xs font-mono font-bold border border-white/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => onOpenAutomation('autoreply')}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        title="تعديل القاعدة"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-200">
                      "{rule.text}"
                    </p>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* ================= الشريط السفلي للجوال ================= */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 glass !rounded-none border-t border-white/10 flex justify-around items-center px-4 z-[100] bg-[#121421]/95 backdrop-blur-xl">
          <button
            onClick={() => {
              setMobileTab('chats');
              if (chats.length > 0) onSelectChat(chats[0].id);
            }}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              mobileTab === 'chats' ? 'text-[#00D1FF]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl">chat</span>
            <span className="text-[9px] font-bold">المحادثات</span>
          </button>

          <button
            onClick={() => {
              setMobileTab('features');
              setActiveMainView('features');
            }}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              mobileTab === 'features' ? 'text-[#00D1FF]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl">grid_view</span>
            <span className="text-[9px] font-bold">المميزات</span>
          </button>

          <button
            onClick={() => setIsCardLoginOpen(true)}
            className="flex flex-col items-center gap-0.5 text-yellow-400 hover:text-yellow-300"
          >
            <span className="material-symbols-outlined text-xl">key</span>
            <span className="text-[9px] font-bold">البطاقة</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              mobileTab === 'settings' ? 'text-[#00D1FF]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="text-[9px] font-bold">الإعدادات</span>
          </button>
        </nav>

      </main>

      {/* ================= 4. شاشة تسجيل الدخول ببطاقة الشحن (Card Login Modal) ================= */}
      <CardLoginModal
        isOpen={isCardLoginOpen}
        onClose={() => setIsCardLoginOpen(false)}
        onSuccessAuth={(code) => {
          alert(`🎉 تم تفعيل بطاقة الدخول بنجاح برمز: ${code}`);
        }}
      />

    </div>
  );
};

