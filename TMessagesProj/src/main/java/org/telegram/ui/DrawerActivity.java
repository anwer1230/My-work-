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
import org.telegram.messenger.UserConfig;
import org.telegram.ui.ActionBar.BaseFragment;

public class DrawerActivity {
    public static final int ITEM_MY_PROFILE = 1;
    public static final int ITEM_NEW_GROUP = 2;
    public static final int ITEM_CONTACTS = 3;
    public static final int ITEM_CALLS = 4;
    public static final int ITEM_SAVED_MESSAGES = 5;
    public static final int ITEM_SETTINGS = 6;
    public static final int ITEM_NIGHT_MODE = 7;

    public static void onDrawerItemClick(int id, BaseFragment parentFragment) {
        if (parentFragment == null) return;
        int account = UserConfig.selectedAccount;

        switch (id) {
            case ITEM_MY_PROFILE:
                Bundle profileArgs = new Bundle();
                profileArgs.putLong("user_id", UserConfig.getInstance(account).getClientUserId());
                parentFragment.presentFragment(new ProfileActivity(profileArgs));
                break;
            case ITEM_SETTINGS:
                parentFragment.presentFragment(new SettingsActivity());
                break;
            case ITEM_SAVED_MESSAGES:
                Bundle chatArgs = new Bundle();
                chatArgs.putLong("user_id", UserConfig.getInstance(account).getClientUserId());
                parentFragment.presentFragment(new ChatActivity(chatArgs));
                break;
            default:
                break;
        }
    }
}
