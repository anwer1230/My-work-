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
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.FileLog;
import org.telegram.messenger.NotificationCenter;
import org.telegram.messenger.SessionSecurityManager;
import org.telegram.messenger.UserConfig;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.BaseFragment;
import java.util.ArrayList;

/**
 * SessionsActivity displays the active devices, desktop clients, browsers,
 * and allows terminating individual sessions or terminating all other sessions.
 */
public class SessionsActivity extends BaseFragment implements NotificationCenter.NotificationCenterDelegate {

    private TLRPC.TL_authorization currentSession;
    private ArrayList<TLRPC.TL_authorization> otherSessions = new ArrayList<>();
    private int ttlDays = 180;
    private boolean loading;

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        NotificationCenter.getInstance(currentAccount).addObserver(this, NotificationCenter.updateInterfaces);
        loadSessions();
        return true;
    }

    @Override
    public void onFragmentDestroy() {
        super.onFragmentDestroy();
        NotificationCenter.getInstance(currentAccount).removeObserver(this, NotificationCenter.updateInterfaces);
    }

    public void loadSessions() {
        loading = true;
        SessionSecurityManager.getInstance(currentAccount).loadAllSessions(new SessionSecurityManager.SessionsCallback() {
            @Override
            public void onSessionsLoaded(TLRPC.TL_authorization current, ArrayList<TLRPC.TL_authorization> others, int ttl) {
                loading = false;
                currentSession = current;
                otherSessions.clear();
                if (others != null) {
                    otherSessions.addAll(others);
                }
                ttlDays = ttl;
                AndroidUtilities.runOnUIThread(() -> updateUI());
            }

            @Override
            public void onError(String error) {
                loading = false;
                FileLog.e("Failed to load sessions: " + error);
                AndroidUtilities.runOnUIThread(() -> updateUI());
            }
        });
    }

    public void terminateSession(TLRPC.TL_authorization authorization) {
        if (authorization == null) return;
        SessionSecurityManager.getInstance(currentAccount).terminateSession(authorization.hash, (success, error) -> {
            if (success) {
                otherSessions.remove(authorization);
                AndroidUtilities.runOnUIThread(() -> updateUI());
            } else {
                FileLog.e("Terminate session failed: " + error);
            }
        });
    }

    public void terminateAllOtherSessions() {
        SessionSecurityManager.getInstance(currentAccount).terminateAllOtherSessions((success, error) -> {
            if (success) {
                otherSessions.clear();
                AndroidUtilities.runOnUIThread(() -> updateUI());
            } else {
                FileLog.e("Terminate all sessions failed: " + error);
            }
        });
    }

    private void updateUI() {
        // UI render delegate
    }

    @Override
    public void didReceivedNotification(int id, int account, Object... args) {
        if (id == NotificationCenter.updateInterfaces) {
            loadSessions();
        }
    }
}
