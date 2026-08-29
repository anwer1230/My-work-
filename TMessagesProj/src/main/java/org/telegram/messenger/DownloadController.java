/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.TLRPC;

public class DownloadController {
    public static final int AUTODOWNLOAD_MASK_PHOTO = 1;
    public static final int AUTODOWNLOAD_MASK_AUDIO = 2;
    public static final int AUTODOWNLOAD_MASK_VIDEO = 4;
    public static final int AUTODOWNLOAD_MASK_DOCUMENT = 8;

    private static volatile DownloadController[] Instance = new DownloadController[UserConfig.MAX_ACCOUNT_COUNT];

    public static DownloadController getInstance(int num) {
        DownloadController localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (DownloadController.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new DownloadController(num);
                }
            }
        }
        return localInstance;
    }

    public DownloadController(int account) {}

    public static boolean canDownloadMedia(int type, int networkType) {
        int currentMask = AUTODOWNLOAD_MASK_PHOTO | AUTODOWNLOAD_MASK_AUDIO | AUTODOWNLOAD_MASK_DOCUMENT;
        return (currentMask & type) != 0;
    }

    public static void checkAndDownloadMedia(TLRPC.Message message) {
        if (message == null || message.media == null) return;
        if (message.media instanceof TLRPC.TL_messageMediaPhoto) {
            FileLoader.getInstance(UserConfig.selectedAccount).loadFile(
                ImageLocation.getForPhoto(FileLoader.getClosestPhotoSizeWithSize(message.media.photo.sizes, 1280), message.media.photo),
                message, "jpg", 1, 1
            );
        } else if (message.media instanceof TLRPC.TL_messageMediaDocument) {
            FileLoader.getInstance(UserConfig.selectedAccount).loadFile(
                message.media.document, message, 0, 1
            );
        }
    }
}
