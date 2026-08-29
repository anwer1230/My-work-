/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;

public class BotHelper {
    public static void requestBotApp(int currentAccount, long botId, String shortName, String startParam, BotAppCallback callback) {
        TLRPC.TL_messages_requestAppWebView req = new TLRPC.TL_messages_requestAppWebView();
        req.peer = MessagesController.getInstance(currentAccount).getInputPeer(botId);
        TLRPC.TL_inputBotAppShortName app = new TLRPC.TL_inputBotAppShortName();
        app.bot_id = MessagesController.getInstance(currentAccount).getInputUser(botId);
        app.short_name = shortName != null ? shortName : "app";
        req.app = app;
        req.start_param = startParam != null ? startParam : "";
        req.platform = "android";

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            AndroidUtilities.runOnUIThread(() -> {
                if (error == null && response instanceof TLRPC.TL_appWebViewResultUrl) {
                    TLRPC.TL_appWebViewResultUrl res = (TLRPC.TL_appWebViewResultUrl) response;
                    NotificationCenter.getInstance(currentAccount).postNotificationName(
                        NotificationCenter.botAppDidLoad, botId, res.url
                    );
                    if (callback != null) {
                        callback.onSuccess(res.url);
                    }
                } else if (callback != null) {
                    callback.onError(error != null ? error.text : "Unknown error");
                }
            });
        });
    }

    public interface BotAppCallback {
        void onSuccess(String url);
        void onError(String error);
    }
}
