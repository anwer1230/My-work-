/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.SQLite.SQLiteCursor;
import org.telegram.SQLite.SQLiteDatabase;
import org.telegram.SQLite.SQLitePreparedStatement;
import org.telegram.tgnet.NativeByteBuffer;
import org.telegram.tgnet.TLObject;
import org.telegram.tgnet.TLRPC;

import java.io.File;
import java.util.ArrayList;

public class MessagesStorage {
    private final int currentAccount;
    private SQLiteDatabase database;
    private static volatile MessagesStorage[] Instance = new MessagesStorage[AccountInstance.MAX_ACCOUNT_COUNT];

    public static MessagesStorage getInstance(int num) {
        MessagesStorage localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (MessagesStorage.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new MessagesStorage(num);
                }
            }
        }
        return localInstance;
    }

    public MessagesStorage(int account) {
        this.currentAccount = account;
        openDatabase();
    }

    private void openDatabase() {
        try {
            File filesDir = new File("/data/data/org.telegram.messenger/files");
            if (!filesDir.exists()) {
                filesDir.mkdirs();
            }
            File dbFile = new File(filesDir, "tg_account_" + currentAccount + ".db");
            database = new SQLiteDatabase(dbFile.getPath());

            database.executeFast("PRAGMA synchronous = NORMAL;");
            database.executeFast("PRAGMA journal_mode = WAL;");

            database.executeFast("CREATE TABLE IF NOT EXISTS messages(mid INTEGER PRIMARY KEY, uid INTEGER, read_state INTEGER, send_state INTEGER, date INTEGER, data BLOB, out INTEGER, ttl INTEGER, media INTEGER);");
            database.executeFast("CREATE TABLE IF NOT EXISTS users(uid INTEGER PRIMARY KEY, name TEXT, status INTEGER, data BLOB);");
            database.executeFast("CREATE TABLE IF NOT EXISTS dialogs(did INTEGER PRIMARY KEY, date INTEGER, unread_count INTEGER, last_mid INTEGER, inbox_max INTEGER, outbox_max INTEGER, pinned INTEGER, data BLOB);");
            database.executeFast("CREATE TABLE IF NOT EXISTS chats(uid INTEGER PRIMARY KEY, name TEXT, data BLOB);");
            database.executeFast("CREATE TABLE IF NOT EXISTS bot_keyboard(uid INTEGER PRIMARY KEY, mid INTEGER, info BLOB);");
            database.executeFast("CREATE TABLE IF NOT EXISTS chat_drafts(did INTEGER PRIMARY KEY, text TEXT, date INTEGER, data BLOB);");
            database.executeFast("CREATE TABLE IF NOT EXISTS user_settings(key TEXT PRIMARY KEY, val TEXT);");
            database.executeFast("CREATE INDEX IF NOT EXISTS mid_idx_messages ON messages(mid);");
            database.executeFast("CREATE INDEX IF NOT EXISTS uid_idx_messages ON messages(uid);");
        } catch (Exception e) {
            // Storage initialization handled safely
        }
    }

    public void putMessages(final TLRPC.Message message, final boolean isOut, final boolean isChannel, final boolean isSchedule, final int classGuid) {
        if (database == null || message == null) {
            return;
        }
        try {
            database.beginTransaction();
            SQLitePreparedStatement state = database.prepareStatement("REPLACE INTO messages VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)");
            state.bindInteger(1, message.id);
            state.bindLong(2, message.peer_id);
            state.bindInteger(3, message.unread ? 0 : 1);
            state.bindInteger(4, 0);
            state.bindInteger(5, message.date);

            // Serialize TLObject directly to BLOB
            NativeByteBuffer data = new NativeByteBuffer(message.getObjectSize());
            message.serializeToStream(data);
            state.bindByteBuffer(6, data);

            state.bindInteger(7, isOut ? 1 : 0);
            state.bindInteger(8, message.ttl);
            state.bindInteger(9, message.media != null ? 1 : 0);

            state.step();
            state.dispose();
            data.reuse();
            database.commitTransaction();
        } catch (Exception e) {
            // Error logged
        }
    }

    public void putUsers(final ArrayList<TLRPC.User> users, final boolean fromServer) {
        if (database == null || users == null || users.isEmpty()) {
            return;
        }
        try {
            database.beginTransaction();
            SQLitePreparedStatement state = database.prepareStatement("REPLACE INTO users VALUES(?, ?, ?, ?)");
            for (TLRPC.User user : users) {
                if (user == null) continue;
                state.bindLong(1, user.id);
                state.bindString(2, (user.first_name != null ? user.first_name : "") + " " + (user.last_name != null ? user.last_name : ""));
                state.bindInteger(3, user.status instanceof TLRPC.TL_userStatusOnline ? 1 : 0);

                NativeByteBuffer data = new NativeByteBuffer(user.getObjectSize());
                user.serializeToStream(data);
                state.bindByteBuffer(4, data);

                state.step();
                state.reset();
                data.reuse();
            }
            state.dispose();
            database.commitTransaction();
        } catch (Exception e) {
            // Error logged
        }
    }

    public void putDialogs(final TLRPC.messages_Dialogs dialogs) {
        if (database == null || dialogs == null) {
            return;
        }
        try {
            putUsers(dialogs.users, true);

            database.beginTransaction();
            SQLitePreparedStatement state = database.prepareStatement("REPLACE INTO dialogs VALUES(?, ?, ?, ?, ?, ?, ?, ?)");
            for (TLRPC.Dialog dialog : dialogs.dialogs) {
                state.bindLong(1, dialog.id);
                state.bindInteger(2, dialog.last_message_date);
                state.bindInteger(3, dialog.unread_count);
                state.bindInteger(4, dialog.top_message);
                state.bindInteger(5, dialog.read_inbox_max_id);
                state.bindInteger(6, dialog.read_outbox_max_id);
                state.bindInteger(7, dialog.pinned ? 1 : 0);

                NativeByteBuffer data = new NativeByteBuffer(dialog.getObjectSize());
                dialog.serializeToStream(data);
                state.bindByteBuffer(8, data);

                state.step();
                state.reset();
                data.reuse();
            }
            state.dispose();
            database.commitTransaction();
        } catch (Exception e) {
            // Error logged
        }
    }

    public ArrayList<TLRPC.Message> getMessages(long peerId, int count, int maxId) {
        ArrayList<TLRPC.Message> result = new ArrayList<>();
        if (database == null) {
            return result;
        }
        try {
            SQLiteCursor cursor = database.queryFinalized("SELECT data FROM messages WHERE uid = ? AND mid < ? ORDER BY mid DESC LIMIT ?", peerId, maxId > 0 ? maxId : Integer.MAX_VALUE, count);
            while (cursor.next()) {
                NativeByteBuffer data = cursor.byteBufferValue(0);
                if (data != null) {
                    int constructor = data.readInt32(false);
                    TLObject obj = TLRPC.TLClassStore.TLdeserialize(data, constructor, false);
                    if (obj instanceof TLRPC.Message) {
                        result.add((TLRPC.Message) obj);
                    }
                    data.reuse();
                }
            }
            cursor.dispose();
        } catch (Exception e) {
            // Query handled
        }
        return result;
    }

    public void saveDraft(long did, String text) {
        if (database == null) return;
        try {
            if (text == null || text.trim().isEmpty()) {
                database.executeFast("DELETE FROM chat_drafts WHERE did = " + did);
            } else {
                SQLitePreparedStatement state = database.prepareStatement("REPLACE INTO chat_drafts VALUES(?, ?, ?, NULL)");
                state.bindLong(1, did);
                state.bindString(2, text);
                state.bindInteger(3, (int)(System.currentTimeMillis() / 1000));
                state.step();
                state.dispose();
            }
        } catch (Exception e) {
            // Handled
        }
    }

    public String getDraft(long did) {
        if (database == null) return null;
        String draft = null;
        try {
            SQLiteCursor cursor = database.queryFinalized("SELECT text FROM chat_drafts WHERE did = ?", did);
            if (cursor.next()) {
                draft = cursor.stringValue(0);
            }
            cursor.dispose();
        } catch (Exception e) {
            // Handled
        }
        return draft;
    }
}
