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

public class StoriesController {
    private final int currentAccount;
    public boolean storiesEnabled = true;
    public boolean storyQualityFull = true;

    private final HashMap<Long, ArrayList<TLRPC.TL_storyItem>> storiesByPeer = new HashMap<>();
    private static volatile StoriesController[] Instance = new StoriesController[UserConfig.MAX_ACCOUNT_COUNT];

    public static StoriesController getInstance(int num) {
        StoriesController localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (StoriesController.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new StoriesController(num);
                }
            }
        }
        return localInstance;
    }

    public StoriesController(int account) {
        this.currentAccount = account;
    }

    public void loadAllStories(boolean force) {
        if (!storiesEnabled) return;
        TLRPC.TL_stories_getAllStories req = new TLRPC.TL_stories_getAllStories();
        req.include_hidden = false;
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (response instanceof TLRPC.TL_stories_allStories) {
                TLRPC.TL_stories_allStories res = (TLRPC.TL_stories_allStories) response;
                NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.storiesUpdated);
            }
        });
    }

    public ArrayList<TLRPC.TL_storyItem> getStoriesForPeer(long peerId) {
        return storiesByPeer.get(peerId);
    }
}
