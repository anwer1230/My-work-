/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import org.telegram.messenger.AccountInstance;
import org.telegram.messenger.ApplicationLoader;
import org.telegram.messenger.AuthTokensHelper;
import org.telegram.messenger.FileLog;
import org.telegram.messenger.UserConfig;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.ActionBarLayout;
import org.telegram.ui.ActionBar.BaseFragment;

public class LaunchActivity extends Activity {

    public static LaunchActivity instance;
    private int currentAccount;
    private ActionBarLayout actionBarLayout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;

        // Initialize application core & UserConfig safely without calling clearConfig()
        ApplicationLoader.postInitApplication();
        currentAccount = UserConfig.selectedAccount;

        // Ensure current account config is loaded and verified against persistent AuthTokensHelper
        UserConfig userConfig = UserConfig.getInstance(currentAccount);
        if (!userConfig.isConfigLoaded()) {
            userConfig.loadConfig();
        }

        // Safety check: Prevent any cleanup or clearConfig() calls from executing if valid session
        // tokens are detected via AuthTokensHelper, ensuring continuous and uninterrupted sessions.
        boolean hasStoredTokens = AuthTokensHelper.getInstance().hasPersistentSession(currentAccount);
        if (hasStoredTokens) {
            FileLog.d("LaunchActivity: Valid persistent session tokens detected via AuthTokensHelper. Protecting configuration & state.");
            if (userConfig.getCurrentUser() == null) {
                TLRPC.User backupUser = AuthTokensHelper.getInstance().restoreUserBackup(currentAccount);
                if (backupUser != null) {
                    userConfig.setCurrentUser(backupUser);
                    userConfig.saveConfig(true);
                }
            }
        }

        // Create main fragment layout container
        actionBarLayout = new ActionBarLayout(this);
        setContentView(actionBarLayout);

        // State Restoration Fix:
        // Clear any previous stack to prevent unwanted jumping to Saved Messages or other chats.
        actionBarLayout.removeAllFragments();

        // Check if there is an activated account or persistent session
        if (UserConfig.getActivatedAccountsCount() > 0 || userConfig.isClientActivated() || hasStoredTokens) {
            Bundle args = new Bundle();
            args.putInt("account", currentAccount);
            DialogsActivity dialogsActivity = new DialogsActivity(args);
            actionBarLayout.addFragmentToStack(dialogsActivity);
            FileLog.d("LaunchActivity: Active session found. Presenting DialogsActivity.");
        } else {
            Bundle args = new Bundle();
            args.putInt("account", currentAccount);
            LoginActivity loginActivity = new LoginActivity(args);
            actionBarLayout.addFragmentToStack(loginActivity);
            FileLog.d("LaunchActivity: No active session found. Presenting LoginActivity.");
        }

        handleIntent(getIntent(), false, false, false);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent, true, false, false);
    }

    public boolean presentFragment(BaseFragment fragment) {
        return actionBarLayout != null && actionBarLayout.presentFragment(fragment);
    }

    public boolean presentFragment(BaseFragment fragment, boolean removeLast, boolean forceWithoutAnimation) {
        return actionBarLayout != null && actionBarLayout.presentFragment(fragment, removeLast, forceWithoutAnimation);
    }

    private boolean handleIntent(Intent intent, boolean isNew, boolean restore, boolean fromPassword) {
        if (intent == null || intent.getAction() == null) {
            return false;
        }

        if (Intent.ACTION_VIEW.equals(intent.getAction())) {
            android.net.Uri data = intent.getData();
            if (data != null) {
                FileLog.d("LaunchActivity: Intercepted deep link -> " + data.toString());
                return org.telegram.ui.Components.OpenTelegramLink.openUri(data, null, currentAccount);
            }
        }
        return false;
    }

    @Override
    protected void onResume() {
        super.onResume();
        ApplicationLoader.mainInterfacePaused = false;
    }

    @Override
    protected void onPause() {
        super.onPause();
        ApplicationLoader.mainInterfacePaused = true;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (instance == this) {
            instance = null;
        }
    }
}
