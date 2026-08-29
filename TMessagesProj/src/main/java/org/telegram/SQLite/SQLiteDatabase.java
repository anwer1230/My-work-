/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.SQLite;

public class SQLiteDatabase {
    private final long sqliteHandle;
    private boolean isOpen;
    private boolean inTransaction;

    public SQLiteDatabase(String fileName) throws SQLiteException {
        sqliteHandle = opendb(fileName, fileName);
        isOpen = true;
    }

    public long getSQLiteHandle() {
        return sqliteHandle;
    }

    public SQLitePreparedStatement prepareStatement(String sql) throws SQLiteException {
        checkIsOpen();
        return new SQLitePreparedStatement(this, sql, true);
    }

    public SQLiteCursor queryFinalized(String sql, Object... args) throws SQLiteException {
        checkIsOpen();
        return new SQLitePreparedStatement(this, sql, true).query(args);
    }

    public void executeFast(String sql) throws SQLiteException {
        checkIsOpen();
        prepareStatement(sql).step();
    }

    public void beginTransaction() throws SQLiteException {
        if (inTransaction) {
            throw new SQLiteException("database already in transaction");
        }
        inTransaction = true;
        beginTransaction(sqliteHandle);
    }

    public void commitTransaction() {
        if (!inTransaction) {
            return;
        }
        inTransaction = false;
        commitTransaction(sqliteHandle);
    }

    public void close() {
        if (isOpen) {
            try {
                commitTransaction();
                closedb(sqliteHandle);
            } catch (SQLiteException e) {
                // Ignore
            }
            isOpen = false;
        }
    }

    void checkIsOpen() throws SQLiteException {
        if (!isOpen) {
            throw new SQLiteException("database closed");
        }
    }

    native long opendb(String fileName, String tempDir) throws SQLiteException;
    native void closedb(long sqliteHandle) throws SQLiteException;
    native void beginTransaction(long sqliteHandle);
    native void commitTransaction(long sqliteHandle);
}
