/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import android.content.Context;
import android.content.SharedPreferences;
import org.telegram.tgnet.TLRPC;

public class NotificationsController {
    private final int currentAccount;
    private static volatile NotificationsController[] Instance = new NotificationsController[UserConfig.MAX_ACCOUNT_COUNT];

    public static NotificationsController getInstance(int num) {
        NotificationsController localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (NotificationsController.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new NotificationsController(num);
                }
            }
        }
        return localInstance;
    }

    public NotificationsController(int account) {
        this.currentAccount = account;
    }

    public void showNotification(TLRPC.Message message, TLRPC.User fromUser, TLRPC.Chat fromChat) {
        if (ApplicationLoader.applicationContext == null) return;
        SharedPreferences preferences = ApplicationLoader.applicationContext.getSharedPreferences("Notifications", Context.MODE_PRIVATE);
        boolean globalEnabled = preferences.getBoolean("EnableAll", true);
        if (!globalEnabled) return;

        String title = fromChat != null ? fromChat.title : (fromUser != null ? fromUser.first_name : "Telegram");
        String messageText = message.message != null ? message.message : "Media message";

        FileLog.d("NotificationsController: Displayed push -> " + title + ": " + messageText);
    }
}
