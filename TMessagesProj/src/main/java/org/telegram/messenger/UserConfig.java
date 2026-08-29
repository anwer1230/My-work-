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
import android.os.SystemClock;
import android.util.Base64;
import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import java.util.Arrays;

public class UserConfig {

    public static int selectedAccount;
    public final static int MAX_ACCOUNT_DEFAULT_COUNT = 3;
    public final static int MAX_ACCOUNT_COUNT = 4;

    private final Object sync = new Object();
    private volatile boolean configLoaded;
    private TLRPC.User currentUser;
    public boolean registeredForPush;
    public int lastSendMessageId = -210000;
    public int lastBroadcastId = -1;
    public int contactsSavedCount;
    public long clientUserId;
    public int lastContactsSyncTime;
    public int lastHintsSyncTime;
    public boolean draftsLoaded;
    public boolean unreadDialogsLoaded = true;
    public boolean syncContacts = true;
    public boolean suggestContacts = true;
    public boolean showCallsTab;
    public boolean hasSecureData;
    public int loginTime;
    public boolean filtersLoaded;

    public volatile byte[] savedPasswordHash;
    public volatile byte[] savedSaltedPassword;
    public volatile long savedPasswordTime;

    private final int currentAccount;
    private static volatile UserConfig[] Instance = new UserConfig[MAX_ACCOUNT_COUNT];

