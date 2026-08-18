import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Smile, 
  Mic, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  BarChart2, 
  Camera, 
  X, 
  CornerUpLeft, 
  Edit3, 
  Trash2, 
  Sparkles,
  StopCircle
} from 'lucide-react';
import { Message, MediaAttachment } from '../../types/telegram';
import { sounds } from '../../utils/audio';
import { VoiceRecorder } from '../../utils/voiceRecorder';

interface MessageInputProps {
  onSendMessage: (text: string, attachments?: MediaAttachment[]) => void;
  replyingTo: Message | null;
  editingMessage: Message | null;
  onCancelReplyOrEdit: () => void;
  onOpenPollModal: () => void;
  isBot?: boolean;
}

const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥹', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😎', '🤩', '🥳', '😏', '🤔', '🤫', '🫡', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥸'] },
  { name: 'Gestures', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'] },
  { name: 'Hearts & Fire', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '✨', '⭐', '🌟', '💫', '💥', '⚡', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '👑', '💎', '🚀', '🔮'] },
  { name: 'Animals & Nature', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '鯊', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'] },
];

const STICKERS = [
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80',
];

const BOT_COMMANDS = [
  { cmd: '/start', desc: 'Restart the bot and initialize commands' },
  { cmd: '/help', desc: 'List of all available bot abilities' },
  { cmd: '/generate', desc: 'Generate creative ideas and blueprints' },
  { cmd: '/roll', desc: 'Roll a random D6 or D20 die' },
  { cmd: '/quiz', desc: 'Test your software engineering trivia' },
  { cmd: '/joke', desc: 'Receive a funny programmer joke' },
];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyingTo,
  editingMessage,
  onCancelReplyOrEdit,
  onOpenPollModal,
  isBot = false,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'emoji' | 'stickers' | 'gifs'>('emoji');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);

  // Set initial text if editing
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // Voice recording timer
  useEffect(() => {
    let interval: number;
    if (isRecordingVoice) {
      interval = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const handleStartVoiceRecording = async () => {
    voiceRecorderRef.current = new VoiceRecorder();
    setIsRecordingVoice(true);
    await voiceRecorderRef.current.start();
  };

  const handleStopVoiceRecording = async (cancel = false) => {
    if (!voiceRecorderRef.current) {
      setIsRecordingVoice(false);
      return;
    }

    if (cancel) {
      voiceRecorderRef.current.cancel();
      setIsRecordingVoice(false);
      return;
    }

    const res = await voiceRecorderRef.current.stop();
    setIsRecordingVoice(false);

    sounds.playSent();
    onSendMessage('', [
      {
        type: 'voice',
        url: res.audioUrl || 'voice_note.webm',
        duration: res.duration,
        waveform: res.waveform,
      },
    ]);
  };

  const handleSend = () => {
    if (isRecordingVoice) {
      handleStopVoiceRecording(false);
      return;
    }

    if (!text.trim()) return;

    sounds.playSent();
    onSendMessage(text.trim());
    setText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleInsertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playSent();
    if (type === 'photo') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onSendMessage(text.trim(), [
          {
            type: 'photo',
            url,
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          },
        ]);
        setText('');
      };
      reader.readAsDataURL(file);
    } else {
      onSendMessage(text.trim(), [
        {
          type: 'document',
          url: file.name,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        },
      ]);
      setText('');
    }
    setShowAttachMenu(false);
  };

  const showBotCommandList = isBot && text.startsWith('/') && text.length < 10;

  return (
    <div id="message-composer-root" className="relative p-3 bg-neutral-900/95 border-t border-neutral-800 shrink-0 select-none">
      {/* Hidden file & camera inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'photo')}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'photo')}
      />

      {/* Bot Command Suggestions Popover */}
      {showBotCommandList && (
        <div className="absolute bottom-full mb-2 left-4 right-4 md:left-12 md:right-auto md:w-80 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-30 animate-in slide-in-from-bottom-2">
          <div className="p-2 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Bot Commands
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-neutral-800/50">
            {BOT_COMMANDS.map((botCmd) => (
              <button
                key={botCmd.cmd}
                onClick={() => {
                  setText(botCmd.cmd);
                  textareaRef.current?.focus();
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-neutral-800/80 flex items-center justify-between text-xs"
              >
                <span className="font-mono font-bold text-sky-400">{botCmd.cmd}</span>
                <span className="text-neutral-400 text-[11px] truncate ml-2">{botCmd.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reply or Edit Banner */}
      {(replyingTo || editingMessage) && (
        <div className="mb-2 p-2 bg-neutral-800/90 border-l-2 border-sky-500 rounded-r-xl flex items-center justify-between animate-in slide-in-from-bottom-1 text-xs">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {replyingTo ? (
              <CornerUpLeft className="w-4 h-4 text-sky-400 shrink-0" />
            ) : (
              <Edit3 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="font-semibold text-sky-400">
                {replyingTo ? 'Replying to message' : 'Edit Message'}
              </div>
              <div className="text-neutral-300 truncate">
                {replyingTo ? replyingTo.text || 'Attachment' : editingMessage?.text}
              </div>
            </div>
          </div>
          <button
            onClick={onCancelReplyOrEdit}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment Popover Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-4 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl py-2 w-52 z-30 animate-in fade-in zoom-in-95 text-xs font-medium text-neutral-200">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full px-4 py-2.5 hover:bg-neutral-800 flex items-center gap-3"
          >
            <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
              <Camera className="w-4 h-4" />
            </div>
            <span>Take Photo (Camera)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2.5 hover:bg-neutral-800 flex items-center gap-3"
          >
            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span>Photo / Video Gallery</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2.5 hover:bg-neutral-800 flex items-center gap-3"
          >
            <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <span>Document / File</span>
          </button>

          <button
            onClick={() => {
              onOpenPollModal();
              setShowAttachMenu(false);
            }}
            className="w-full px-4 py-2.5 hover:bg-neutral-800 flex items-center gap-3"
          >
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span>Create Poll</span>
          </button>
        </div>
      )}

      {/* Emoji / Sticker / GIF Drawer */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 w-80 md:w-96 h-80 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col z-30 animate-in fade-in zoom-in-95 overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2 bg-neutral-900/60">
            <div className="flex gap-2 text-xs font-semibold">
              <button
                onClick={() => setPickerTab('emoji')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  pickerTab === 'emoji' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Emoji
              </button>
              <button
                onClick={() => setPickerTab('stickers')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  pickerTab === 'stickers' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Stickers
              </button>
            </div>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {pickerTab === 'emoji' ? (
              <div className="space-y-4">
                {EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <div className="text-[11px] font-semibold text-neutral-400 mb-1.5">{cat.name}</div>
                    <div className="grid grid-cols-8 gap-1">
                      {cat.emojis.map((em, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleInsertEmoji(em)}
                          className="w-8 h-8 rounded-lg hover:bg-neutral-800 text-lg flex items-center justify-center transition-transform hover:scale-125"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-[11px] font-semibold text-neutral-400 mb-2">Featured Telegram Stickers</div>
                <div className="grid grid-cols-2 gap-2">
                  {STICKERS.map((stickerUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sounds.playSent();
                        onSendMessage('', [
                          {
                            type: 'photo',
                            url: stickerUrl,
                            fileName: `sticker_${idx + 1}.png`,
                          },
                        ]);
                        setShowEmojiPicker(false);
                      }}
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-transform hover:scale-105"
                    >
                      <img src={stickerUrl} alt="Sticker" className="w-full h-24 object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Input Box Row */}
      <div className="flex items-center gap-2">
        {/* Attach Menu Button */}
        <button
          id="btn-attach"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className={`p-2.5 rounded-full transition-colors shrink-0 ${
            showAttachMenu
              ? 'text-sky-400 bg-sky-500/20'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
          title="Attach media or poll"
        >
          <Paperclip className="w-5 h-5 rotate-45" />
        </button>

        {/* Live Voice Recording Status Bar OR Textarea */}
        {isRecordingVoice ? (
          <div className="flex-1 flex items-center justify-between bg-neutral-950 border border-red-500/40 rounded-2xl px-4 py-2 text-sm text-red-400 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-semibold font-mono">
                0:{recordingSeconds.toString().padStart(2, '0')}
              </span>
              <span className="text-neutral-400 text-xs">Recording live voice note...</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStopVoiceRecording(true)}
                className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800"
                title="Cancel recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStopVoiceRecording(false)}
                className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"
                title="Finish & Send"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={textareaRef}
              id="message-input-textarea"
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={isBot ? 'Write a message or /command...' : 'Write a message...'}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500/80 rounded-2xl pl-4 pr-10 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-hidden resize-none max-h-32 transition-colors"
            />
            <button
              id="btn-emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`absolute right-2.5 p-1.5 rounded-lg transition-colors ${
                showEmojiPicker
                  ? 'text-sky-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Emojis and Stickers"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Send / Mic Button */}
        {text.trim() || isRecordingVoice ? (
          <button
            id="btn-send-message"
            onClick={handleSend}
            className="w-11 h-11 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0 transition-transform active:scale-95 cursor-pointer"
            title="Send Message (Enter)"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        ) : (
          <button
            id="btn-record-voice"
            onClick={handleStartVoiceRecording}
            className="w-11 h-11 rounded-full bg-neutral-800 hover:bg-sky-500/20 text-neutral-300 hover:text-sky-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Click to start Voice Recording"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

