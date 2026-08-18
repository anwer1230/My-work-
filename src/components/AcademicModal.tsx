import React, { useState } from 'react';
import { GraduationCap, FileText, CheckCircle2, Copy, Sparkles, X, Wand2 } from 'lucide-react';

interface AcademicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicModal: React.FC<AcademicModalProps> = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'formatter'>('services');

  if (!isOpen) return null;

  const handleFormatText = () => {
    if (!inputText.trim()) return;
    // Format text: add bullet points, clean double spaces, polish academic headings
    let cleaned = inputText.replace(/\s+/g, ' ').trim();
    let result = `📚 **النص المنسق أسرع إنجاز** 📚\n\n` +
      cleaned.split('. ').map((sentence, idx) => `▫️ ${sentence.trim()}`).join('.\n\n');
    setFormattedText(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    alert('✅ تم نسخ النص المنسق للفيشة!');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-sky-400">
          <GraduationCap className="w-6 h-6" />
          <h3 className="font-bold text-base">مركز سرعة إنجاز — الخدمات والتنسيق الأكاديمي</h3>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl mb-4 border border-slate-800">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'services' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            🎓 الخدمات الطلابية والأكاديمية
          </button>
          <button
            onClick={() => setActiveTab('formatter')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'formatter' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✨ منسق النصوص الأكاديمية
          </button>
        </div>

        {activeTab === 'services' ? (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">📖</div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">إعداد البحوث والأوراق العلمية</h4>
                <p className="text-slate-400 mt-0.5">تنسيق وتوثيق المراجع بنظام APA & MLA مع توفير المصادر المعتمدة.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">📊</div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">مشاريع التخرج والتحليل الإحصائي</h4>
                <p className="text-slate-400 mt-0.5">معالجة البيانات باستخدام SPSS والتحليل الإحصائي الدقيق للأبحاث.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">🖋️</div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">التدقيق اللغوي وإعادة الصياغة</h4>
                <p className="text-slate-400 mt-0.5">تصحيح الأخطاء النحوية والملائية وتحسين الأسلوب العلمي للرسائل.</p>
              </div>
            </div>

            <a
              href="https://t.me/Abu_Mlk"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow mt-2"
            >
              <span>طلب خدمة أكاديمية مباشرة عبر تيليجرام</span>
            </a>
          </div>
        ) : (
          <div className="space-y-3 flex-1 flex flex-col overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">أدخل النص المراد تنسيقه وتدقيقه:</label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="أدخل الفقرات والبحث هنا لتهذيبها وتنسيقها..."
                className="w-full bg-slate-800 text-xs text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={handleFormatText}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <Wand2 className="w-4 h-4" />
              <span>تنسيق وصياغة النص فوراً</span>
            </button>

            {formattedText && (
              <div className="mt-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400">النتيجة المنسقة:</span>
                  <button onClick={handleCopy} className="text-[11px] text-sky-400 hover:underline flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" /> نسخ
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">
                  {formattedText}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
