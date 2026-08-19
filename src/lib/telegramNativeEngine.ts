/**
 * ============================================================================
 * TELEGRAM OFFICIAL NATIVE ENGINE (Ported from DrKLO/Telegram Android)
 * Source Reference: https://github.com/DrKLO/Telegram
 * - MessagesController.java & LinkPath.java
 * - ChatMessageCell.java & MessageObject.java
 * - NotificationsController.java & TLRPC.java
 * ============================================================================
 */

// ── 1. MTProto TL-SCHEMA TYPES FOR INVITE LINKS & CHATS ──────────────────────

export interface TL_chatInvite {
  _: 'chatInvite';
  flags: number;
  channel?: boolean;
  broadcast?: boolean;
  public?: boolean;
  megagroup?: boolean;
  request_needed?: boolean;
  verified?: boolean;
  scam?: boolean;
  fake?: boolean;
  title: string;
  about?: string;
  photo?: string;
  participants_count: number;
  participants?: Array<{ id: number | string; name: string; avatar?: string }>;
  hash: string;
  raw_url: string;
}

export interface TL_chatInviteAlready {
  _: 'chatInviteAlready';
  chat: {
    id: number | string;
    title: string;
    type: 'group' | 'supergroup' | 'channel';
    members_count?: number;
    avatar?: string;
    username?: string;
  };
}

export interface TL_chatInvitePeek {
  _: 'chatInvitePeek';
  chat: {
    id: number | string;
    title: string;
    members_count?: number;
  };
  expires: number;
}

export type ChatInviteResult = TL_chatInvite | TL_chatInviteAlready | TL_chatInvitePeek;

export interface InviteLinkParseResult {
  valid: boolean;
  type: 'private_invite' | 'public_username' | 'telegram_me_join' | 'tg_protocol' | 'unknown';
  hashOrUsername: string;
  originalUrl: string;
  cleanUrl: string;
}

// ── 2. LINK PARSER (Regex from DrKLO/Telegram Android LinkPath.java) ──────────

export class TelegramLinkEngine {
  // Matches t.me/joinchat/HASH, t.me/+HASH, telegram.me/joinchat/HASH, etc.
  private static PRIVATE_INVITE_REGEX =
    /(?:https?:\/\/)?(?:www\.)?(?:t(?:elegram)?\.(?:me|dog)|telegram\.org)\/(?:joinchat\/|\+)([a-zA-Z0-9_-]{10,32})/i;

  // Matches t.me/username, telegram.me/username, t.me/username/123 (message link)
  private static PUBLIC_USERNAME_REGEX =
    /(?:https?:\/\/)?(?:www\.)?(?:t(?:elegram)?\.(?:me|dog)|telegram\.org)\/([a-zA-Z0-9_]{4,32})(?:\/([0-9]+))?/i;

  // Matches tg://join?invite=HASH
  private static TG_JOIN_DEEPLINK_REGEX = /tg:\/\/join\?invite=([a-zA-Z0-9_-]+)/i;

  // Matches tg://resolve?domain=username
  private static TG_RESOLVE_DEEPLINK_REGEX = /tg:\/\/resolve\?domain=([a-zA-Z0-9_]+)/i;

  /**
   * Parses any Telegram link string and extracts its canonical type and identifier.
   */
  public static parseLink(rawInput: string): InviteLinkParseResult {
    const input = rawInput.trim();

    // 1. Check tg://join?invite=
    const tgJoinMatch = input.match(this.TG_JOIN_DEEPLINK_REGEX);
    if (tgJoinMatch && tgJoinMatch[1]) {
      return {
        valid: true,
        type: 'tg_protocol',
        hashOrUsername: tgJoinMatch[1],
        originalUrl: input,
        cleanUrl: `https://t.me/+${tgJoinMatch[1]}`,
      };
    }

    // 2. Check tg://resolve?domain=
    const tgResolveMatch = input.match(this.TG_RESOLVE_DEEPLINK_REGEX);
    if (tgResolveMatch && tgResolveMatch[1]) {
      return {
        valid: true,
        type: 'public_username',
        hashOrUsername: tgResolveMatch[1],
        originalUrl: input,
        cleanUrl: `https://t.me/${tgResolveMatch[1]}`,
      };
    }

    // 3. Check Private Invite Link (joinchat or +)
    const privMatch = input.match(this.PRIVATE_INVITE_REGEX);
    if (privMatch && privMatch[1]) {
      return {
        valid: true,
        type: 'private_invite',
        hashOrUsername: privMatch[1],
        originalUrl: input,
        cleanUrl: `https://t.me/+${privMatch[1]}`,
      };
    }

    // 4. Check Public Username Link
    const pubMatch = input.match(this.PUBLIC_USERNAME_REGEX);
    if (pubMatch && pubMatch[1]) {
      const username = pubMatch[1];
      // Filter out reserved system routes
      if (!['joinchat', 'addstickers', 'addtheme', 'share', 'setlanguage', 'contact', 'proxy'].includes(username.toLowerCase())) {
        return {
          valid: true,
          type: 'public_username',
          hashOrUsername: username,
          originalUrl: input,
          cleanUrl: `https://t.me/${username}`,
        };
      }
    }

    // 5. Bare username without URL prefix (@groupname or groupname)
    if (/^@?[a-zA-Z0-9_]{4,32}$/.test(input)) {
      const u = input.replace(/^@/, '');
      return {
        valid: true,
        type: 'public_username',
        hashOrUsername: u,
        originalUrl: input,
        cleanUrl: `https://t.me/${u}`,
      };
    }

    return {
      valid: false,
      type: 'unknown',
      hashOrUsername: '',
      originalUrl: input,
      cleanUrl: input,
    };
  }

