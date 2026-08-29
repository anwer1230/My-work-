/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui;

import android.content.Context;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import org.telegram.messenger.FileLog;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;
import org.telegram.tgnet.TLObject;
import org.telegram.tgnet.TLRPC;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.BaseFragment;

public class ChatInviteActivity extends BaseFragment {

    private String inviteHash;
    private TLRPC.ChatInvite currentInvite;
    private boolean isAlreadyParticipant = false;
    private long alreadyChatId = 0;

    private ProgressBar progressBar;
    private LinearLayout contentLayout;
    private TextView titleTextView;
    private TextView countTextView;
    private TextView descriptionTextView;
    private Button joinButton;

    public ChatInviteActivity(String hash) {
        super();
        this.inviteHash = hash;
    }

    public ChatInviteActivity(Bundle args) {
        super(args);
        if (args != null) {
            this.inviteHash = args.getString("hash");
        }
    }

    @Override
    public boolean onFragmentCreate() {
        super.onFragmentCreate();
        checkInvite();
        return true;
    }

    @Override
    public View createView(Context context) {
        actionBar.setBackButtonImage(android.R.drawable.ic_menu_revert);
        actionBar.setTitle("Invitation");
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) {
                    finishFragment();
                }
            }
        });

        FrameLayout root = new FrameLayout(context);
        fragmentView = root;

        progressBar = new ProgressBar(context);
        FrameLayout.LayoutParams pbParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT,
            Gravity.CENTER
        );
        root.addView(progressBar, pbParams);

        contentLayout = new LinearLayout(context);
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.setGravity(Gravity.CENTER_HORIZONTAL);
        contentLayout.setVisibility(View.GONE);
        FrameLayout.LayoutParams contentParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT,
            Gravity.CENTER
        );
        contentParams.leftMargin = 32;
        contentParams.rightMargin = 32;
        root.addView(contentLayout, contentParams);

        titleTextView = new TextView(context);
        titleTextView.setTextSize(20);
        titleTextView.setTextColor(0xFF222222);
        titleTextView.setGravity(Gravity.CENTER);
        contentLayout.addView(titleTextView);

        countTextView = new TextView(context);
        countTextView.setTextSize(14);
        countTextView.setTextColor(0xFF888888);
        countTextView.setGravity(Gravity.CENTER);
        contentLayout.addView(countTextView);

        descriptionTextView = new TextView(context);
        descriptionTextView.setTextSize(14);
        descriptionTextView.setTextColor(0xFF555555);
        descriptionTextView.setGravity(Gravity.CENTER);
        contentLayout.addView(descriptionTextView);

        joinButton = new Button(context);
        joinButton.setText("Join Group / Channel");
        joinButton.setOnClickListener(v -> joinChat());
        contentLayout.addView(joinButton);

        return fragmentView;
    }

    private void checkInvite() {
        if (inviteHash == null || inviteHash.isEmpty()) {
            return;
        }

        MessagesController.getInstance(currentAccount).checkChatInvite(inviteHash, (response, error) -> {
            if (error != null) {
                handleCheckError(error);
                return;
            }

            if (response instanceof TLRPC.TL_chatInviteAlready) {
                TLRPC.TL_chatInviteAlready inviteAlready = (TLRPC.TL_chatInviteAlready) response;
                isAlreadyParticipant = true;
                if (inviteAlready.chat != null) {
                    alreadyChatId = inviteAlready.chat.id;
                }
                updateUIForInviteAlready(inviteAlready);
            } else if (response instanceof TLRPC.TL_chatInvite) {
                currentInvite = (TLRPC.TL_chatInvite) response;
                isAlreadyParticipant = false;
                updateUIForInvite(currentInvite);
            }
        });
    }

    private void updateUIForInvite(TLRPC.TL_chatInvite invite) {
        if (fragmentView == null) return;
        fragmentView.post(() -> {
            if (progressBar != null) progressBar.setVisibility(View.GONE);
            if (contentLayout != null) contentLayout.setVisibility(View.VISIBLE);

            if (titleTextView != null) {
                titleTextView.setText(invite.title != null ? invite.title : "Telegram Group");
            }
            if (countTextView != null) {
                countTextView.setText(invite.participants_count + " members");
            }
            if (descriptionTextView != null && invite.about != null) {
                descriptionTextView.setText(invite.about);
            }
            if (joinButton != null) {
                joinButton.setText(invite.channel ? "Join Channel" : "Join Group");
            }
        });
    }

    private void updateUIForInviteAlready(TLRPC.TL_chatInviteAlready inviteAlready) {
        if (fragmentView == null) return;
        fragmentView.post(() -> {
            if (progressBar != null) progressBar.setVisibility(View.GONE);
            if (contentLayout != null) contentLayout.setVisibility(View.VISIBLE);

            if (titleTextView != null) {
                titleTextView.setText(inviteAlready.chat != null ? inviteAlready.chat.title : "Telegram Chat");
            }
            if (countTextView != null) {
                countTextView.setText("You are already a member");
            }
            if (joinButton != null) {
                joinButton.setText("Open Chat");
            }
        });
    }

    private void joinChat() {
        if (isAlreadyParticipant) {
            openChatActivity(alreadyChatId);
            return;
        }

        if (joinButton != null) {
            joinButton.setEnabled(false);
        }

        MessagesController.getInstance(currentAccount).importChatInvite(inviteHash, (response, error) -> {
            if (error != null) {
                handleJoinError(error);
                return;
            }

            if (response instanceof TLRPC.TL_updates) {
                TLRPC.TL_updates updates = (TLRPC.TL_updates) response;
                long joinedChatId = 0;
                if (!updates.chats.isEmpty()) {
                    joinedChatId = updates.chats.get(0).id;
                }
                openChatActivity(joinedChatId);
            }
        });
    }

    private void openChatActivity(long chatId) {
        if (fragmentView == null) return;
        fragmentView.post(() -> {
            Bundle args = new Bundle();
            args.putLong("chat_id", chatId);
            ChatActivity chatActivity = new ChatActivity(args);
            presentFragment(chatActivity, true, false);
        });
    }

    private void handleCheckError(TLRPC.TL_error error) {
        if (fragmentView == null) return;
        fragmentView.post(() -> {
            if (progressBar != null) progressBar.setVisibility(View.GONE);
            String text = error != null && error.text != null ? error.text : "UNKNOWN_ERROR";
            String userMessage;

            if (text.contains("INVITE_HASH_EXPIRED")) {
                userMessage = "This invite link has expired or is no longer valid.";
            } else if (text.contains("INVITE_HASH_INVALID")) {
                userMessage = "Invalid invite link.";
            } else if (text.contains("USER_ALREADY_PARTICIPANT")) {
                userMessage = "You are already a member of this chat.";
            } else {
                userMessage = "Error verifying invite link (" + text + ")";
            }

            Toast.makeText(getParentActivity(), userMessage, Toast.LENGTH_LONG).show();
            finishFragment();
        });
    }

    private void handleJoinError(TLRPC.TL_error error) {
        if (fragmentView == null) return;
        fragmentView.post(() -> {
            if (joinButton != null) joinButton.setEnabled(true);
            String text = error != null && error.text != null ? error.text : "UNKNOWN_ERROR";
            String userMessage;

            if (text.contains("USERS_TOO_MUCH")) {
                userMessage = "This channel or group is full.";
            } else if (text.contains("INVITE_REQUEST_SENT")) {
                userMessage = "Join request sent. Please wait for admin approval.";
            } else if (text.contains("INVITE_HASH_EXPIRED")) {
                userMessage = "This invite link has expired.";
            } else {
                userMessage = "Failed to join chat (" + text + ")";
            }

            Toast.makeText(getParentActivity(), userMessage, Toast.LENGTH_LONG).show();
        });
    }
}
