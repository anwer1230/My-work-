/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.TLRPC;

public class ChatObject {
    public static final int CHAT_TYPE_CHAT = 0;
    public static final int CHAT_TYPE_CHANNEL = 1;
    public static final int CHAT_TYPE_MEGAGROUP = 2;
    public static final int CHAT_TYPE_FORUM = 3;

    public static boolean isChannel(TLRPC.Chat chat) {
        return chat != null && (chat instanceof TLRPC.TL_channel || chat instanceof TLRPC.TL_channelForbidden);
    }

    public static boolean isMegagroup(TLRPC.Chat chat) {
        return isChannel(chat) && chat.megagroup;
    }

    public static boolean isForum(TLRPC.Chat chat) {
        return isChannel(chat) && chat.forum;
    }

    public static boolean canSendMessages(TLRPC.Chat chat) {
        if (chat == null) return false;
        if (chat.default_banned_rights != null && chat.default_banned_rights.send_messages) {
            return false;
        }
        return true;
    }

    public static boolean canPin(TLRPC.Chat chat) {
        if (chat == null) return false;
        if (chat.creator || (chat.admin_rights != null && chat.admin_rights.pin_messages)) {
            return true;
        }
        return chat.default_banned_rights != null && !chat.default_banned_rights.pin_messages;
    }

    public static boolean canPost(TLRPC.Chat chat) {
        if (chat == null) return false;
        return chat.creator || (chat.admin_rights != null && chat.admin_rights.post_messages);
    }

    public static boolean canEdit(TLRPC.Chat chat) {
        if (chat == null) return false;
        return chat.creator || (chat.admin_rights != null && chat.admin_rights.edit_messages);
    }

    public static boolean canDeleteMessages(TLRPC.Chat chat) {
        if (chat == null) return false;
        return chat.creator || (chat.admin_rights != null && chat.admin_rights.delete_messages);
    }

    public static boolean canBanUsers(TLRPC.Chat chat) {
        if (chat == null) return false;
        return chat.creator || (chat.admin_rights != null && chat.admin_rights.ban_users);
    }

    public static boolean canInviteUsers(TLRPC.Chat chat) {
        if (chat == null) return false;
        if (chat.creator || (chat.admin_rights != null && chat.admin_rights.invite_users)) {
            return true;
        }
        return chat.default_banned_rights != null && !chat.default_banned_rights.invite_users;
    }

    public static boolean canChangeInfo(TLRPC.Chat chat) {
        if (chat == null) return false;
        if (chat.creator || (chat.admin_rights != null && chat.admin_rights.change_info)) {
            return true;
        }
        return chat.default_banned_rights != null && !chat.default_banned_rights.change_info;
    }

    public static boolean canAddAdmins(TLRPC.Chat chat) {
        if (chat == null) return false;
        return chat.creator || (chat.admin_rights != null && chat.admin_rights.add_admins);
    }

    public static boolean hasAdminRights(TLRPC.Chat chat) {
        return chat != null && (chat.creator || chat.admin_rights != null);
    }
}
