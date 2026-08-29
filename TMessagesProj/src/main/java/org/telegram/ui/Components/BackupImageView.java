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
import org.telegram.messenger.ImageLocation;
import org.telegram.tgnet.TLObject;

public class BackupImageView extends View {
    private ImageLocation imageLocation;
    private int roundRadius;

    public BackupImageView(Context context) {
        super(context);
    }

    public void setImage(ImageLocation location, String filter, String ext, android.graphics.drawable.Drawable thumb, Object parentObject) {
        this.imageLocation = location;
        invalidate();
    }

    public void setImageObject(TLObject object, String filter, android.graphics.drawable.Drawable thumb) {
        invalidate();
    }

    public void setRoundRadius(int rad) {
        this.roundRadius = rad;
        invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        // Render avatar / media
    }
}
