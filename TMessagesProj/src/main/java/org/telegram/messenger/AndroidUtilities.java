/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Point;
import android.os.Handler;
import android.os.Looper;
import android.util.DisplayMetrics;
import android.view.View;

public class AndroidUtilities {
    public static float density = 1.0f;
    public static Point displaySize = new Point();
    public static DisplayMetrics displayMetrics = new DisplayMetrics();
    private static volatile Handler applicationHandler;

    static {
        density = Resources.getSystem().getDisplayMetrics().density;
        displayMetrics = Resources.getSystem().getDisplayMetrics();
    }

    public static Handler getApplicationHandler() {
        if (applicationHandler == null) {
            synchronized (AndroidUtilities.class) {
                if (applicationHandler == null) {
                    applicationHandler = new Handler(Looper.getMainLooper());
                }
            }
        }
        return applicationHandler;
    }

    public static void runOnUIThread(Runnable runnable) {
        runOnUIThread(runnable, 0);
    }

    public static void runOnUIThread(Runnable runnable, long delay) {
        if (runnable == null) return;
        if (delay == 0 && Looper.myLooper() == Looper.getMainLooper()) {
            runnable.run();
        } else {
            getApplicationHandler().postDelayed(runnable, delay);
        }
    }

    public static void cancelRunOnUIThread(Runnable runnable) {
        if (runnable == null) return;
        getApplicationHandler().removeCallbacks(runnable);
    }

    public static int dp(float value) {
        if (value == 0) {
            return 0;
        }
        return (int) Math.ceil(density * value);
    }

    public static float dpf2(float value) {
        if (value == 0) {
            return 0;
        }
        return density * value;
    }

    public static int dp2(float value) {
        if (value == 0) {
            return 0;
        }
        return (int) Math.floor(density * value);
    }
}
