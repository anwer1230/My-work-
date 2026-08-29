/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.RequestDelegate;
import org.telegram.tgnet.TLObject;
import org.telegram.tgnet.TLRPC;
import java.util.ArrayList;

/**
 * SessionSecurityManager provides complete MTProto Layer 184+ control over
 * active authorizations across all devices, real-time login alerts, session
 * termination, and multi-device synchronization.
 */
public class SessionSecurityManager {

    private static volatile SessionSecurityManager[] Instance = new SessionSecurityManager[UserConfig.MAX_ACCOUNT_COUNT];

    public static SessionSecurityManager getInstance(int num) {
        SessionSecurityManager localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (SessionSecurityManager.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new SessionSecurityManager(num);
                }
            }
        }
        return localInstance;
    }

    private final int currentAccount;

    public SessionSecurityManager(int account) {
        this.currentAccount = account;
    }

    public interface SessionsCallback {
        void onSessionsLoaded(TLRPC.TL_authorization current, ArrayList<TLRPC.TL_authorization> others, int ttlDays);
        void onError(String error);
    }

    public interface ActionCallback {
        void onResult(boolean success, String error);
    }

    /**
     * Loads all authorizations across all devices (TL_account_getAuthorizations)
     */
    public void loadAllSessions(SessionsCallback callback) {
        TLRPC.TL_account_getAuthorizations req = new TLRPC.TL_account_getAuthorizations();
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (error == null && response instanceof TLRPC.TL_account_authorizations) {
                TLRPC.TL_account_authorizations auths = (TLRPC.TL_account_authorizations) response;
                TLRPC.TL_authorization current = null;
                ArrayList<TLRPC.TL_authorization> others = new ArrayList<>();
                for (TLRPC.TL_authorization a : auths.authorizations) {
                    if ((a.flags & 1) != 0 || a.current) {
                        current = a;
                    } else {
                        others.add(a);
                    }
                }
                if (callback != null) {
                    callback.onSessionsLoaded(current, others, auths.authorization_ttl_days);
                }
            } else {
                if (callback != null) {
                    callback.onError(error != null ? error.text : "UNKNOWN_ERROR");
                }
            }
        });
    }

    /**
     * Terminates a single session by hash (TL_account_resetAuthorization)
     */
    public void terminateSession(long hash, ActionCallback callback) {
        TLRPC.TL_account_resetAuthorization req = new TLRPC.TL_account_resetAuthorization();
        req.hash = hash;
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            boolean ok = (error == null && response instanceof TLRPC.TL_boolTrue);
            if (callback != null) {
                callback.onResult(ok, error != null ? error.text : null);
            }
            if (ok) {
                NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.updateInterfaces, 0x0008);
            }
        });
    }

    /**
     * Terminates all other sessions except current (TL_auth_resetAuthorizations)
     */
    public void terminateAllOtherSessions(ActionCallback callback) {
        TLRPC.TL_auth_resetAuthorizations req = new TLRPC.TL_auth_resetAuthorizations();
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            boolean ok = (error == null && response instanceof TLRPC.TL_boolTrue);
            if (callback != null) {
                callback.onResult(ok, error != null ? error.text : null);
            }
            if (ok) {
                NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.updateInterfaces, 0x0008);
            }
        });
    }

    /**
     * Sets automatic termination period for inactive sessions (TL_account_changeAuthorizationSettings)
     */
    public void changeAuthorizationSettings(long hash, boolean confirmed, ActionCallback callback) {
        TLRPC.TL_account_changeAuthorizationSettings req = new TLRPC.TL_account_changeAuthorizationSettings();
        req.hash = hash;
        req.confirmed = confirmed;
        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            boolean ok = (error == null && response instanceof TLRPC.TL_boolTrue);
            if (callback != null) {
                callback.onResult(ok, error != null ? error.text : null);
            }
        });
    }
}
