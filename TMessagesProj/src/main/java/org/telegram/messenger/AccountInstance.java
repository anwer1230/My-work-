/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;

public class AccountInstance {
    public static final int MAX_ACCOUNT_COUNT = 4;
    private static volatile AccountInstance[] Instance = new AccountInstance[MAX_ACCOUNT_COUNT];

    private final int currentAccount;

    public static AccountInstance getInstance(int num) {
        AccountInstance localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (AccountInstance.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new AccountInstance(num);
                }
            }
        }
        return localInstance;
    }

    public AccountInstance(int instance) {
        currentAccount = instance;
    }

    public int getCurrentAccount() {
        return currentAccount;
    }

    public MessagesController getMessagesController() {
        return MessagesController.getInstance(currentAccount);
    }

    public MessagesStorage getMessagesStorage() {
        return MessagesStorage.getInstance(currentAccount);
    }

    public ConnectionsManager getConnectionsManager() {
        return ConnectionsManager.getInstance(currentAccount);
    }

    public NotificationCenter getNotificationCenter() {
        return NotificationCenter.getInstance(currentAccount);
    }

    public UserConfig getUserConfig() {
        return UserConfig.getInstance(currentAccount);
    }
}
