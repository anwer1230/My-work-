/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui.Cells;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.view.View;
import org.telegram.messenger.MessageObject;
import org.telegram.tgnet.TLRPC;

public class ChatMessageCell extends View {

    public static final int ROLE_NONE = 0;
    public static final int ROLE_CREATOR = 1;
    public static final int ROLE_ADMIN = 2;
    public static final int ROLE_RESTRICTED = 3;
    public static final int ROLE_BANNED = 4;

    private MessageObject currentMessageObject;
    private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint bgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint statePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint adminTagPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint adminTagBgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF bubbleRect = new RectF();
    private final RectF adminTagRect = new RectF();

    private boolean isVisibleState = false;
    private String senderName;
    private String senderRank;
    private int senderRole = ROLE_NONE;

    public ChatMessageCell(Context context) {
        super(context);
        init();
    }

    private void init() {
        textPaint.setColor(Color.WHITE);
        textPaint.setTextSize(36);

        namePaint.setColor(Color.parseColor("#4ea4f6"));
        namePaint.setTextSize(30);
        namePaint.setFakeBoldText(true);

        statePaint.setAntiAlias(true);
        statePaint.setStrokeWidth(4);
        statePaint.setStyle(Paint.Style.STROKE);

        adminTagPaint.setTextSize(22);
        adminTagPaint.setFakeBoldText(true);
        adminTagBgPaint.setStyle(Paint.Style.FILL);
    }

    public void setMessageObject(MessageObject messageObject) {
        this.currentMessageObject = messageObject;
        checkMessageState();
        invalidate();
    }

    public void setSenderInfo(String name, int role, String customRank) {
        this.senderName = name;
        this.senderRole = role;
        this.senderRank = customRank;
        invalidate();
    }

    public void setParticipantRole(TLRPC.ChannelParticipant participant) {
        if (participant instanceof TLRPC.TL_channelParticipantCreator) {
            this.senderRole = ROLE_CREATOR;
            TLRPC.TL_channelParticipantCreator c = (TLRPC.TL_channelParticipantCreator) participant;
            this.senderRank = c.rank != null && !c.rank.isEmpty() ? c.rank : "مالك";
        } else if (participant instanceof TLRPC.TL_channelParticipantAdmin) {
            this.senderRole = ROLE_ADMIN;
            TLRPC.TL_channelParticipantAdmin a = (TLRPC.TL_channelParticipantAdmin) participant;
            this.senderRank = a.rank != null && !a.rank.isEmpty() ? a.rank : "مشرف";
        } else if (participant instanceof TLRPC.TL_channelParticipantBanned) {
            TLRPC.TL_channelParticipantBanned b = (TLRPC.TL_channelParticipantBanned) participant;
            if (b.banned_rights != null && b.banned_rights.view_messages) {
                this.senderRole = ROLE_BANNED;
                this.senderRank = "محظور";
            } else {
                this.senderRole = ROLE_RESTRICTED;
                this.senderRank = "مقيد";
            }
        } else {
            this.senderRole = ROLE_NONE;
            this.senderRank = null;
        }
        invalidate();
    }

    public MessageObject getMessageObject() {
        return currentMessageObject;
    }

