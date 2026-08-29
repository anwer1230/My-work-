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
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.NotificationCenter;
import org.telegram.messenger.TopicsController;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.BaseFragment;
import java.util.ArrayList;

public class TopicsFragment extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {
    private final long chatId;
    private final ArrayList<TLRPC.TL_forumTopic> forumTopics = new ArrayList<>();

    public TopicsFragment(Bundle args) {
        super(args);
        chatId = args != null ? args.getLong("chat_id", 0) : 0;
    }

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.topicsDidLoaded);
        TopicsController.getInstance(currentAccount).loadTopics(chatId, true);
        return true;
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.topicsDidLoaded);
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(android.R.drawable.ic_menu_revert);
        actionBar.setTitle("المواضيع (Topics)");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) finishFragment();
            }
        });

        fragmentView = new FrameLayout(context);
        return fragmentView;
    }

    public void createNewTopic(String title, int iconColor, long emojiId) {
        TopicsController.getInstance(currentAccount).createTopic(chatId, title, iconColor, emojiId);
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (account != currentAccount) return;
        if (id == NotificationCenter.topicsDidLoaded) {
            long cid = (long) args[0];
            if (cid == chatId) {
                AndroidUtilities.runOnUIThread(() -> {
                    ArrayList<TLRPC.TL_forumTopic> list = TopicsController.getInstance(currentAccount).getTopics(chatId);
                    if (list != null) {
                        forumTopics.clear();
                        forumTopics.addAll(list);
                    }
                    if (fragmentView != null) {
                        fragmentView.invalidate();
                    }
                });
            }
        }
    }
}
