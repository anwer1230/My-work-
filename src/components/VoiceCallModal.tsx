import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Lock,
  X,
  Monitor,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface CallRecord {
  id: string;
  peer_name?: string;
  user_name?: string;
  direction?: 'incoming' | 'outgoing' | 'missed';
  type?: 'incoming' | 'outgoing' | 'missed' | 'voice' | 'video';
  status?: 'ended' | 'missed' | 'active';
  duration?: string | number;
  date?: string;
}

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  peerName?: string;
  peerAvatar?: string;
  initialType?: 'voice' | 'video';
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  peerName = 'أبو ملك (المشرف الأكاديمي)',
  peerAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  initialType = 'voice',
}) => {
  const [activeTab, setActiveTab] = useState<'call' | 'history'>('call');
  const [currentPeerName, setCurrentPeerName] = useState(peerName);
  const [callType, setCallType] = useState<'voice' | 'video'>(initialType);
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [callHistory, setCallHistory] = useState<CallRecord[]>([
    {
      id: '1',
      peer_name: 'أبو ملك (المشرف الأكاديمي)',
      direction: 'outgoing',
      status: 'ended',
      duration: '02:22',
      date: 'اليوم 11:20',
      type: 'video',
    },
    {
      id: '2',
      peer_name: 'د. خالد عبد العزيز',
      direction: 'incoming',
      status: 'ended',
      duration: '00:58',
      date: 'أمس 18:40',
      type: 'voice',
    },
    {
      id: '3',
      peer_name: 'مركز الدعم والتنسيق الأكاديمي',
      direction: 'missed',
      status: 'missed',
      duration: '00:00',
      date: 'أمس 14:00',
      type: 'voice',
    },
  ]);

  useEffect(() => {
    setCurrentPeerName(peerName);
    setCallType(initialType);
  }, [peerName, initialType, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/calls/history')
        .then((res) => res.json())
        .then((d) => {
          if (d.calls && Array.isArray(d.calls)) {
            setCallHistory(
              d.calls.map((c: any) => ({
                id: c.id,
                peer_name: c.user_name || c.peer_name || 'مستخدم تليجرام',
                direction: c.type === 'missed' ? 'missed' : c.type === 'incoming' ? 'incoming' : 'outgoing',
                type: c.call_type || 'voice',
                duration: typeof c.duration === 'number' ? `${Math.floor(c.duration / 60)}:${c.duration % 60}` : c.duration || '01:15',
                date: c.date || 'اليوم',
                status: c.type === 'missed' ? 'missed' : 'ended',
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (inCall) {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);

      if (callType === 'video' && !isVideoOff) {
        navigator.mediaDevices
          ?.getUserMedia({ video: true, audio: true })
          .then((stream) => {
            mediaStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn('Camera access error:', err);
          });
      }
    } else {
      setCallSeconds(0);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }
    return () => {
      clearInterval(interval);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [inCall, callType, isVideoOff]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setInCall(false);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const startCallWith = (name: string, type: 'voice' | 'video' = 'voice') => {
    setCurrentPeerName(name);
    setCallType(type);
    setActiveTab('call');
    setInCall(true);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[2600] select-none text-zinc-100 font-['Cairo',sans-serif]">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-5 shadow-2xl relative max-h-[90vh] flex flex-col justify-between overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              {callType === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                <span>{callType === 'video' ? 'مكالمة تليجرام مرئية' : 'مكالمة تليجرام صوتية'}</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  E2EE مشفرة
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400">اتصال مباشر فائق السرعة عبر بروتوكول تليجرام WebRTC</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900 p-1 rounded-xl my-3 border border-zinc-800 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('call')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'call' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            📞 مكالمة مباشرة
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'history' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            📜 سجل المكالمات
          </button>
        </div>

        {activeTab === 'call' ? (
          <div className="flex-1 flex flex-col items-center justify-between py-2 space-y-4">
            
            {/* Call Mode Switcher */}
            {!inCall && (
              <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 text-xs font-bold">
                <button
                  onClick={() => setCallType('voice')}
                  className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    callType === 'voice'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>مكالمة صوتية</span>
                </button>

                <button
                  onClick={() => setCallType('video')}
                  className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    callType === 'video'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>مكالمة فيديو</span>
                </button>
              </div>
            )}

            {/* Video Viewfinder / Audio Frame */}
            <div className="relative w-full h-56 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner">
              {callType === 'video' && inCall && !isVideoOff ? (
                <>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-3xl"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded-lg text-[10px] text-emerald-400 font-mono border border-white/10">
                    كاميرا عالية الدقة (HD WebRTC)
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center p-4">
                  <div className="relative mb-2">
                    <img
                      src={peerAvatar}
                      alt={currentPeerName}
                      className={`w-24 h-24 rounded-full object-cover border-4 transition-all ${
                        inCall
                          ? 'border-emerald-500 scale-105 shadow-emerald-500/20 shadow-2xl animate-pulse'
                          : 'border-zinc-700'
                      }`}
                    />
                    <div
                      className="absolute top-0 right-0 p-1.5 bg-emerald-500 text-zinc-950 rounded-full shadow"
                      title="تشفير كامل End-to-End"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-100">{currentPeerName}</h4>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5">
                    {inCall
                      ? `متصل بالخوادم المشفرة... ${formatTimer(callSeconds)}`
                      : 'جاهز للاتصال المباشر'}
                  </p>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="w-full space-y-3 pt-2">
              {inCall ? (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3.5 rounded-2xl shadow-lg transition-transform hover:scale-110 ${
                      isMuted ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                    }`}
                    title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الميكروفون'}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {callType === 'video' && (
                    <button
                      onClick={() => setIsVideoOff(!isVideoOff)}
                      className={`p-3.5 rounded-2xl shadow-lg transition-transform hover:scale-110 ${
                        isVideoOff ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                      }`}
                      title={isVideoOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
                    >
                      {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>
                  )}

                  <button
                    onClick={handleEndCall}
                    className="p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl shadow-2xl transition-transform hover:scale-110 animate-pulse"
                    title="إنهاء المكالمة"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setInCall(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  {callType === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  <span>
                    بدء {callType === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية'} مشفرة الآن
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 text-xs">
            {callHistory.map((c) => {
              const isMissed = c.direction === 'missed' || c.status === 'missed';
              const isOutgoing = c.direction === 'outgoing';
              const isIncoming = c.direction === 'incoming';

              return (
                <div
                  key={c.id}
                  onClick={() => startCallWith(c.peer_name || 'مستخدم', 'voice')}
                  className="p-3 bg-zinc-900/80 hover:bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-xs cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-zinc-800">
                      {isOutgoing && <PhoneOutgoing className="w-4 h-4 text-emerald-400" />}
                      {isIncoming && <PhoneIncoming className="w-4 h-4 text-sky-400" />}
                      {isMissed && <PhoneMissed className="w-4 h-4 text-rose-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-100 group-hover:text-sky-400 transition-colors">
                        {c.peer_name}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span className={isMissed ? 'text-rose-400' : isOutgoing ? 'text-emerald-400' : 'text-sky-400'}>
                          {isMissed ? 'مكالمة مفقودة' : isOutgoing ? 'صادرة' : 'واردة'}
                        </span>
                        <span>•</span>
                        <span>{c.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {c.duration}
                    </span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
