/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Base64;
import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import java.util.HashMap;
import java.util.Map;

/**
 * AuthTokensHelper manages long-lived authentication tokens, session secrets,
 * and future auth tokens (TL_auth_exportLoginToken) to ensure sessions persist
 * permanently across application updates, code changes, and background syncs.
 */
public class AuthTokensHelper {

    private static final String PREF_NAME = "tg_auth_tokens_store";
    private static final String KEY_PREFIX_TOKEN = "future_token_acc_";
    private static final String KEY_PREFIX_SESSION_KEY = "session_auth_key_";
    private static final String KEY_PREFIX_EXPIRES = "token_expires_";
    private static final String KEY_PREFIX_USER_ID = "backup_user_id_";
    private static final String KEY_PREFIX_PHONE = "backup_phone_";
    private static final String KEY_PREFIX_FIRST_NAME = "backup_first_name_";
    private static final String KEY_PREFIX_LAST_NAME = "backup_last_name_";
    private static final String KEY_PREFIX_USERNAME = "backup_username_";
    private static final String KEY_PREFIX_IS_PREMIUM = "backup_is_premium_";

    private static volatile AuthTokensHelper Instance;

    public static AuthTokensHelper getInstance() {
        AuthTokensHelper localInstance = Instance;
        if (localInstance == null) {
            synchronized (AuthTokensHelper.class) {
                localInstance = Instance;
                if (localInstance == null) {
                    Instance = localInstance = new AuthTokensHelper();
                }
            }
        }
        return localInstance;
    }

    private SharedPreferences getPreferences() {
        Context context = ApplicationLoader.applicationContext;
        if (context == null) return null;
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    /**
     * Stores a future authentication token for persistent login
     */
    public void saveFutureAuthToken(int account, byte[] tokenBytes, int expireTimestamp) {
        SharedPreferences pref = getPreferences();
        if (pref == null || tokenBytes == null) return;
        String encoded = Base64.encodeToString(tokenBytes, Base64.DEFAULT);
        pref.edit()
            .putString(KEY_PREFIX_TOKEN + account, encoded)
            .putInt(KEY_PREFIX_EXPIRES + account, expireTimestamp)
            .apply();
        FileLog.d("AuthTokensHelper: Saved persistent future auth token for account " + account);
    }

    /**
     * Retrieves the stored future authentication token
     */
    public byte[] getFutureAuthToken(int account) {
        SharedPreferences pref = getPreferences();
        if (pref == null) return null;
        String encoded = pref.getString(KEY_PREFIX_TOKEN + account, null);
        if (encoded == null) return null;
        try {
            return Base64.decode(encoded, Base64.DEFAULT);
        } catch (Exception e) {
            FileLog.e(e);
            return null;
        }
    }

    /**
     * Stores raw session auth key representation that survives app updates
     */
    public void saveSessionKey(int account, String sessionString) {
        SharedPreferences pref = getPreferences();
        if (pref == null || sessionString == null) return;
        pref.edit().putString(KEY_PREFIX_SESSION_KEY + account, sessionString).apply();
        FileLog.d("AuthTokensHelper: Saved persistent session key for account " + account);
    }

    public String getSessionKey(int account) {
        SharedPreferences pref = getPreferences();
        if (pref == null) return null;
        return pref.getString(KEY_PREFIX_SESSION_KEY + account, null);
    }

    /**
     * Stores a resilient backup of the user profile credentials
     * to protect against loss during system migrations or APK updates.
     */
    public void saveUserBackup(int account, long userId, String phone, String firstName, String lastName, String username, boolean isPremium) {
        SharedPreferences pref = getPreferences();
        if (pref == null) return;
        pref.edit()
            .putLong(KEY_PREFIX_USER_ID + account, userId)
            .putString(KEY_PREFIX_PHONE + account, phone != null ? phone : "")
            .putString(KEY_PREFIX_FIRST_NAME + account, firstName != null ? firstName : "")
            .putString(KEY_PREFIX_LAST_NAME + account, lastName != null ? lastName : "")
            .putString(KEY_PREFIX_USERNAME + account, username != null ? username : "")
            .putBoolean(KEY_PREFIX_IS_PREMIUM + account, isPremium)
            .apply();
        FileLog.d("AuthTokensHelper: Persisted backup user credentials for account " + account);
    }

    /**
     * Restores user object in UserConfig if the primary preferences were wiped or lost during an update.
     */
    public TLRPC.User restoreUserBackup(int account) {
        SharedPreferences pref = getPreferences();
        if (pref == null) return null;
        long userId = pref.getLong(KEY_PREFIX_USER_ID + account, 0);
        if (userId == 0) return null;

        TLRPC.User user = new TLRPC.User();
        user.id = userId;
        user.phone = pref.getString(KEY_PREFIX_PHONE + account, "");
        user.first_name = pref.getString(KEY_PREFIX_FIRST_NAME + account, "");
        user.last_name = pref.getString(KEY_PREFIX_LAST_NAME + account, "");
        user.username = pref.getString(KEY_PREFIX_USERNAME + account, "");
        user.premium = pref.getBoolean(KEY_PREFIX_IS_PREMIUM + account, false);
        FileLog.d("AuthTokensHelper: Restored user credentials from persistent store for account " + account);
        return user;
    }

    /**
     * Checks if a valid persistent session exists for an account
     */
    public boolean hasPersistentSession(int account) {
        SharedPreferences pref = getPreferences();
        if (pref == null) return false;
        long backupId = pref.getLong(KEY_PREFIX_USER_ID + account, 0);
        return backupId != 0 || getFutureAuthToken(account) != null || getSessionKey(account) != null;
    }

    /**
     * Clean only on explicit user-requested logout.
     * Prevents accidental wipes during launch or initialization.
     */
    public void clearAccountTokens(int account) {
        SharedPreferences pref = getPreferences();
        if (pref == null) return;
        pref.edit()
            .remove(KEY_PREFIX_TOKEN + account)
            .remove(KEY_PREFIX_EXPIRES + account)
            .remove(KEY_PREFIX_SESSION_KEY + account)
            .remove(KEY_PREFIX_USER_ID + account)
            .remove(KEY_PREFIX_PHONE + account)
            .remove(KEY_PREFIX_FIRST_NAME + account)
            .remove(KEY_PREFIX_LAST_NAME + account)
            .remove(KEY_PREFIX_USERNAME + account)
            .remove(KEY_PREFIX_IS_PREMIUM + account)
            .apply();
        FileLog.d("AuthTokensHelper: Cleared tokens for account " + account + " on explicit logout");
    }
}
