import React, { useState } from 'react';
import { X, Plus, Trash2, BarChart2, Check } from 'lucide-react';
import { Poll } from '../../types/telegram';

interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (poll: Poll) => void;
}

export const PollModal: React.FC<PollModalProps> = ({
  isOpen,
  onClose,
  onCreatePoll,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [allowsMultipleAnswers, setAllowsMultipleAnswers] = useState(false);
  const [isQuiz, setIsQuiz] = useState(false);
  const [correctOptionIdx, setCorrectOptionIdx] = useState<number>(0);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const updated = options.filter((_, idx) => idx !== index);
      setOptions(updated);
      if (correctOptionIdx >= updated.length) {
        setCorrectOptionIdx(0);
      }
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim().length > 0);
    if (!question.trim() || validOptions.length < 2) return;

    const pollOptions = validOptions.map((text, idx) => ({
      id: `opt-${Date.now()}-${idx}`,
      text: text.trim(),
      votes: 0,
      voters: [],
    }));

    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      question: question.trim(),
      options: pollOptions,
      isAnonymous,
      allowsMultipleAnswers: isQuiz ? false : allowsMultipleAnswers,
      isQuiz,
      correctOptionId: isQuiz ? pollOptions[correctOptionIdx]?.id : undefined,
      totalVotes: 0,
    };

    onCreatePoll(newPoll);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-neutral-100 text-base">New Poll</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Question *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Poll Options * (min 2)
            </label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {isQuiz && (
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOptionIdx === idx}
                      onChange={() => setCorrectOptionIdx(idx)}
                      title="Mark as correct answer"
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                  )}
                  <input
                    type="text"
                    required
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl px-3 py-2 text-sm text-neutral-100 focus:outline-hidden"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg"
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
                className="mt-2 text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-sky-500/10"
              >
                <Plus className="w-4 h-4" /> Add an option
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300 font-medium">Anonymous Voting</span>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300 font-medium">Multiple Answers</span>
              <input
                type="checkbox"
                disabled={isQuiz}
                checked={allowsMultipleAnswers && !isQuiz}
                onChange={(e) => setAllowsMultipleAnswers(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 disabled:opacity-40"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300 font-medium">Quiz Mode (Single right answer)</span>
              <input
                type="checkbox"
                checked={isQuiz}
                onChange={(e) => setIsQuiz(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!question.trim() || options.filter((o) => o.trim()).length < 2}
              className="px-5 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
