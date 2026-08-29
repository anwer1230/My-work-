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
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;
import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.BaseFragment;

public class ChatRightsEditActivity extends BaseFragment {
    public static final int TYPE_ADMIN = 0;
    public static final int TYPE_BANNED = 1;

    private final int currentType;
    private final long chatId;
    private final long userId;
    private TLRPC.TL_chatAdminRights adminRights;
    private TLRPC.TL_chatBannedRights bannedRights;
    private String customTitle;

    public ChatRightsEditActivity(long userId, long chatId, TLRPC.TL_chatAdminRights adminRights, TLRPC.TL_chatBannedRights bannedRights, String rank, int type) {
        this.userId = userId;
        this.chatId = chatId;
        this.adminRights = adminRights != null ? adminRights : new TLRPC.TL_chatAdminRights();
        this.bannedRights = bannedRights != null ? bannedRights : new TLRPC.TL_chatBannedRights();
        this.customTitle = rank != null ? rank : "";
        this.currentType = type;
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(android.R.drawable.ic_menu_revert);
        actionBar.setTitle(currentType == TYPE_ADMIN ? "صلاحيات المشرف" : "تقييد المستخدم");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) {
                    finishFragment();
                } else if (id == 1) {
                    applyRights();
                }
            }
        });

        fragmentView = new FrameLayout(context);
        return fragmentView;
    }

    public void applyRights() {
        if (currentType == TYPE_ADMIN) {
            MessagesController.getInstance(currentAccount).setAdminRights(
                chatId, userId, adminRights, customTitle
            );
        } else {
            MessagesController.getInstance(currentAccount).setBannedRights(
                chatId, userId, bannedRights
            );
        }
        finishFragment();
    }
}
