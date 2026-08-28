// ============================================================================
// DrKLO/Telegram TMessagesProj: ConnectionsManager.java Architecture
// Source: TMessagesProj/src/main/java/org/telegram/tgnet/ConnectionsManager.java
// ============================================================================

export class ConnectionsManager {
  private static instances: ConnectionsManager[] = [];
  private currentAccount: number;
  private connectionState: number = 3; // 1: Connecting, 2: Updating, 3: Ready

  constructor(instance: number) {
    this.currentAccount = instance;
  }

  public static getInstance(num: number = 0): ConnectionsManager {
    if (!ConnectionsManager.instances[num]) {
      ConnectionsManager.instances[num] = new ConnectionsManager(num);
    }
    return ConnectionsManager.instances[num];
  }

  public getConnectionState(): number {
    return this.connectionState;
  }

  public setConnectionState(state: number) {
    this.connectionState = state;
  }

  public async sendRequest<T = any>(method: string, params: any = {}): Promise<T> {
    const res = await fetch(`/api/telegram/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        account_id: this.currentAccount,
      }),
    });
    return await res.json();
  }
}
