/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.TLRPC;
import java.util.ArrayList;

public class FileLoader {
    private final int currentAccount;
    private static volatile FileLoader[] Instance = new FileLoader[UserConfig.MAX_ACCOUNT_COUNT];

    public static FileLoader getInstance(int num) {
        FileLoader localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (FileLoader.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new FileLoader(num);
                }
            }
        }
        return localInstance;
    }

    public FileLoader(int account) {
        this.currentAccount = account;
    }

    public void loadFile(ImageLocation location, Object parentObject, String ext, int priority, int cacheType) {
        FileLog.d("FileLoader: Scheduled file download for image location");
    }

    public void loadFile(TLRPC.Document document, Object parentObject, int priority, int cacheType) {
        FileLog.d("FileLoader: Scheduled document download: " + (document != null ? document.id : 0));
    }

    public static TLRPC.PhotoSize getClosestPhotoSizeWithSize(ArrayList<TLRPC.PhotoSize> sizes, int expected) {
        if (sizes == null || sizes.isEmpty()) return null;
        TLRPC.PhotoSize closest = sizes.get(0);
        for (TLRPC.PhotoSize size : sizes) {
            if (size.w >= expected) {
                return size;
            }
        }
        return closest;
    }
}
