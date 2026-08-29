/**
 * Telegram Link & Identifier Resolver
 * Automatically reads direct links, invite links, and usernames,
 * converting them into valid MTProto / TDLib / Bot API group identifiers.
 */

export interface ResolvedGroupTarget {
  raw: string;
  type: 'username' | 'invite' | 'internal_id' | 'channel_post' | 'chat_id' | 'unknown';
  identifier: string; // MTProto target e.g. "@group_name", "+Abc12345", "-1001234567890"
  normalizedUrl: string;
  cleanName: string;
  isValid: boolean;
}

/**
 * Resolves a single Telegram link or identifier into a canonical entity
 */
export function resolveTelegramLink(input: string): ResolvedGroupTarget {
  const raw = (input || '').trim();
  if (!raw) {
    return {
      raw: '',
      type: 'unknown',
      identifier: '',
      normalizedUrl: '',
      cleanName: '',
      isValid: false,
    };
  }

  // 1. Private Invite Links: https://t.me/+hash, t.me/joinchat/hash, tg://join?invite=hash
  const inviteRegex = /(?:https?:\/\/)?(?:t(?:elegram)?\.me\/(?:\+|joinchat\/)|tg:\/\/join\?invite=)([a-zA-Z0-9_-]+)/i;
  const inviteMatch = raw.match(inviteRegex);
  if (inviteMatch) {
    const inviteHash = inviteMatch[1];
    return {
      raw,
      type: 'invite',
      identifier: `+${inviteHash}`,
      normalizedUrl: `https://t.me/+${inviteHash}`,
      cleanName: `دعوة خاصة (+${inviteHash.substring(0, 6)}...)`,
      isValid: true,
    };
  }

  // 2. Private Channel / Supergroup internal IDs: https://t.me/c/1234567890/10 or t.me/c/1234567890
  const internalIdRegex = /(?:https?:\/\/)?(?:t(?:elegram)?\.me\/c\/)(\d+)(?:\/\d+)?/i;
  const internalIdMatch = raw.match(internalIdRegex);
  if (internalIdMatch) {
    const rawId = internalIdMatch[1];
    const fullChannelId = `-100${rawId}`;
    return {
      raw,
      type: 'internal_id',
      identifier: fullChannelId,
      normalizedUrl: `https://t.me/c/${rawId}`,
      cleanName: `قناة داخلية (${fullChannelId})`,
      isValid: true,
    };
  }

  // 3. Channel Post / Topic Link: https://t.me/username/1234
  const postRegex = /(?:https?:\/\/)?(?:t(?:elegram)?\.me\/)([a-zA-Z0-9_]{3,32})\/(\d+)/i;
  const postMatch = raw.match(postRegex);
  if (postMatch && postMatch[1] !== 'joinchat' && postMatch[1] !== 'c') {
    const username = postMatch[1];
    return {
      raw,
      type: 'channel_post',
      identifier: `@${username}`,
      normalizedUrl: `https://t.me/${username}`,
      cleanName: `@${username} (منشور #${postMatch[2]})`,
      isValid: true,
    };
  }

  // 4. Native tg:// scheme: tg://resolve?domain=username
  if (raw.startsWith('tg://')) {
    const domainMatch = raw.match(/tg:\/\/resolve\?domain=([a-zA-Z0-9_]+)/i);
    if (domainMatch) {
      const username = domainMatch[1];
      return {
        raw,
        type: 'username',
        identifier: `@${username}`,
        normalizedUrl: `https://t.me/${username}`,
        cleanName: `@${username}`,
        isValid: true,
      };
    }
  }

  // 5. Standard Public Group / Channel Link: https://t.me/username or t.me/username or telegram.me/username
  const publicUrlRegex = /(?:https?:\/\/)?(?:t(?:elegram)?\.me\/)([a-zA-Z0-9_]{3,32})\/?$/i;
  const publicUrlMatch = raw.match(publicUrlRegex);
  if (publicUrlMatch) {
    const username = publicUrlMatch[1];
    return {
      raw,
      type: 'username',
      identifier: `@${username}`,
      normalizedUrl: `https://t.me/${username}`,
      cleanName: `@${username}`,
      isValid: true,
    };
  }

  // 6. Direct @username syntax: @my_group
  if (raw.startsWith('@')) {
    const cleanUsername = raw.substring(1).trim();
    if (/^[a-zA-Z0-9_]{3,32}$/.test(cleanUsername)) {
      return {
        raw,
        type: 'username',
        identifier: `@${cleanUsername}`,
        normalizedUrl: `https://t.me/${cleanUsername}`,
        cleanName: `@${cleanUsername}`,
        isValid: true,
      };
    }
  }

  // 7. Numeric chat / channel ID: -1001234567890 or 123456789
  if (/^-?\d{5,16}$/.test(raw)) {
    return {
      raw,
      type: 'chat_id',
      identifier: raw,
      normalizedUrl: `tg://openmessage?chat_id=${raw}`,
      cleanName: `معرف محادثة (${raw})`,
      isValid: true,
    };
  }

  // 8. Plain username without @ or protocol: my_group_name
  if (/^[a-zA-Z0-9_]{3,32}$/.test(raw) && !/^\d+$/.test(raw)) {
    return {
      raw,
      type: 'username',
      identifier: `@${raw}`,
      normalizedUrl: `https://t.me/${raw}`,
      cleanName: `@${raw}`,
      isValid: true,
    };
  }

  // Fallback / Unknown format
  return {
    raw,
    type: 'unknown',
    identifier: raw,
    normalizedUrl: raw.startsWith('http') ? raw : `https://${raw}`,
    cleanName: raw,
    isValid: raw.length > 2,
  };
}

/**
 * Parses multiple links from a raw multiline/comma-separated text
 * Returns deduplicated list of resolved targets
 */
export function parseMultipleGroupLinks(text: string): ResolvedGroupTarget[] {
  if (!text) return [];

  // Split by newlines, commas, semicolons or spaces
  const lines = text
    .split(/[\r\n,;]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const seen = new Set<string>();
  const resolved: ResolvedGroupTarget[] = [];

  for (const line of lines) {
    const target = resolveTelegramLink(line);
    const key = target.identifier.toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      resolved.push(target);
    }
  }

  return resolved;
}
