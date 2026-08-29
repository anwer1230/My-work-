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
import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.BaseFragment;
import java.util.ArrayList;

public class PrivacyControlActivity extends BaseFragment {
    public static final int PRIVACY_RULES_TYPE_LASTSEEN = 0;
    public static final int PRIVACY_RULES_TYPE_INVITE = 1;
    public static final int PRIVACY_RULES_TYPE_FORWARDS = 2;
    public static final int PRIVACY_RULES_TYPE_FACTCHECK = 3;

    private int currentRulesType = 0;
    private int currentRule = 0; // 0: Everybody, 1: Contacts, 2: Nobody

    public void setCurrentRulesType(int type) {
        this.currentRulesType = type;
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(android.R.drawable.ic_menu_revert);
        actionBar.setTitle("Privacy Control");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) finishFragment();
            }
        });

        fragmentView = new FrameLayout(context);
        return fragmentView;
    }

    public void applyPrivacyRule(int rule) {
        this.currentRule = rule;
        TLRPC.TL_account_setPrivacy req = new TLRPC.TL_account_setPrivacy();

        if (currentRulesType == PRIVACY_RULES_TYPE_FACTCHECK) {
            req.key = new TLRPC.TL_inputPrivacyKeyFactcheck();
        } else {
            req.key = new TLRPC.TL_inputPrivacyKeyStatusTimestamp();
        }

        req.rules = new ArrayList<>();
        if (rule == 0) {
            req.rules.add(new TLRPC.TL_inputPrivacyValueAllowAll());
        } else if (rule == 1) {
            req.rules.add(new TLRPC.TL_inputPrivacyValueAllowContacts());
        } else if (rule == 2) {
            req.rules.add(new TLRPC.TL_inputPrivacyValueDisallowAll());
        }

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (response instanceof TLRPC.TL_account_privacyRules) {
                NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.privacyRulesUpdated);
            }
        });
    }
}
