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

public class GroupCallMessagesController {
    private final int currentAccount;
    private static volatile GroupCallMessagesController[] Instance = new GroupCallMessagesController[UserConfig.MAX_ACCOUNT_COUNT];
    private final HashMap<Long, TLRPC.GroupCall> currentGroupCalls = new HashMap<>();

    public static GroupCallMessagesController getInstance(int num) {
        GroupCallMessagesController localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (GroupCallMessagesController.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new GroupCallMessagesController(num);
                }
            }
        }
        return localInstance;
    }

    public GroupCallMessagesController(int account) {
        this.currentAccount = account;
    }

    public void joinGroupCall(long chatId, TLRPC.InputGroupCall call, boolean muted, boolean videoStopped) {
        TLRPC.TL_phone_joinGroupCall req = new TLRPC.TL_phone_joinGroupCall();
        req.call = call;
        req.join_as = MessagesController.getInstance(currentAccount).getInputPeer(UserConfig.getInstance(currentAccount).getClientUserId());
        req.muted = muted;
        req.video_stopped = videoStopped;
        req.params = new TLRPC.DataJSON();
        req.params.data = "{}";

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null && response instanceof TLRPC.Updates) {
                    MessagesController.getInstance(currentAccount).processUpdates((TLRPC.Updates) response, false);
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.groupCallUpdated, chatId
                    );
                }
            });
        });
    }

    public void leaveGroupCall(long chatId, TLRPC.InputGroupCall call) {
        TLRPC.TL_phone_leaveGroupCall req = new TLRPC.TL_phone_leaveGroupCall();
        req.call = call;
        req.source = 0;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.groupCallUpdated, chatId
                    );
                }
            });
        });
    }
}