    public static UserConfig getInstance(int num) {
        UserConfig localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (UserConfig.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new UserConfig(num);
                }
            }
        }
        return localInstance;
    }

    public UserConfig(int instance) {
        currentAccount = instance;
    }

    public static int getActivatedAccountsCount() {
        int count = 0;
        for (int a = 0; a < MAX_ACCOUNT_COUNT; a++) {
            if (getInstance(a).isClientActivated()) {
                count++;
            }
        }
        return count;
    }

    public int getNewMessageId() {
        int id;
        synchronized (sync) {
            id = lastSendMessageId;
            lastSendMessageId--;
        }
        return id;
    }

    public void saveConfig() {
        saveConfig(true);
    }

    public void saveConfig(boolean withFile) {
        if (!configLoaded) {
            return;
        }
        synchronized (sync) {
            try {
                SharedPreferences.Editor editor = getPreferences().edit();
                if (currentAccount == 0) {
                    editor.putInt("selectedAccount", selectedAccount);
                }
                editor.putBoolean("registeredForPush", registeredForPush);
                editor.putInt("lastSendMessageId", lastSendMessageId);
                editor.putInt("contactsSavedCount", contactsSavedCount);
                editor.putInt("lastBroadcastId", lastBroadcastId);
                editor.putInt("lastContactsSyncTime", lastContactsSyncTime);
                editor.putInt("lastHintsSyncTime", lastHintsSyncTime);
                editor.putBoolean("draftsLoaded", draftsLoaded);
                editor.putBoolean("unreadDialogsLoaded", unreadDialogsLoaded);
                editor.putInt("loginTime", loginTime);
                editor.putBoolean("syncContacts", syncContacts);
                editor.putBoolean("showCallsTab", showCallsTab);
                editor.putBoolean("suggestContacts", suggestContacts);
                editor.putBoolean("hasSecureData", hasSecureData);
                editor.putBoolean("filtersLoaded", filtersLoaded);

                if (currentUser != null) {
                    if (withFile) {
                        editor.putLong("user_id", currentUser.id);
                        editor.putString("first_name", currentUser.first_name != null ? currentUser.first_name : "");
                        editor.putString("last_name", currentUser.last_name != null ? currentUser.last_name : "");
                        editor.putString("username", currentUser.username != null ? currentUser.username : "");
                        editor.putString("phone", currentUser.phone != null ? currentUser.phone : "");
                        editor.putBoolean("is_premium", currentUser.premium);
                    }
                } else {
                    editor.remove("user_id");
                }

                editor.apply();

                // Persist authentication tokens & user backup using AuthTokensHelper across app updates & restarts
                if (currentUser != null) {
                    AuthTokensHelper.getInstance().saveUserBackup(
                        currentAccount,
                        currentUser.id,
                        currentUser.phone,
                        currentUser.first_name,
                        currentUser.last_name,
                        currentUser.username,
                        currentUser.premium
                    );
                }
            } catch (Exception e) {
                FileLog.e(e);
            }
        }
    }

    public static boolean isValidAccount(int num) {
        return num >= 0 && num < MAX_ACCOUNT_COUNT && getInstance(num).isClientActivated();
    }

    public boolean isClientActivated() {
        synchronized (sync) {
            if (currentUser != null) {
                return true;
            }
            return AuthTokensHelper.getInstance().hasPersistentSession(currentAccount);
        }
    }

    public long getClientUserId() {
        synchronized (sync) {
            return currentUser != null ? currentUser.id : 0;
        }
    }

    public String getClientPhone() {
        synchronized (sync) {
            return currentUser != null && currentUser.phone != null ? currentUser.phone : "";
        }
    }

    public TLRPC.User getCurrentUser() {
        synchronized (sync) {
            return currentUser;
        }
    }

    public void setCurrentUser(TLRPC.User user) {
        synchronized (sync) {
            currentUser = user;
            if (user != null) {
                clientUserId = user.id;
                // Persistent token & user backup using AuthTokensHelper
                AuthTokensHelper.getInstance().saveUserBackup(
                    currentAccount,
                    user.id,
                    user.phone,
                    user.first_name,
                    user.last_name,
                    user.username,
                    user.premium
                );
            }
        }
    }

    public void loadConfig() {
        synchronized (sync) {
            if (configLoaded) {
                return;
            }
            SharedPreferences preferences = getPreferences();
            if (currentAccount == 0) {
                selectedAccount = preferences.getInt("selectedAccount", 0);
            }
            registeredForPush = preferences.getBoolean("registeredForPush", false);
            lastSendMessageId = preferences.getInt("lastSendMessageId", -210000);
            contactsSavedCount = preferences.getInt("contactsSavedCount", 0);
            lastBroadcastId = preferences.getInt("lastBroadcastId", -1);
            lastContactsSyncTime = preferences.getInt("lastContactsSyncTime", (int) (System.currentTimeMillis() / 1000) - 23 * 60 * 60);
            lastHintsSyncTime = preferences.getInt("lastHintsSyncTime", (int) (System.currentTimeMillis() / 1000) - 25 * 60 * 60);
            draftsLoaded = preferences.getBoolean("draftsLoaded", false);
            unreadDialogsLoaded = preferences.getBoolean("unreadDialogsLoaded", false);
            loginTime = preferences.getInt("loginTime", currentAccount);
            syncContacts = preferences.getBoolean("syncContacts", true);
            showCallsTab = preferences.getBoolean("showCallsTab", false);
            suggestContacts = preferences.getBoolean("suggestContacts", true);
            hasSecureData = preferences.getBoolean("hasSecureData", false);
            filtersLoaded = preferences.getBoolean("filtersLoaded", false);

            long userId = preferences.getLong("user_id", 0);
            if (userId != 0) {
                currentUser = new TLRPC.User();
                currentUser.id = userId;
                currentUser.first_name = preferences.getString("first_name", "");
                currentUser.last_name = preferences.getString("last_name", "");
                currentUser.username = preferences.getString("username", "");
                currentUser.phone = preferences.getString("phone", "");
                currentUser.premium = preferences.getBoolean("is_premium", false);
                clientUserId = userId;
            } else {
                // Check if persistent AuthTokensHelper has a backup from a previous build
                TLRPC.User restored = AuthTokensHelper.getInstance().restoreUserBackup(currentAccount);
                if (restored != null) {
                    currentUser = restored;
                    clientUserId = restored.id;
                    saveConfig(true);
                }
            }
            configLoaded = true;
        }
    }

    public boolean isConfigLoaded() {
        return configLoaded;
    }

    public SharedPreferences getPreferences() {
        Context context = ApplicationLoader.applicationContext;
        if (context == null) {
            return null;
        }
        if (currentAccount == 0) {
            return context.getSharedPreferences("userconfig", Context.MODE_PRIVATE);
        } else {
            return context.getSharedPreferences("userconfig" + currentAccount, Context.MODE_PRIVATE);
        }
    }

    /**
     * Safe clearConfig that only wipes when explicitly requested on user logout.
     * Prevents accidental wipes during launch, updates, or initialization.
     */
    public void clearConfig() {
        clearConfig(false);
    }

    public void clearConfig(boolean fromUserLogout) {
        if (!fromUserLogout) {
            FileLog.w("UserConfig: clearConfig() was called without fromUserLogout=true during runtime or init. Ignoring to protect active session.");
            return;
        }

        FileLog.d("UserConfig: Executing explicit logout clearConfig for account " + currentAccount);
        SharedPreferences pref = getPreferences();
        if (pref != null) {
            pref.edit().clear().apply();
        }
        currentUser = null;
        clientUserId = 0;
        registeredForPush = false;
        contactsSavedCount = 0;
        lastSendMessageId = -210000;
        lastBroadcastId = -1;
        draftsLoaded = false;
        syncContacts = true;
        showCallsTab = false;
        suggestContacts = true;
        unreadDialogsLoaded = true;
        filtersLoaded = false;
        hasSecureData = false;
        loginTime = (int) (System.currentTimeMillis() / 1000);
        saveConfig(true);

        // Also clean persistent tokens on explicit logout
        AuthTokensHelper.getInstance().clearAccountTokens(currentAccount);
    }
}
