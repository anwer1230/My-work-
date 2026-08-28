// ============================================================================
// DrKLO/Telegram TMessagesProj: UserConfig.java Architecture
// Source: TMessagesProj/src/main/java/org/telegram/messenger/UserConfig.java
// ============================================================================

export interface TLRPCUser {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  photo?: string | null;
  status?: any;
  is_self?: boolean;
  bot?: boolean;
  verified?: boolean;
  premium?: boolean;
  access_hash?: string;
}

export class UserConfig {
  public static readonly MAX_ACCOUNT_COUNT = 4;
  public static selectedAccount = 0;
  private static instances: UserConfig[] = new Array(UserConfig.MAX_ACCOUNT_COUNT);

  public currentUser: TLRPCUser | null = null;
  public clientActivated: boolean = false;
  public clientUserId: string | number = 0;
  public currentAccount: number;
  public isRealAccount: boolean = false;

  constructor(instance: number) {
    this.currentAccount = instance;
    this.loadConfig();
  }

  public static getInstance(num: number = 0): UserConfig {
    const idx = Math.max(0, Math.min(num, UserConfig.MAX_ACCOUNT_COUNT - 1));
    if (!UserConfig.instances[idx]) {
      UserConfig.instances[idx] = new UserConfig(idx);
    }
    return UserConfig.instances[idx];
  }

  public isClientActivated(): boolean {
    return this.currentUser !== null && this.clientActivated;
  }

  public getClientUserId(): string | number {
    return this.currentUser ? this.currentUser.id : 0;
  }

  public getCurrentUser(): TLRPCUser | null {
    return this.currentUser;
  }

  public setCurrentUser(user: TLRPCUser | null, isReal: boolean = true) {
    this.currentUser = user;
    this.clientActivated = user !== null;
    this.clientUserId = user ? user.id : 0;
    this.isRealAccount = isReal;
    this.saveConfig();
  }

  /**
   * Cleans all configuration, sessions, and demo accounts from localStorage
   */
  public clearConfig() {
    this.currentUser = null;
    this.clientActivated = false;
    this.clientUserId = 0;
    this.isRealAccount = false;

    const storageKey = `userconfig_${this.currentAccount}`;
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`tg_session_${this.currentAccount}`);
      if (this.currentAccount === 0) {
        localStorage.removeItem('userconfig');
        localStorage.removeItem('tg_session');
      }
    } catch (e) {
      console.warn('Failed to clear UserConfig preferences:', e);
    }
  }

  public saveConfig() {
    const storageKey = `userconfig_${this.currentAccount}`;
    try {
      if (this.currentUser) {
        const payload = JSON.stringify({
          currentUser: this.currentUser,
          clientActivated: this.clientActivated,
          clientUserId: this.clientUserId,
          isRealAccount: this.isRealAccount,
          savedAt: Date.now(),
        });
        localStorage.setItem(storageKey, payload);
        if (this.currentAccount === 0) {
          localStorage.setItem('userconfig', payload);
        }
      } else {
        localStorage.removeItem(storageKey);
        if (this.currentAccount === 0) {
          localStorage.removeItem('userconfig');
        }
      }
    } catch (e) {
      console.warn('Failed to save UserConfig:', e);
    }
  }

  public loadConfig() {
    try {
      const storageKey = `userconfig_${this.currentAccount}`;
      let raw = localStorage.getItem(storageKey);
      if (!raw && this.currentAccount === 0) {
        raw = localStorage.getItem('userconfig');
      }
      if (raw) {
        const data = JSON.parse(raw);
        this.currentUser = data.currentUser || null;
        this.clientActivated = Boolean(data.clientActivated && this.currentUser);
        this.clientUserId = data.clientUserId || (this.currentUser ? this.currentUser.id : 0);
        this.isRealAccount = Boolean(data.isRealAccount);
      }
    } catch (e) {
      console.warn('Failed to load UserConfig:', e);
    }
  }
}

export const userConfig = UserConfig.getInstance(0);
