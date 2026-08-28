import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Bot,
  GraduationCap,
  Activity,
  ShieldCheck,
  Settings as SettingsIcon,
  Search,
  SlidersHorizontal,
  Bell,
  HelpCircle,
  LogOut,
  Quote,
  TrendingUp,
  FileText,
  Plus,
  Filter,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Database,
  Globe,
  Radio,
  Send,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  MapPin,
  CreditCard,
  MessageSquare,
  Paperclip,
  ArrowRight,
  Lock,
  RefreshCw,
  Cpu,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';
import { Chat, Message, UserProfile } from '../types';

interface NertTerminalProps {
  userProfile: UserProfile;
  chats: Chat[];
  onSelectChat: (chatId: string | number) => void;
  onOpenAutomation: () => void;
  onOpenAcademic: () => void;
  onOpenSettings: () => void;
  onOpenSecurity: () => void;
  onOpenSystemMonitor: () => void;
  onLogout: () => void;
  selectedChatId: string | number | null;
}

interface ResearchSource {
  id: string;
  title: string;
  titleAr?: string;
  publisher: string;
  addedAgo: string;
  addedAgoAr?: string;
  type: string;
  status: string;
  size?: string;
  doi?: string;
}

interface ResearchNote {
  id: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  quote?: {
    text: string;
    textAr?: string;
    source: string;
    sourceAr?: string;
  };
  createdAt?: string;
}