  /**
   * Bulk extracts all valid Telegram invite and channel links from any unstructured text.
   */
  public static extractAllLinks(text: string): InviteLinkParseResult[] {
    if (!text) return [];
    const results: InviteLinkParseResult[] = [];
    const tokens = text.split(/[\s,;\n\r<>"'()[\]{}|]+/);

    const seen = new Set<string>();

    for (const token of tokens) {
      if (!token) continue;
      const parsed = this.parseLink(token);
      if (parsed.valid && !seen.has(parsed.cleanUrl.toLowerCase())) {
        seen.add(parsed.cleanUrl.toLowerCase());
        results.push(parsed);
      }
    }

    return results;
  }
}

// ── 3. INVITE & JOIN RPC ENGINE (DrKLO MessagesController.java) ───────────────

export class TelegramJoinRpcEngine {
  /**
   * Step 1: messages.checkChatInvite#3ebd0e88
   * Validates invite hash and fetches preview without joining.
   */
  public static async checkChatInvite(hash: string): Promise<{ success: boolean; data?: ChatInviteResult; error?: string }> {
    try {
      const res = await fetch('/api/telegram/check_invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.invite };
      }
      return { success: false, error: data.error || 'INVITE_HASH_INVALID' };
    } catch (e: any) {
      return { success: false, error: e.message || 'NETWORK_ERROR' };
    }
  }

  /**
   * Step 2: messages.importChatInvite#6c500570
   * Joins the target chat or sends join request if approval is required.
   */
  public static async importChatInvite(hash: string): Promise<{ success: boolean; chat?: any; status: string; error?: string }> {
    try {
      const res = await fetch('/api/autojoin/join_one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: `https://t.me/+${hash}` }),
      });
      const data = await res.json();
      if (data.success) {
        return {
          success: true,
          chat: data.chat,
          status: data.already_joined ? 'ALREADY_JOINED' : 'JOINED_SUCCESSFULLY',
        };
      }
      return {
        success: false,
        status: data.error || 'JOIN_FAILED',
        error: data.message || data.error,
      };
    } catch (e: any) {
      return {
        success: false,
        status: 'NETWORK_ERROR',
        error: e.message || 'تعذر الاتصال بخادم تليجرام',
      };
    }
  }
}

// ── 4. CHAT BUBBLE & MESSAGE CELL LAYOUT MATH (ChatMessageCell.java) ──────────

export interface BubbleLayoutDimensions {
  bubbleWidthPercent: number; // e.g. 75%
  maxBubbleWidthPx: number;
  outerBorderRadiusPx: number; // 16px
  chainedBorderRadiusPx: number; // 6px
  avatarSizePx: number; // 38px
  tailWidthPx: number; // 6px
  tailHeightPx: number; // 14px
  timeInsetPx: number; // 6px
  nameColor: string;
}

export class TelegramLayoutEngine {
  /**
   * Calculates bubble corner radiuses based on message grouping in a sequence
   * (e.g. first message, middle chained message, last message with tail).
   */
  public static calculateBubbleCorners(isOutgoing: boolean, isFirstInGroup: boolean, isLastInGroup: boolean): string {
    const R_OUTER = '16px';
    const R_CHAIN = '6px';
    const R_TAIL = isOutgoing ? '2px' : '2px';

    if (isOutgoing) {
      // Outgoing message (Right aligned)
      const topLeft = R_OUTER;
      const topRight = isFirstInGroup ? R_OUTER : R_CHAIN;
      const bottomRight = isLastInGroup ? R_TAIL : R_CHAIN;
      const bottomLeft = R_OUTER;
      return `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
    } else {
      // Incoming message (Left aligned)
      const topLeft = isFirstInGroup ? R_OUTER : R_CHAIN;
      const topRight = R_OUTER;
      const bottomRight = R_OUTER;
      const bottomLeft = isLastInGroup ? R_TAIL : R_CHAIN;
      return `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
    }
  }

  /**
   * Deterministic 7-Color algorithm for group participant names from DrKLO AvatarDrawable.java
   */
  public static getSenderColor(senderId: string | number, name: string): string {
    const PALETTE = [
      '#e17076', // Red
      '#faa774', // Orange
      '#a695e7', // Violet
      '#7bc862', // Green
      '#6ec9cb', // Cyan
      '#65aadd', // Blue
      '#ee7aae', // Pink
    ];

    if (typeof senderId === 'number') {
      return PALETTE[Math.abs(senderId) % 7];
    }
    const str = String(senderId || name || 'User');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
    }
    return PALETTE[Math.abs(hash) % 7];
  }
}
