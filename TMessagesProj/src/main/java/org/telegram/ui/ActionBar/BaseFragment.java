/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui.ActionBar;

import android.os.Bundle;
import android.view.View;
import org.telegram.messenger.AccountInstance;
import org.telegram.messenger.UserConfig;

public abstract class BaseFragment {
    protected int currentAccount = UserConfig.selectedAccount;
    protected View fragmentView;
    protected ActionBarLayout parentLayout;
    protected Bundle arguments;
    protected boolean isFinished;

    public BaseFragment() {
    }

    public BaseFragment(Bundle args) {
        arguments = args;
        if (arguments != null) {
            currentAccount = arguments.getInt("account", UserConfig.selectedAccount);
        }
    }

    public boolean onFragmentCreate() {
        return true;
    }

    public void onFragmentDestroy() {
        isFinished = true;
    }

    public void onResume() {
    }

    public void onPause() {
    }

    public View createView(android.content.Context context) {
        return null;
    }

    public View getFragmentView() {
        return fragmentView;
    }

    public void setParentLayout(ActionBarLayout layout) {
        parentLayout = layout;
    }

    public ActionBarLayout getParentLayout() {
        return parentLayout;
    }

    public int getCurrentAccount() {
        return currentAccount;
    }

    public AccountInstance getAccountInstance() {
        return AccountInstance.getInstance(currentAccount);
    }

    public boolean presentFragment(BaseFragment fragment) {
        return parentLayout != null && parentLayout.presentFragment(fragment);
    }

    public boolean presentFragment(BaseFragment fragment, boolean removeLast) {
        return parentLayout != null && parentLayout.presentFragment(fragment, removeLast);
    }

    public void finishFragment() {
        if (parentLayout != null) {
            parentLayout.closeLastFragment(true);
        }
    }
}