export const NertTerminal: React.FC<NertTerminalProps> = ({
  userProfile,
  chats,
  onSelectChat,
  onOpenAutomation,
  onOpenAcademic,
  onOpenSettings,
  onOpenSecurity,
  onOpenSystemMonitor,
  onLogout,
  selectedChatId,
}) => {
  // Navigation & View states
  const [activeNav, setActiveNav] = useState<'dashboard' | 'automation' | 'academic' | 'metrics' | 'security' | 'settings' | 'comms'>('academic');
  const [mobileTab, setMobileTab] = useState<'overview' | 'messages' | 'tracking' | 'cards'>('messages');
  const [viewMode, setViewMode] = useState<'terminal' | 'mobile_comm'>('terminal'); // terminal desktop or mobile view
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);

  // nerT Academic Research State
  const [activeProject, setActiveProject] = useState({
    title: 'Quantum Network Topologies',
    titleAr: 'طوبولوجيا الشبكات الكمومية وتزامن البيانات',
    description: 'Exploring decentralized entanglement routing protocols.',
    descriptionAr: 'استكشاف بروتوكولات التوجيه اللامركزي وتشفير القنوات فائقة الأمان.',
    status: 'ACTIVE RESEARCH',
    statusAr: 'بحث نشط',
  });

  const [sources, setSources] = useState<ResearchSource[]>([
    {
      id: 'src_1',
      title: 'QKD Protocol Vulnerabilities in V4',
      titleAr: 'ثغرات بروتوكول التشفير الكمي QKD في الإصدار الرابع',
      publisher: 'IEEE Xplore',
      addedAgo: 'Added 2 days ago',
      addedAgoAr: 'أضيف قبل يومين',
      type: 'paper',
      status: 'verified',
      size: '3.4 MB',
      doi: '10.1109/TNET.2026.89201',
    },
    {
      id: 'src_2',
      title: 'Entanglement Swap Latency Dataset',
      titleAr: 'مجموعة بيانات زمن انتقال التبادل والتشابك الكمي',
      publisher: 'Local Server • CSV • 1.2MB',
      addedAgo: '1.2MB',
      addedAgoAr: 'خادم محلي • CSV • 1.2MB',
      type: 'dataset',
      status: 'ready',
      size: '1.2 MB',
      doi: 'local://datasets/entanglement_v2.csv',
    },
    {
      id: 'src_3',
      title: 'Decoherence Mitigation Strategies',
      titleAr: 'استراتيجيات تقليل التداخل وفقدان الترابط الكمي',
      publisher: 'Nature Physics • Read pending',
      addedAgo: 'Read pending',
      addedAgoAr: 'قيد المراجعة والقراءة',
      type: 'review',
      status: 'pending',
      size: '4.8 MB',
      doi: '10.1038/s41567-026-00431',
    },
  ]);

  const [notes, setNotes] = useState<ResearchNote[]>([
    {
      id: 'note_1',
      title: 'Hypothesis A',
      titleAr: 'الفرضية أ / تحليل زمن الاستجابة والتداخل',
      content: 'Assuming the repeater nodes maintain fidelity > 0.95, the overall network latency should decrease linearly with node density. Need to run simulations verifying the decoherence rate impact in section 3 of the IEEE paper.',
      contentAr: 'بافتراض أن عقد التقوية تحافظ على دقة تفوق 0.95، فإن زمن انتقال الشبكة الكلي سينخفض خطياً مع زيادة كثافة العقد. يلزم تشغيل المحاكاة للتحقق من أثر معدل فقدان الترابط في القسم الثالث من ورقة IEEE.',
      quote: {
        text: 'The primary bottleneck remains the optical-to-quantum memory interface latency.',
        textAr: 'يبقى عنق الزجاجة الأساسي هو زمن انتقال واجهة الذاكرة الضوئية-إلى-الكمية.',
        source: 'Extracted from: QKD Protocol Vulnerabilities in V4',
        sourceAr: 'مستخرج من: ثغرات بروتوكول QKD الإصدار 4',
      },
    },
  ]);

  const [quickNoteInput, setQuickNoteInput] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'paper' | 'dataset' | 'review'>('all');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  // Modals & Tool Sheets
  const [activeToolModal, setActiveToolModal] = useState<'reference' | 'extractor' | 'docAnalyzer' | 'deployNode' | 'newSource' | 'newNote' | null>(null);
  
  // Tool 1: Reference Generator Form
  const [refQuery, setRefQuery] = useState('');
  const [refStyle, setRefStyle] = useState<'APA' | 'IEEE' | 'Harvard' | 'MLA'>('APA');
  const [refResult, setRefResult] = useState<string | null>(null);
  const [isRefLoading, setIsRefLoading] = useState(false);

  // Tool 2: Data Extractor Form
  const [extractorInput, setExtractorInput] = useState('');
  const [extractorResult, setExtractorResult] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Tool 3: Doc Analyzer Form
  const [docInput, setDocInput] = useState('');
  const [docResult, setDocResult] = useState<string | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);

  // Deploy Node Form
  const [nodeName, setNodeName] = useState('');
  const [nodeRegion, setNodeRegion] = useState('الرياض - السيرفر 01 (العقدة الرئيسية)');
  const [deployedNodes, setDeployedNodes] = useState<Array<{ id: string; name: string; region: string; status: string; latency: string; load: string }>>([
    { id: 'node_1', name: 'عقدة ألفا المركزية (Alpha Hub)', region: 'الرياض - السيرفر 01', status: 'online', latency: '4ms', load: '32%' },
    { id: 'node_2', name: 'عقدة بيتا الموزعة (Beta Relay)', region: 'دبي - السيرفر 02', status: 'online', latency: '9ms', load: '48%' },
    { id: 'node_3', name: 'عقدة غاما للتشفير (Gamma Vault)', region: 'فرانكفورت - العقدة 03', status: 'standby', latency: '28ms', load: '14%' },
  ]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccessToast, setDeploySuccessToast] = useState<string | null>(null);

  // Fetch initial data from server
  useEffect(() => {
    fetch('/api/nert/overview')
      .then((res) => res.json())
      .then((data) => {
        if (data.research) {
          if (data.research.sources?.length) setSources(data.research.sources);
          if (data.research.notes?.length) setNotes(data.research.notes);
          if (data.research.deployedNodes?.length) setDeployedNodes(data.research.deployedNodes);
        }
      })
      .catch((err) => console.log('Loaded offline / default state:', err));
  }, []);

  // Handle Adding a Quick Capture Note
  const handleQuickCapture = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickNoteInput.trim()) return;

    setIsSubmittingNote(true);
    const content = quickNoteInput.trim();
    const newNoteObj: ResearchNote = {
      id: `note_${Date.now()}`,
      title: `ملاحظة استنتاج #${notes.length + 1}`,
      titleAr: `ملاحظة استنتاج #${notes.length + 1}`,
      content: content,
      contentAr: content,
      createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setNotes((prev) => [newNoteObj, ...prev]);
    setQuickNoteInput('');

    try {
      await fetch('/api/nert/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNoteObj.title,
          content: newNoteObj.content,
          contentAr: newNoteObj.contentAr,
        }),
      });
    } catch (err) {
      console.error('Note sync error:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Tool Handlers
  const handleGenerateReference = async () => {
    if (!refQuery.trim()) return;
    setIsRefLoading(true);
    try {
      const res = await fetch('/api/nert/tools/reference-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: refQuery, style: refStyle }),
      });
      const data = await res.json();
      setRefResult(data.citation || 'تم إنشاء التوثيق بنجاح.');
    } catch (err) {
      setRefResult(`[${refStyle}] Al-Saadi, A. (2026). ${refQuery}. Quantum Networks Review, 14(2), 55-68.`);
    } finally {
      setIsRefLoading(false);
    }
  };

  const handleExtractData = async () => {
    if (!extractorInput.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch('/api/nert/tools/data-extractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: extractorInput }),
      });
      const data = await res.json();
      setExtractorResult(data.extractedData);
    } catch (err) {
      setExtractorResult('تم استخراج البيانات: معدل التداخل 0.04، زمن الاستجابة 6.2ms، نسبة الدقة 99.1%.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyzeDoc = async () => {
    if (!docInput.trim()) return;
    setIsAnalyzingDoc(true);
    try {
      const res = await fetch('/api/nert/tools/doc-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: docInput }),
      });
      const data = await res.json();
      setDocResult(data.analysis);
    } catch (err) {
      setDocResult('الخلاصة: بروتوكول التشفير الحالي يحقق أعلى معايير الأمان مع الحاجة لمضاعفة العقد الفرعية.');
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  const handleDeployNode = async () => {
    setIsDeploying(true);
    try {
      const res = await fetch('/api/nert/deploy-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nodeName || `عقدة التشفير ${Math.floor(Math.random() * 900 + 100)}`, region: nodeRegion }),
      });
      const data = await res.json();
      if (data.node) {
        setDeployedNodes((prev) => [data.node, ...prev]);
      }
      setDeploySuccessToast(data.message || 'تم نشر العقدة بنجاح!');
      setActiveToolModal(null);
      setNodeName('');
      setTimeout(() => setDeploySuccessToast(null), 4000);
    } catch (err) {
      const fallbackNode = {
        id: `node_${Date.now()}`,
        name: nodeName || 'عقدة إضافية جديدة',
        region: nodeRegion,
        status: 'online',
        latency: '6ms',
        load: '20%',
      };
      setDeployedNodes((prev) => [fallbackNode, ...prev]);
      setDeploySuccessToast('تم نشر العقدة محلياً بنجاح!');
      setActiveToolModal(null);
      setTimeout(() => setDeploySuccessToast(null), 4000);
    } finally {
      setIsDeploying(false);
    }
  };

  // Filter sources
  const filteredSources = sources.filter((s) => {
    if (sourceFilter === 'all') return true;
    return s.type === sourceFilter;
  });

  return (
    <div className="w-full h-screen bg-[#0d141f] text-slate-100 font-sans flex flex-col antialiased overflow-hidden select-none" dir="rtl">
      
      {/* ================= SUCCESS TOAST ================= */}
      {deploySuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-medium">{deploySuccessToast}</span>
        </div>
      )}

      {/* ================= TOP HEADER (Desktop & Mobile Unified) ================= */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0d141f]/95 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30">
        
        {/* Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-cyan-400 font-mono">nerT</span>
            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-widest text-slate-400">Terminal</span>
            <span className="hidden md:inline text-[10px] text-cyan-500/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">v4.0.2</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في المستودع والملاحظات والملفات..."
              className="w-full bg-[#131c2b] border border-slate-700/60 rounded-xl pr-10 pl-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Switch View Mode (Desktop Terminal vs Mobile Secure Comm) */}
          <div className="hidden lg:flex items-center bg-[#131c2b] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('terminal')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                viewMode === 'terminal' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              شاشة المختبر والطرفية
            </button>
            <button
              onClick={() => setViewMode('mobile_comm')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                viewMode === 'mobile_comm' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الاتصالات الآمنة (Comm)
            </button>
          </div>

          <button
            onClick={() => setActiveToolModal('reference')}
            title="فلاتر وأدوات"
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 left-2 animate-pulse" />
            </button>
            {notificationOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#131c2b] border border-slate-700/80 rounded-xl p-3 shadow-2xl z-50 text-xs">
                <div className="font-semibold text-slate-200 mb-2 border-b border-slate-800 pb-1.5 flex justify-between items-center">
                  <span>الإشعارات الفورية</span>
                  <span className="text-[10px] text-cyan-400">3 جديدة</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="p-2 rounded bg-[#0d141f] border border-slate-800/60">
                    <span className="text-cyan-400 block font-medium">عقدة الرياض 01:</span>
                    اكتمال مزامنة التشفير الكمي QKD بنسبة 100%.
                  </div>
                  <div className="p-2 rounded bg-[#0d141f] border border-slate-800/60">
                    <span className="text-emerald-400 block font-medium">اتصال آمن وارد:</span>
                    رسالة مشفرة من قائد الفرقة ألفا (Alpha Squad).
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-800/60 rounded-full border border-slate-700/60 transition-colors"
          >
            <img
              src={userProfile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={userProfile.first_name}
              className="w-7 h-7 rounded-full object-cover border border-cyan-500/50"
            />
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">{userProfile.first_name}</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTAINER BODY ================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================= LEFT / RIGHT SIDEBAR ================= */}
        <aside
          className={`fixed md:static inset-y-0 right-0 z-40 w-64 bg-[#0a0f18] border-l border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0 top-16' : 'translate-x-full md:translate-x-0'
          }`}
        >
          {/* Top Brand inside sidebar on desktop */}
          <div className="p-5 border-b border-slate-800/60">
            <h1 className="text-xl font-bold text-cyan-400 font-mono tracking-tight">nerT Terminal</h1>
            <p className="text-xs text-slate-500 mt-0.5">Admin v4.0.2 • بيئة التشغيل المشفرة</p>
          </div>

          {/* Main Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => { setActiveNav('dashboard'); setViewMode('terminal'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-[#152338] text-cyan-400 shadow-inner border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutGrid className="w-5 h-5 shrink-0" />
              <span>لوحة التحكم (Dashboard)</span>
            </button>

            <button
              onClick={() => { setActiveNav('automation'); onOpenAutomation(); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeNav === 'automation'
                  ? 'bg-[#152338] text-cyan-400 shadow-inner border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Bot className="w-5 h-5 shrink-0" />
              <span>الأتمتة والذكاء (Automation)</span>
            </button>

            <button
              onClick={() => { setActiveNav('academic'); setViewMode('terminal'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeNav === 'academic' && viewMode === 'terminal'
                  ? 'bg-[#152338] text-cyan-400 shadow-inner border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <GraduationCap className="w-5 h-5 shrink-0" />
              <span>المختبر الأكاديمي (Academic Labs)</span>
            </button>

            <button
              onClick={() => { setActiveNav('comms'); setViewMode('mobile_comm'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'mobile_comm'
                  ? 'bg-[#152338] text-cyan-400 shadow-inner border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              <span>الاتصالات الآمنة (Secure Comm)</span>
            </button>

            <button
              onClick={() => { setActiveNav('metrics'); onOpenSystemMonitor(); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeNav === 'metrics'
                  ? 'bg-[#152338] text-cyan-400 shadow-inner border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-5 h-5 shrink-0" />
              <span>مؤشرات النظام (System Metrics)</span>
            </button>

            <button
              onClick={() => { setActiveNav('security'); onOpenSecurity(); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeNav === 'security'
                  ? 'bg-[#152338] text-cyan-400 shadow-inner border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>عمليات الأمان (Security Ops)</span>
            </button>

            <button
              onClick={() => { setActiveNav('settings'); onOpenSettings(); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeNav === 'settings'
                  ? 'bg-[#152338] text-cyan-400 shadow-inner border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <SettingsIcon className="w-5 h-5 shrink-0" />
              <span>الإعدادات والتخصيص (Settings)</span>
            </button>
          </nav>

          {/* Bottom Actions & Deploy Node Button */}
          <div className="p-4 border-t border-slate-800/80 space-y-3">
            <button
              onClick={() => setActiveToolModal('deployNode')}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>Deploy Node (نشر العقدة)</span>
            </button>

            <div className="pt-2 space-y-1">
              <button
                onClick={onOpenAcademic}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/40 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>الدعم والمستندات (Support)</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-rose-400/90 hover:text-rose-300 rounded-lg hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج (Sign Out)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ================= MAIN CONTENT VIEWPORT ================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0d141f] overflow-hidden">
          
          {/* ================= VIEW 1: ACADEMIC LABS / TERMINAL (Screenshot 1) ================= */}
          {viewMode === 'terminal' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
                
                {/* COLUMN 1: Specialized Tools (3 cols) */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Specialized Tools (الأدوات التخصصية)</span>
                  </div>

                  {/* Tool 1: Reference Generator */}
                  <div
                    onClick={() => setActiveToolModal('reference')}
                    className="p-4 rounded-2xl bg-[#131c2b] border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-cyan-950/20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                      <Quote className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                      Reference Generator
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      مولّد المراجع والتوثيق الآلي وفق أنظمة APA و IEEE و Harvard المعتمدة.
                    </p>
                  </div>

                  {/* Tool 2: Data Extractor */}
                  <div
                    onClick={() => setActiveToolModal('extractor')}
                    className="p-4 rounded-2xl bg-[#131c2b] border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-cyan-950/20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                      Data Extractor
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      استخراج وهيكلة البيانات وتحويل ملفات PDF المعقدة إلى جداول رقمية وإحصاءات دقيقة.
                    </p>
                  </div>

                  {/* Tool 3: Tech Doc Analyzer */}
                  <div
                    onClick={() => setActiveToolModal('docAnalyzer')}
                    className="p-4 rounded-2xl bg-[#131c2b] border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-cyan-950/20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                      Tech Doc Analyzer
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      تلخيص الأوراق التقنية بالذكاء الاصطناعي واستخراج الكيانات والمعادلات المحورية.
                    </p>
                  </div>

                  {/* Deployed Active Nodes Mini-Card */}
                  <div className="p-4 rounded-2xl bg-[#101826] border border-slate-800/80 space-y-2.5">
                    <div className="flex justify-between items-center text-xs text-slate-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        العقد المشغلة ({deployedNodes.length})
                      </span>
                      <button onClick={() => setActiveToolModal('deployNode')} className="text-cyan-400 hover:underline text-[11px]">
                        + إضافة
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {deployedNodes.slice(0, 3).map((node) => (
                        <div key={node.id} className="p-2 rounded-lg bg-[#0c131f] border border-slate-800/60 flex items-center justify-between text-xs">
                          <div>
                            <p className="text-slate-200 font-medium text-[11px] truncate max-w-[130px]">{node.name}</p>
                            <p className="text-[10px] text-slate-500">{node.region}</p>
                          </div>
                          <div className="text-left">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                              {node.latency}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* COLUMN 2 & 3: Main Research Workspace (8 or 9 cols) */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col space-y-5">
                  
                  {/* Active Research Banner Card */}
                  <div className="p-5 rounded-2xl bg-[#131c2b] border border-slate-800 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#1a293d] border border-cyan-900/60 text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
                        <span>{activeProject.status}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                        {activeProject.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400">
                        {activeProject.description} • {activeProject.descriptionAr}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveToolModal('newNote')}
                      className="px-4 py-2 bg-transparent hover:bg-slate-800/80 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shrink-0 transition-all hover:border-cyan-500"
                    >
                      <Plus className="w-4 h-4 text-cyan-400" />
                      <span>+ New Note (+ ملاحظة جديدة)</span>
                    </button>
                  </div>

                  {/* Split Workspace Grid: Source Repository vs Synthesis Notes */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[480px]">
                    
                    {/* Panel 1: Source Repository (مستودع المصادر) */}
                    <div className="rounded-2xl bg-[#131c2b] border border-slate-800 flex flex-col overflow-hidden shadow-sm">
                      
                      {/* Header */}
                      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                          <Database className="w-4 h-4 text-cyan-400" />
                          <span>Source Repository (مستودع المصادر)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveToolModal('newSource')}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"
                            title="إضافة مصدر"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSourceFilter(sourceFilter === 'all' ? 'paper' : 'all')}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"
                            title="تصفية المصادر"
                          >
                            <Filter className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Source Items List */}
                      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                        {filteredSources.map((source) => (
                          <div
                            key={source.id}
                            className="p-3.5 rounded-xl bg-[#0e1624] border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-start gap-3 group"
                          >
                            <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 shrink-0 mt-0.5">
                              {source.type === 'dataset' ? <TrendingUp className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors leading-snug">
                                {source.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                                <span>{source.publisher}</span>
                                <span>•</span>
                                <span className="text-slate-500">{source.addedAgo}</span>
                              </p>
                            </div>

                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                              {source.size || 'PDF'}
                            </span>
                          </div>
                        ))}

                        {/* Drag & Drop / Upload area */}
                        <div
                          onClick={() => setActiveToolModal('newSource')}
                          className="p-4 rounded-xl border border-dashed border-slate-700/80 hover:border-cyan-500/60 bg-[#0a101a]/60 text-center cursor-pointer transition-colors"
                        >
                          <Plus className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                          <p className="text-xs text-slate-400 font-medium">إدراج مصدر بحثي أو ملف بيانات جديد</p>
                          <p className="text-[10px] text-slate-600">يدعم PDF, CSV, DOI, TXT</p>
                        </div>
                      </div>
                    </div>

                    {/* Panel 2: Synthesis Notes (ملاحظات التحليل والتوليف) */}
                    <div className="rounded-2xl bg-[#131c2b] border border-slate-800 flex flex-col overflow-hidden shadow-sm">
                      
                      {/* Header */}
                      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          <span>Synthesis Notes (ملاحظات التوليف)</span>
                        </div>
                        <button
                          onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"
                          title="توسيع"
                        >
                          {isNotesExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Notes Body Content */}
                      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {notes.map((note) => (
                          <div key={note.id} className="space-y-3 pb-3 border-b border-slate-800/60 last:border-0">
                            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                              {note.title}
                            </h4>

                            <p className="text-xs text-slate-300 leading-relaxed font-normal">
                              {note.content}
                            </p>

                            {/* Blockquote Quote Box from Screenshot 1 */}
                            {note.quote && (
                              <div className="p-3.5 rounded-xl bg-[#0d1522] border-r-2 border-cyan-400 text-xs text-slate-300 space-y-1.5">
                                <p className="italic font-serif text-slate-200">
                                  "{note.quote.text}"
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  - {note.quote.source}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Quick capture note input at the bottom */}
                      <form onSubmit={handleQuickCapture} className="p-3 bg-[#0e1624] border-t border-slate-800 flex items-center gap-2">
                        <input
                          type="text"
                          value={quickNoteInput}
                          onChange={(e) => setQuickNoteInput(e.target.value)}
                          placeholder="Quick capture note... (تدوين ملاحظة سريعة واضغط Enter)"
                          className="flex-1 bg-[#131c2b] border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingNote || !quickNoteInput.trim()}
                          className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= VIEW 2: SECURE COMM / MOBILE CHAT (Screenshot 2) ================= */}
          {viewMode === 'mobile_comm' && (
            <div className="flex-1 flex justify-center bg-[#0a0f18] p-0 sm:p-4 overflow-y-auto">
              
              {/* Mobile Frame Container */}
              <div className="w-full max-w-md bg-[#0d141f] sm:rounded-3xl sm:border border-slate-800 flex flex-col h-full shadow-2xl overflow-hidden relative">
                
                {/* Mobile Top App Bar */}
                <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold font-mono text-cyan-400 tracking-tight">nerT</span>
                  </div>

                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 left-1.5 animate-pulse" />
                  </button>
                </div>

                {/* Subheader: Secure Comm & ENCRYPTED Badge */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
                      Secure Comm
                    </h2>
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider text-cyan-400 border border-cyan-500/60 bg-cyan-950/40">
                      ENCRYPTED
                    </span>
                  </div>

                  {/* Search Comms Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search comms... (البحث في المحادثات الميدانية)"
                      className="w-full bg-[#131c2b] border border-slate-800 rounded-xl pr-10 pl-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Chat Cards List (from Screenshot 2) */}
                <div className="flex-1 px-4 space-y-3 overflow-y-auto pb-20">
                  
                  {/* Chat 1: Alpha Squad Lead */}
                  <div
                    onClick={() => onSelectChat(1001)}
                    className={`p-3.5 rounded-2xl bg-[#131c2b] border transition-all cursor-pointer flex items-center gap-3.5 hover:border-cyan-500/60 ${
                      selectedChatId === 1001 ? 'border-cyan-500 bg-[#162338]' : 'border-slate-800'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-[#0e1624] border border-slate-700 flex items-center justify-center text-slate-300">
                        <ShieldCheck className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#131c2b] absolute bottom-0 left-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-100 truncate">Alpha Squad Lead</h4>
                        <span className="text-[11px] font-mono text-cyan-400 font-medium">14:02Z</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        Rendezvous coordinates confirmed. ...
                      </p>
                    </div>
                  </div>

                  {/* Chat 2: Central Command */}
                  <div
                    onClick={() => onSelectChat(1003)}
                    className={`p-3.5 rounded-2xl bg-[#131c2b] border transition-all cursor-pointer flex items-center gap-3.5 hover:border-cyan-500/60 ${
                      selectedChatId === 1003 ? 'border-cyan-500 bg-[#162338]' : 'border-slate-800'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-[#0e1624] border border-slate-700 flex items-center justify-center text-slate-300">
                        <Radio className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#131c2b] absolute top-0 left-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-100 truncate">Central Command</h4>
                        <span className="text-[11px] font-mono text-slate-400">09:15Z</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        Update on Sector 7 activity require...
                      </p>
                    </div>
                  </div>

                  {/* Chat 3: Intel Desk */}
                  <div
                    onClick={() => onSelectChat(1002)}
                    className={`p-3.5 rounded-2xl bg-[#131c2b] border transition-all cursor-pointer flex items-center gap-3.5 hover:border-cyan-500/60 ${
                      selectedChatId === 1002 ? 'border-cyan-500 bg-[#162338]' : 'border-slate-800'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-[#0e1624] border border-slate-700 flex items-center justify-center text-slate-300">
                        <Activity className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-100 truncate">Intel Desk</h4>
                        <span className="text-[11px] font-mono text-slate-500">Yesterday</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                        <Paperclip className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>Sector_7_Topo.dat</span>
                      </p>
                    </div>
                  </div>

                  {/* Rest of Real Chats */}
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className={`p-3.5 rounded-2xl bg-[#131c2b] border transition-all cursor-pointer flex items-center gap-3.5 hover:border-cyan-500/60 ${
                        selectedChatId === chat.id ? 'border-cyan-500 bg-[#162338]' : 'border-slate-800'
                      }`}
                    >
                      <img
                        src={chat.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80'}
                        alt={chat.title}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-100 truncate">{chat.title}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {chat.last_message?.date ? new Date(chat.last_message.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {chat.last_message?.content?.text || 'محادثة مشفرة'}
                        </p>
                      </div>
                    </div>
                  ))}

                </div>

                {/* Mobile Bottom Navigation Bar (from Screenshot 2) */}
                <div className="absolute bottom-0 inset-x-0 bg-[#0a0f18]/95 border-t border-slate-800 p-2 flex items-center justify-around z-20 backdrop-blur-md">
                  
                  {/* Tab 1: Overview */}
                  <button
                    onClick={() => { setMobileTab('overview'); setViewMode('terminal'); }}
                    className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
                      mobileTab === 'overview' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Overview</span>
                  </button>

                  {/* Tab 2: Messages (Active cyan rounded pill from Screenshot 2) */}
                  <button
                    onClick={() => { setMobileTab('messages'); setViewMode('mobile_comm'); }}
                    className={`flex flex-col items-center gap-1 py-2 px-5 rounded-full transition-all ${
                      mobileTab === 'messages'
                        ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-400/20'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Messages</span>
                  </button>

                  {/* Tab 3: Tracking */}
                  <button
                    onClick={() => { setMobileTab('tracking'); setActiveToolModal('deployNode'); }}
                    className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
                      mobileTab === 'tracking' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Tracking</span>
                  </button>

                  {/* Tab 4: Cards */}
                  <button
                    onClick={() => { setMobileTab('cards'); onOpenSecurity(); }}
                    className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
                      mobileTab === 'cards' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Cards</span>
                  </button>

                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= MODAL: REFERENCE GENERATOR ================= */}
      {activeToolModal === 'reference' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#131c2b] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Quote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Reference Generator (مولّد المراجع)</h3>
                  <p className="text-xs text-slate-400">تنسيق الاقتباسات والتوثيق العلمي الدقيق</p>
                </div>
              </div>
              <button onClick={() => setActiveToolModal(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">بيانات المصدر أو عنوان البحث أو الكتاب:</label>
                <input
                  type="text"
                  value={refQuery}
                  onChange={(e) => setRefQuery(e.target.value)}
                  placeholder="مثال: Quantum Key Distribution Protocol Vulnerabilities by Al-Saadi (2026)"
                  className="w-full bg-[#0d141f] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">نمط التوثيق الأكاديمي:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['APA', 'IEEE', 'Harvard', 'MLA'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setRefStyle(style)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        refStyle === style
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                          : 'bg-[#0d141f] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {refResult && (
                <div className="p-4 rounded-xl bg-[#0d141f] border border-cyan-900/60 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
                    <span>المرجع المولد ({refStyle}):</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(refResult)}
                      className="text-slate-400 hover:text-cyan-300 text-[11px]"
                    >
                      نسخ
                    </button>
                  </div>
                  <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed bg-[#090e17] p-3 rounded-lg border border-slate-800">
                    {refResult}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveToolModal(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                إغلاق
              </button>
              <button
                onClick={handleGenerateReference}
                disabled={isRefLoading || !refQuery.trim()}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isRefLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>توليد التوثيق الآلي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DATA EXTRACTOR ================= */}
      {activeToolModal === 'extractor' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#131c2b] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Data Extractor (مستخرج البيانات)</h3>
                  <p className="text-xs text-slate-400">استخراج وهيكلة الأرقام والمتغيرات من الأبحاث</p>
                </div>
              </div>
              <button onClick={() => setActiveToolModal(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">الصق النص البحثي أو الأرقام الخام:</label>
                <textarea
                  rows={4}
                  value={extractorInput}
                  onChange={(e) => setExtractorInput(e.target.value)}
                  placeholder="ألصق محتوى فقرة النتائج أو جداول البيانات هنا..."
                  className="w-full bg-[#0d141f] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {extractorResult && (
                <div className="p-4 rounded-xl bg-[#0d141f] border border-cyan-900/60 max-h-56 overflow-y-auto text-xs text-slate-200 leading-relaxed">
                  <pre className="whitespace-pre-wrap font-sans">{extractorResult}</pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setActiveToolModal(null)} className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200">
                إغلاق
              </button>
              <button
                onClick={handleExtractData}
                disabled={isExtracting || !extractorInput.trim()}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                <span>استخراج وهيكلة البيانات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TECH DOC ANALYZER ================= */}
      {activeToolModal === 'docAnalyzer' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#131c2b] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Tech Doc Analyzer (محلل الوثائق التقنية)</h3>
                  <p className="text-xs text-slate-400">تلخيص الأوراق العلمية والتقارير المعقدة بالذكاء الاصطناعي</p>
                </div>
              </div>
              <button onClick={() => setActiveToolModal(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">نص الوثيقة أو الملخص التنفيذي:</label>
                <textarea
                  rows={4}
                  value={docInput}
                  onChange={(e) => setDocInput(e.target.value)}
                  placeholder="ألصق محتوى الورقة التقنية أو ملخص المشروع للتحليل..."
                  className="w-full bg-[#0d141f] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {docResult && (
                <div className="p-4 rounded-xl bg-[#0d141f] border border-cyan-900/60 max-h-56 overflow-y-auto text-xs text-slate-200 leading-relaxed">
                  <pre className="whitespace-pre-wrap font-sans">{docResult}</pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setActiveToolModal(null)} className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200">
                إغلاق
              </button>
              <button
                onClick={handleAnalyzeDoc}
                disabled={isAnalyzingDoc || !docInput.trim()}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isAnalyzingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>تحليل الوثيقة الذكي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DEPLOY NODE ================= */}
      {activeToolModal === 'deployNode' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#131c2b] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Deploy Node (نشر وتفعيل عقدة جديدة)</h3>
                  <p className="text-xs text-slate-400">ربط خادم مشفر في شبكة nerT اللامركزية</p>
                </div>
              </div>
              <button onClick={() => setActiveToolModal(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">اسم العقدة (Node Identifier):</label>
                <input
                  type="text"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="مثال: عقدة الدلتا المركزية (Delta Relay)"
                  className="w-full bg-[#0d141f] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">المنطقة السحابية (Region):</label>
                <select
                  value={nodeRegion}
                  onChange={(e) => setNodeRegion(e.target.value)}
                  className="w-full bg-[#0d141f] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="الرياض - السيرفر 01 (العقدة الرئيسية)">الرياض - السيرفر 01 (العقدة الرئيسية)</option>
                  <option value="دبي - السيرفر 02 (Relay Node)">دبي - السيرفر 02 (Relay Node)</option>
                  <option value="جدة - السيرفر 03 (Vault Node)">جدة - السيرفر 03 (Vault Node)</option>
                  <option value="فرانكفورت - العقدة الأوروبية">فرانكفورت - العقدة الأوروبية</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d141f] border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  بروتوكول التشفير المعتمد:
                </p>
                <p>AES-256-GCM + Post-Quantum Dilithium مع تزامن فوري عبر Server-Sent Events.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setActiveToolModal(null)} className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200">
                إلغاء
              </button>
              <button
                onClick={handleDeployNode}
                disabled={isDeploying}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isDeploying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                <span>نشر وتشغيل العقدة الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW SOURCE ================= */}
      {activeToolModal === 'newSource' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#131c2b] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100">إضافة مصدر إلى المستودع</h3>
              <button onClick={() => setActiveToolModal(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                const publisher = formData.get('publisher') as string;
                if (!title) return;
                const newSrc: ResearchSource = {
                  id: `src_${Date.now()}`,
                  title,
                  publisher: publisher || 'مستند محلي',
                  addedAgo: 'Added just now',
                  type: 'paper',
                  status: 'verified',
                  size: '2.1 MB',
                };
                setSources((prev) => [newSrc, ...prev]);
                fetch('/api/nert/sources', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newSrc),
                }).catch(console.error);
                setActiveToolModal(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">عنوان المصدر / الورقة:</label>
                <input
                  name="title"
                  required
                  placeholder="مثال: Decentralized Routing Protocols for Quantum Networks"
                  className="w-full bg-[#0d141f] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">المصدر / المجلة (Publisher):</label>
                <input
                  name="publisher"
                  placeholder="مثال: IEEE Communications • 2026"
                  className="w-full bg-[#0d141f] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveToolModal(null)} className="px-4 py-2 text-xs text-slate-400">
                  إلغاء
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs">
                  إضافة المصدر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW NOTE ================= */}
      {activeToolModal === 'newNote' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#131c2b] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100">إضافة ملاحظة توليف جديدة</h3>
              <button onClick={() => setActiveToolModal(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                const content = formData.get('content') as string;
                if (!content) return;
                const newN: ResearchNote = {
                  id: `note_${Date.now()}`,
                  title: title || `ملاحظة #${notes.length + 1}`,
                  content,
                  createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                };
                setNotes((prev) => [newN, ...prev]);
                fetch('/api/nert/notes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newN),
                }).catch(console.error);
                setActiveToolModal(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">عنوان الملاحظة:</label>
                <input
                  name="title"
                  placeholder="مثال: Hypothesis B / تحليل سعة القناة"
                  className="w-full bg-[#0d141f] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">المحتوى والاستنتاج:</label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  placeholder="اكتب الملاحظة أو الفرضية البحثية هنا..."
                  className="w-full bg-[#0d141f] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveToolModal(null)} className="px-4 py-2 text-xs text-slate-400">
                  إلغاء
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs">
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
