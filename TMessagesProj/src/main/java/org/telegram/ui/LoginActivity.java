/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import org.telegram.messenger.AccountInstance;
import org.telegram.messenger.ConnectionsManager;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;
import org.telegram.messenger.UserConfig;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.ActionBarLayout;
import org.telegram.ui.ActionBar.BaseFragment;

public class LoginActivity extends BaseFragment {

    private EditText phoneField;
    private EditText codeField;
    private String phoneCodeHash;
    private String registeredPhone;

    public LoginActivity() {
        super();
    }

    public LoginActivity(Bundle args) {
        super(args);
    }

    @Override
    public boolean onFragmentCreate() {
        return super.onFragmentCreate();
    }

    @Override
    public View createView(Context context) {
        fragmentView = new View(context);
        return fragmentView;
    }

    // Called on successful TL_auth_signIn / TL_auth_signUp response
    public void onAuthSuccess(TLRPC.User user) {
        final int account = currentAccount;

        // 1) Save User in UserConfig
        UserConfig.getInstance(account).setCurrentUser(user);
        UserConfig.getInstance(account).saveConfig(true);

        // 2) Ensure AccountInstance is ready
        AccountInstance.getInstance(account).getMessagesStorage().openDatabase();

        // 3) Start ConnectionsManager for this account
        ConnectionsManager.getInstance(account).init();

        // 4) Trigger initial dialogs preload
        MessagesController.getInstance(account).loadDialogs(0, 0, 100);

        // 5) Post notifications across the app
        AccountInstance.getInstance(account).getNotificationCenter().postNotificationName(NotificationCenter.mainUserInfoChanged);

        // 6) Present DialogsActivity and close LoginActivity
        if (parentLayout != null) {
            Bundle args = new Bundle();
            args.putInt("account", account);
            DialogsActivity dialogsActivity = new DialogsActivity(args);
            parentLayout.presentFragment(dialogsActivity, true, true);
        } else if (getParentActivity() != null) {
            Intent intent = new Intent(getParentActivity(), LaunchActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
            getParentActivity().startActivity(intent);
            getParentActivity().finish();
        }
    }
}
