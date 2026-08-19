import React, { useState } from 'react';
import { Activity, Server, Bot, Cpu, HardDrive, BarChart3, Send, X } from 'lucide-react';

interface SystemMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemMonitorModal: React.FC<SystemMonitorModalProps> = ({ isOpen, onClose }) => {
  const [broadcastText, setBroadcastText] = useState('');
  const [activeTab, setActiveTab] = useState<'monitor' | 'stats' | 'broadcast'>('monitor');

  if (!isOpen) return null;

  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) return;
    alert(`📢 تم إرسال الرسالة الجماعية لجميع مستخدمي البوت والمجموعة:\n"${broadcastText}"`);
    setBroadcastText('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-100 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-amber-400">
          <Activity className="w-6 h-6" />
          <h3 className="font-bold text-sm">مراقبة النظام والبوتات والإحصائيات (Monitor & Admin)</h3>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl mb-4 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'monitor' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            🖥️ حالة السيرفر
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'stats' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 الإحصائيات (1208)
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'broadcast' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            📢 الإذاعة الجماعية
          </button>
        </div>

        {activeTab === 'monitor' && (
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-sky-400" /> استهلاك المعالج (CPU):</span>
                <span className="font-mono font-bold text-emerald-400">14%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[14%]" />
              </div>

              <div className="flex justify-between items-center text-slate-300 mt-2">
                <span className="flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-purple-400" /> الذاكرة العشوائية (RAM):</span>
                <span className="font-mono font-bold text-sky-400">280 MB / 1024 MB</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-[27%]" />
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-slate-100">بوت سرعة إنجاز الرئيسي</div>
                  <div className="text-[10px] text-slate-400 font-mono">@Abu_Mlk_bot</div>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/40">
                نشط (Online)
              </span>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-center">
                <div className="text-[10px] text-slate-400">إجمالي الرسائل المعالجة</div>
                <div className="text-lg font-bold text-amber-400 font-mono mt-1">48,210</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-center">
                <div className="text-[10px] text-slate-400">الأعضاء والمستفيدون</div>
                <div className="text-lg font-bold text-sky-400 font-mono mt-1">1,208</div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-400">الطلبات الأكاديمية المنفذة</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-1">3,450 طلب ناجح</div>
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">نص الإذاعة الجماعية (Broadcast):</label>
              <textarea
                rows={4}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="أدخل الإعلان أو الرسالة التحديثية لبثها فوراً..."
                className="w-full bg-slate-800 text-xs text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleSendBroadcast}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              <span>إرسال الإذاعة فوراً لجميع القنوات والمستخدمين</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
