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
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.ImageLocation;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;
import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.BaseFragment;

public class ProfileActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {

    private long userId;
    private long chatId;
    private TLRPC.User currentUser;
    private TLRPC.UserFull userInfo;
    private TLRPC.ChatFull chatInfo;
    private TLRPC.ChannelParticipant chatParticipant;

    public ProfileActivity(Bundle args) {
        super(args);
        if (args != null) {
            this.userId = args.getLong("user_id", 0);
            this.chatId = args.getLong("chat_id", 0);
        }
    }

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.userFullInfoDidLoad);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.chatInfoDidLoad);
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.channelRightsUpdated);

        if (userId != 0) {
            loadUserProfile();
        }
        if (chatId != 0) {
            loadChatFull();
            if (userId != 0) {
                loadChatParticipantStatus();
            }
        }
        return true;
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.userFullInfoDidLoad);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.chatInfoDidLoad);
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.channelRightsUpdated);
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(android.R.drawable.ic_menu_revert);
        actionBar.setTitle("الملف الشخصي");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) finishFragment();
            }
        });

        fragmentView = new FrameLayout(context);
        return fragmentView;
    }

    public void loadUserProfile() {
        TLRPC.TL_users_getFullUser req = new TLRPC.TL_users_getFullUser();
        req.id = MessagesController.getInstance(currentAccount).getInputUser(userId);

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (response instanceof TLRPC.TL_users_userFull) {
                    userInfo = ((TLRPC.TL_users_userFull) response).full_user;
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.userFullInfoDidLoad, userId, userInfo
                    );
                }
            });
        });
    }

    public void loadChatFull() {
        TLRPC.TL_channels_getFullChannel req = new TLRPC.TL_channels_getFullChannel();
        req.channel = MessagesController.getInstance(currentAccount).getInputChannel(chatId);

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (response instanceof TLRPC.TL_messages_chatFull) {
                    chatInfo = ((TLRPC.TL_messages_chatFull) response).full_chat;
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.chatInfoDidLoad, chatId, chatInfo
                    );
                }
            });
        });
    }

    public void loadChatParticipantStatus() {
        MessagesController.getInstance(currentAccount).getChannelParticipant(chatId, userId, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (response instanceof TLRPC.TL_channels_channelParticipant) {
                    chatParticipant = ((TLRPC.TL_channels_channelParticipant) response).participant;
                    if (fragmentView != null) {
                        fragmentView.invalidate();
                    }
                }
            });
        });
    }

    public String getParticipantRoleTitle() {
        if (chatParticipant instanceof TLRPC.TL_channelParticipantCreator) {
            TLRPC.TL_channelParticipantCreator creator = (TLRPC.TL_channelParticipantCreator) chatParticipant;
            return creator.rank != null && !creator.rank.isEmpty() ? creator.rank : "مالك المجموعة 👑";
        } else if (chatParticipant instanceof TLRPC.TL_channelParticipantAdmin) {
            TLRPC.TL_channelParticipantAdmin admin = (TLRPC.TL_channelParticipantAdmin) chatParticipant;
            return admin.rank != null && !admin.rank.isEmpty() ? admin.rank : "مشرف 🛡️";
        } else if (chatParticipant instanceof TLRPC.TL_channelParticipantBanned) {
            TLRPC.TL_channelParticipantBanned banned = (TLRPC.TL_channelParticipantBanned) chatParticipant;
            if (banned.banned_rights != null && banned.banned_rights.view_messages) {
                return "محظور ❌";
            }
            return "مقيد الصلاحيات ⚠️";
        }
        return "عضو عادي 👤";
    }

    public ImageLocation getUserAvatarLocation(TLRPC.User user) {
        if (user == null || user.photo == null) return null;
        return ImageLocation.getForUser(user, ImageLocation.TYPE_BIG);
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (account != currentAccount) return;

        AndroidUtilities.runOnUIThread(() -> {
            if (id == NotificationCenter.userFullInfoDidLoad) {
                long uid = (long) args[0];
                if (uid == userId && fragmentView != null) {
                    fragmentView.invalidate();
                }
            } else if (id == NotificationCenter.chatInfoDidLoad) {
                long cid = (long) args[0];
                if (cid == chatId && fragmentView != null) {
                    fragmentView.invalidate();
                }
            } else if (id == NotificationCenter.channelRightsUpdated) {
                long cid = (long) args[0];
                long uid = (long) args[1];
                if (cid == chatId && uid == userId) {
                    chatParticipant = MessagesController.getInstance(currentAccount).getChannelParticipantCached(chatId, userId);
                    if (fragmentView != null) {
                        fragmentView.invalidate();
                    }
                }
            }
        });
    }
}
