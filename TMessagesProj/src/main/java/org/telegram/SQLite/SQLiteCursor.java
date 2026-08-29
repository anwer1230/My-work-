/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.SQLite;

import org.telegram.tgnet.NativeByteBuffer;

public class SQLiteCursor {
    public static final int SQLITE_ROW = 100;
    public static final int SQLITE_DONE = 101;
    public static final int SQLITE_ERROR = 1;

    private final SQLitePreparedStatement preparedStatement;
    private boolean inRow;

    public SQLiteCursor(SQLitePreparedStatement stmt) {
        preparedStatement = stmt;
    }

    public boolean next() throws SQLiteException {
        int statusCode = preparedStatement.step();
        if (statusCode == -1) {
            int repeatCount = 6;
            while (repeatCount-- != 0) {
                try {
                    Thread.sleep(500);
                } catch (Exception e) {
                    // Ignore
                }
                statusCode = preparedStatement.step();
                if (statusCode == 0) {
                    break;
                }
            }
            if (statusCode == -1) {
                throw new SQLiteException("sqlite busy");
            }
        }
        inRow = (statusCode == SQLITE_ROW);
        return inRow;
    }

    public long longValue(int column) throws SQLiteException {
        checkInRow();
        return columnLongValue(preparedStatement.getStatementHandle(), column);
    }

    public int intValue(int column) throws SQLiteException {
        checkInRow();
        return columnIntValue(preparedStatement.getStatementHandle(), column);
    }

    public double doubleValue(int column) throws SQLiteException {
        checkInRow();
        return columnDoubleValue(preparedStatement.getStatementHandle(), column);
    }

    public String stringValue(int column) throws SQLiteException {
        checkInRow();
        return columnStringValue(preparedStatement.getStatementHandle(), column);
    }

    public byte[] byteArrayValue(int column) throws SQLiteException {
        checkInRow();
        return columnByteArrayValue(preparedStatement.getStatementHandle(), column);
    }

    public NativeByteBuffer byteBufferValue(int column) throws SQLiteException {
        checkInRow();
        long ptr = columnByteBufferValue(preparedStatement.getStatementHandle(), column);
        if (ptr != 0) {
            return NativeByteBuffer.wrap(ptr);
        }
        return null;
    }

    public boolean isNull(int column) throws SQLiteException {
        checkInRow();
        return columnIsNull(preparedStatement.getStatementHandle(), column) == 1;
    }

    public void dispose() {
        preparedStatement.dispose();
    }

    void checkInRow() throws SQLiteException {
        if (!inRow) {
            throw new SQLiteException("You must call next before");
        }
    }

    native int columnIntValue(long stmtHandle, int columnIndex);
    native long columnLongValue(long stmtHandle, int columnIndex);
    native double columnDoubleValue(long stmtHandle, int columnIndex);
    native String columnStringValue(long stmtHandle, int columnIndex);
    native byte[] columnByteArrayValue(long stmtHandle, int columnIndex);
    native long columnByteBufferValue(long stmtHandle, int columnIndex);
    native int columnIsNull(long stmtHandle, int columnIndex);
}
