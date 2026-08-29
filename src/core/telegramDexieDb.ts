import Dexie, { Table } from 'dexie';
import { MyMessagesBatch, LiveDiscoveredLink, SenderBatch } from '../types';

export class TelegramDexieDatabase extends Dexie {
  myMessageBatches!: Table<MyMessagesBatch, string>;
  discoveredLinks!: Table<LiveDiscoveredLink, string>;
  senderBatches!: Table<SenderBatch, string>;

  constructor() {
    super('TelegramLocalDatabase');

    // Define tables and indexed keys
    this.version(1).stores({
      myMessageBatches: 'id, date, timestamp, groupsCount',
      discoveredLinks: 'id, url, sourceChatId, status, timestamp, autoJoined',
      senderBatches: 'id, createdAt, status, isScheduled',
    });
  }
}

export const telegramDb = new TelegramDexieDatabase();

// Seed starter data if database is fresh
export async function initTelegramDexieDb(): Promise<void> {
  try {
    const batchesCount = await telegramDb.myMessageBatches.count();
    if (batchesCount === 0) {
      await telegramDb.myMessageBatches.bulkPut([
        {
          id: 'batch_101',
          text: 'عرض خاص لجميع الطلاب والطالبات! خصم 20% على جميع الخدمات الأكاديمية والاستشارات 🎓✨',
          hasImages: true,
          imagesCount: 1,
          groupsCount: 12,
          targets: [
            { chatId: 'chat_1', chatTitle: 'جروب المطورين التقني', messageId: 'msg_b1' },
            { chatId: 'chat_2', chatTitle: 'قناة التصميم والإبداع', messageId: 'msg_b2' },
          ],
          date: '2026-08-22',
          timestamp: '08:15 AM',
        },
        {
          id: 'batch_102',
          text: '🚀 انضم الآن إلى مجتمع مطوري Telegram MTProto Layer 184 للأتمتة السريعة والمجانية!',
          hasImages: false,
          imagesCount: 0,
          groupsCount: 8,
          targets: [
            { chatId: 'chat_3', chatTitle: 'مجموعة نقاشات التقنية', messageId: 'msg_b3' },
          ],
          date: '2026-08-22',
          timestamp: '08:40 AM',
        },
      ]);
    }

    const linksCount = await telegramDb.discoveredLinks.count();
    if (linksCount === 0) {
      await telegramDb.discoveredLinks.bulkPut([
        {
          id: 'link_init_1',
          url: 'https://t.me/tech_innovators_hub',
          sourceChatTitle: 'جروب المطورين التقني',
          sourceChatId: 'chat_1',
          senderName: 'Alex Developer',
          timestamp: '08:14 AM',
          status: 'joined',
          autoJoined: true,
        },
        {
          id: 'link_init_2',
          url: 'https://t.me/+AbC_Telegram2026_Vip',
          sourceChatTitle: 'مجموعة نقاشات التقنية',
          sourceChatId: 'chat_3',
          senderName: 'Sarah Connor',
          timestamp: '08:25 AM',
          status: 'pending',
          autoJoined: false,
        },
        {
          id: 'link_init_3',
          url: 'https://t.me/toncoin_arabic',
          sourceChatTitle: 'قناة مجتمع العملات الرقمية',
          sourceChatId: 'chat_crypto',
          senderName: 'Crypto Analyst',
          timestamp: '08:42 AM',
          status: 'pending',
          autoJoined: false,
        },
      ]);
    }
  } catch (err) {
    console.warn('[Dexie DB] IndexedDB initialization notice:', err);
  }
}
