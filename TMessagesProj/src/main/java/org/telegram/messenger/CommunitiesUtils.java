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

public class CommunitiesUtils {
    public static boolean isCommunityChannel(TLRPC.Chat chat) {
        return ChatObject.isMegagroup(chat) || ChatObject.isForum(chat);
    }

    public static String getParticipantRankString(TLRPC.ChannelParticipant participant) {
        if (participant instanceof TLRPC.TL_channelParticipantCreator) {
            return "Owner";
        } else if (participant instanceof TLRPC.TL_channelParticipantAdmin) {
            return "Admin";
        } else if (participant instanceof TLRPC.TL_channelParticipantBanned) {
            return "Banned";
        }
        return "Member";
    }
}
