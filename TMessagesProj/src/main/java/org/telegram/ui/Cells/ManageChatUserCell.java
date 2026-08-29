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
import org.telegram.messenger.ImageLocation;
import org.telegram.tgnet.TLRPC;

public class ManageChatUserCell extends View {

    private final Paint namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint statusPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint roleBadgePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint roleBadgeBgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint avatarPlaceholderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF badgeRect = new RectF();

    private TLRPC.User currentUser;
    private TLRPC.ChannelParticipant currentParticipant;
    private String name;
    private String statusText;
    private String roleText;
    private int roleColor;
    private int roleBgColor;

    public ManageChatUserCell(Context context) {
        super(context);
        init();
    }

    private void init() {
        namePaint.setColor(Color.WHITE);
        namePaint.setTextSize(32);
        namePaint.setFakeBoldText(true);

        statusPaint.setColor(Color.parseColor("#8E8E93"));
        statusPaint.setTextSize(26);

        roleBadgePaint.setTextSize(24);
        roleBadgePaint.setFakeBoldText(true);

        roleBadgeBgPaint.setStyle(Paint.Style.FILL);
        avatarPlaceholderPaint.setColor(Color.parseColor("#2AABEE"));
    }

    public void setData(TLRPC.User user, TLRPC.ChannelParticipant participant) {
        this.currentUser = user;
        this.currentParticipant = participant;

        if (user != null) {
            String first = user.first_name != null ? user.first_name : "";
            String last = user.last_name != null ? user.last_name : "";
            this.name = (first + " " + last).trim();
            if (this.name.isEmpty()) {
                this.name = user.username != null ? "@" + user.username : "عضو";
            }
            if (user.status instanceof TLRPC.TL_userStatusOnline) {
                this.statusText = "متصل الآن";
                statusPaint.setColor(Color.parseColor("#4ea4f6"));
            } else {
                this.statusText = "آخر ظهور قريباً";
                statusPaint.setColor(Color.parseColor("#8E8E93"));
            }
        }

        updateRoleDisplay();
        invalidate();
    }

    private void updateRoleDisplay() {
        if (currentParticipant instanceof TLRPC.TL_channelParticipantCreator) {
            TLRPC.TL_channelParticipantCreator creator = (TLRPC.TL_channelParticipantCreator) currentParticipant;
            roleText = creator.rank != null && !creator.rank.isEmpty() ? creator.rank : "مالك";
            roleColor = Color.parseColor("#FFD54F");
            roleBgColor = Color.parseColor("#33FFB300");
        } else if (currentParticipant instanceof TLRPC.TL_channelParticipantAdmin) {
            TLRPC.TL_channelParticipantAdmin admin = (TLRPC.TL_channelParticipantAdmin) currentParticipant;
            roleText = admin.rank != null && !admin.rank.isEmpty() ? admin.rank : "مشرف";
            roleColor = Color.parseColor("#4FC3F7");
            roleBgColor = Color.parseColor("#3329B6F6");
        } else if (currentParticipant instanceof TLRPC.TL_channelParticipantBanned) {
            TLRPC.TL_channelParticipantBanned banned = (TLRPC.TL_channelParticipantBanned) currentParticipant;
            if (banned.banned_rights != null && banned.banned_rights.view_messages) {
                roleText = "محظور";
                roleColor = Color.parseColor("#E57373");
                roleBgColor = Color.parseColor("#33F44336");
            } else {
                roleText = "مقيد";
                roleColor = Color.parseColor("#FFB74D");
                roleBgColor = Color.parseColor("#33FF9800");
            }
        } else {
            roleText = null;
        }
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        int height = getHeight();
        int width = getWidth();

        // 1. Draw User Avatar (Circle Placeholder or Bitmap)
        float avatarRadius = 24;
        float avatarX = 40;
        float avatarY = height / 2.0f;
        canvas.drawCircle(avatarX, avatarY, avatarRadius, avatarPlaceholderPaint);

        // 2. Draw User Name
        if (name != null) {
            canvas.drawText(name, 80, avatarY - 4, namePaint);
        }

        // 3. Draw User Status (Online / Last seen)
        if (statusText != null) {
            canvas.drawText(statusText, 80, avatarY + 28, statusPaint);
        }

        // 4. Draw Right Role Badge
        if (roleText != null) {
            roleBadgePaint.setColor(roleColor);
            roleBadgeBgPaint.setColor(roleBgColor);

            float textWidth = roleBadgePaint.measureText(roleText);
            float badgeWidth = textWidth + 24;
            float badgeHeight = 36;
            float badgeRight = width - 24;
            float badgeLeft = badgeRight - badgeWidth;
            float badgeTop = avatarY - (badgeHeight / 2.0f);
            float badgeBottom = badgeTop + badgeHeight;

            badgeRect.set(badgeLeft, badgeTop, badgeRight, badgeBottom);
            canvas.drawRoundRect(badgeRect, 10, 10, roleBadgeBgPaint);
            canvas.drawText(roleText, badgeLeft + 12, badgeTop + 26, roleBadgePaint);
        }
    }
}
