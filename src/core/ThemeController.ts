/**
 * ThemeController.ts - Theme Engine, Color Keys & UI Metrics
 * 
 * Replicated directly from DrKLO/Telegram Android:
 * org.telegram.ui.ActionBar.Theme.java
 */

import { AndroidUtilities } from './AndroidUtilities';

export interface ThemeMetrics {
  fontSize: number;          // 12 .. 30sp (default 16sp)
  bubbleRadius: number;      // 0 .. 24dp (default 16dp)
  bubblePaddingH: number;    // 12dp
  bubblePaddingV: number;    // 6dp
  avatarRadius: number;      // 50% circular
  iconSize: number;          // 24dp
  iconSmallSize: number;     // 18dp
  headerHeight: number;      // 56dp
  bottomBarHeight: number;   // 64dp
}

export interface ThemeColors {
  windowBackgroundWhite: string;
  windowBackgroundGray: string;
  actionBarDefault: string;
  actionBarDefaultTitle: string;
  chat_inBubble: string;
  chat_outBubble: string;
  chat_inBubbleSelected: string;
  chat_outBubbleSelected: string;
  chat_messageTextIn: string;
  chat_messageTextOut: string;
  chat_inTimeText: string;
  chat_outTimeText: string;
  chat_inForwardedNameText: string;
  chat_outForwardedNameText: string;
  chat_inReplyNameText: string;
  chat_outReplyNameText: string;
  chat_inReplyMessageText: string;
  chat_outReplyMessageText: string;
  chat_unreadMessagesStartText: string;
  chat_unreadMessagesStartBackground: string;
}

export class ThemeController {
  private static instance: ThemeController;

  private metrics: ThemeMetrics = {
    fontSize: 16,
    bubbleRadius: 16,
    bubblePaddingH: 12,
    bubblePaddingV: 6,
    avatarRadius: 50,
    iconSize: 24,
    iconSmallSize: 18,
    headerHeight: 56,
    bottomBarHeight: 64,
  };

  private isNightMode: boolean = false;

  public static getInstance(): ThemeController {
    if (!ThemeController.instance) {
      ThemeController.instance = new ThemeController();
    }
    return ThemeController.instance;
  }

  private constructor() {
    this.loadPersistedTheme();
  }

  private loadPersistedTheme() {
    try {
      const savedFontSize = localStorage.getItem('tg_font_size');
      if (savedFontSize) {
        this.metrics.fontSize = parseInt(savedFontSize, 10);
      }
      const savedRadius = localStorage.getItem('tg_bubble_radius');
      if (savedRadius) {
        this.metrics.bubbleRadius = parseInt(savedRadius, 10);
      }
      this.applyAllStyles();
    } catch {}
  }

  public getMetrics(): ThemeMetrics {
    return { ...this.metrics };
  }

  /**
   * Applies font scaling (12px .. 30px) to the document
   */
  public applyFontSize(fontSize: number) {
    const clamped = Math.max(12, Math.min(30, fontSize));
    this.metrics.fontSize = clamped;
    localStorage.setItem('tg_font_size', clamped.toString());

    document.documentElement.style.setProperty('--tg-chat-font-size', `${clamped}px`);
    document.documentElement.style.setProperty(
      '--tg-chat-bubble-scale',
      `${(clamped / 16).toFixed(2)}`
    );
  }

  /**
   * Applies bubble corner radius (0px .. 24px)
   */
  public applyBubbleCornerRadius(radius: number) {
    const clamped = Math.max(0, Math.min(24, radius));
    this.metrics.bubbleRadius = clamped;
    localStorage.setItem('tg_bubble_radius', clamped.toString());

    document.documentElement.style.setProperty('--tg-bubble-corner-radius', `${clamped}px`);
  }

  public applyAllStyles() {
    this.applyFontSize(this.metrics.fontSize);
    this.applyBubbleCornerRadius(this.metrics.bubbleRadius);
    document.documentElement.style.setProperty('--tg-bubble-padding-h', `${this.metrics.bubblePaddingH}px`);
    document.documentElement.style.setProperty('--tg-bubble-padding-v', `${this.metrics.bubblePaddingV}px`);
  }

  /**
   * Calculates merged bubble border radius classes based on grouping flags
   */
  public getBubbleRadiusStyle(isOutgoing: boolean, group: {
    isGroupStart?: boolean;
    isGroupMiddle?: boolean;
    isGroupEnd?: boolean;
    isSingle?: boolean;
  }): string {
    const r = `${this.metrics.bubbleRadius}px`;
    const smR = '4px';

    if (group.isSingle) {
      return `${r}`;
    }

    if (isOutgoing) {
      // Outgoing message (right aligned)
      if (group.isGroupStart) return `${r} ${r} ${smR} ${r}`;
      if (group.isGroupMiddle) return `${r} ${smR} ${smR} ${r}`;
      if (group.isGroupEnd) return `${r} ${smR} ${r} ${r}`;
    } else {
      // Incoming message (left aligned)
      if (group.isGroupStart) return `${r} ${r} ${r} ${smR}`;
      if (group.isGroupMiddle) return `${smR} ${r} ${r} ${smR}`;
      if (group.isGroupEnd) return `${smR} ${r} ${r} ${r}`;
    }

    return `${r}`;
  }
}

export const themeController = ThemeController.getInstance();
