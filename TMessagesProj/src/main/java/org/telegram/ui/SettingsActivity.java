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
import org.telegram.messenger.UserConfig;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.BaseFragment;

public class SettingsActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {

    private int generalSectionRow;
    private int chatsRow;
    private int privacyRow;
    private int notificationsRow;
    private int dataRow;
    private int languageRow;
    private int rowCount;

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.mainUserInfoChanged);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.updateInterfaces);
        return true;
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.mainUserInfoChanged);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.updateInterfaces);
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(android.R.drawable.ic_menu_revert);
        actionBar.setTitle("Settings");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) {
                    finishFragment();
                }
            }
        });

        fragmentView = new FrameLayout(context);
        updateRows();
        return fragmentView;
    }

    private void updateRows() {
        rowCount = 0;
        generalSectionRow = rowCount++;
        chatsRow = rowCount++;
        privacyRow = rowCount++;
        notificationsRow = rowCount++;
        dataRow = rowCount++;
        languageRow = rowCount++;
    }

    public void onRowClicked(int position) {
        if (position == privacyRow) {
            presentFragment(new PrivacySettingsActivity());
        } else if (position == notificationsRow) {
            // Open Notification Settings
        }
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (id == NotificationCenter.mainUserInfoChanged || id == NotificationCenter.updateInterfaces) {
            if (fragmentView != null) {
                fragmentView.invalidate();
            }
        }
    }
}
