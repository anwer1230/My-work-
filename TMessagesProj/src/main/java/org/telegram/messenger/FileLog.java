/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

public class FileLog {
    public static void e(String tag, Throwable e) {
        System.err.println("[" + tag + "] " + e.getMessage());
    }

    public static void e(Throwable e) {
        if (e != null) {
            e.printStackTrace();
        }
    }

    public static void d(String message) {
        System.out.println("[TelegramDebug] " + message);
    }
}
