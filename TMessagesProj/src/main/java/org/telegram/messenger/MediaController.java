/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;

public class MediaController {
    public static final int HD_QUALITY_ORIGINAL = 0;
    public static final int HD_QUALITY_1080P = 1;
    public static final int HD_QUALITY_720P = 2;
    public static final int HD_QUALITY_480P = 3;

    private static volatile MediaController Instance;

    public static MediaController getInstance() {
        if (Instance == null) {
            synchronized (MediaController.class) {
                if (Instance == null) {
                    Instance = new MediaController();
                }
            }
        }
        return Instance;
    }

    public boolean canSendHD() {
        return true;
    }

    public int getPreferredVideoQuality() {
        return HD_QUALITY_1080P;
    }
}
