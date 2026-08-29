/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.tgnet;

public abstract class TLObject {
    public boolean disableFree = false;
    public int networkType;

    public void readParams(NativeByteBuffer stream, boolean exception) {

    }

    public void serializeToStream(NativeByteBuffer stream) {

    }

    public TLObject deserializeResponse(NativeByteBuffer stream, int constructor, boolean exception) {
        return null;
    }

    public void freeResources() {

    }

    public int getObjectSize() {
        NativeByteBuffer byteBuffer = new NativeByteBuffer(true);
        serializeToStream(byteBuffer);
        return byteBuffer.length();
    }
}
