/**
 * TDLibEngine.ts - Telegram Database Library (TDLib) Bridge & Execution Engine
 * Replicated from tdlib/td & TDLib JNI bindings in DrKLO/Telegram Android
 */

import { TdApi } from './tdlib/TdApi';
import { tdClient, TdClient } from './tdlib/TdClient';
import { TLRPC } from './TLRPC';
import { telegramDb } from './telegramDexieDb';
import { Chat, Message, User } from '../types';

export class TDLibEngine {
  private static instance: TDLibEngine;
  private client: TdClient;
  private isReady = false;

  public static getInstance(): TDLibEngine {
    if (!TDLibEngine.instance) {
      TDLibEngine.instance = new TDLibEngine();
    }
    return TDLibEngine.instance;
  }

  private constructor() {
    this.client = tdClient;
  }

  public async initialize(): Promise<void> {
    if (this.isReady) return;
    try {
      await this.client.init({
        api_id: 2040,
        api_hash: 'b18441a1ff607e10a989891a5462e627',
        application_version: '10.14.0',
        device_model: 'Web Client',
        system_language_code: 'ar',
        system_version: '1.0',
      });
      this.isReady = true;
      console.log('[TDLib Engine] TDLib & SQLite persistent database fully initialized.');
    } catch (e) {
      console.warn('[TDLib Engine] Initialization error:', e);
    }
  }

  /**
   * Returns direct access to the core TdClient
   */
  public getClient(): TdClient {
    return this.client;
  }

  /**
   * Execute TDLib JSON / Object query
   */
  public async execute<T = any>(query: { '@type': string; [key: string]: any }): Promise<T> {
    await this.initialize();
    return this.client.send<T>(query as unknown as TdApi.Object);
  }
}

export const tdlib = TDLibEngine.getInstance();
