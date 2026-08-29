/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.widget.FrameLayout;
import org.telegram.messenger.AccountInstance;
import org.telegram.messenger.NotificationCenter;
import org.telegram.messenger.StoriesController;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.BaseFragment;
import java.util.ArrayList;

public class StoriesActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {

    private long peerId;
    private ArrayList<TLRPC.TL_storyItem> stories = new ArrayList<>();
    private int currentStoryIndex = 0;

    public StoriesActivity(Bundle args) {
        super(args);
        if (args != null) {
            peerId = args.getLong("peer_id", 0);
        }
    }

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.storiesUpdated);
        StoriesController.getInstance(currentAccount).loadAllStories(false);
        return true;
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.storiesUpdated);
    }

    @Override
    public View createView(Context context) {
        FrameLayout container = new FrameLayout(context);
        fragmentView = container;
        return fragmentView;
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (id == NotificationCenter.storiesUpdated) {
            if (fragmentView != null) {
                fragmentView.invalidate();
            }
        }
    }
}
