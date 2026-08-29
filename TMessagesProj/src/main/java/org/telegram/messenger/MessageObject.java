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

public class MessageObject {
    public static final int MESSAGE_SEND_STATE_SENT = 0;
    public static final int MESSAGE_SEND_STATE_SENDING = 1;
    public static final int MESSAGE_SEND_STATE_SEND_ERROR = 2;

    public TLRPC.Message messageOwner;
    public CharSequence messageText;
    public int currentAccount;
    public boolean disablePauseOnScreen;
    public int type;
    public TLRPC.WebPage webPage;

    public static final int TYPE_TEXT = 0;
    public static final int TYPE_PHOTO = 1;
    public static final int TYPE_VIDEO = 2;
    public static final int TYPE_DOCUMENT = 3;
    public static final int TYPE_AUDIO = 4;
    public static final int TYPE_VOICE = 5;
    public static final int TYPE_STICKER = 6;
    public static final int TYPE_ANIMATED_STICKER = 7;

    public MessageObject(int account, TLRPC.Message message, boolean generateLayout, boolean checkMedia) {
        this.currentAccount = account;
        this.messageOwner = message;
        this.messageText = message != null && message.message != null ? message.message : "";

        if (message != null && message.media != null) {
            if (message.media instanceof TLRPC.TL_messageMediaPhoto) {
                this.type = TYPE_PHOTO;
            } else if (message.media instanceof TLRPC.TL_messageMediaDocument) {
                this.type = TYPE_DOCUMENT;
            } else if (message.media instanceof TLRPC.TL_messageMediaWebPage) {
                this.webPage = ((TLRPC.TL_messageMediaWebPage) message.media).webpage;
                this.type = TYPE_TEXT;
            } else {
                this.type = TYPE_TEXT;
            }
        } else {
            this.type = TYPE_TEXT;
        }
    }

    public boolean isOut() {
        return messageOwner != null && messageOwner.out;
    }

    public boolean isOutOwner() {
        if (messageOwner == null) return false;
        long myUserId = UserConfig.getInstance(currentAccount).getClientUserId();
        return messageOwner.out && (messageOwner.from_id == myUserId || messageOwner.from_id == 0);
    }

    public boolean isFromUser() {
        return messageOwner != null && messageOwner.from_id > 0;
    }

    public boolean isSending() {
        return messageOwner != null && messageOwner.send_state == MESSAGE_SEND_STATE_SENDING;
    }

    public boolean isSendError() {
        return messageOwner != null && messageOwner.send_state == MESSAGE_SEND_STATE_SEND_ERROR;
    }

    public boolean isSent() {
        return messageOwner != null && messageOwner.send_state == MESSAGE_SEND_STATE_SENT;
    }

    public boolean isUnread() {
        return messageOwner != null && messageOwner.unread;
    }

    public void setIsRead() {
        if (messageOwner != null) {
            messageOwner.unread = false;
        }
    }

    public int getSendState() {
        return messageOwner != null ? messageOwner.send_state : MESSAGE_SEND_STATE_SENT;
    }

    public int getId() {
        return messageOwner != null ? messageOwner.id : 0;
    }

    public void setDisablePauseOnScreen(boolean disable) {
        this.disablePauseOnScreen = disable;
    }

    public long getDialogId() {
        if (messageOwner == null) return 0;
        if (messageOwner.peer_id != 0) {
            return messageOwner.peer_id;
        }
        return 0;
    }

    public static long getDialogId(TLRPC.Message message) {
        if (message == null) return 0;
        if (message.peer_id != 0) {
            return message.peer_id;
        }
        return 0;
    }

    public static void loadWebPagePreview(int currentAccount, String url, final MessageObjectCallback callback) {
        TLRPC.TL_messages_getWebPagePreview req = new TLRPC.TL_messages_getWebPagePreview();
        req.message = url;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null && response instanceof TLRPC.TL_messageMediaWebPage) {
                    TLRPC.TL_messageMediaWebPage media = (TLRPC.TL_messageMediaWebPage) response;
                    if (callback != null) {
                        callback.onWebPageLoaded(media.webpage);
                    }
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.webPageDidLoad, url, media.webpage
                    );
                }
            });
        });
    }

    public interface MessageObjectCallback {
        void onWebPageLoaded(TLRPC.WebPage webPage);
    }
}
