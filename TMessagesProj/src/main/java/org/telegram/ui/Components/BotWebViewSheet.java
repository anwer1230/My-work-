/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui.Components;

import android.content.Context;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.BotHelper;

public class BotWebViewSheet extends FrameLayout {
    private final WebView webView;
    private final int currentAccount;

    public BotWebViewSheet(Context context, int account) {
        super(context);
        this.currentAccount = account;
        this.webView = new WebView(context);
        this.webView.getSettings().setJavaScriptEnabled(true);
        this.webView.getSettings().setDomStorageEnabled(true);
        this.webView.setWebViewClient(new WebViewClient());
        addView(webView, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
    }

    public void loadBotApp(long botId, String shortName, String startParam) {
        BotHelper.requestBotApp(currentAccount, botId, shortName, startParam, new BotHelper.BotAppCallback() {
            @Override
            public void onSuccess(String url) {
                AndroidUtilities.runOnUIThread(() -> {
                    if (webView != null) {
                        webView.loadUrl(url);
                    }
                });
            }

            @Override
            public void onError(String error) {
                // Display error
            }
        });
    }
}
