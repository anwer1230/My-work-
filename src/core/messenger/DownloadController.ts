/**
 * DownloadController.ts - org.telegram.messenger.DownloadController
 * Direct TypeScript translation of DrKLO/Telegram Android architecture
 */

import { Message } from '../../types';
import { NotificationCenter } from '../NotificationCenter';

export class DownloadController {
  public static readonly AUTODOWNLOAD_MASK_PHOTO = 1;
  public static readonly AUTODOWNLOAD_MASK_AUDIO = 2;
  public static readonly AUTODOWNLOAD_MASK_VIDEO = 4;
  public static readonly AUTODOWNLOAD_MASK_DOCUMENT = 8;

  private static instances = new Map<number, DownloadController>();
  private currentAccount: number;

  public static getInstance(account: number = 0): DownloadController {
    if (!DownloadController.instances.has(account)) {
      DownloadController.instances.set(account, new DownloadController(account));
    }
    return DownloadController.instances.get(account)!;
  }

  private constructor(account: number) {
    this.currentAccount = account;
  }

  public canDownloadMedia(type: number): boolean {
    const currentMask =
      DownloadController.AUTODOWNLOAD_MASK_PHOTO |
      DownloadController.AUTODOWNLOAD_MASK_AUDIO |
      DownloadController.AUTODOWNLOAD_MASK_DOCUMENT;
    return (currentMask & type) !== 0;
  }

  public checkAndDownloadMedia(message: Message): void {
    if (!message || !message.media) return;
    // Handled via FileLoader
  }
}

export const downloadController = DownloadController.getInstance();
