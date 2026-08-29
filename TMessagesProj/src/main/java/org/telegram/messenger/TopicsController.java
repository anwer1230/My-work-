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

public class TopicsController {
    private final int currentAccount;
    private final HashMap<Long, ArrayList<TLRPC.TL_forumTopic>> topicsByChat = new HashMap<>();

    private static volatile TopicsController[] Instance = new TopicsController[UserConfig.MAX_ACCOUNT_COUNT];

    public static TopicsController getInstance(int num) {
        TopicsController localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (TopicsController.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new TopicsController(num);
                }
            }
        }
        return localInstance;
    }

    public TopicsController(int account) {
        this.currentAccount = account;
    }

    public void loadTopics(long chatId, boolean force) {
        TLRPC.TL_channels_getForumTopics req = new TLRPC.TL_channels_getForumTopics();
        req.channel = MessagesController.getInstance(currentAccount).getInputChannel(chatId);
        req.offset_date = 0;
        req.offset_id = 0;
        req.offset_topic = 0;
        req.limit = 100;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (response instanceof TLRPC.TL_messages_forumTopics) {
                    TLRPC.TL_messages_forumTopics res = (TLRPC.TL_messages_forumTopics) response;
                    ArrayList<TLRPC.TL_forumTopic> list = new ArrayList<>();
                    for (TLRPC.ForumTopic topic : res.topics) {
                        if (topic instanceof TLRPC.TL_forumTopic) {
                            list.add((TLRPC.TL_forumTopic) topic);
                        }
                    }
                    topicsByChat.put(chatId, list);
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.topicsDidLoaded, chatId
                    );
                }
            });
        });
    }

    public void createTopic(long chatId, String title, int iconColor, long iconEmojiId) {
        TLRPC.TL_channels_createForumTopic req = new TLRPC.TL_channels_createForumTopic();
        req.channel = MessagesController.getInstance(currentAccount).getInputChannel(chatId);
        req.title = title != null ? title : "New Topic";
        req.icon_color = iconColor;
        req.icon_emoji_id = iconEmojiId;
        req.random_id = (long) (Math.random() * Long.MAX_VALUE);

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null && response instanceof TLRPC.Updates) {
                    MessagesController.getInstance(currentAccount).processUpdates((TLRPC.Updates) response, false);
                    loadTopics(chatId, true);
                }
            });
        });
    }

    public ArrayList<TLRPC.TL_forumTopic> getTopics(long chatId) {
        return topicsByChat.get(chatId);
    }
}
