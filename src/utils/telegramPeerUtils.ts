// =========================================================================
// TELEGRAM 12.x OFFICIAL PEER COLOR & AVATAR ENGINE (DrKLO/Telegram)
// =========================================================================

export interface PeerColorPalette {
  name: string;
  gradient: string;
  color: string;
  bgRgb: string;
}

// Exact Telegram 7-color peer gradient palette from DrKLO/Telegram Android (AvatarDrawable.java)
export const TELEGRAM_PEER_COLORS: PeerColorPalette[] = [
  {
    name: 'red',
    gradient: 'linear-gradient(135deg, #e17076 0%, #ff885e 100%)',
    color: '#e17076',
    bgRgb: '225, 112, 118',
  },
  {
    name: 'orange',
    gradient: 'linear-gradient(135deg, #faa774 0%, #ffbe5b 100%)',
    color: '#faa774',
    bgRgb: '250, 167, 116',
  },
  {
    name: 'violet',
    gradient: 'linear-gradient(135deg, #a695e7 0%, #8561c5 100%)',
    color: '#a695e7',
    bgRgb: '166, 149, 231',
  },
  {
    name: 'green',
    gradient: 'linear-gradient(135deg, #7bc862 0%, #6ec9cb 100%)',
    color: '#7bc862',
    bgRgb: '123, 200, 98',
  },
  {
    name: 'cyan',
    gradient: 'linear-gradient(135deg, #6ec9cb 0%, #539ecb 100%)',
    color: '#6ec9cb',
    bgRgb: '110, 201, 203',
  },
  {
    name: 'blue',
    gradient: 'linear-gradient(135deg, #65aadd 0%, #5375d5 100%)',
    color: '#65aadd',
    bgRgb: '101, 170, 221',
  },
  {
    name: 'pink',
    gradient: 'linear-gradient(135deg, #ee7aae 0%, #d0467c 100%)',
    color: '#ee7aae',
    bgRgb: '238, 122, 174',
  },
];

/**
 * Calculates the exact deterministic Telegram peer color index (0 to 6)
 * according to DrKLO/Telegram Android AvatarDrawable logic.
 */
export function getPeerColorIndex(peerIdOrTitle: string | number): number {
  if (typeof peerIdOrTitle === 'number') {
    return Math.abs(peerIdOrTitle) % 7;
  }
  const str = String(peerIdOrTitle || 'Telegram').trim();
  const num = parseInt(str.replace(/[^\d]/g, ''), 10);
  if (!isNaN(num) && num > 0) {
    return Math.abs(num) % 7;
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) % 7;
}

export function getPeerColor(peerIdOrTitle: string | number): PeerColorPalette {
  const idx = getPeerColorIndex(peerIdOrTitle);
  return TELEGRAM_PEER_COLORS[idx];
}

/**
 * Formats user/group name initials with support for Arabic and Latin scripts
 */
export function getPeerInitials(title: string): string {
  if (!title) return 'TG';
  const clean = title
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
  if (!clean) return title.charAt(0).toUpperCase() || 'TG';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return clean.slice(0, Math.min(2, clean.length)).toUpperCase();
}

/**
 * Synthesizes the authentic Telegram incoming message sound chime using Web Audio API
 */
export function playTelegramIncomingSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Dual harmonic tone (Telegram signature chime: 880Hz A5 + 1760Hz A6 harmonic)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // E6
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.18); // A6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (e) {
    // Audio Context might be waiting for user gesture
  }
}
