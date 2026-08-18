import React, { useState } from 'react';
import { BarChart2, Plus, Trash2, X } from 'lucide-react';

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (question: string, options: string[]) => void;
}

export const PollModal: React.FC<PollModalProps> = ({
  isOpen,
  onClose,
  onCreatePoll,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['نعم', 'لا']);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 10) setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!question.trim()) return alert('أدخل سؤال الاستطلاع');
    if (validOptions.length < 2) return alert('أدخل خيارين على الأقل');

    onCreatePoll(question.trim(), validOptions);
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

        <div className="flex items-center gap-2 mb-4 text-amber-400">
          <BarChart2 className="w-6 h-6" />
          <h3 className="font-bold text-sm">إنشاء استطلاع رأي جديد (Poll)</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">السؤال الرئيسي</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="مثال: ما هو موعد الاجتماع المناسب؟"
              className="w-full bg-slate-800 text-xs text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">الخيارات المتاحة</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`خيار ${idx + 1}`}
                    className="flex-1 bg-slate-800 text-xs text-slate-100 p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-rose-400 hover:bg-slate-800 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة خيار آخر</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow mt-2"
          >
            نشر الاستطلاع في المحادثة
          </button>
        </form>
      </div>
    </div>
  );
};
