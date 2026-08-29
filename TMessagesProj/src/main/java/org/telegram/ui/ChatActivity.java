/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui;

import android.content.Context;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.Spanned;
import android.text.style.CharacterStyle;
import android.text.style.StyleSpan;
import android.text.style.URLSpan;
import android.view.View;
import org.telegram.messenger.AccountInstance;
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.MessageObject;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;
import org.telegram.messenger.SendMessagesHelper;
import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.BaseFragment;
import java.util.ArrayList;

public class ChatActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {
    private long dialogId;
    private TLRPC.User currentUser;
    private TLRPC.Chat currentChat;
    private final ArrayList<MessageObject> messages = new ArrayList<>();
    private MessageObject replyingMessageObject;
    private MessageObject editingMessageObject;

    public ChatActivity(Bundle args) {
        super(args);
        if (args != null) {
            dialogId = args.getLong("user_id", args.getLong("chat_id", 0));
        }
    }

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        AccountInstance accountInstance = AccountInstance.getInstance(currentAccount);
        accountInstance.getNotificationCenter().addObserver(this, NotificationCenter.didReceiveNewMessages);
        accountInstance.getNotificationCenter().addObserver(this, NotificationCenter.messagesDeleted);
        accountInstance.getNotificationCenter().addObserver(this, NotificationCenter.messagesRead);
        accountInstance.getNotificationCenter().addObserver(this, NotificationCenter.reactionsDidLoad);
        accountInstance.getNotificationCenter().addObserver(this, NotificationCenter.messageReceivedByAck);
        accountInstance.getNotificationCenter().addObserver(this, NotificationCenter.messageSendError);

        // Fetch offline messages from SQLite
        ArrayList<TLRPC.Message> cached = accountInstance.getMessagesStorage().getMessages(dialogId, 50, 0);
        for (TLRPC.Message msg : cached) {
            messages.add(new MessageObject(currentAccount, msg, true, true));
        }
        return true;
    }

    @Override
    public View createView(Context context) {
        fragmentView = new View(context);
        return fragmentView;
    }

    public ArrayList<TLRPC.MessageEntity> getEntitiesFromSpannable(CharSequence text) {
        ArrayList<TLRPC.MessageEntity> entities = new ArrayList<>();
        if (text instanceof Spanned) {
            Spanned spanned = (Spanned) text;
            CharacterStyle[] spans = spanned.getSpans(0, text.length(), CharacterStyle.class);
            for (CharacterStyle span : spans) {
                int start = spanned.getSpanStart(span);
                int end = spanned.getSpanEnd(span);
                int len = end - start;
                if (len <= 0) continue;

                if (span instanceof StyleSpan) {
                    StyleSpan styleSpan = (StyleSpan) span;
                    if (styleSpan.getStyle() == Typeface.BOLD) {
                        TLRPC.TL_messageEntityBold bold = new TLRPC.TL_messageEntityBold();
                        bold.offset = start;
                        bold.length = len;
                        entities.add(bold);
                    } else if (styleSpan.getStyle() == Typeface.ITALIC) {
                        TLRPC.TL_messageEntityItalic italic = new TLRPC.TL_messageEntityItalic();
                        italic.offset = start;
                        italic.length = len;
                        entities.add(italic);
                    }
                } else if (span instanceof URLSpan) {
                    URLSpan urlSpan = (URLSpan) span;
                    TLRPC.TL_messageEntityTextUrl url = new TLRPC.TL_messageEntityTextUrl();
                    url.offset = start;
                    url.length = len;
                    url.url = urlSpan.getURL();
                    entities.add(url);
                }
            }
        }
        return entities;
    }

    public void processSendingText(CharSequence text, boolean schedule, int scheduleDate) {
        if (text == null || text.length() == 0) return;
        ArrayList<TLRPC.MessageEntity> entities = getEntitiesFromSpannable(text);
        String plainText = text.toString();

        if (editingMessageObject != null) {
            MessagesController.getInstance(currentAccount).editMessage(
                dialogId, editingMessageObject.getId(), plainText, entities
            );
            editingMessageObject = null;
        } else if (schedule && scheduleDate > 0) {
            SendMessagesHelper.getInstance(currentAccount).sendScheduledMessage(
                plainText, dialogId, scheduleDate, entities
            );
        } else {
            TLRPC.TL_messageReplyHeader replyHeader = null;
            if (replyingMessageObject != null) {
                replyHeader = new TLRPC.TL_messageReplyHeader();
                replyHeader.reply_to_msg_id = replyingMessageObject.getId();
            }
            SendMessagesHelper.getInstance(currentAccount).sendMessage(
                plainText, dialogId, replyHeader, entities
            );
            replyingMessageObject = null;
        }
    }

    public void sendReaction(int messageId, String emoji) {
        MessagesController.getInstance(currentAccount).sendReaction(dialogId, messageId, emoji);
    }

    public void forwardSelectedMessages(ArrayList<Integer> messageIds, long toDialogId) {
        MessagesController.getInstance(currentAccount).forwardMessages(messageIds, dialogId, toDialogId);
    }

    public void pinMessage(int messageId, boolean notify, boolean forBoth) {
        MessagesController.getInstance(currentAccount).pinMessage(dialogId, messageId, notify, forBoth);
    }

    public void deleteMessages(ArrayList<Integer> messageIds, boolean revoke) {
        MessagesController.getInstance(currentAccount).deleteMessages(messageIds, dialogId, revoke);
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (account != currentAccount) {
            return;
        }
        AndroidUtilities.runOnUIThread(() -> {
            if (id == NotificationCenter.didReceiveNewMessages) {
                long peerId = (long) args[0];
                if (peerId == dialogId) {
                    Object msgArg = args[1];
                    if (msgArg instanceof MessageObject) {
                        messages.add(0, (MessageObject) msgArg);
                    } else if (msgArg instanceof TLRPC.Message) {
                        messages.add(0, new MessageObject(currentAccount, (TLRPC.Message) msgArg, true, true));
                    }
                }
            } else if (id == NotificationCenter.messagesDeleted) {
                long peerId = (long) args[1];
                if (peerId == dialogId) {
                    ArrayList<Integer> deletedIds = (ArrayList<Integer>) args[0];
                    messages.removeIf(m -> deletedIds.contains(m.getId()));
                }
            } else if (id == NotificationCenter.reactionsDidLoad) {
                long peerId = (long) args[0];
                if (peerId == dialogId) {
                    // Update reaction layouts
                }
            }
        });
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        AccountInstance accountInstance = AccountInstance.getInstance(currentAccount);
        accountInstance.getNotificationCenter().removeObserver(this, NotificationCenter.didReceiveNewMessages);
        accountInstance.getNotificationCenter().removeObserver(this, NotificationCenter.messagesDeleted);
        accountInstance.getNotificationCenter().removeObserver(this, NotificationCenter.messagesRead);
        accountInstance.getNotificationCenter().removeObserver(this, NotificationCenter.reactionsDidLoad);
        accountInstance.getNotificationCenter().removeObserver(this, NotificationCenter.messageReceivedByAck);
        accountInstance.getNotificationCenter().removeObserver(this, NotificationCenter.messageSendError);
    }
}
