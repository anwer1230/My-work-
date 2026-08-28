// ============================================================================
// DrKLO/Telegram TMessagesProj: AccountInstance.java Architecture
// Source: TMessagesProj/src/main/java/org/telegram/messenger/AccountInstance.java
// ============================================================================

import { UserConfig } from './userConfig';
import { MessagesController } from './messagesController';
import { MessagesStorage } from './messagesStorage';
import { ConnectionsManager } from './connectionsManager';

export class AccountInstance {
  private static instances: AccountInstance[] = new Array(UserConfig.MAX_ACCOUNT_COUNT);
  private currentAccount: number;

  constructor(instance: number) {
    this.currentAccount = instance;
  }

  public static getInstance(num: number = 0): AccountInstance {
    const idx = Math.max(0, Math.min(num, UserConfig.MAX_ACCOUNT_COUNT - 1));
    if (!AccountInstance.instances[idx]) {
      AccountInstance.instances[idx] = new AccountInstance(idx);
    }
    return AccountInstance.instances[idx];
  }

  public getCurrentAccount(): number {
    return this.currentAccount;
  }

  public getUserConfig(): UserConfig {
    return UserConfig.getInstance(this.currentAccount);
  }

  public getMessagesController(): MessagesController {
    return MessagesController.getInstance(this.currentAccount);
  }

  public getMessagesStorage(): MessagesStorage {
    return MessagesStorage.getInstance(this.currentAccount);
  }

  public getConnectionsManager(): ConnectionsManager {
    return ConnectionsManager.getInstance(this.currentAccount);
  }

  /**
   * Switches the active account, initializes its controller, and loads only its real dialogs
   */
  public static setAsPrimaryAccount(realAccountNum: number) {
    UserConfig.selectedAccount = realAccountNum;
    const realInstance = AccountInstance.getInstance(realAccountNum);
    realInstance.getMessagesController().loadDialogs(0, 100, true);
  }
}

export const accountInstance = AccountInstance.getInstance(0);
