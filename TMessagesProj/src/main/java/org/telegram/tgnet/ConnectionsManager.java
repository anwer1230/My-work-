/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.tgnet;

import org.telegram.messenger.AccountInstance;
import org.telegram.messenger.MessagesController;
import org.telegram.messenger.NotificationCenter;

public class ConnectionsManager {
    public static final int ConnectionStateConnecting = 1;
    public static final int ConnectionStateConnected = 2;
    public static final int ConnectionStateUpdating = 3;
    public static final int ConnectionStateSuspended = 4;

    public static final int RequestFlagEnableUnauthorized = 1;
    public static final int RequestFlagFailOnServerErrors = 2;
    public static final int RequestFlagCanCompress = 4;
    public static final int RequestFlagWithoutLogin = 8;
    public static final int RequestFlagTryDifferentDc = 16;
    public static final int RequestFlagForceDownload = 32;
    public static final int RequestFlagInvokeAfter = 64;
    public static final int RequestFlagNeedQuickAck = 128;

    public static final int DEFAULT_DATACENTER_ID = 4;

    private final int currentAccount;
    private int connectionState = ConnectionStateConnected;
    private int lastRequestToken = 1;

    public interface RequestDelegate {
        void run(TLObject response, TLRPC.TL_error error);
    }

    public interface QuickAckDelegate {
        void run();
    }

    public interface RequestDelegateInternal {
        void run(long responseAddress, int errorCode, String errorText);
    }

    public static ConnectionsManager getInstance(int num) {
        return AccountInstance.getInstance(num).getConnectionsManager();
    }

    public ConnectionsManager(int instance) {
        currentAccount = instance;
    }

    public int getConnectionState() {
        return connectionState;
    }

    public int sendRequest(final TLObject object, final RequestDelegate onComplete) {
        return sendRequest(object, onComplete, null, 0);
    }

    public int sendRequest(final TLObject object, final RequestDelegate onComplete, final QuickAckDelegate onQuickAck, final int flags) {
        final int requestToken = lastRequestToken++;
        if (object == null) {
            return 0;
        }

        NativeByteBuffer buffer = new NativeByteBuffer(object.getObjectSize());
        object.serializeToStream(buffer);

        native_sendRequest(currentAccount, buffer.address, (responseAddress, errorCode, errorText) -> {
            TLObject response = null;
            TLRPC.TL_error error = null;

            if (responseAddress != 0) {
                NativeByteBuffer responseBuffer = NativeByteBuffer.wrap(responseAddress);
                int constructor = responseBuffer.readInt32(true);
                response = TLRPC.TLClassStore.TLdeserialize(responseBuffer, constructor, true);
            } else if (errorText != null) {
                error = new TLRPC.TL_error();
                error.code = errorCode;
                error.text = errorText;
            }

            if (onComplete != null) {
                onComplete.run(response, error);
            }
        }, flags);

        return requestToken;
    }

    public static void onUnparsedMessageReceived(int account, long address) {
        if (address == 0) {
            return;
        }
        NativeByteBuffer buffer = NativeByteBuffer.wrap(address);
        int constructor = buffer.readInt32(true);
        TLObject updateObj = TLRPC.TLClassStore.TLdeserialize(buffer, constructor, true);

        if (updateObj instanceof TLRPC.Updates) {
            MessagesController.getInstance(account).processUpdates((TLRPC.Updates) updateObj, false);
        }
    }

    public static void onConnectionStateChanged(int account, int state) {
        ConnectionsManager manager = getInstance(account);
        manager.connectionState = state;
        NotificationCenter.getInstance(account).postNotificationName(
            NotificationCenter.didUpdateConnectionState, state
        );
    }

    public static native int native_sendRequest(int account, long bufferAddress, RequestDelegateInternal onComplete, int flags);
    public static native void native_cancelRequest(int account, int token, boolean notifyServer);
    public static native void native_cleanUp(int account, boolean resetKeys);
}
