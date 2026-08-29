/*
 * This is the source code of Telegram for Android v. 12.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.ui.Components;

import android.content.Context;
import android.graphics.Canvas;
import android.view.View;
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.MessageObject;
import org.telegram.tgnet.TLRPC;
import java.util.ArrayList;

public class ReactionsLayoutInBubble {
    public static class ReactionButton {
        public String reaction;
        public int count;
        public boolean isChosen;
        public int x;
        public int y;
        public int width;
        public int height;

        public ReactionButton(String reaction, int count, boolean isChosen) {
            this.reaction = reaction;
            this.count = count;
            this.isChosen = isChosen;
        }
    }

    private final View parentView;
    public final ArrayList<ReactionButton> reactionButtons = new ArrayList<>();
    public int width;
    public int height;

    public ReactionsLayoutInBubble(View parent) {
        this.parentView = parent;
    }

    public void setMessageObject(MessageObject messageObject) {
        reactionButtons.clear();
        if (messageObject != null && messageObject.messageOwner != null && messageObject.messageOwner.reactions != null) {
            for (TLRPC.TL_reactionCount r : messageObject.messageOwner.reactions.results) {
                if (r.reaction instanceof TLRPC.TL_reactionEmoji) {
                    TLRPC.TL_reactionEmoji emoji = (TLRPC.TL_reactionEmoji) r.reaction;
                    reactionButtons.add(new ReactionButton(emoji.emoticon, r.count, false));
                }
            }
        }
    }

    public void draw(Canvas canvas) {
        if (reactionButtons.isEmpty()) return;
        // Render reactions bubbles & counts
    }
}
