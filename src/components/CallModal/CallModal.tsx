import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  PhoneOff, 
  Maximize2, 
  ShieldCheck,
  MonitorUp,
  Smile
} from 'lucide-react';
import { CallSession } from '../../types/telegram';
import { sounds } from '../../utils/audio';

interface CallModalProps {
  session: CallSession | null;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  session,
  onEndCall,
  onToggleMute,
  onToggleVideo,
}) => {
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<'ringing' | 'connected'>('ringing');
  const [isSpeaker, setIsSpeaker] = useState(true);

  // Sound effect and connection timing
  useEffect(() => {
    if (!session) return;

    // Ringing sound
    const stopRingtone = sounds.playCallRingtone();

    // Auto connect after 2.5 seconds simulation
    const connectTimer = window.setTimeout(() => {
      stopRingtone();
      setStatus('connected');
      sounds.playCallConnected();
    }, 2800);

    return () => {
      stopRingtone();
      window.clearTimeout(connectTimer);
    };
  }, [session]);

  // Duration counter when connected
  useEffect(() => {
    let timer: number;
    if (status === 'connected') {
      timer = window.setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  if (!session) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    sounds.playCallEnd();
    onEndCall();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blur backdrop */}
      <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md" />

      {/* Call Window */}
      <div 
        id="call-modal-window"
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-8 z-10 select-none animate-in zoom-in-95 duration-200"
      >
        {/* Top Header: E2E Emoji Key & Title */}
        <div className="w-full flex items-center justify-between mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-950/80 border border-neutral-800 rounded-full text-xs text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted:</span>
            <span className="text-base tracking-widest">{session.emojiKey.join(' ')}</span>
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            {session.type === 'video' ? 'Video Call' : 'Voice Call'}
          </span>
        </div>

        {/* Avatar / Video Feed Container */}
        <div className="relative my-4 flex flex-col items-center">
          {session.isVideoOn ? (
            <div className="w-48 h-48 rounded-3xl overflow-hidden bg-black border-2 border-sky-500 shadow-2xl relative">
              <img 
                src={session.user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'} 
                alt="Video" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs rounded-md text-[10px] text-white">
                HD 1080p
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Pulsing ripples during ringing */}
              {status === 'ringing' && (
                <>
                  <div className="absolute -inset-4 rounded-full bg-sky-500/20 animate-ping" />
                  <div className="absolute -inset-8 rounded-full bg-sky-500/10 animate-pulse" />
                </>
              )}

              {session.user.avatar ? (
                <img 
                  src={session.user.avatar} 
                  alt={session.user.name} 
                  className="w-32 h-32 rounded-full object-cover shadow-2xl ring-4 ring-neutral-800 relative z-10"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full bg-gradient-to-tr ${session.user.avatarColor || 'from-sky-500 to-indigo-600'} text-white font-bold text-4xl flex items-center justify-center shadow-2xl ring-4 ring-neutral-800 relative z-10`}>
                  {session.user.name.charAt(0)}
                </div>
              )}
            </div>
          )}

          <h2 className="text-xl font-bold text-neutral-100 mt-6 mb-1">{session.user.name}</h2>
          <p className="text-sm font-medium text-neutral-400">
            {status === 'ringing' ? 'Ringing...' : formatDuration(duration)}
          </p>
        </div>

        {/* Action Controls Bar */}
        <div className="w-full flex items-center justify-center gap-4 mt-8 pt-4 border-t border-neutral-800/80">
          {/* Mute Mic Button */}
          <button
            onClick={onToggleMute}
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
              session.isMuted
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
            }`}
            title={session.isMuted ? 'Unmute' : 'Mute'}
          >
            {session.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={onToggleVideo}
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
              session.isVideoOn
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
            }`}
            title={session.isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {session.isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Speaker Toggle Button */}
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
              isSpeaker
                ? 'bg-neutral-800 text-sky-400'
                : 'bg-neutral-800 text-neutral-500'
            }`}
            title="Speaker"
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            id="btn-end-call"
            onClick={handleEnd}
            className="w-13 h-13 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
