/**
 * DialogsController.ts
 * 
 * Direct implementation of org.telegram.messenger.DialogsController.java
 * Responsible for sorting, pinned dialogs management, folder/filter routing, 
 * unread counters calculation and conversation ranking in DrKLO/Telegram Android.
 */

import { TLRPC } from '../TLRPC';
import { NotificationCenter } from '../NotificationCenter';

export interface DialogItem {
  id: string | number;
  unread_count: number;
  unread_mentions_count: number;
  unread_reactions_count: number;
  last_message_date: number;
  top_message_id: number;
  is_pinned: boolean;
  pinned_order: number;
  flags: number;
  folder_id: number;
  draft?: TLRPC.DraftMessage;
}

export class DialogsController {
  private static instances: Map<number, DialogsController> = new Map();
  private currentAccount: number = 0;

  // Dialog lists partitioned by folder (0 = Main, 1 = Archive, etc.)
  public dialogs_dict: Map<string | number, TLRPC.TL_dialog> = new Map();
  public allDialogs: TLRPC.TL_dialog[] = [];
  public dialogs_serverOnly: TLRPC.TL_dialog[] = [];
  public dialogs_folders: Map<number, TLRPC.TL_dialog[]> = new Map();

  // Pinned dialogs order list
  public pinnedDialogs: (string | number)[] = [];

  public static getInstance(account: number = 0): DialogsController {
    let instance = DialogsController.instances.get(account);
    if (!instance) {
      instance = new DialogsController(account);
      DialogsController.instances.set(account, instance);
    }
    return instance;
  }

  constructor(account: number) {
    this.currentAccount = account;
  }

  /**
   * Sorts dialogs list according to DrKLO/Telegram ordering logic:
   * 1. Pinned items at the top (sorted by pinnedIndex/pinnedOrder)
   * 2. Non-pinned items sorted descending by max(last_message_date, draft.date)
   */
  public sortDialogs(folderId: number = 0): TLRPC.TL_dialog[] {
    const list = this.dialogs_folders.get(folderId) || this.allDialogs;

    list.sort((a, b) => {
      const aPinned = a.pinned;
      const bPinned = b.pinned;

      // Both are pinned -> sort by pinnedIndex/pinned_order
      if (aPinned && bPinned) {
        return (a.pinnedNum || 0) - (b.pinnedNum || 0);
      }
      // a is pinned -> a comes first
      if (aPinned && !bPinned) return -1;
      // b is pinned -> b comes first
      if (!aPinned && bPinned) return 1;

      // Neither is pinned -> sort by effective activity date (top message or draft)
      const aDate = Math.max(a.last_message_date || 0, a.draft?.date || 0);
      const bDate = Math.max(b.last_message_date || 0, b.draft?.date || 0);

      return bDate - aDate;
    });

    this.dialogs_folders.set(folderId, list);
    return list;
  }

  /**
   * Updates or inserts a dialog after a new message arrives or changes
   */
  public processDialogUpdate(
    dialogId: string | number,
    topMessageId: number,
    date: number,
    unreadDelta: number = 0,
    folderId: number = 0
  ): TLRPC.TL_dialog {
    let dialog = this.dialogs_dict.get(dialogId);

    if (!dialog) {
      dialog = {
        _: 'dialog',
        id: dialogId,
        top_message: topMessageId,
        last_message_date: date,
        unread_count: Math.max(0, unreadDelta),
        unread_mentions_count: 0,
        unread_reactions_count: 0,
        flags: 0,
        folder_id: folderId,
        pinned: false,
        pinnedNum: 0,
      };
      this.dialogs_dict.set(dialogId, dialog);
      this.allDialogs.push(dialog);
    } else {
      dialog.top_message = topMessageId;
      dialog.last_message_date = Math.max(dialog.last_message_date || 0, date);
      if (unreadDelta !== 0) {
        dialog.unread_count = Math.max(0, (dialog.unread_count || 0) + unreadDelta);
      }
    }

    // Re-sort after updating top message
    this.sortDialogs(folderId);

    // Notify UI adapter that dialogs order has changed
    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.dialogsNeedReload
    );

    return dialog;
  }

  /**
   * Sets pinned status and order
   */
  public setDialogPinned(dialogId: string | number, pinned: boolean, folderId: number = 0): boolean {
    const dialog = this.dialogs_dict.get(dialogId);
    if (!dialog) return false;

    dialog.pinned = pinned;
    if (pinned) {
      dialog.pinnedNum = Date.now();
      if (!this.pinnedDialogs.includes(dialogId)) {
        this.pinnedDialogs.unshift(dialogId);
      }
    } else {
      dialog.pinnedNum = 0;
      this.pinnedDialogs = this.pinnedDialogs.filter((id) => id !== dialogId);
    }

    this.sortDialogs(folderId);
    NotificationCenter.getInstance(this.currentAccount).postNotificationName(
      NotificationCenter.dialogsNeedReload
    );
    return true;
  }

  /**
   * Marks unread messages in a dialog as read
   */
  public markDialogAsRead(dialogId: string | number, maxId: number): void {
    const dialog = this.dialogs_dict.get(dialogId);
    if (dialog) {
      dialog.unread_count = 0;
      dialog.read_inbox_max_id = maxId;
      NotificationCenter.getInstance(this.currentAccount).postNotificationName(
        NotificationCenter.updateInterfaces,
        NotificationCenter.UPDATE_MASK_READ_DIALOG_MESSAGE
      );
    }
  }
}

export const dialogsController = DialogsController.getInstance(0);
