import React, { useState } from 'react';
import { Lottie } from 'lottie-react';
import { CustomAnimatedEmoji } from '../components/Chat/CustomAnimatedEmoji';
import {
  CUSTOM_EMOJIS_MAP,
  LOTTIE_HEART_PULSE,
  LOTTIE_FIRE_FLAME,
  LOTTIE_TON_GEM,
  LOTTIE_PARTY_POPPER,
  LOTTIE_ROCKET_BOOST,
  LOTTIE_DUCK_WINK,
} from '../data/lottieStickerData';
import { LinkPreviewData } from '../types';

export interface ParsedLinkResult {
  type: 'telegram_invite' | 'telegram_username' | 'telegram_message' | 'external_url' | 'hashtag' | 'telegram_scheme';
  value: string;
  display: string;
  action?: string;
}

export function parseTelegramUrl(url: string): ParsedLinkResult | null {
  const clean = url.trim();

  // 1. Invite link: t.me/+hash or t.me/joinchat/hash or tg://join?invite=hash
  const inviteMatch = clean.match(/(?:https?:\/\/)?(?:t\.me\/(?:\+|joinchat\/)|tg:\/\/join\?invite=)([a-zA-Z0-9_-]+)/i);
  if (inviteMatch) {
    return {
      type: 'telegram_invite',
      value: inviteMatch[1],
      display: clean,
    };
  }

  // 2. Message link: t.me/username/123 or t.me/c/12345/678
  const msgLinkMatch = clean.match(/(?:https?:\/\/)?(?:t\.me\/)([a-zA-Z0-9_]+)\/(\d+)/i);
  if (msgLinkMatch && msgLinkMatch[1] !== 'joinchat' && msgLinkMatch[1] !== '+') {
    return {
      type: 'telegram_message',
      value: `${msgLinkMatch[1]}/${msgLinkMatch[2]}`,
      display: clean,
    };
  }

  // 3. tg:// native URI scheme (e.g. tg://resolve?domain=..., tg://settings/..., tg://msg?text=...)
  if (clean.startsWith('tg://')) {
    const domainMatch = clean.match(/tg:\/\/resolve\?domain=([a-zA-Z0-9_]+)/i);
    if (domainMatch) {
      return {
        type: 'telegram_username',
        value: domainMatch[1],
        display: `@${domainMatch[1]}`,
      };
    }
    return {
      type: 'telegram_scheme',
      value: clean,
      display: clean,
    };
  }

  // 4. Username link or handle: t.me/username or @username
  const usernameMatch = clean.match(/^(?:https?:\/\/)?(?:t\.me\/|@)([a-zA-Z0-9_]{3,32})$/i);
  if (usernameMatch) {
    return {
      type: 'telegram_username',
      value: usernameMatch[1],
      display: `@${usernameMatch[1]}`,
    };
  }

  // 5. Hashtags: #crypto, #telegram, #release
  if (clean.startsWith('#')) {
    return {
      type: 'hashtag',
      value: clean.substring(1),
      display: clean,
    };
  }

  // 6. General Web URLs
  if (clean.match(/^https?:\/\//i)) {
    return {
      type: 'external_url',
      value: clean,
      display: clean,
    };
  }

  return null;
}

/**
 * Extracts the first URL from text and generates rich Telegram OpenGraph preview snippet
 */
export function extractLinkPreview(text: string): LinkPreviewData | null {
  if (!text) return null;
  const match = text.match(/(https?:\/\/[^\s]+|t\.me\/[^\s]+|github\.com\/[^\s]+)/i);
  if (!match) return null;

  const rawUrl = match[1];
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

  if (url.includes('github.com/DrKLO/Telegram') || url.includes('DrKLO/Telegram')) {
    return {
      url,
      displayUrl: 'github.com/DrKLO/Telegram',
      siteName: 'GitHub',
      title: 'DrKLO/Telegram: Telegram for Android source',
      description: 'Official Telegram for Android source code repository. Built with C++ native core, WebRTC, and MTProto 2.0 Layer 184.',
      type: 'website',
    };
  }

  if (url.includes('t.me/tg_releases_official') || url.includes('tg_releases_official')) {
    return {
      url,
      displayUrl: 't.me/tg_releases_official',
      siteName: 'Telegram Channel',
      title: 'Telegram Releases & Updates 🚀',
      description: 'Official channel for Telegram application releases, APK downloads, and engine updates.',
      type: 'telegram_channel',
      channelUsername: 'tg_releases_official',
      memberCount: 185000,
    };
  }

  if (url.includes('t.me/telegram') || url.includes('telegram.org')) {
    return {
      url,
      displayUrl: 'telegram.org',
      siteName: 'Telegram Messenger',
      title: 'Telegram: Fast, Secure and Free Cloud Messaging',
      description: 'Pure instant messaging — simple, fast, secure, and synced across all your devices. Over 900 million active users.',
      type: 'website',
    };
  }

  if (url.includes('t.me/+') || url.includes('t.me/joinchat')) {
    const inviteHash = url.split('/').pop() || 'invite';
    return {
      url,
      displayUrl: `t.me/+${inviteHash}`,
      siteName: 'Telegram Invite Link',
      title: 'Join Private Channel / Community',
      description: 'Tap to view and join this private Telegram community via secure MTProto invitation.',
      type: 'telegram_invite',
    };
  }

  try {
    const parsed = new URL(url);
    return {
      url,
      displayUrl: parsed.hostname,
      siteName: parsed.hostname,
      title: parsed.hostname.replace('www.', ''),
      description: `Link preview for ${url}`,
      type: 'website',
    };
  } catch {
    return null;
  }
}

const EMOJI_LOTTIE_MAP: Record<string, any> = {
  '❤️': LOTTIE_HEART_PULSE,
  '🔥': LOTTIE_FIRE_FLAME,
  '💎': LOTTIE_TON_GEM,
  '🎉': LOTTIE_PARTY_POPPER,
  '🚀': LOTTIE_ROCKET_BOOST,
  '🦆': LOTTIE_DUCK_WINK,
  '👍': LOTTIE_DUCK_WINK,
};

/**
 * Checks if the entire message text consists ONLY of 1-3 emojis (Telegram Big Emoji feature)
 */
export function isOnlyBigEmojis(text: string): { isBig: boolean; emojis: string[] } {
  const trimmed = text.trim();
  if (!trimmed) return { isBig: false, emojis: [] };

  // Check for custom emoji code e.g. ":ton_gem:"
  if (CUSTOM_EMOJIS_MAP[trimmed]) {
    return { isBig: true, emojis: [trimmed] };
  }

  // Check if string is 1 to 3 unicode emojis
  const emojiRegex = /^(?:\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*){1,3}$/u;
  if (emojiRegex.test(trimmed)) {
    const matched = trimmed.match(/\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu) || [];
    if (matched.length >= 1 && matched.length <= 3) {
      return { isBig: true, emojis: matched };
    }
  }

  return { isBig: false, emojis: [] };
}

/**
 * Renders large animated Lottie/Vector emojis for standalone emoji messages
 */
export function renderBigAnimatedEmojis(emojis: string[]): React.ReactNode {
  return (
    <div className="flex items-center gap-2 py-1 justify-center animate-in zoom-in-95 duration-200">
      {emojis.map((emoji, index) => {
        if (CUSTOM_EMOJIS_MAP[emoji]) {
          return <CustomAnimatedEmoji key={index} code={emoji} size={48} inline={false} />;
        }
        const lottieData = EMOJI_LOTTIE_MAP[emoji];
        if (lottieData) {
          return (
            <div
              key={index}
              className="w-16 h-16 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            >
              <Lottie src={lottieData} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
            </div>
          );
        }
        return (
          <span key={index} className="text-5xl leading-none drop-shadow-md select-none hover:scale-110 transition-transform">
            {emoji}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Interactive Telegram Spoiler Span (tap to reveal with particle effect)
 */
export const TelegramSpoiler: React.FC<{ text: string }> = ({ text }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(!revealed);
      }}
      className={`relative inline-block cursor-pointer px-1 rounded transition-all duration-300 select-none ${
        revealed
          ? 'bg-black/20 text-inherit filter-none'
          : 'bg-neutral-800/80 text-transparent filter blur-[5px] hover:blur-[3px] border border-white/10'
      }`}
      title={revealed ? '' : 'Tap to reveal spoiler'}
    >
      <span className={revealed ? 'opacity-100' : 'opacity-0 select-none'}>{text}</span>
      {!revealed && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/60 font-mono tracking-widest pointer-events-none">
          ░░░
        </span>
      )}
    </span>
  );
};

/**
 * Parses message text and turns URLs, @mentions, #hashtags, /botcommands, spoilers, markdown, and custom emoji tokens into interactive elements
 */
export function renderInteractiveMessageText(
  text: string,
  onLinkClick: (link: ParsedLinkResult) => void
): React.ReactNode[] {
  if (!text) return [];

  // Match: Spoilers ||text||, Bold **text**, Italic __text__, Code `text`, Links/Mentions/Tags/Commands/Emojis
  const pattern = /(\|\|.+?\|\||\*\*.+?\*\*|__.+?__|`[^`]+`|\/[a-zA-Z0-9_]+|https?:\/\/[^\s]+|t\.me\/[^\s]+|tg:\/\/[^\s]+|@[a-zA-Z0-9_]+|#[a-zA-Z0-9_\u0600-\u06FF]+|:[a-zA-Z0-9_-]+:)/g;

  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Spoilers: ||spoiler||
    if (part.startsWith('||') && part.endsWith('||') && part.length > 4) {
      const inner = part.slice(2, -2);
      return <TelegramSpoiler key={index} text={inner} />;
    }

    // 2. Bold: **bold**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold">
          {inner}
        </strong>
      );
    }

    // 3. Italic: __italic__
    if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <em key={index} className="italic">
          {inner}
        </em>
      );
    }

    // 4. Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-black/25 font-mono text-[11px] text-amber-300 border border-white/10 select-all"
        >
          {inner}
        </code>
      );
    }

    // 5. Bot Commands: /start, /help
    if (part.startsWith('/') && part.length > 1 && !part.includes(' ')) {
      return (
        <span
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            onLinkClick({
              type: 'telegram_scheme',
              value: part,
              display: part,
            });
          }}
          className="text-[#2481cc] dark:text-[#64b5f6] hover:underline cursor-pointer font-medium font-mono"
        >
          {part}
        </span>
      );
    }

    // 6. Custom Emoji token match
    if (part.startsWith(':') && part.endsWith(':') && CUSTOM_EMOJIS_MAP[part]) {
      return <CustomAnimatedEmoji key={index} code={part} size={22} inline={true} />;
    }

    // 7. Link / Mention / Tag match
    const linkInfo = parseTelegramUrl(part);
    if (linkInfo) {
      return (
        <span
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            onLinkClick(linkInfo);
          }}
          className="text-sky-400 hover:underline cursor-pointer font-medium hover:text-sky-300 transition-colors inline-block break-all"
        >
          {part}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
}
