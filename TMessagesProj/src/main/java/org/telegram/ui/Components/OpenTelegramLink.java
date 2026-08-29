/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui.Components;

import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;
import org.telegram.messenger.FileLog;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.ChatActivity;
import org.telegram.ui.ChatInviteActivity;
import org.telegram.ui.LaunchActivity;

public class OpenTelegramLink {

    public static boolean openUrl(String url, BaseFragment parentFragment, int currentAccount) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        try {
            Uri uri = Uri.parse(url.trim());
            return openUri(uri, parentFragment, currentAccount);
        } catch (Throwable e) {
            FileLog.e(e);
            return false;
        }
    }

    public static boolean openUri(Uri uri, BaseFragment parentFragment, int currentAccount) {
        if (uri == null) {
            return false;
        }

        String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "";
        String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";
        String path = uri.getPath() != null ? uri.getPath() : "";

        // 1. Handle tg:// custom scheme
        if ("tg".equals(scheme)) {
            String action = uri.getHost() != null ? uri.getHost().toLowerCase() : "";
            if ("join".equals(action)) {
                String invite = uri.getQueryParameter("invite");
                if (invite != null && !invite.isEmpty()) {
                    openChatInvite(invite, parentFragment, currentAccount);
                    return true;
                }
            } else if ("resolve".equals(action)) {
                String domain = uri.getQueryParameter("domain");
                if (domain != null && !domain.isEmpty()) {
                    resolveAndOpenUsername(domain, parentFragment, currentAccount);
                    return true;
                }
            }
            return false;
        }

        // 2. Handle HTTP/HTTPS deep links (t.me, telegram.me, telegram.dog)
        if ("http".equals(scheme) || "https".equals(scheme)) {
            if ("t.me".equals(host) || "telegram.me".equals(host) || "telegram.dog".equals(host)) {
                if (path.startsWith("/+")) {
                    String hash = path.substring(2);
                    openChatInvite(hash, parentFragment, currentAccount);
                    return true;
                } else if (path.startsWith("/joinchat/")) {
                    String hash = path.substring("/joinchat/".length());
                    openChatInvite(hash, parentFragment, currentAccount);
                    return true;
                } else if (path.length() > 1) {
                    String username = path.substring(1);
                    // Filter out non-username paths
                    if (username.contains("/")) {
                        String[] parts = username.split("/");
                        username = parts[0];
                    }
                    if (!username.isEmpty()) {
                        resolveAndOpenUsername(username, parentFragment, currentAccount);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public static void openChatInvite(String hash, BaseFragment parentFragment, int currentAccount) {
        if (hash == null || hash.isEmpty()) return;

        ChatInviteActivity inviteActivity = new ChatInviteActivity(hash);
        if (parentFragment != null) {
            parentFragment.presentFragment(inviteActivity);
        } else if (LaunchActivity.instance != null) {
            LaunchActivity.instance.presentFragment(inviteActivity);
        }
    }

    public static void resolveAndOpenUsername(String username, BaseFragment parentFragment, int currentAccount) {
        if (username == null || username.isEmpty()) return;

        MessagesController.getInstance(currentAccount).resolveUsername(username, (response, error) -> {
            if (error != null) {
                if (parentFragment != null && parentFragment.getParentActivity() != null) {
                    parentFragment.getParentActivity().runOnUiThread(() -> {
                        Toast.makeText(parentFragment.getParentActivity(), "Username @" + username + " not found", Toast.LENGTH_SHORT).show();
                    });
                }
                return;
            }

            if (response instanceof TLRPC.TL_contacts_resolvedPeer) {
                TLRPC.TL_contacts_resolvedPeer resolvedPeer = (TLRPC.TL_contacts_resolvedPeer) response;
                long peerId = 0;

                if (resolvedPeer.peer instanceof TLRPC.TL_peerUser) {
                    peerId = ((TLRPC.TL_peerUser) resolvedPeer.peer).user_id;
                } else if (resolvedPeer.peer instanceof TLRPC.TL_peerChat) {
                    peerId = -((TLRPC.TL_peerChat) resolvedPeer.peer).chat_id;
                } else if (resolvedPeer.peer instanceof TLRPC.TL_peerChannel) {
                    peerId = -((TLRPC.TL_peerChannel) resolvedPeer.peer).channel_id;
                }

                if (peerId != 0) {
                    long finalPeerId = peerId;
                    if (LaunchActivity.instance != null) {
                        LaunchActivity.instance.runOnUiThread(() -> {
                            Bundle args = new Bundle();
                            if (finalPeerId < 0) {
                                args.putLong("chat_id", -finalPeerId);
                            } else {
                                args.putLong("user_id", finalPeerId);
                            }
                            ChatActivity chatActivity = new ChatActivity(args);
                            if (parentFragment != null) {
                                parentFragment.presentFragment(chatActivity);
                            } else {
                                LaunchActivity.instance.presentFragment(chatActivity);
                            }
                        });
                    }
                }
            }
        });
    }
}
