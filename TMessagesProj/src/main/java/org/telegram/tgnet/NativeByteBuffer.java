/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.tgnet;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class NativeByteBuffer extends TLObject {
    protected long address;
    public ByteBuffer buffer;
    private boolean justCalc;
    private int len;

    public NativeByteBuffer(int size) {
        if (size >= 0) {
            address = native_getFreeBuffer(size);
            if (address != 0) {
                buffer = native_getJavaByteBuffer(address);
                buffer.position(0);
                buffer.limit(size);
                buffer.order(ByteOrder.LITTLE_ENDIAN);
            }
        }
    }

    public NativeByteBuffer(boolean calculate) {
        justCalc = calculate;
    }

    public static NativeByteBuffer wrap(long addr) {
        NativeByteBuffer result = new NativeByteBuffer(0);
        result.address = addr;
        result.buffer = native_getJavaByteBuffer(addr);
        result.buffer.limit(native_limit(addr));
        result.buffer.position(native_position(addr));
        result.buffer.order(ByteOrder.LITTLE_ENDIAN);
        return result;
    }

    public void writeInt32(int x) {
        if (!justCalc) {
            buffer.putInt(x);
        } else {
            len += 4;
        }
    }

    public void writeInt64(long x) {
        if (!justCalc) {
            buffer.putLong(x);
        } else {
            len += 8;
        }
    }

    public void writeBool(boolean value) {
        if (!justCalc) {
            if (value) {
                writeInt32(0x997275b5);
            } else {
                writeInt32(0xbc799737);
            }
        } else {
            len += 4;
        }
    }

    public void writeBytes(byte[] b) {
        if (!justCalc) {
            buffer.put(b);
        } else {
            len += b.length;
        }
    }

    public void writeString(String s) {
        if (s == null) {
            writeByteArray(new byte[0]);
            return;
        }
        try {
            writeByteArray(s.getBytes("UTF-8"));
        } catch (Exception e) {
            writeByteArray(new byte[0]);
        }
    }

    public void writeByteArray(byte[] b) {
        try {
            if (b.length <= 253) {
                if (!justCalc) {
                    buffer.put((byte) b.length);
                } else {
                    len += 1;
                }
            } else {
                if (!justCalc) {
                    buffer.put((byte) 254);
                    buffer.put((byte) b.length);
                    buffer.put((byte) (b.length >> 8));
                    buffer.put((byte) (b.length >> 16));
                } else {
                    len += 4;
                }
            }
            if (!justCalc) {
                buffer.put(b);
            } else {
                len += b.length;
            }
            int padding = (b.length <= 253 ? b.length + 1 : b.length) % 4;
            if (padding != 0) {
                padding = 4 - padding;
            }
            if (!justCalc) {
                for (int a = 0; a < padding; a++) {
                    buffer.put((byte) 0);
                }
            } else {
                len += padding;
            }
        } catch (Exception e) {
            // Ignored
        }
    }

    public int readInt32(boolean exception) {
        try {
            return buffer.getInt();
        } catch (Exception e) {
            if (exception) {
                throw new RuntimeException("read int32 error", e);
            }
            return 0;
        }
    }

    public long readInt64(boolean exception) {
        try {
            return buffer.getLong();
        } catch (Exception e) {
            if (exception) {
                throw new RuntimeException("read int64 error", e);
            }
            return 0;
        }
    }

    public boolean readBool(boolean exception) {
        int cons = readInt32(exception);
        if (cons == 0x997275b5) {
            return true;
        } else if (cons == 0xbc799737) {
            return false;
        }
        if (exception) {
            throw new RuntimeException("Not a boolean constructor");
        }
        return false;
    }

    public String readString(boolean exception) {
        byte[] arr = readByteArray(exception);
        if (arr == null) {
            return null;
        }
        try {
            return new String(arr, "UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

    public byte[] readByteArray(boolean exception) {
        try {
            int sl = 1;
            int l = buffer.get() & 0xFF;
            if (l >= 254) {
                l = (buffer.get() & 0xFF) | ((buffer.get() & 0xFF) << 8) | ((buffer.get() & 0xFF) << 16);
                sl = 4;
            }
            byte[] b = new byte[l];
            buffer.get(b);
            int padding = (l + sl) % 4;
            if (padding != 0) {
                padding = 4 - padding;
            }
            for (int a = 0; a < padding; a++) {
                buffer.get();
            }
            return b;
        } catch (Exception e) {
            if (exception) {
                throw new RuntimeException("read byte array error", e);
            }
            return new byte[0];
        }
    }

    public int length() {
        if (!justCalc) {
            return buffer.position();
        }
        return len;
    }

    public void reuse() {
        if (address != 0) {
            native_reuse(address);
            address = 0;
        }
    }

    public static native long native_getFreeBuffer(int size);
    public static native ByteBuffer native_getJavaByteBuffer(long address);
    public static native int native_limit(long address);
    public static native int native_position(long address);
    public static native void native_reuse(long address);
}
