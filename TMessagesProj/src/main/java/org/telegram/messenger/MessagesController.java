/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLObject;
import org.telegram.tgnet.TLRPC;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

public class MessagesController {
    private final int currentAccount;
    private final ConcurrentHashMap<Long, TLRPC.User> users = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, TLRPC.Chat> chats = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, ConcurrentHashMap<Long, TLRPC.ChannelParticipant>> channelParticipants = new ConcurrentHashMap<>();
    private final ArrayList<TLRPC.Dialog> dialogs = new ArrayList<>();
    private static volatile MessagesController[] Instance = new MessagesController[AccountInstance.MAX_ACCOUNT_COUNT];

    public static MessagesController getInstance(int num) {
        MessagesController localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (MessagesController.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new MessagesController(num);
                }
            }
        }
        return localInstance;
    }

    public MessagesController(int account) {
        this.currentAccount = account;
    }

    public TLRPC.User getUser(Long id) {
        return users.get(id);
    }

    public void putUser(TLRPC.User user, boolean fromServer) {
        if (user == null) {
            return;
        }
        users.put(user.id, user);
    }

    public void putUsers(ArrayList<TLRPC.User> usersList, boolean fromServer) {
        if (usersList == null || usersList.isEmpty()) {
            return;
        }
        for (TLRPC.User user : usersList) {
            putUser(user, fromServer);
        }
    }

    public void putChats(ArrayList<TLRPC.Chat> chatsList, boolean fromServer) {
        if (chatsList == null || chatsList.isEmpty()) {
            return;
        }
        for (TLRPC.Chat chat : chatsList) {
            if (chat != null) {
                chats.put(chat.id, chat);
            }
        }
    }

    public void loadDialogs(int offsetDate, int offsetId, int limit) {
        TLRPC.TL_messages_getDialogs req = new TLRPC.TL_messages_getDialogs();
        req.offset_date = offsetDate;
        req.offset_id = offsetId;
        req.offset_peer = new TLRPC.TL_inputPeerEmpty();
        req.limit = limit;
        req.hash = 0;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (response instanceof TLRPC.messages_Dialogs) {
                TLRPC.messages_Dialogs dialogsResponse = (TLRPC.messages_Dialogs) response;
                putUsers(dialogsResponse.users, false);
                putChats(dialogsResponse.chats, false);

                synchronized (dialogs) {
                    dialogs.clear();
                    dialogs.addAll(dialogsResponse.dialogs);
                }

                // Persist binary BLOBs to SQLite
                MessagesStorage.getInstance(currentAccount).putDialogs(dialogsResponse);

                // Broadcast UI update
                NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.dialogsNeedReload
                );
            }
        });
    }

    public void processUpdates(TLRPC.Updates updates, boolean isFromStorage) {
        if (updates instanceof TLRPC.TL_updates) {
            TLRPC.TL_updates u = (TLRPC.TL_updates) updates;
            putUsers(u.users, false);
            putChats(u.chats, false);

            for (TLRPC.Update update : u.updates) {
                if (update instanceof TLRPC.TL_updateNewMessage) {
                    TLRPC.TL_updateNewMessage newMsgUpdate = (TLRPC.TL_updateNewMessage) update;
                    TLRPC.Message message = newMsgUpdate.message;

                    // 1. Save binary message in SQLite
                    MessagesStorage.getInstance(currentAccount).putMessages(
                        message, message.out, false, false, 0
                    );

                    // 2. Broadcast to UI listeners via Event-Bus
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.didReceiveNewMessages,
                        message.peer_id,
                        message
                    );
                } else if (update instanceof TLRPC.TL_updateReadHistoryOutbox) {
                    TLRPC.TL_updateReadHistoryOutbox readOutbox = (TLRPC.TL_updateReadHistoryOutbox) update;
                    long peerId = readOutbox.peer != null ? readOutbox.peer.user_id : 0;
                    processUpdateReadOutbox(peerId, readOutbox.max_id, 0);
                } else if (update instanceof TLRPC.TL_updateChatParticipantAdmin) {
                    TLRPC.TL_updateChatParticipantAdmin adminUpdate = (TLRPC.TL_updateChatParticipantAdmin) update;
                    ConcurrentHashMap<Long, TLRPC.ChannelParticipant> map = channelParticipants.get(adminUpdate.chat_id);
                    if (map != null) {
                        TLRPC.ChannelParticipant participant = map.get(adminUpdate.user_id);
                        if (participant != null) {
                            if (adminUpdate.is_admin) {
                                TLRPC.TL_channelParticipantAdmin newAdmin = new TLRPC.TL_channelParticipantAdmin();
                                newAdmin.user_id = adminUpdate.user_id;
                                newAdmin.can_edit = true;
                                map.put(adminUpdate.user_id, newAdmin);
                            } else {
                                TLRPC.TL_channelParticipant regular = new TLRPC.TL_channelParticipant();
                                regular.user_id = adminUpdate.user_id;
                                map.put(adminUpdate.user_id, regular);
                            }
                        }
                    }
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.channelRightsUpdated,
                        adminUpdate.chat_id,
                        adminUpdate.user_id
                    );
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.updateInterfaces
                    );
                } else if (update instanceof TLRPC.TL_updateChannelParticipant) {
                    TLRPC.TL_updateChannelParticipant partUpdate = (TLRPC.TL_updateChannelParticipant) update;
                    ConcurrentHashMap<Long, TLRPC.ChannelParticipant> map = channelParticipants.get(partUpdate.channel_id);
                    if (map == null) {
                        map = new ConcurrentHashMap<>();
                        channelParticipants.put(partUpdate.channel_id, map);
                    }
                    if (partUpdate.new_participant != null) {
                        map.put(partUpdate.user_id, partUpdate.new_participant);
                    } else {
                        map.remove(partUpdate.user_id);
                    }
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.channelRightsUpdated,
                        partUpdate.channel_id,
                        partUpdate.user_id
                    );
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.updateInterfaces
                    );
                }
            }
        }
    }

    public void processUpdateReadOutbox(long peerId, int maxId, int unreadCount) {
        MessagesStorage.getInstance(currentAccount).updateDialogsReadOutbox(peerId, maxId);

        NotificationCenter.getInstance(currentAccount).postNotificationName(
            NotificationCenter.messagesReadContent, peerId, maxId
        );
        NotificationCenter.getInstance(currentAccount).postNotificationName(
            NotificationCenter.updateInterfaces, NotificationCenter.UPDATE_MASK_READ_DIALOG_MESSAGE
        );
    }

    public void markDialogAsRead(long peerId, int maxId) {
        TLRPC.TL_messages_readHistory req = new TLRPC.TL_messages_readHistory();
        req.peer = getInputPeer(peerId);
        req.max_id = maxId;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (error == null) {
                MessagesStorage.getInstance(currentAccount).updateDialogsReadInbox(peerId, maxId);
                NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.messagesRead, peerId, maxId
                );
            }
        });
    }

    public TLRPC.InputPeer getInputPeer(long peerId) {
        if (peerId > 0) {
            TLRPC.TL_inputPeerUser inputPeer = new TLRPC.TL_inputPeerUser();
            inputPeer.user_id = peerId;
            TLRPC.User u = users.get(peerId);
            inputPeer.access_hash = u != null ? u.access_hash : 0;
            return inputPeer;
        } else {
            TLRPC.TL_inputPeerChat inputPeer = new TLRPC.TL_inputPeerChat();
            inputPeer.chat_id = -peerId;
            return inputPeer;
        }
    }

    public TLRPC.InputUser getInputUser(long userId) {
        TLRPC.User user = getUser(userId);
        if (user == null) {
            TLRPC.TL_inputUser inputUser = new TLRPC.TL_inputUser();
            inputUser.user_id = userId;
            inputUser.access_hash = 0;
            return inputUser;
        }
        TLRPC.TL_inputUser inputUser = new TLRPC.TL_inputUser();
        inputUser.user_id = user.id;
        inputUser.access_hash = user.access_hash;
        return inputUser;
    }

    public TLRPC.InputChannel getInputChannel(long channelId) {
        TLRPC.Chat chat = chats.get(channelId);
        TLRPC.TL_inputChannel inputChannel = new TLRPC.TL_inputChannel();
        inputChannel.channel_id = channelId;
        if (chat != null) {
            inputChannel.access_hash = chat.access_hash;
        }
        return inputChannel;
    }

    public void checkChatInvite(String hash, InviteCheckCallback callback) {
        TLRPC.TL_messages_checkChatInvite req = new TLRPC.TL_messages_checkChatInvite();
        req.hash = hash;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (callback != null) {
                callback.onResult(response, error);
            }
        });
    }

    public void importChatInvite(String hash, InviteImportCallback callback) {
        TLRPC.TL_messages_importChatInvite req = new TLRPC.TL_messages_importChatInvite();
        req.hash = hash;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (response instanceof TLRPC.TL_updates) {
                processUpdates((TLRPC.TL_updates) response, false);
                NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.updateInterfaces);
            }
            if (callback != null) {
                callback.onResult(response, error);
            }
        });
    }

    public void resolveUsername(String username, UsernameResolveCallback callback) {
        TLRPC.TL_contacts_resolveUsername req = new TLRPC.TL_contacts_resolveUsername();
        req.username = username;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (response instanceof TLRPC.TL_contacts_resolvedPeer) {
                TLRPC.TL_contacts_resolvedPeer peer = (TLRPC.TL_contacts_resolvedPeer) response;
                putUsers(peer.users, false);
                putChats(peer.chats, false);
            }
            if (callback != null) {
                callback.onResult(response, error);
            }
        });
    }

    public void joinChannel(long channelId, ChannelJoinCallback callback) {
        TLRPC.TL_channels_joinChannel req = new TLRPC.TL_channels_joinChannel();
        req.channel = getInputChannel(channelId);

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (response instanceof TLRPC.TL_updates) {
                processUpdates((TLRPC.TL_updates) response, false);
                NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.updateInterfaces);
            }
            if (callback != null) {
                callback.onResult(response, error);
            }
        });
    }

    public void loadChannelParticipants(long channelId, TLRPC.ChannelParticipantsFilter filter, int offset, int limit, ChannelParticipantsCallback callback) {
        TLRPC.TL_channels_getParticipants req = new TLRPC.TL_channels_getParticipants();
        req.channel = getInputChannel(channelId);
        req.filter = filter != null ? filter : new TLRPC.TL_channelParticipantsRecent();
        req.offset = offset;
        req.limit = limit;
        req.hash = 0;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (response instanceof TLRPC.TL_channels_channelParticipants) {
                TLRPC.TL_channels_channelParticipants res = (TLRPC.TL_channels_channelParticipants) response;
                putUsers(res.users, false);
                putChats(res.chats, false);

                ConcurrentHashMap<Long, TLRPC.ChannelParticipant> map = channelParticipants.get(channelId);
                if (map == null) {
                    map = new ConcurrentHashMap<>();
                    channelParticipants.put(channelId, map);
                }
                for (TLRPC.ChannelParticipant p : res.participants) {
                    map.put(p.user_id, p);
                }

                NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.chatInfoDidLoad, channelId
                );
            }
            if (callback != null) {
                callback.onResult(response, error);
            }
        });
    }

    public void getChannelParticipant(long channelId, long userId, ChannelParticipantCallback callback) {
        TLRPC.TL_channels_getParticipant req = new TLRPC.TL_channels_getParticipant();
        req.channel = getInputChannel(channelId);
        req.participant = getInputPeer(userId);

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (response instanceof TLRPC.TL_channels_channelParticipant) {
                TLRPC.TL_channels_channelParticipant res = (TLRPC.TL_channels_channelParticipant) response;
                putUsers(res.users, false);
                putChats(res.chats, false);

                ConcurrentHashMap<Long, TLRPC.ChannelParticipant> map = channelParticipants.get(channelId);
                if (map == null) {
                    map = new ConcurrentHashMap<>();
                    channelParticipants.put(channelId, map);
                }
                if (res.participant != null) {
                    map.put(userId, res.participant);
                }

                NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.channelRightsUpdated, channelId, userId
                );
            }
            if (callback != null) {
                callback.onResult(response, error);
            }
        });
    }

    public TLRPC.ChannelParticipant getChannelParticipantCached(long channelId, long userId) {
        ConcurrentHashMap<Long, TLRPC.ChannelParticipant> map = channelParticipants.get(channelId);
        return map != null ? map.get(userId) : null;
    }

    public void editMessage(long dialogId, int messageId, String newText, ArrayList<TLRPC.MessageEntity> entities) {
        TLRPC.TL_messages_editMessage req = new TLRPC.TL_messages_editMessage();
        req.peer = getInputPeer(dialogId);
        req.id = messageId;
        req.message = newText != null ? newText : "";
        if (entities != null && !entities.isEmpty()) {
            req.entities = entities;
            req.flags |= 8;
        }
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (err == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.messagesDidLoaded, dialogId
                    );
                }
            });
        });
    }

    public void forwardMessages(ArrayList<Integer> messageIds, long fromDialogId, long toDialogId) {
        if (messageIds == null || messageIds.isEmpty()) return;
        TLRPC.TL_messages_forwardMessages req = new TLRPC.TL_messages_forwardMessages();
        req.from_peer = getInputPeer(fromDialogId);
        req.to_peer = getInputPeer(toDialogId);
        req.id = messageIds;
        req.random_id = new ArrayList<>();
        for (int i = 0; i < messageIds.size(); i++) {
            req.random_id.add((long) (Math.random() * Long.MAX_VALUE));
        }
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (err == null && res instanceof TLRPC.Updates) {
                    processUpdates((TLRPC.Updates) res, false);
                }
            });
        });
    }

    public void pinMessage(long dialogId, int messageId, boolean notify, boolean forBoth) {
        TLRPC.TL_messages_updatePinnedMessage req = new TLRPC.TL_messages_updatePinnedMessage();
        req.peer = getInputPeer(dialogId);
        req.id = messageId;
        req.silent = !notify;
        req.pm_oneside = !forBoth;
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (err == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.chatInfoDidLoad, dialogId
                    );
                }
            });
        });
    }

    public void deleteMessages(ArrayList<Integer> messageIds, long dialogId, boolean revoke) {
        if (messageIds == null || messageIds.isEmpty()) return;
        TLRPC.TL_messages_deleteMessages req = new TLRPC.TL_messages_deleteMessages();
        req.id = messageIds;
        req.revoke = revoke;
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (err == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.messagesDeleted, messageIds, dialogId
                    );
                }
            });
        });
    }

    public void sendReaction(long dialogId, int messageId, String emojiReaction) {
        TLRPC.TL_messages_sendReaction req = new TLRPC.TL_messages_sendReaction();
        req.peer = getInputPeer(dialogId);
        req.msg_id = messageId;
        if (emojiReaction != null && !emojiReaction.isEmpty()) {
            TLRPC.TL_reactionEmoji reaction = new TLRPC.TL_reactionEmoji();
            reaction.emoticon = emojiReaction;
            req.reaction.add(reaction);
            req.flags |= 1;
        }
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (err == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.reactionsDidLoad, dialogId, messageId
                    );
                }
            });
        });
    }

    public void pinDialogToFolder(long dialogId, int folderId) {
        TLRPC.TL_folders_editPeerFolders req = new TLRPC.TL_folders_editPeerFolders();
        TLRPC.TL_inputFolderPeer peer = new TLRPC.TL_inputFolderPeer();
        peer.peer = getInputPeer(dialogId);
        peer.folder_id = folderId;
        req.folder_peers.add(peer);

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.dialogsNeedReload
                );
            });
        });
    }

    public void muteDialog(long dialogId, int muteUntil) {
        TLRPC.TL_account_updateNotifySettings req = new TLRPC.TL_account_updateNotifySettings();
        TLRPC.TL_inputNotifyPeer inputPeer = new TLRPC.TL_inputNotifyPeer();
        inputPeer.peer = getInputPeer(dialogId);
        req.peer = inputPeer;

        TLRPC.TL_inputPeerNotifySettings settings = new TLRPC.TL_inputPeerNotifySettings();
        settings.mute_until = muteUntil;
        settings.flags |= 4;
        req.settings = settings;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                NotificationCenter.getInstance(currentAccount).postNotificationName(
                    NotificationCenter.notificationsSettingsUpdated, dialogId
                );
            });
        });
    }

    public void setAdminRights(long chatId, long userId, TLRPC.TL_chatAdminRights rights, String customTitle) {
        TLRPC.TL_channels_editAdmin req = new TLRPC.TL_channels_editAdmin();
        req.channel = getInputChannel(chatId);
        req.user_id = getInputUser(userId);
        req.admin_rights = rights;
        req.rank = customTitle != null ? customTitle : "";

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.chatInfoDidLoad, chatId
                    );
                }
            });
        });
    }

    public void setBannedRights(long chatId, long userId, TLRPC.TL_chatBannedRights rights) {
        TLRPC.TL_channels_editBanned req = new TLRPC.TL_channels_editBanned();
        req.channel = getInputChannel(chatId);
        req.participant = getInputPeer(userId);
        req.banned_rights = rights;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (err == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.channelRightsUpdated, chatId, userId
                    );
                }
            });
        });
    }

    public void inviteToChannel(long channelId, ArrayList<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) return;
        TLRPC.TL_channels_inviteToChannel req = new TLRPC.TL_channels_inviteToChannel();
        req.channel = getInputChannel(channelId);
        for (Long uid : userIds) {
            req.users.add(getInputUser(uid));
        }
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (err == null) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.chatInfoDidLoad, channelId
                    );
                }
            });
        });
    }

    public void loadFullUserInfo(long userId, FullUserInfoCallback callback) {
        TLRPC.TL_users_getFullUser req = new TLRPC.TL_users_getFullUser();
        req.id = getInputPeer(userId);
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (err == null && res instanceof TLRPC.TL_users_userFull) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.userFullInfoDidLoad, userId, res
                    );
                }
                if (callback != null) {
                    callback.onResult(res, err);
                }
            });
        });
    }

    public void loadFullChatInfo(long chatId, FullChatInfoCallback callback) {
        TLRPC.TL_channels_getFullChannel req = new TLRPC.TL_channels_getFullChannel();
        req.channel = getInputChannel(chatId);
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (res, err) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (err == null && res instanceof TLRPC.TL_messages_chatFull) {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.chatInfoDidLoad, chatId, res
                    );
                }
                if (callback != null) {
                    callback.onResult(res, err);
                }
            });
        });
    }

    public void processUpdates(TLRPC.Updates updates, boolean isDifference) {
        if (updates == null) return;
        if (updates instanceof TLRPC.TL_updates) {
            for (TLRPC.Update update : ((TLRPC.TL_updates) updates).updates) {
                processSingleUpdate(update);
            }
        }
    }

    private void processSingleUpdate(TLRPC.Update update) {
        if (update instanceof TLRPC.TL_updateNewMessage) {
            TLRPC.TL_updateNewMessage newMessageUpdate = (TLRPC.TL_updateNewMessage) update;
            TLRPC.Message message = newMessageUpdate.message;
            if (message != null) {
                MessageObject obj = new MessageObject(currentAccount, message, true, true);
                AndroidUtilities.runOnUIThread(() -> {
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.didReceiveNewMessages,
                        MessageObject.getDialogId(message),
                        obj
                    );
                });
            }
        }
    }

    public interface FullUserInfoCallback {
        void onResult(TLObject response, TLRPC.TL_error error);
    }

    public interface FullChatInfoCallback {
        void onResult(TLObject response, TLRPC.TL_error error);
    }

    public interface ChannelParticipantsCallback {
        void onResult(TLObject response, TLRPC.TL_error error);
    }

    public interface ChannelParticipantCallback {
        void onResult(TLObject response, TLRPC.TL_error error);
    }

    public interface InviteCheckCallback {
        void onResult(TLObject response, TLRPC.TL_error error);
    }

    public interface InviteImportCallback {
        void onResult(TLObject response, TLRPC.TL_error error);
    }

    public interface UsernameResolveCallback {
        void onResult(TLObject response, TLRPC.TL_error error);
    }

    public interface ChannelJoinCallback {
        void onResult(TLObject response, TLRPC.TL_error error);
    }
}