    public void checkMessageState() {
        if (currentMessageObject == null || !currentMessageObject.isOutOwner()) {
            isVisibleState = false;
            return;
        }
        isVisibleState = true;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        if (currentMessageObject == null) {
            return;
        }

        boolean isOut = currentMessageObject.isOutOwner();
        int width = getWidth();
        int height = getHeight();

        // 1. Draw message bubble background
        if (isOut) {
            bgPaint.setColor(Color.parseColor("#2b5278"));
            bubbleRect.set(width * 0.3f, 8, width - 16, height - 8);
        } else {
            bgPaint.setColor(Color.parseColor("#182533"));
            bubbleRect.set(16, 8, width * 0.7f, height - 8);
        }
        canvas.drawRoundRect(bubbleRect, 18, 18, bgPaint);

        float textOffsetY = bubbleRect.top + 48;

        // 2. Draw Sender Name & Role Badge (For incoming group messages)
        if (!isOut && senderName != null) {
            float nameX = bubbleRect.left + 24;
            float nameY = bubbleRect.top + 34;
            canvas.drawText(senderName, nameX, nameY, namePaint);
            float nameWidth = namePaint.measureText(senderName);

            // Draw Role / Rank Badge if user is Admin, Creator or Restricted
            if (senderRole != ROLE_NONE && senderRank != null) {
                String badgeText = (senderRole == ROLE_CREATOR ? "👑 " : (senderRole == ROLE_ADMIN ? "🛡️ " : "")) + senderRank;
                float tagWidth = adminTagPaint.measureText(badgeText) + 16;
                float tagLeft = nameX + nameWidth + 12;
                float tagTop = nameY - 22;
                float tagBottom = nameY + 6;

                adminTagRect.set(tagLeft, tagTop, tagLeft + tagWidth, tagBottom);

                if (senderRole == ROLE_CREATOR) {
                    adminTagBgPaint.setColor(Color.parseColor("#33FFB300"));
                    adminTagPaint.setColor(Color.parseColor("#FFD54F"));
                } else if (senderRole == ROLE_ADMIN) {
                    adminTagBgPaint.setColor(Color.parseColor("#3329B6F6"));
                    adminTagPaint.setColor(Color.parseColor("#4FC3F7"));
                } else if (senderRole == ROLE_RESTRICTED) {
                    adminTagBgPaint.setColor(Color.parseColor("#33FF9800"));
                    adminTagPaint.setColor(Color.parseColor("#FFB74D"));
                } else if (senderRole == ROLE_BANNED) {
                    adminTagBgPaint.setColor(Color.parseColor("#33F44336"));
                    adminTagPaint.setColor(Color.parseColor("#E57373"));
                }

                canvas.drawRoundRect(adminTagRect, 8, 8, adminTagBgPaint);
                canvas.drawText(badgeText, tagLeft + 8, nameY - 4, adminTagPaint);
            }

            textOffsetY += 32;
        }

        // 3. Draw message text
        String text = currentMessageObject.messageText != null ? currentMessageObject.messageText.toString() : "";
        canvas.drawText(text, bubbleRect.left + 24, textOffsetY, textPaint);

        // 4. Draw Message Status Icon (🕒, ✓, ✓✓, ❌)
        if (isVisibleState && isOut) {
            float stateX = bubbleRect.right - 48;
            float stateY = bubbleRect.bottom - 24;

            if (currentMessageObject.isSending()) {
                // 🕒 State: Sending (Clock circle and rotating tick)
                statePaint.setColor(Color.parseColor("#80FFFFFF"));
                canvas.drawCircle(stateX, stateY - 8, 10, statePaint);
                canvas.drawLine(stateX, stateY - 8, stateX, stateY - 14, statePaint);
                canvas.drawLine(stateX, stateY - 8, stateX + 5, stateY - 8, statePaint);
            } else if (currentMessageObject.isSendError()) {
                // ❌ State: Send Error (Red warning exclamation / cross)
                statePaint.setColor(Color.parseColor("#FF5252"));
                canvas.drawCircle(stateX, stateY - 8, 11, statePaint);
                canvas.drawLine(stateX, stateY - 14, stateX, stateY - 6, statePaint);
                canvas.drawCircle(stateX, stateY - 2, 1.5f, statePaint);
            } else if (currentMessageObject.isSent() || currentMessageObject.isOutOwner()) {
                if (currentMessageObject.isUnread()) {
                    // ✓ State: Delivered to Server / Single checkmark
                    statePaint.setColor(Color.parseColor("#4fae4e"));
                    canvas.drawLine(stateX - 6, stateY - 8, stateX - 1, stateY - 3, statePaint);
                    canvas.drawLine(stateX - 1, stateY - 3, stateX + 8, stateY - 14, statePaint);
                } else {
                    // ✓✓ State: Read by recipient / Double checkmark
                    statePaint.setColor(Color.parseColor("#4fae4e"));
                    // First Check
                    canvas.drawLine(stateX - 10, stateY - 8, stateX - 5, stateY - 3, statePaint);
                    canvas.drawLine(stateX - 5, stateY - 3, stateX + 4, stateY - 14, statePaint);
                    // Second Check
                    canvas.drawLine(stateX - 4, stateY - 8, stateX + 1, stateY - 3, statePaint);
                    canvas.drawLine(stateX + 1, stateY - 3, stateX + 10, stateY - 14, statePaint);
                }
            }
        }
    }
}
