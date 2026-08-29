import React, { useState, useEffect } from 'react';
import {
  Layers,
  Edit3,
  Trash2,
  Image,
  Users,
  Calendar,
  Clock,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { notificationsService } from '../../core/NotificationsService';
import { MyMessagesBatch } from '../../types';

export const MyMessagesModal: React.FC = () => {
  const { activeModal, setActiveModal, showToast } = useTelegram();
  const [batches, setBatches] = useState<MyMessagesBatch[]>([]);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsub = notificationsService.subscribe(() => {
      setBatches([...notificationsService.getBatchLogs()]);
    });
    setBatches([...notificationsService.getBatchLogs()]);
    return () => unsub();
  }, []);

  if (activeModal !== ('my-messages' as any)) return null;

  const handleStartEdit = (batch: MyMessagesBatch) => {
    setEditingBatchId(batch.id);
    setEditText(batch.text);
  };

  const handleSaveEdit = async (batchId: string) => {
    if (!editText.trim()) return;
    setIsProcessing(true);
    await notificationsService.editBatch(batchId, editText);
    setIsProcessing(false);
    setEditingBatchId(null);
    showToast('تم تعديل الدفعة في جميع المجموعات بنجاح ✏️', '✨');
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدفعة نهائياً من كافة المجموعات؟')) {
      setIsProcessing(true);
      await notificationsService.deleteBatch(batchId);
      setIsProcessing(false);
      showToast('تم سحب وحذف الرسائل من كافة المجموعات 🗑️', '✨');
    }
  };

  return (
    <div
      id="modal-my-messages-activity"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none"
      dir="rtl"
    >
      <div
        className="w-full max-w-2xl text-[#e8eaf6] rounded-3xl shadow-2xl overflow-hidden border border-blue-500/30 my-auto animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #0a1128, #111d42, #060a17)',
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">وظيفة "رسائلي" (سجل الدفعات)</h3>
              <p className="text-[11px] text-blue-300/80">التعديل الجماعي والحذف التلقائي لكافة الحملات</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {batches.length === 0 ? (
            <div className="p-10 text-center space-y-2 rounded-2xl bg-black/20 border border-white/5 text-gray-400">
              <Layers className="w-8 h-8 mx-auto text-gray-500" />
              <p className="text-xs">لا يوجد دفعات مرسلة حتى الآن.</p>
              <p className="text-[11px] text-gray-500">
                عند إرسال أي رسالة عبر وظيفة الإرسال، سيتم تسجيلها هنا تلقائياً.
              </p>
            </div>
          ) : (
            batches.map((batch) => {
              const isEditing = editingBatchId === batch.id;
              return (
                <div
                  key={batch.id}
                  className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 hover:border-blue-500/30 transition-all"
                >
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-blue-400 font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{batch.groupsCount} مجموعة</span>
                      </span>
                      {batch.hasImages && (
                        <span className="flex items-center gap-1 text-purple-400 font-bold">
                          <Image className="w-3.5 h-3.5" />
                          <span>{batch.imagesCount} صورة</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-mono text-[10px]">
                      <span>{batch.date}</span>
                      <span>•</span>
                      <span>{batch.timestamp}</span>
                    </div>
                  </div>

                  {/* Message Content */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full h-24 bg-black/50 border border-blue-400 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingBatchId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 text-[11px] font-bold"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={() => handleSaveEdit(batch.id)}
                          disabled={isProcessing}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>حفظ وتعديل للجميع</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-200 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                      {batch.text}
                    </p>
                  )}

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <span className="text-[10px] text-gray-500">معرف الدفعة: #{batch.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(batch)}
                          className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل جماعي</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف الدفعة</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setActiveModal('none')}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
