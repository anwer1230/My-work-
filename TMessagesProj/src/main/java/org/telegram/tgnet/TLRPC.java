/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.tgnet;

import java.util.ArrayList;

public class TLRPC {

    public static class TL_error extends TLObject {
        public int code;
        public String text;
    }

    public static abstract class InputPeer extends TLObject {
        public long user_id;
        public long chat_id;
        public long channel_id;
        public long access_hash;
    }

    public static class TL_inputPeerEmpty extends InputPeer {
        public static int constructor = 0x7f3b18ea;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
        }
    }

    public static class TL_inputPeerSelf extends InputPeer {
        public static int constructor = 0x7da07ec9;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
        }
    }

    public static class TL_inputPeerUser extends InputPeer {
        public static int constructor = 0xdde8a54c;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeInt64(user_id);
            stream.writeInt64(access_hash);
        }
    }

    public static class TL_inputPeerChat extends InputPeer {
        public static int constructor = 0x3563e46b;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeInt64(chat_id);
        }
    }

    public static class TL_inputPeerChannel extends InputPeer {
        public static int constructor = 0x27bcb610;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeInt64(channel_id);
            stream.writeInt64(access_hash);
        }
    }

    public static abstract class User extends TLObject {
        public long id;
        public String first_name;
        public String last_name;
        public String username;
        public String phone;
        public boolean self;
        public boolean contact;
        public boolean mutual_contact;
        public boolean deleted;
        public boolean bot;
        public boolean verified;
        public boolean premium;
        public UserStatus status;
    }

    public static class TL_user extends User {
        public static int constructor = 0x215c4438;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            int flags = stream.readInt32(exception);
            self = (flags & 1024) != 0;
            contact = (flags & 2048) != 0;
            mutual_contact = (flags & 4096) != 0;
            deleted = (flags & 8192) != 0;
            bot = (flags & 16384) != 0;
            verified = (flags & 131072) != 0;
            premium = (flags & 1048576) != 0;
            id = stream.readInt64(exception);
            if ((flags & 64) != 0) {
                first_name = stream.readString(exception);
            }
            if ((flags & 128) != 0) {
                last_name = stream.readString(exception);
            }
            if ((flags & 256) != 0) {
                username = stream.readString(exception);
            }
            if ((flags & 512) != 0) {
                phone = stream.readString(exception);
            }
        }

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            int flags = 0;
            if (self) flags |= 1024;
            if (contact) flags |= 2048;
            if (mutual_contact) flags |= 4096;
            if (deleted) flags |= 8192;
            if (bot) flags |= 16384;
            if (verified) flags |= 131072;
            if (premium) flags |= 1048576;
            if (first_name != null) flags |= 64;
            if (last_name != null) flags |= 128;
            if (username != null) flags |= 256;
            if (phone != null) flags |= 512;
            stream.writeInt32(flags);
            stream.writeInt64(id);
            if (first_name != null) stream.writeString(first_name);
            if (last_name != null) stream.writeString(last_name);
            if (username != null) stream.writeString(username);
            if (phone != null) stream.writeString(phone);
        }
    }

    public static abstract class UserStatus extends TLObject {}
    public static class TL_userStatusOnline extends UserStatus {
        public static int constructor = 0xedb93949;
        public int expires;
    }
    public static class TL_userStatusOffline extends UserStatus {
        public static int constructor = 0x008c703e;
        public int was_online;
    }

    public static abstract class Message extends TLObject {
        public int id;
        public long peer_id;
        public long from_id;
        public int date;
        public String message;
        public boolean out;
        public boolean unread;
        public int send_state;
        public long random_id;
        public int ttl;
        public MessageMedia media;
    }

    public static class TL_message extends Message {
        public static int constructor = 0x76bec211;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            int flags = stream.readInt32(exception);
            out = (flags & 2) != 0;
            unread = (flags & 1) == 0;
            id = stream.readInt32(exception);
            from_id = stream.readInt64(exception);
            peer_id = stream.readInt64(exception);
            date = stream.readInt32(exception);
            message = stream.readString(exception);
        }

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            int flags = 0;
            if (out) flags |= 2;
            stream.writeInt32(flags);
            stream.writeInt32(id);
            stream.writeInt64(from_id);
            stream.writeInt64(peer_id);
            stream.writeInt32(date);
            stream.writeString(message != null ? message : "");
        }
    }

    public static class TL_messages_sendMessage extends TLObject {
        public static int constructor = 0x280d096f;
        public int flags;
        public boolean no_webpage;
        public boolean silent;
        public boolean background;
        public boolean clear_draft;
        public boolean noforwards;
        public boolean update_stickersets_order;
        public boolean invert_media;
        public InputPeer peer;
        public Long reply_to_msg_id;
        public String message;
        public long random_id;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeInt32(flags);
            peer.serializeToStream(stream);
            if (reply_to_msg_id != null) {
                stream.writeInt64(reply_to_msg_id);
            }
            stream.writeString(message != null ? message : "");
            stream.writeInt64(random_id);
        }
    }

    public static class TL_messages_readHistory extends TLObject {
        public static int constructor = 0x0e306d3a;
        public InputPeer peer;
        public int max_id;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            peer.serializeToStream(stream);
            stream.writeInt32(max_id);
        }
    }

    public static abstract class MessageMedia extends TLObject {}

    public static class TL_messageMediaPhoto extends MessageMedia {
        public static int constructor = 0x695150d7;
    }

    public static class TL_messageMediaDocument extends MessageMedia {
        public static int constructor = 0x7c4414d3;
    }

    public static abstract class Chat extends TLObject {
        public long id;
        public String title;
        public int participants_count;
    }

    public static abstract class Dialog extends TLObject {
        public long id;
        public int top_message;
        public int read_inbox_max_id;
        public int read_outbox_max_id;
        public int unread_count;
        public int last_message_date;
        public boolean pinned;
    }

    public static class TL_dialog extends Dialog {
        public static int constructor = 0xd58a08c6;
    }

    public static abstract class messages_Dialogs extends TLObject {
        public ArrayList<Dialog> dialogs = new ArrayList<>();
        public ArrayList<Message> messages = new ArrayList<>();
        public ArrayList<Chat> chats = new ArrayList<>();
        public ArrayList<User> users = new ArrayList<>();
    }

    public static class TL_messages_dialogs extends messages_Dialogs {
        public static int constructor = 0x15ba6c40;
    }

    public static class TL_messages_getDialogs extends TLObject {
        public static int constructor = 0xa0f4cb4f;
        public int flags;
        public int offset_date;
        public int offset_id;
        public InputPeer offset_peer;
        public int limit;
        public long hash;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeInt32(flags);
            stream.writeInt32(offset_date);
            stream.writeInt32(offset_id);
            offset_peer.serializeToStream(stream);
            stream.writeInt32(limit);
            stream.writeInt64(hash);
        }
    }

    public static abstract class Updates extends TLObject {}

    public static class TL_updates extends Updates {
        public static int constructor = 0x74ae4240;
        public ArrayList<Update> updates = new ArrayList<>();
        public ArrayList<User> users = new ArrayList<>();
        public ArrayList<Chat> chats = new ArrayList<>();
        public int date;
        public int seq;
    }

    public static abstract class Update extends TLObject {}

    public static class TL_updateNewMessage extends Update {
        public static int constructor = 0x1f2b0afd;
        public Message message;
        public int pts;
        public int pts_count;
    }

    public static class TL_updateMessageID extends Update {
        public static int constructor = 0x4e9004e4;
        public int id;
        public long random_id;
    }

    public static class TL_updateReadHistoryOutbox extends Update {
        public static int constructor = 0x2f2f21bf;
        public InputPeer peer;
        public int max_id;
        public int pts;
        public int pts_count;
    }

    public static class TL_updateReadHistoryInbox extends Update {
        public static int constructor = 0x9961fd5c;
        public InputPeer peer;
        public int max_id;
        public int still_unread_count;
        public int pts;
        public int pts_count;
    }

    public static abstract class ChatAdminRights extends TLObject {
        public int flags;
        public boolean change_info;
        public boolean post_messages;
        public boolean edit_messages;
        public boolean delete_messages;
        public boolean ban_users;
        public boolean invite_users;
        public boolean pin_messages;
        public boolean add_admins;
        public boolean anonymous;
        public boolean manage_call;
        public boolean manage_topics;
        public boolean post_stories;
        public boolean edit_stories;
        public boolean delete_stories;
    }

    public static class TL_chatAdminRights extends ChatAdminRights {
        public static int constructor = 0x5fb224d5;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            flags = stream.readInt32(exception);
            change_info = (flags & 1) != 0;
            post_messages = (flags & 2) != 0;
            edit_messages = (flags & 4) != 0;
            delete_messages = (flags & 8) != 0;
            ban_users = (flags & 16) != 0;
            invite_users = (flags & 32) != 0;
            pin_messages = (flags & 128) != 0;
            add_admins = (flags & 512) != 0;
            anonymous = (flags & 1024) != 0;
            manage_call = (flags & 2048) != 0;
            manage_topics = (flags & 8192) != 0;
            post_stories = (flags & 16384) != 0;
            edit_stories = (flags & 32768) != 0;
            delete_stories = (flags & 65536) != 0;
        }

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            flags = 0;
            if (change_info) flags |= 1;
            if (post_messages) flags |= 2;
            if (edit_messages) flags |= 4;
            if (delete_messages) flags |= 8;
            if (ban_users) flags |= 16;
            if (invite_users) flags |= 32;
            if (pin_messages) flags |= 128;
            if (add_admins) flags |= 512;
            if (anonymous) flags |= 1024;
            if (manage_call) flags |= 2048;
            if (manage_topics) flags |= 8192;
            if (post_stories) flags |= 16384;
            if (edit_stories) flags |= 32768;
            if (delete_stories) flags |= 65536;
            stream.writeInt32(flags);
        }
    }

    public static abstract class ChatBannedRights extends TLObject {
        public int flags;
        public boolean view_messages;
        public boolean send_messages;
        public boolean send_media;
        public boolean send_stickers;
        public boolean send_gifs;
        public boolean send_games;
        public boolean send_inline;
        public boolean embed_links;
        public boolean send_polls;
        public boolean change_info;
        public boolean invite_users;
        public boolean pin_messages;
        public boolean manage_topics;
        public boolean send_photos;
        public boolean send_videos;
        public boolean send_roundvideos;
        public boolean send_audios;
        public boolean send_voices;
        public boolean send_docs;
        public boolean send_plain;
        public int until_date;
    }

    public static class TL_chatBannedRights extends ChatBannedRights {
        public static int constructor = 0x9f120418;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            flags = stream.readInt32(exception);
            view_messages = (flags & 1) != 0;
            send_messages = (flags & 2) != 0;
            send_media = (flags & 4) != 0;
            send_stickers = (flags & 8) != 0;
            send_gifs = (flags & 16) != 0;
            send_games = (flags & 32) != 0;
            send_inline = (flags & 64) != 0;
            embed_links = (flags & 128) != 0;
            send_polls = (flags & 256) != 0;
            change_info = (flags & 1024) != 0;
            invite_users = (flags & 32768) != 0;
            pin_messages = (flags & 131072) != 0;
            manage_topics = (flags & 524288) != 0;
            send_photos = (flags & 1048576) != 0;
            send_videos = (flags & 2097152) != 0;
            send_roundvideos = (flags & 4194304) != 0;
            send_audios = (flags & 8388608) != 0;
            send_voices = (flags & 16777216) != 0;
            send_docs = (flags & 33554432) != 0;
            send_plain = (flags & 67108864) != 0;
            until_date = stream.readInt32(exception);
        }

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            flags = 0;
            if (view_messages) flags |= 1;
            if (send_messages) flags |= 2;
            if (send_media) flags |= 4;
            if (send_stickers) flags |= 8;
            if (send_gifs) flags |= 16;
            if (send_games) flags |= 32;
            if (send_inline) flags |= 64;
            if (embed_links) flags |= 128;
            if (send_polls) flags |= 256;
            if (change_info) flags |= 1024;
            if (invite_users) flags |= 32768;
            if (pin_messages) flags |= 131072;
            if (manage_topics) flags |= 524288;
            if (send_photos) flags |= 1048576;
            if (send_videos) flags |= 2097152;
            if (send_roundvideos) flags |= 4194304;
            if (send_audios) flags |= 8388608;
            if (send_voices) flags |= 16777216;
            if (send_docs) flags |= 33554432;
            if (send_plain) flags |= 67108864;
            stream.writeInt32(flags);
            stream.writeInt32(until_date);
        }
    }

    // ==========================================
    // Channel Participants Model Architecture
    // ==========================================

    public static abstract class ChannelParticipant extends TLObject {
        public int flags;
        public long user_id;
        public long inviter_id;
        public long promoted_by;
        public long kicked_by;
        public int date;
        public TLRPC.ChatAdminRights admin_rights;
        public TLRPC.ChatBannedRights banned_rights;
        public String rank;
        public boolean can_edit;
        public boolean self;
        public TLRPC.Peer peer;
    }

    public static class TL_channelParticipantCreator extends ChannelParticipant {
        public static int constructor = 0x2fe601d3;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            flags = stream.readInt32(exception);
            user_id = stream.readInt64(exception);
            admin_rights = (TLRPC.ChatAdminRights) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
            if ((flags & 1) != 0) {
                rank = stream.readString(exception);
            }
        }

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            flags = rank != null ? 1 : 0;
            stream.writeInt32(flags);
            stream.writeInt64(user_id);
            admin_rights.serializeToStream(stream);
            if (rank != null) {
                stream.writeString(rank);
            }
        }
    }

    public static class TL_channelParticipantAdmin extends ChannelParticipant {
        public static int constructor = 0x34c3bb53;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            flags = stream.readInt32(exception);
            can_edit = (flags & 1) != 0;
            self = (flags & 2) != 0;
            user_id = stream.readInt64(exception);
            if ((flags & 2) != 0) {
                inviter_id = stream.readInt64(exception);
            }
            promoted_by = stream.readInt64(exception);
            date = stream.readInt32(exception);
            admin_rights = (TLRPC.ChatAdminRights) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
            if ((flags & 4) != 0) {
                rank = stream.readString(exception);
            }
        }

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            flags = 0;
            if (can_edit) flags |= 1;
            if (self) flags |= 2;
            if (rank != null) flags |= 4;
            stream.writeInt32(flags);
            stream.writeInt64(user_id);
            if (self) {
                stream.writeInt64(inviter_id);
            }
            stream.writeInt64(promoted_by);
            stream.writeInt32(date);
            admin_rights.serializeToStream(stream);
            if (rank != null) {
                stream.writeString(rank);
            }
        }
    }

    public static class TL_channelParticipant extends ChannelParticipant {
        public static int constructor = 0xcb446d40;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            flags = stream.readInt32(exception);
            user_id = stream.readInt64(exception);
            date = stream.readInt32(exception);
            if ((flags & 1) != 0) {
                subscription_until_date = stream.readInt32(exception);
            }
        }

        public int subscription_until_date;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            flags = 0;
            stream.writeInt32(flags);
            stream.writeInt64(user_id);
            stream.writeInt32(date);
        }
    }

    public static class TL_channelParticipantBanned extends ChannelParticipant {
        public static int constructor = 0x6df8014e;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            flags = stream.readInt32(exception);
            boolean left = (flags & 1) != 0;
            peer = (TLRPC.Peer) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
            if (peer != null) {
                user_id = peer.user_id;
            }
            kicked_by = stream.readInt64(exception);
            date = stream.readInt32(exception);
            banned_rights = (TLRPC.ChatBannedRights) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
        }

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeInt32(flags);
            if (peer != null) {
                peer.serializeToStream(stream);
            }
            stream.writeInt64(kicked_by);
            stream.writeInt32(date);
            banned_rights.serializeToStream(stream);
        }
    }

    public static class TL_channelParticipantLeft extends ChannelParticipant {
        public static int constructor = 0x1b03f006;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            peer = (TLRPC.Peer) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
            if (peer != null) {
                user_id = peer.user_id;
            }
        }

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            if (peer != null) {
                peer.serializeToStream(stream);
            }
        }
    }

    public static class TL_channelParticipantSelf extends ChannelParticipant {
        public static int constructor = 0x35a8b815;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            flags = stream.readInt32(exception);
            user_id = stream.readInt64(exception);
            inviter_id = stream.readInt64(exception);
            date = stream.readInt32(exception);
        }

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeInt32(flags);
            stream.writeInt64(user_id);
            stream.writeInt64(inviter_id);
            stream.writeInt32(date);
        }
    }

    // Filter definitions
    public static abstract class ChannelParticipantsFilter extends TLObject {}

    public static class TL_channelParticipantsRecent extends ChannelParticipantsFilter {
        public static int constructor = 0xde3f3c79;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
        }
    }

    public static class TL_channelParticipantsAdmins extends ChannelParticipantsFilter {
        public static int constructor = 0xb4608969;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
        }
    }

    public static class TL_channelParticipantsKicked extends ChannelParticipantsFilter {
        public static int constructor = 0x3c37bb74;
        public String q;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeString(q != null ? q : "");
        }
    }

    public static class TL_channelParticipantsBanned extends ChannelParticipantsFilter {
        public static int constructor = 0x1427a5e5;
        public String q;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeString(q != null ? q : "");
        }
    }

    public static class TL_channelParticipantsBots extends ChannelParticipantsFilter {
        public static int constructor = 0xb0d1865b;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
        }
    }

    public static class TL_channelParticipantsSearch extends ChannelParticipantsFilter {
        public static int constructor = 0x06560f38;
        public String q;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeString(q != null ? q : "");
        }
    }

    // RPC Requests & Responses
    public static class TL_channels_getParticipants extends TLObject {
        public static int constructor = 0x77ced9d0;
        public InputChannel channel;
        public ChannelParticipantsFilter filter;
        public int offset;
        public int limit;
        public long hash;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            channel.serializeToStream(stream);
            filter.serializeToStream(stream);
            stream.writeInt32(offset);
            stream.writeInt32(limit);
            stream.writeInt64(hash);
        }
    }

    public static class TL_channels_getParticipant extends TLObject {
        public static int constructor = 0xa0ab6cc6;
        public InputChannel channel;
        public InputPeer participant;

        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            channel.serializeToStream(stream);
            participant.serializeToStream(stream);
        }
    }

    public static abstract class channels_ChannelParticipants extends TLObject {
        public int count;
        public ArrayList<ChannelParticipant> participants = new ArrayList<>();
        public ArrayList<Chat> chats = new ArrayList<>();
        public ArrayList<User> users = new ArrayList<>();
    }

    public static class TL_channels_channelParticipants extends channels_ChannelParticipants {
        public static int constructor = 0x9ab0fe02;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            count = stream.readInt32(exception);
            int magic = stream.readInt32(exception);
            int countParticipants = stream.readInt32(exception);
            for (int a = 0; a < countParticipants; a++) {
                ChannelParticipant obj = (ChannelParticipant) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
                if (obj == null) return;
                participants.add(obj);
            }
            magic = stream.readInt32(exception);
            int countChats = stream.readInt32(exception);
            for (int a = 0; a < countChats; a++) {
                Chat obj = (Chat) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
                if (obj == null) return;
                chats.add(obj);
            }
            magic = stream.readInt32(exception);
            int countUsers = stream.readInt32(exception);
            for (int a = 0; a < countUsers; a++) {
                User obj = (User) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
                if (obj == null) return;
                users.add(obj);
            }
        }
    }

    public static class TL_channels_channelParticipant extends TLObject {
        public static int constructor = 0xdfb80317;
        public ChannelParticipant participant;
        public ArrayList<Chat> chats = new ArrayList<>();
        public ArrayList<User> users = new ArrayList<>();

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            participant = (ChannelParticipant) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
            int magic = stream.readInt32(exception);
            int countChats = stream.readInt32(exception);
            for (int a = 0; a < countChats; a++) {
                Chat obj = (Chat) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
                if (obj == null) return;
                chats.add(obj);
            }
            magic = stream.readInt32(exception);
            int countUsers = stream.readInt32(exception);
            for (int a = 0; a < countUsers; a++) {
                User obj = (User) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
                if (obj == null) return;
                users.add(obj);
            }
        }
    }

    public static abstract class Peer extends TLObject {
        public long user_id;
        public long chat_id;
        public long channel_id;
    }

    public static class TL_peerUser extends Peer {
        public static int constructor = 0x595f17d7;
        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            user_id = stream.readInt64(exception);
        }
    }

    public static class TL_peerChat extends Peer {
        public static int constructor = 0xbad0eda6;
        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            chat_id = stream.readInt64(exception);
        }
    }

    public static class TL_peerChannel extends Peer {
        public static int constructor = 0xa2a5371e;
        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            channel_id = stream.readInt64(exception);
        }
    }

    public static class TL_updateChatParticipantAdmin extends Update {
        public static int constructor = 0xd7ca61a2;
        public long chat_id;
        public long user_id;
        public boolean is_admin;
        public int version;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            chat_id = stream.readInt64(exception);
            user_id = stream.readInt64(exception);
            is_admin = stream.readBool(exception);
            version = stream.readInt32(exception);
        }
    }

    public static class TL_updateChannelParticipant extends Update {
        public static int constructor = 0x985d3abb;
        public int flags;
        public long channel_id;
        public int date;
        public long actor_id;
        public long user_id;
        public ChannelParticipant prev_participant;
        public ChannelParticipant new_participant;
        public int qts;

        @Override
        public void readParams(NativeByteBuffer stream, boolean exception) {
            flags = stream.readInt32(exception);
            channel_id = stream.readInt64(exception);
            date = stream.readInt32(exception);
            actor_id = stream.readInt64(exception);
            user_id = stream.readInt64(exception);
            if ((flags & 1) != 0) {
                prev_participant = (ChannelParticipant) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
            }
            if ((flags & 2) != 0) {
                new_participant = (ChannelParticipant) TLClassStore.TLdeserialize(stream, stream.readInt32(exception), exception);
            }
            qts = stream.readInt32(exception);
        }
    }

    public static class TL_messages_checkChatInvite extends TLObject {
        public static int constructor = 0x3eadb1bb;
        public String hash;
        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeString(hash);
        }
    }

    public static class TL_messages_importChatInvite extends TLObject {
        public static int constructor = 0x6c50051c;
        public String hash;
        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeString(hash);
        }
    }

    public static class TL_contacts_resolveUsername extends TLObject {
        public static int constructor = 0xf93ccba3;
        public String username;
        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeString(username);
        }
    }

    public static class TL_contacts_resolvedPeer extends TLObject {
        public static int constructor = 0x7f077ad9;
        public Peer peer;
        public ArrayList<Chat> chats = new ArrayList<>();
        public ArrayList<User> users = new ArrayList<>();
    }

    public static class TL_channels_joinChannel extends TLObject {
        public static int constructor = 0x24b524c5;
        public InputChannel channel;
        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            channel.serializeToStream(stream);
        }
    }

    public static class TL_inputChannel extends InputChannel {
        public static int constructor = 0xf35aec28;
        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeInt64(channel_id);
            stream.writeInt64(access_hash);
        }
    }

    public static abstract class InputChannel extends TLObject {
        public long channel_id;
        public long access_hash;
    }

    public static class TL_inputUser extends InputPeer {
        public static int constructor = 0xf21158d6;
        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            stream.writeInt64(user_id);
            stream.writeInt64(access_hash);
        }
    }

    public static class TL_channel extends Chat {
        public static int constructor = 0x83e20e04;
        public boolean megagroup;
        public boolean forum;
        public long access_hash;
        public ChatBannedRights default_banned_rights;
    }

    public static class TL_channelForbidden extends Chat {
        public static int constructor = 0x17d493d5;
        public long access_hash;
    }

    public static class TL_users_getFullUser extends TLObject {
        public static int constructor = 0xb60f5918;
        public InputPeer id;
        @Override
        public void serializeToStream(NativeByteBuffer stream) {
            stream.writeInt32(constructor);
            id.serializeToStream(stream);
        }
    }

    public static class TL_users_userFull extends TLObject {
        public static int constructor = 0x3b6d152e;
        public UserFull full_user;
    }

    public static class UserFull extends TLObject {
        public long id;
        public String about;
        public PeerSettings settings;
        public Photo profile_photo;
        public PeerNotifySettings notify_settings;
        public BotInfo bot_info;
        public boolean blocked;
        public boolean phone_calls_available;
        public boolean video_calls_available;
        public int common_chats_count;
    }

    public static class PeerSettings extends TLObject {
        public int flags;
    }

    public static class BotInfo extends TLObject {
        public long user_id;
        public String description;
    }

    public static abstract class MessageEntity extends TLObject {
        public int offset;
        public int length;
    }

    public static class TL_messageEntityUnknown extends MessageEntity {
        public static int constructor = 0xbb92ba95;
    }

    public static class TL_messageEntityMention extends MessageEntity {
        public static int constructor = 0xfa042b05;
    }

    public static class TL_messageEntityHashtag extends MessageEntity {
        public static int constructor = 0x6f6343c0;
    }

    public static class TL_messageEntityBotCommand extends MessageEntity {
        public static int constructor = 0x6cef8ac7;
    }

    public static class TL_messageEntityUrl extends MessageEntity {
        public static int constructor = 0x6ed02538;
    }

    public static class TL_messageEntityEmail extends MessageEntity {
        public static int constructor = 0x64e475ac;
    }

    public static class TL_messageEntityBold extends MessageEntity {
        public static int constructor = 0xbd610bc9;
    }

    public static class TL_messageEntityItalic extends MessageEntity {
        public static int constructor = 0x826f8b60;
    }

    public static class TL_messageEntityCode extends MessageEntity {
        public static int constructor = 0x28a20571;
    }

    public static class TL_messageEntityPre extends MessageEntity {
        public static int constructor = 0x73924be0;
        public String language;
    }

    public static class TL_messageEntityTextUrl extends MessageEntity {
        public static int constructor = 0x76a2cbf7;
        public String url;
    }

    public static class TL_messageEntityMentionName extends MessageEntity {
        public static int constructor = 0xdc7b1140;
        public long user_id;
    }

    public static class TL_messageEntityPhone extends MessageEntity {
        public static int constructor = 0x9b69e34b;
    }

    public static class TL_messageEntityCashtag extends MessageEntity {
        public static int constructor = 0x4c4e743f;
    }

    public static class TL_messageEntityUnderline extends MessageEntity {
        public static int constructor = 0x9c4e7e8b;
    }

    public static class TL_messageEntityStrike extends MessageEntity {
        public static int constructor = 0xbf069386;
    }

    public static class TL_messageEntityBlockquote extends MessageEntity {
        public static int constructor = 0x020df5ff;
    }

    public static class TL_messageEntitySpoiler extends MessageEntity {
        public static int constructor = 0x32ca960f;
    }

    public static class TL_messageEntityCustomEmoji extends MessageEntity {
        public static int constructor = 0xc8cf05f8;
        public long document_id;
    }

    public static abstract class InputMedia extends TLObject {
    }

    public static class TL_inputMediaEmpty extends InputMedia {
        public static int constructor = 0x96146124;
    }

    public static class TL_inputMediaUploadedPhoto extends InputMedia {
        public static int constructor = 0x1e287d04;
        public InputFile file;
        public ArrayList<MessageEntity> entities = new ArrayList<>();
        public int ttl_seconds;
    }

    public static class TL_inputMediaUploadedDocument extends InputMedia {
        public static int constructor = 0x5b38c6c1;
        public InputFile file;
        public String mime_type;
        public ArrayList<DocumentAttribute> attributes = new ArrayList<>();
        public ArrayList<MessageEntity> entities = new ArrayList<>();
        public int ttl_seconds;
    }

    public static class DocumentAttribute extends TLObject {
    }

    public static class TL_messages_sendMedia extends TLObject {
        public static int constructor = 0x78524a6c;
        public int flags;
        public boolean silent;
        public boolean background;
        public boolean clear_draft;
        public boolean noforwards;
        public boolean update_stickersets_order;
        public InputPeer peer;
        public MessageReplyHeader reply_to;
        public InputMedia media;
        public String message;
        public long random_id;
        public ArrayList<MessageEntity> entities = new ArrayList<>();
        public int schedule_date;
    }

    public static class TL_messages_editMessage extends TLObject {
        public static int constructor = 0x48f71778;
        public int flags;
        public boolean no_webpage;
        public InputPeer peer;
        public int id;
        public String message;
        public InputMedia media;
        public ArrayList<MessageEntity> entities = new ArrayList<>();
        public int schedule_date;
    }

    public static class TL_messages_deleteMessages extends TLObject {
        public static int constructor = 0xe58e9535;
        public int flags;
        public boolean revoke;
        public ArrayList<Integer> id = new ArrayList<>();
    }

    public static class TL_messages_forwardMessages extends TLObject {
        public static int constructor = 0xcc30292b;
        public int flags;
        public boolean silent;
        public boolean background;
        public boolean with_my_score;
        public boolean drop_author;
        public boolean drop_media_captions;
        public boolean noforwards;
        public InputPeer from_peer;
        public ArrayList<Integer> id = new ArrayList<>();
        public ArrayList<Long> random_id = new ArrayList<>();
        public InputPeer to_peer;
        public int schedule_date;
    }

    public static class TL_messages_updatePinnedMessage extends TLObject {
        public static int constructor = 0xdba2296c;
        public int flags;
        public boolean silent;
        public boolean unpin;
        public boolean pm_oneside;
        public InputPeer peer;
        public int id;
    }

    public static class TL_messages_sendScheduledMessage extends TLObject {
        public static int constructor = 0xbd3885c6;
        public InputPeer peer;
        public int id;
    }

    public static abstract class Reaction extends TLObject {
    }

    public static class TL_reactionEmpty extends Reaction {
        public static int constructor = 0x79f5d419;
    }

    public static class TL_reactionEmoji extends Reaction {
        public static int constructor = 0x1b2286b8;
        public String emoticon;
    }

    public static class TL_reactionCustomEmoji extends Reaction {
        public static int constructor = 0x8935fc73;
        public long document_id;
    }

    public static class TL_reactionCount extends TLObject {
        public static int constructor = 0xa3d1cb80;
        public Reaction reaction;
        public int count;
    }

    public static class TL_messageReactions extends TLObject {
        public static int constructor = 0x4f2b9479;
        public int flags;
        public boolean min;
        public boolean can_see_list;
        public ArrayList<TL_reactionCount> results = new ArrayList<>();
    }

    public static class TL_messages_sendReaction extends TLObject {
        public static int constructor = 0xd30d78d4;
        public int flags;
        public boolean big;
        public boolean add_to_recent;
        public InputPeer peer;
        public int msg_id;
        public ArrayList<Reaction> reaction = new ArrayList<>();
    }

    public static abstract class WebPage extends TLObject {
        public long id;
        public String url;
        public String display_url;
        public String site_name;
        public String title;
        public String description;
        public Photo photo;
    }

    public static class TL_webPageEmpty extends WebPage {
        public static int constructor = 0x211a1788;
    }

    public static class TL_webPagePending extends WebPage {
        public static int constructor = 0xc586da1e;
        public int date;
    }

    public static class TL_webPage extends WebPage {
        public static int constructor = 0xe89c45b2;
        public int flags;
        public String type;
    }

    public static class TL_webPageNotModified extends WebPage {
        public static int constructor = 0x7311aca2;
    }

    public static class TL_messageMediaWebPage extends MessageMedia {
        public static int constructor = 0xa32dd600;
        public WebPage webpage;
    }

    public static class TL_messages_getWebPagePreview extends TLObject {
        public static int constructor = 0x8b68b0cc;
        public int flags;
        public String message;
        public ArrayList<MessageEntity> entities = new ArrayList<>();
    }

    public static class TL_inputFolderPeer extends TLObject {
        public static int constructor = 0xfbd2b3d6;
        public InputPeer peer;
        public int folder_id;
    }

    public static class TL_folders_editPeerFolders extends TLObject {
        public static int constructor = 0x6847d0ab;
        public ArrayList<TL_inputFolderPeer> folder_peers = new ArrayList<>();
    }

    public static abstract class InputNotifyPeer extends TLObject {
    }

    public static class TL_inputNotifyPeer extends InputNotifyPeer {
        public static int constructor = 0xb8bc5b0c;
        public InputPeer peer;
    }

    public static class TL_inputNotifyUsers extends InputNotifyPeer {
        public static int constructor = 0x193b44cd;
    }

    public static class TL_inputNotifyChats extends InputNotifyPeer {
        public static int constructor = 0x4a95e84e;
    }

    public static class TL_inputNotifyBroadcasts extends InputNotifyPeer {
        public static int constructor = 0xb1db7c7e;
    }

    public static class PeerNotifySettings extends TLObject {
        public int flags;
        public boolean show_previews;
        public boolean silent;
        public int mute_until;
        public String sound;
    }

    public static class TL_peerNotifySettings extends PeerNotifySettings {
        public static int constructor = 0xaf509d20;
    }

    public static class TL_inputPeerNotifySettings extends TLObject {
        public static int constructor = 0xcac67912;
        public int flags;
        public boolean show_previews;
        public boolean silent;
        public int mute_until;
        public String sound;
    }

    public static class TL_account_updateNotifySettings extends TLObject {
        public static int constructor = 0x84be5b93;
        public InputNotifyPeer peer;
        public TL_inputPeerNotifySettings settings;
    }

    public static class TL_channels_editAdmin extends TLObject {
        public static int constructor = 0xd33c8902;
        public InputChannel channel;
        public InputUser user_id;
        public TL_chatAdminRights admin_rights;
        public String rank;
    }

    public static class TL_channels_editBanned extends TLObject {
        public static int constructor = 0x96e6cd81;
        public InputChannel channel;
        public InputPeer participant;
        public TL_chatBannedRights banned_rights;
    }

    public static class TL_channels_inviteToChannel extends TLObject {
        public static int constructor = 0x199f3a14;
        public InputChannel channel;
        public ArrayList<InputUser> users = new ArrayList<>();
    }

    public static class TL_channels_createForumTopic extends TLObject {
        public static int constructor = 0xf40c0224;
        public int flags;
        public InputChannel channel;
        public String title;
        public int icon_color;
        public long icon_emoji_id;
        public long random_id;
        public InputPeer send_as;
    }

    public static class ForumTopic extends TLObject {
        public int flags;
        public boolean my;
        public boolean closed;
        public boolean pinned;
        public boolean hidden;
        public int id;
        public int date;
        public String title;
        public int icon_color;
        public long icon_emoji_id;
        public int top_message;
        public int read_inbox_max_id;
        public int read_outbox_max_id;
        public int unread_count;
    }

    public static class TL_forumTopic extends ForumTopic {
        public static int constructor = 0x71701da9;
    }

    public static abstract class ChatFull extends TLObject {
        public long id;
        public String about;
        public int participants_count;
        public int admins_count;
        public int kicked_count;
        public int banned_count;
        public int online_count;
        public int read_inbox_max_id;
        public int read_outbox_max_id;
        public int unread_count;
        public Photo chat_photo;
        public PeerNotifySettings notify_settings;
        public ExportedChatInvite exported_invite;
        public ArrayList<BotInfo> bot_info = new ArrayList<>();
        public int pinned_msg_id;
        public int folder_id;
        public TL_chatAdminRights admin_rights;
        public TL_chatBannedRights default_banned_rights;
    }

    public static class TL_chatFull extends ChatFull {
        public static int constructor = 0xc9d31138;
        public ChatParticipants participants;
    }

    public static class TL_channelFull extends ChatFull {
        public static int constructor = 0xf2355507;
        public int flags;
        public boolean can_view_participants;
        public boolean can_set_username;
        public boolean can_set_stickers;
        public boolean hidden_prehistory;
        public boolean can_set_location;
        public boolean has_scheduled;
        public boolean can_view_stats;
        public boolean blocked;
        public boolean can_delete_channel;
        public boolean antispam;
        public boolean participants_hidden;
        public boolean translations_disabled;
        public boolean view_forum_as_messages;
        public int slowmode_seconds;
        public int slowmode_next_send_date;
        public int stats_dc;
        public int pts;
        public InputGroupCall call;
        public ArrayList<TL_chatInviteExported> available_reactions;
    }

    public static class TL_messages_chatFull extends TLObject {
        public static int constructor = 0xe5d7d19c;
        public ChatFull full_chat;
        public ArrayList<Chat> chats = new ArrayList<>();
        public ArrayList<User> users = new ArrayList<>();
    }

    public static class TL_channels_getFullChannel extends TLObject {
        public static int constructor = 0x08736a09;
        public InputChannel channel;
    }

    public static abstract class InputBotApp extends TLObject {
    }

    public static class TL_inputBotAppShortName extends InputBotApp {
        public static int constructor = 0x90551370;
        public InputUser bot_id;
        public String short_name;
    }

    public static class TL_messages_requestAppWebView extends TLObject {
        public static int constructor = 0x53618bce;
        public int flags;
        public boolean write_allowed;
        public InputPeer peer;
        public InputBotApp app;
        public String start_param;
        public String theme_params;
        public String platform;
    }

    public static class TL_appWebViewResultUrl extends TLObject {
        public static int constructor = 0x3c46e80a;
        public int flags;
        public String url;
    }

    public static class TL_phone_joinGroupCall extends TLObject {
        public static int constructor = 0xb132ff7b;
        public int flags;
        public boolean muted;
        public boolean video_stopped;
        public InputGroupCall call;
        public InputPeer join_as;
        public String invite_hash;
        public DataJSON params;
    }

    public static class TL_phone_leaveGroupCall extends TLObject {
        public static int constructor = 0x500377f9;
        public InputGroupCall call;
        public int source;
    }

    public static class DataJSON extends TLObject {
        public static int constructor = 0x7d748d04;
        public String data;
    }

    public static class TLClassStore {
        public static TLObject TLdeserialize(NativeByteBuffer stream, int constructor, boolean exception) {
            TLObject obj = null;
            if (constructor == TL_user.constructor) {
                obj = new TL_user();
            } else if (constructor == TL_message.constructor) {
                obj = new TL_message();
            } else if (constructor == TL_messages_dialogs.constructor) {
                obj = new TL_messages_dialogs();
            } else if (constructor == TL_updates.constructor) {
                obj = new TL_updates();
            } else if (constructor == TL_updateNewMessage.constructor) {
                obj = new TL_updateNewMessage();
            } else if (constructor == TL_updateMessageID.constructor) {
                obj = new TL_updateMessageID();
            } else if (constructor == TL_updateReadHistoryOutbox.constructor) {
                obj = new TL_updateReadHistoryOutbox();
            } else if (constructor == TL_updateReadHistoryInbox.constructor) {
                obj = new TL_updateReadHistoryInbox();
            } else if (constructor == TL_chatAdminRights.constructor) {
                obj = new TL_chatAdminRights();
            } else if (constructor == TL_chatBannedRights.constructor) {
                obj = new TL_chatBannedRights();
            } else if (constructor == TL_channelParticipantCreator.constructor) {
                obj = new TL_channelParticipantCreator();
            } else if (constructor == TL_channelParticipantAdmin.constructor) {
                obj = new TL_channelParticipantAdmin();
            } else if (constructor == TL_channelParticipant.constructor) {
                obj = new TL_channelParticipant();
            } else if (constructor == TL_channelParticipantBanned.constructor) {
                obj = new TL_channelParticipantBanned();
            } else if (constructor == TL_channelParticipantLeft.constructor) {
                obj = new TL_channelParticipantLeft();
            } else if (constructor == TL_channelParticipantSelf.constructor) {
                obj = new TL_channelParticipantSelf();
            } else if (constructor == TL_channels_channelParticipants.constructor) {
                obj = new TL_channels_channelParticipants();
            } else if (constructor == TL_channels_channelParticipant.constructor) {
                obj = new TL_channels_channelParticipant();
            } else if (constructor == TL_peerUser.constructor) {
                obj = new TL_peerUser();
            } else if (constructor == TL_peerChat.constructor) {
                obj = new TL_peerChat();
            } else if (constructor == TL_peerChannel.constructor) {
                obj = new TL_peerChannel();
            } else if (constructor == TL_updateChatParticipantAdmin.constructor) {
                obj = new TL_updateChatParticipantAdmin();
            } else if (constructor == TL_updateChannelParticipant.constructor) {
                obj = new TL_updateChannelParticipant();
            }
            if (obj != null) {
                obj.readParams(stream, exception);
            }
            return obj;
        }
    }
}
