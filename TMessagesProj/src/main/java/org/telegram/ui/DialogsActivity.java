/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import org.telegram.messenger.AccountInstance;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;
import org.telegram.messenger.UserConfig;
import org.telegram.ui.ActionBar.BaseFragment;

public class DialogsActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {

    public DialogsActivity() {
        super();
    }

    public DialogsActivity(Bundle args) {
        super(args);
    }

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        AccountInstance accountInstance = AccountInstance.getInstance(currentAccount);
        accountInstance.getNotificationCenter().addObserver(this, NotificationCenter.dialogsNeedReload);
        accountInstance.getNotificationCenter().addObserver(this, NotificationCenter.didReceiveNewMessages);
        accountInstance.getNotificationCenter().addObserver(this, NotificationCenter.didUpdateConnectionState);

        // Load persisted dialogs from SQLite
        accountInstance.getMessagesController().loadDialogs(0, 0, 100);
        return true;
    }

    @Override
    public View createView(Context context) {
        fragmentView = new View(context);
        return fragmentView;
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (account != currentAccount) {
            return;
        }
        if (id == NotificationCenter.dialogsNeedReload || id == NotificationCenter.didReceiveNewMessages) {
            if (fragmentView != null) {
                fragmentView.post(() -> {
                    // Update conversation list items
                });
            }
        }
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        AccountInstance accountInstance = AccountInstance.getInstance(currentAccount);
        accountInstance.getNotificationCenter().removeObserver(this, NotificationCenter.dialogsNeedReload);
        accountInstance.getNotificationCenter().removeObserver(this, NotificationCenter.didReceiveNewMessages);
        accountInstance.getNotificationCenter().removeObserver(this, NotificationCenter.didUpdateConnectionState);
    }
}
