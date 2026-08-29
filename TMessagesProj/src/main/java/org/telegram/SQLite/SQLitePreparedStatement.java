/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.SQLite;

import org.telegram.tgnet.NativeByteBuffer;

public class SQLitePreparedStatement {
    private final long sqliteStatementHandle;
    private boolean isFinalized;

    public SQLitePreparedStatement(SQLiteDatabase db, String sql, boolean finalize) throws SQLiteException {
        sqliteStatementHandle = prepare(db.getSQLiteHandle(), sql);
    }

    public SQLiteCursor query(Object[] args) throws SQLiteException {
        checkFinalized();
        reset();
        int i = 1;
        for (Object obj : args) {
            if (obj == null) {
                bindNull(sqliteStatementHandle, i);
            } else if (obj instanceof Integer) {
                bindInt(sqliteStatementHandle, i, (Integer) obj);
            } else if (obj instanceof Double) {
                bindDouble(sqliteStatementHandle, i, (Double) obj);
            } else if (obj instanceof String) {
                bindString(sqliteStatementHandle, i, (String) obj);
            } else if (obj instanceof Long) {
                bindLong(sqliteStatementHandle, i, (Long) obj);
            } else if (obj instanceof NativeByteBuffer) {
                bindByteBuffer(sqliteStatementHandle, i, (NativeByteBuffer) obj);
            }
            i++;
        }
        return new SQLiteCursor(this);
    }

    public void bindInteger(int index, int value) throws SQLiteException {
        bindInt(sqliteStatementHandle, index, value);
    }

    public void bindLong(int index, long value) throws SQLiteException {
        bindLong(sqliteStatementHandle, index, value);
    }

    public void bindString(int index, String value) throws SQLiteException {
        bindString(sqliteStatementHandle, index, value);
    }

    public void bindByteBuffer(int index, NativeByteBuffer buffer) throws SQLiteException {
        bindByteBuffer(sqliteStatementHandle, index, buffer);
    }

    public void bindNull(int index) throws SQLiteException {
        bindNull(sqliteStatementHandle, index);
    }

    public int step() throws SQLiteException {
        return step(sqliteStatementHandle);
    }

    public void reset() throws SQLiteException {
        checkFinalized();
        reset(sqliteStatementHandle);
    }

    public void dispose() {
        if (!isFinalized) {
            try {
                finalize(sqliteStatementHandle);
            } catch (SQLiteException e) {
                // Ignore
            }
            isFinalized = true;
        }
    }

    void checkFinalized() throws SQLiteException {
        if (isFinalized) {
            throw new SQLiteException("Prepared query finalized");
        }
    }

    public long getStatementHandle() {
        return sqliteStatementHandle;
    }

    native long prepare(long sqliteHandle, String sql) throws SQLiteException;
    native void bindInt(long stmtHandle, int index, int value) throws SQLiteException;
    native void bindLong(long stmtHandle, int index, long value) throws SQLiteException;
    native void bindDouble(long stmtHandle, int index, double value) throws SQLiteException;
    native void bindString(long stmtHandle, int index, String value) throws SQLiteException;
    native void bindByteBuffer(long stmtHandle, int index, NativeByteBuffer buffer) throws SQLiteException;
    native void bindNull(long stmtHandle, int index) throws SQLiteException;
    native int step(long stmtHandle) throws SQLiteException;
    native void reset(long stmtHandle) throws SQLiteException;
    native void finalize(long stmtHandle) throws SQLiteException;
}
