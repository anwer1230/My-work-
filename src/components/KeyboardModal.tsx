import React, { useState } from 'react';
import { Keyboard, Plus, Trash2, X, ExternalLink } from 'lucide-react';
import { InlineKeyboardButton } from '../types';

interface KeyboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendKeyboard: (text: string, buttons: InlineKeyboardButton[][]) => void;
}

export const KeyboardModal: React.FC<KeyboardModalProps> = ({
  isOpen,
  onClose,
  onSendKeyboard,
}) => {
  const [msgText, setMsgText] = useState('اختر الخدمة أو الخيار المطلوب من القائمة التالية:');
  const [btnText, setBtnText] = useState('📚 القسم الأكاديمي');
  const [btnData, setBtnData] = useState('acad_section');

  const [btnText2, setBtnText2] = useState('🌐 زيارة الموقع الرسمي');
  const [btnUrl, setBtnUrl] = useState('https://telegram.org');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rows: InlineKeyboardButton[][] = [
      [
        { text: btnText || 'خيار 1', callback_data: btnData || 'cb_1' },
      ],
      [
        { text: btnText2 || 'موقع خارجي', url: btnUrl || 'https://telegram.org' },
      ],
    ];

    onSendKeyboard(msgText, rows);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-purple-400">
          <Keyboard className="w-6 h-6" />
          <h3 className="font-bold text-sm">إرسال أزرار تفاعلية (Inline Keyboard)</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">نص الرسالة الرئيسية</label>
            <input
              type="text"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              className="w-full bg-slate-800 text-xs text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-purple-400">السطر الأول (زر تفاعلي داخلي)</div>
            <input
              type="text"
              value={btnText}
              onChange={(e) => setBtnText(e.target.value)}
              placeholder="عنوان الزر"
              className="w-full bg-slate-800 text-xs text-slate-100 p-2 rounded-xl border border-slate-700"
            />
            <input
              type="text"
              value={btnData}
              onChange={(e) => setBtnData(e.target.value)}
              placeholder="كود الاستجابة (callback_data)"
              className="w-full bg-slate-800 text-xs text-slate-100 p-2 rounded-xl border border-slate-700 font-mono dir-ltr text-right"
            />
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>السطر الثاني (زر رابط خارجي URL)</span>
            </div>
            <input
              type="text"
              value={btnText2}
              onChange={(e) => setBtnText2(e.target.value)}
              placeholder="عنوان الزر"
              className="w-full bg-slate-800 text-xs text-slate-100 p-2 rounded-xl border border-slate-700"
            />
            <input
              type="text"
              value={btnUrl}
              onChange={(e) => setBtnUrl(e.target.value)}
              placeholder="الرابط الخارجي (https://...)"
              className="w-full bg-slate-800 text-xs text-slate-100 p-2 rounded-xl border border-slate-700 font-mono dir-ltr text-right"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow mt-2"
          >
            إرسال الأزرار التفاعلية
          </button>
        </form>
      </div>
    </div>
  );
};
