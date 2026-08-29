/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import java.util.ArrayList;
import java.util.HashMap;

public class SecretChatHelper {
    private final int currentAccount;
    private static volatile SecretChatHelper[] Instance = new SecretChatHelper[UserConfig.MAX_ACCOUNT_COUNT];

    public static SecretChatHelper getInstance(int num) {
        SecretChatHelper localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (SecretChatHelper.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new SecretChatHelper(num);
                }
            }
        }
        return localInstance;
    }

    public SecretChatHelper(int account) {
        this.currentAccount = account;
    }

    public void startSecretChat(final android.content.Context context, final TLRPC.User user) {
        if (user == null) return;
        TLRPC.TL_messages_requestEncryption req = new TLRPC.TL_messages_requestEncryption();
        req.user_id = MessagesController.getInstance(currentAccount).getInputUser(user.id);
        req.random_id = (int) (Math.random() * Integer.MAX_VALUE);
        req.g_a = new byte[256];

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null && response instanceof TLRPC.EncryptedChat) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.encryptedChatCreated, response
                    );
                }
            });
        });
    }

    public void acceptSecretChat(TLRPC.TL_encryptedChatRequested encryptedChat) {
        if (encryptedChat == null) return;
        TLRPC.TL_messages_acceptEncryption req = new TLRPC.TL_messages_acceptEncryption();
        req.peer = new TLRPC.TL_inputEncryptedChat();
        req.peer.chat_id = encryptedChat.id;
        req.peer.access_hash = encryptedChat.access_hash;
        req.g_b = new byte[256];
        req.key_fingerprint = encryptedChat.key_fingerprint;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.dialogsNeedReload
                    );
                }
            });
        });
    }
}
