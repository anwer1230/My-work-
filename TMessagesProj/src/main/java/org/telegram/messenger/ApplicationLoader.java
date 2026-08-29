/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import android.app.Application;
import android.content.Context;
import java.io.File;

public class ApplicationLoader extends Application {
    public static volatile Context applicationContext;
    public static volatile boolean isScreenOn = true;
    public static volatile boolean mainInterfacePaused = true;
    public static volatile boolean mainInterfacePausedStageQueue = true;
    private static File filesDirFixed;

    @Override
    public void onCreate() {
        super.onCreate();
        applicationContext = getApplicationContext();
        postInitApplication();
    }

    public static File getFilesDirFixed() {
        if (filesDirFixed == null) {
            if (applicationContext != null) {
                filesDirFixed = applicationContext.getFilesDir();
            } else {
                filesDirFixed = new File("/data/data/org.telegram.messenger.anwer/files");
            }
            if (!filesDirFixed.exists()) {
                filesDirFixed.mkdirs();
            }
        }
        return filesDirFixed;
    }

    public static void postInitApplication() {
        for (int a = 0; a < UserConfig.MAX_ACCOUNT_COUNT; a++) {
            UserConfig.getInstance(a).loadConfig();
            MessagesController.getInstance(a);
            MessagesStorage.getInstance(a);
        }

        // Start background NotificationService for FCM / Push message delivery
        try {
            if (applicationContext != null) {
                android.content.Intent intent = new android.content.Intent(applicationContext, NotificationService.class);
                applicationContext.startService(intent);
            }
        } catch (Throwable e) {
            FileLog.e(e);
        }
    }
}
