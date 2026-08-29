/**
 * MessageObject.ts - Telegram Core Message Model & Entity Parser
 * 
 * Replicated directly from DrKLO/Telegram Android:
 * org.telegram.messenger.MessageObject.java
 * org.telegram.ui.Cells.ChatMessageCell.java
 */

import { Message, MessageMedia } from '../types';
import { TLRPC } from './TLRPC';

export interface MessageEntity {
  type:
    | 'url'
    | 'mention'
    | 'bot_command'
    | 'hashtag'
    | 'bold'
    | 'italic'
    | 'code'
    | 'pre'
    | 'spoiler'
    | 'phone'
    | 'email'
    | 'cashtag'
    | 'custom_emoji';
  offset: number;
  length: number;
  url?: string;
  language?: string;
  documentId?: string;
}

export class MessageObject {
  public messageOwner: Message;
  public messageText: string;
  public entities: MessageEntity[] = [];
  public currentAccount: number = 0;

  // Types corresponding to MessageObject.type in Telegram Android
  public type: number = 0;
  public static readonly TYPE_TEXT = 0;
  public static readonly TYPE_PHOTO = 1;
  public static readonly TYPE_VIDEO = 2;
  public static readonly TYPE_VOICE = 3;
  public static readonly TYPE_DOCUMENT = 4;
  public static readonly TYPE_STICKER = 5;
  public static readonly TYPE_ANIMATED_STICKER = 6;
  public static readonly TYPE_LOCATION = 7;
  public static readonly TYPE_CONTACT = 8;
  public static readonly TYPE_POLL = 9;
  public static readonly TYPE_CALL = 10;
  public static readonly TYPE_ROUND_VIDEO = 11;

  constructor(message: Message, account: number = 0) {
    this.messageOwner = message;
    this.messageText = message.text || '';
    this.currentAccount = account;
    this.classifyType();
    this.parseEntities();
  }

  private classifyType(): void {
    const msg = this.messageOwner;
    if (msg.media) {
      const mType = (msg.media.type as string) || '';
      switch (mType) {
        case 'photo':
          this.type = MessageObject.TYPE_PHOTO;
          break;
        case 'video':
          this.type = MessageObject.TYPE_VIDEO;
          break;
        case 'audio':
        case 'voice':
          this.type = MessageObject.TYPE_VOICE;
          break;
        case 'document':
          this.type = MessageObject.TYPE_DOCUMENT;
          break;
        case 'sticker':
        case 'animated_sticker':
          this.type = MessageObject.TYPE_STICKER;
          break;
        case 'location':
          this.type = MessageObject.TYPE_LOCATION;
          break;
        case 'contact':
          this.type = MessageObject.TYPE_CONTACT;
          break;
        case 'poll':
          this.type = MessageObject.TYPE_POLL;
          break;
        case 'call':
          this.type = MessageObject.TYPE_CALL;
          break;
        case 'video_note':
        case 'round_video':
          this.type = MessageObject.TYPE_ROUND_VIDEO;
          break;
        default:
          this.type = MessageObject.TYPE_TEXT;
      }
    } else {
      this.type = MessageObject.TYPE_TEXT;
    }
  }

  /**
   * DrKLO MessageObject.getEntities()
   * Extracts Telegram rich entities: URLs, mentions, bot commands, hashtags, spoilers, bold, italic, code
   */
  public getEntities(): MessageEntity[] {
    return this.entities;
  }

  public parseEntities(): void {
    const text = this.messageText;
    if (!text) {
      this.entities = [];
      return;
    }

    const entities: MessageEntity[] = [];

    // 1. URLs (https?:// or t.me/ or tg://)
    const urlRegex = /(https?:\/\/[^\s<]+|t\.me\/[^\s<]+|tg:\/\/[^\s<]+)/gi;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(text)) !== null) {
      entities.push({
        type: 'url',
        offset: match.index,
        length: match[0].length,
        url: match[0].startsWith('http') || match[0].startsWith('tg://') ? match[0] : `https://${match[0]}`,
      });
    }

    // 2. Mentions (@username)
    const mentionRegex = /@([a-zA-Z0-9_]{3,32})/g;
    while ((match = mentionRegex.exec(text)) !== null) {
      entities.push({
        type: 'mention',
        offset: match.index,
        length: match[0].length,
        url: `https://t.me/${match[1]}`,
      });
    }

    // 3. Bot commands (/command)
    const cmdRegex = /\/([a-zA-Z0-9_]{1,64})/g;
    while ((match = cmdRegex.exec(text)) !== null) {
      entities.push({
        type: 'bot_command',
        offset: match.index,
        length: match[0].length,
      });
    }

    // 4. Hashtags (#tag)
    const hashtagRegex = /#([a-zA-Z0-9_\u0600-\u06FF]+)/g;
    while ((match = hashtagRegex.exec(text)) !== null) {
      entities.push({
        type: 'hashtag',
        offset: match.index,
        length: match[0].length,
      });
    }

    // 5. Spoilers (||spoiler||)
    const spoilerRegex = /\|\|(.*?)\|\|/g;
    while ((match = spoilerRegex.exec(text)) !== null) {
      entities.push({
        type: 'spoiler',
        offset: match.index,
        length: match[0].length,
      });
    }

    // 6. Bold (**bold**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    while ((match = boldRegex.exec(text)) !== null) {
      entities.push({
        type: 'bold',
        offset: match.index,
        length: match[0].length,
      });
    }

    // 7. Italic (__italic__)
    const italicRegex = /__(.*?)__/g;
    while ((match = italicRegex.exec(text)) !== null) {
      entities.push({
        type: 'italic',
        offset: match.index,
        length: match[0].length,
      });
    }

    // 8. Code (`code`)
    const codeRegex = /`([^`]+)`/g;
    while ((match = codeRegex.exec(text)) !== null) {
      entities.push({
        type: 'code',
        offset: match.index,
        length: match[0].length,
      });
    }

    this.entities = entities.sort((a, b) => a.offset - b.offset);
  }

  // Quick State Checks (Replicating MessageObject flags)
  public isOut(): boolean {
    return !!this.messageOwner.isOutgoing;
  }

  public isUnread(): boolean {
    return this.messageOwner.status !== 'read' && !this.isOut();
  }

  public isSending(): boolean {
    return this.messageOwner.status === 'sending';
  }

  public isSendError(): boolean {
    return (this.messageOwner.status as string) === 'failed';
  }

  public isMediaEmpty(): boolean {
    return !this.messageOwner.media;
  }

  public isVoice(): boolean {
    return this.type === MessageObject.TYPE_VOICE;
  }

  public isVideo(): boolean {
    return this.type === MessageObject.TYPE_VIDEO;
  }

  public isPhoto(): boolean {
    return this.type === MessageObject.TYPE_PHOTO;
  }

  public isSticker(): boolean {
    return this.type === MessageObject.TYPE_STICKER;
  }

  public isPoll(): boolean {
    return this.type === MessageObject.TYPE_POLL;
  }

  public getMedia(): MessageMedia | undefined {
    return this.messageOwner.media;
  }

  public getId(): string {
    return this.messageOwner.id;
  }

  public getDialogId(): string {
    return this.messageOwner.chatId;
  }
}
