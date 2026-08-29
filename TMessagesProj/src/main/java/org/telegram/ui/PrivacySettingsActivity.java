/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui;

import android.content.Context;
import android.view.View;
import android.widget.FrameLayout;
import org.telegram.messenger.NotificationCenter;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.BaseFragment;

public class PrivacySettingsActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {

    private int lastSeenRow;
    private int phoneRow;
    private int forwardsRow;
    private int profilePhotoRow;
    private int callsRow;
    private int passcodeRow;
    private int twoStepRow;
    private int factCheckRow;
    private int rowCount;

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.privacyRulesUpdated);
        return true;
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.privacyRulesUpdated);
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(android.R.drawable.ic_menu_revert);
        actionBar.setTitle("Privacy and Security");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) finishFragment();
            }
        });

        fragmentView = new FrameLayout(context);
        updateRows();
        return fragmentView;
    }

    private void updateRows() {
        rowCount = 0;
        lastSeenRow = rowCount++;
        phoneRow = rowCount++;
        profilePhotoRow = rowCount++;
        forwardsRow = rowCount++;
        callsRow = rowCount++;
        passcodeRow = rowCount++;
        twoStepRow = rowCount++;
        factCheckRow = rowCount++;
    }

    public void onRowClicked(int position) {
        if (position == factCheckRow) {
            PrivacyControlActivity fragment = new PrivacyControlActivity();
            fragment.setCurrentRulesType(PrivacyControlActivity.PRIVACY_RULES_TYPE_FACTCHECK);
            presentFragment(fragment);
        } else if (position == lastSeenRow) {
            PrivacyControlActivity fragment = new PrivacyControlActivity();
            fragment.setCurrentRulesType(PrivacyControlActivity.PRIVACY_RULES_TYPE_LASTSEEN);
            presentFragment(fragment);
        }
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (id == NotificationCenter.privacyRulesUpdated && fragmentView != null) {
            fragmentView.invalidate();
        }
    }
}
