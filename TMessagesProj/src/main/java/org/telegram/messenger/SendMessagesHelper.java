/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.RequestDelegate;
import org.telegram.tgnet.TLObject;
import org.telegram.tgnet.TLRPC;
import java.util.ArrayList;
import java.util.HashMap;

public class SendMessagesHelper {
    private static volatile SendMessagesHelper[] Instance = new SendMessagesHelper[UserConfig.MAX_ACCOUNT_COUNT];
    private final int currentAccount;
    private final HashMap<String, MessageObject> sendingMessages = new HashMap<>();

    public static SendMessagesHelper getInstance(int num) {
        SendMessagesHelper localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (SendMessagesHelper.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new SendMessagesHelper(num);
                }
            }
        }
        return localInstance;
    }

    public SendMessagesHelper(int account) {
        currentAccount = account;
    }

    public void sendMessage(String text, long peerId, long replyToMsgId) {
        TLRPC.TL_messageReplyHeader replyHeader = null;
        if (replyToMsgId > 0) {
            replyHeader = new TLRPC.TL_messageReplyHeader();
            replyHeader.reply_to_msg_id = (int) replyToMsgId;
        }
        sendMessage(text, peerId, replyHeader, null);
    }

    public void sendMessage(String text, long peerId, TLRPC.MessageReplyHeader replyHeader, ArrayList<TLRPC.MessageEntity> entities) {
        if (text == null || text.trim().isEmpty()) {
            return;
        }

        final TLRPC.TL_message newMsg = new TLRPC.TL_message();
        newMsg.message = text.trim();
        newMsg.date = ConnectionsManager.getInstance(currentAccount).getCurrentTime();
        newMsg.out = true;
        newMsg.unread = true;
        newMsg.send_state = MessageObject.MESSAGE_SEND_STATE_SENDING; // 1. جاري الإرسال (Clock 🕒)
        newMsg.from_id = UserConfig.getInstance(currentAccount).getClientUserId();
        newMsg.peer_id = peerId;
        newMsg.id = UserConfig.getInstance(currentAccount).getNewMessageId();
        newMsg.random_id = (long) (Math.random() * Long.MAX_VALUE);
        newMsg.reply_to = replyHeader;
        if (entities != null && !entities.isEmpty()) {
            newMsg.entities = entities;
            newMsg.flags |= 8;
        }

        final MessageObject newMsgObj = new MessageObject(currentAccount, newMsg, false, false);
        sendingMessages.put(String.valueOf(newMsg.id), newMsgObj);

        // Notify UI to immediately render message in "Sending" state
        AndroidUtilities.runOnUIThread(() -> {
            NotificationCenter.getInstance(currentAccount).postNotificationName(
                NotificationCenter.didReceiveNewMessages, peerId, newMsgObj
            );
        });

        // Build MTProto TL_messages_sendMessage Request
        TLRPC.TL_messages_sendMessage req = new TLRPC.TL_messages_sendMessage();
        req.message = text.trim();
        req.peer = MessagesController.getInstance(currentAccount).getInputPeer(peerId);
        req.random_id = newMsg.random_id;
        req.reply_to = replyHeader;
        if (entities != null && !entities.isEmpty()) {
            req.entities = entities;
            req.flags |= 8;
        }

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, new RequestDelegate() {
            @Override
            public void run(TLObject response, TLRPC.TL_error error) {
                AndroidUtilities.runOnUIThread(() -> {
                    if (error == null) {
                        // Update state to sent (✓)
                        newMsg.send_state = MessageObject.MESSAGE_SEND_STATE_SENT;
                        newMsgObj.messageOwner.send_state = MessageObject.MESSAGE_SEND_STATE_SENT;
                        
                        int realMsgId = newMsg.id;
                        if (response instanceof TLRPC.Updates) {
                            TLRPC.Updates updates = (TLRPC.Updates) response;
                            for (TLRPC.Update update : updates.updates) {
                                if (update instanceof TLRPC.TL_updateMessageID) {
                                    TLRPC.TL_updateMessageID updateMsgId = (TLRPC.TL_updateMessageID) update;
                                    if (updateMsgId.random_id == newMsg.random_id) {
                                        realMsgId = updateMsgId.id;
                                        newMsg.id = realMsgId;
                                        newMsgObj.messageOwner.id = realMsgId;
                                    }
                                }
                            }
                        }

                        // Save to local database
                        MessagesStorage.getInstance(currentAccount).putMessages(new ArrayList<TLRPC.Message>() {{ add(newMsg); }}, false, true, false, 0);

                        // Notify UI that server confirmed the message
                        NotificationCenter.getInstance(currentAccount).postNotificationName(
                            NotificationCenter.messageReceivedByAck, realMsgId, newMsg.id, newMsgObj, peerId
                        );
                        NotificationCenter.getInstance(currentAccount).postNotificationName(
                            NotificationCenter.updateInterfaces, NotificationCenter.UPDATE_MASK_SEND_STATE
                        );
                    } else {
                        // Failed to send: mark as error (❌)
                        newMsg.send_state = MessageObject.MESSAGE_SEND_STATE_SEND_ERROR;
                        newMsgObj.messageOwner.send_state = MessageObject.MESSAGE_SEND_STATE_SEND_ERROR;

                        NotificationCenter.getInstance(currentAccount).postNotificationName(
                            NotificationCenter.messageSendError, newMsg.id
                        );
                        NotificationCenter.getInstance(currentAccount).postNotificationName(
                            NotificationCenter.updateInterfaces, NotificationCenter.UPDATE_MASK_SEND_STATE
                        );
                    }
                });
            }
        });
    }

    public void sendMedia(TLRPC.InputMedia media, long peerDialogId, String caption, ArrayList<TLRPC.MessageEntity> entities) {
        TLRPC.TL_messages_sendMedia req = new TLRPC.TL_messages_sendMedia();
        req.peer = MessagesController.getInstance(currentAccount).getInputPeer(peerDialogId);
        req.media = media;
        req.message = caption != null ? caption : "";
        req.random_id = (long) (Math.random() * Long.MAX_VALUE);
        if (entities != null && !entities.isEmpty()) {
            req.entities = entities;
            req.flags |= 8;
        }

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null && response instanceof TLRPC.Updates) {
                    MessagesController.getInstance(currentAccount).processUpdates((TLRPC.Updates) response, false);
                }
            });
        });
    }

    public void sendScheduledMessage(String message, long peerDialogId, int scheduleDate, ArrayList<TLRPC.MessageEntity> entities) {
        TLRPC.TL_messages_sendMessage req = new TLRPC.TL_messages_sendMessage();
        req.message = message != null ? message.trim() : "";
        req.peer = MessagesController.getInstance(currentAccount).getInputPeer(peerDialogId);
        req.random_id = (long) (Math.random() * Long.MAX_VALUE);
        req.schedule_date = scheduleDate;
        req.flags |= 1024; // SCHEDULE_DATE_FLAG
        if (entities != null && !entities.isEmpty()) {
            req.entities = entities;
            req.flags |= 8;
        }

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.scheduledMessagesDidLoad, peerDialogId
                    );
                }
            });
        });
    }

    public void retrySendMessage(MessageObject messageObject) {
        if (messageObject == null || !messageObject.isSendError()) {
            return;
        }
        messageObject.messageOwner.send_state = MessageObject.MESSAGE_SEND_STATE_SENDING;
        sendMessage(messageObject.messageOwner.message, messageObject.getDialogId(), 0);
    }
}
