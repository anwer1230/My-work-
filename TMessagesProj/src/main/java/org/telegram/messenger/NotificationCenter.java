/*
 * This is the source code of Telegram for Android v. 11.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Nikolai Kudashov, 2013-2024.
 */

package org.telegram.messenger;

import java.util.ArrayList;
import java.util.HashMap;

public class NotificationCenter {
    private static int totalEvents = 1;

    public static final int didReceiveNewMessages = totalEvents++;
    public static final int updateInterfaces = totalEvents++;
    public static final int dialogsNeedReload = totalEvents++;
    public static final int closeChats = totalEvents++;
    public static final int messagesDeleted = totalEvents++;
    public static final int messagesRead = totalEvents++;
    public static final int messagesReadContent = totalEvents++;
    public static final int messageReceivedByAck = totalEvents++;
    public static final int messageSendError = totalEvents++;
    public static final int userStatusUpdated = totalEvents++;
    public static final int didUpdateConnectionState = totalEvents++;
    public static final int activeUserUpdated = totalEvents++;
    public static final int encryptedChatCreated = totalEvents++;
    public static final int chatInfoDidLoad = totalEvents++;
    public static final int channelRightsUpdated = totalEvents++;
    public static final int userFullInfoDidLoad = totalEvents++;
    public static final int scheduledMessagesDidLoad = totalEvents++;
    public static final int topicsDidLoaded = totalEvents++;
    public static final int notificationsSettingsUpdated = totalEvents++;
    public static final int reactionsDidLoad = totalEvents++;
    public static final int webPageDidLoad = totalEvents++;
    public static final int botAppDidLoad = totalEvents++;
    public static final int groupCallUpdated = totalEvents++;
    public static final int messagesDidLoaded = totalEvents++;

    public static final int UPDATE_MASK_READ_DIALOG_MESSAGE = 0x0001;
    public static final int UPDATE_MASK_SELECT_DIALOG = 0x0002;
    public static final int UPDATE_MASK_SEND_STATE = 0x0004;

    public interface NotificationCenterDelegate {
        void didReceivedNotification(int id, int account, Object... args);
    }

    private static volatile NotificationCenter[] Instance = new NotificationCenter[AccountInstance.MAX_ACCOUNT_COUNT];
    private final int currentAccount;
    private final HashMap<Integer, ArrayList<NotificationCenterDelegate>> observers = new HashMap<>();

    public static NotificationCenter getInstance(int num) {
        NotificationCenter localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (NotificationCenter.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new NotificationCenter(num);
                }
            }
        }
        return localInstance;
    }

    public NotificationCenter(int instance) {
        currentAccount = instance;
    }

    public void addObserver(NotificationCenterDelegate observer, int id) {
        ArrayList<NotificationCenterDelegate> arrayList = observers.get(id);
        if (arrayList == null) {
            arrayList = new ArrayList<>();
            observers.put(id, arrayList);
        }
        if (!arrayList.contains(observer)) {
            arrayList.add(observer);
        }
    }

    public void removeObserver(NotificationCenterDelegate observer, int id) {
        ArrayList<NotificationCenterDelegate> arrayList = observers.get(id);
        if (arrayList != null) {
            arrayList.remove(observer);
        }
    }

    public void postNotificationName(int id, Object... args) {
        ArrayList<NotificationCenterDelegate> arrayList = observers.get(id);
        if (arrayList != null && !arrayList.isEmpty()) {
            ArrayList<NotificationCenterDelegate> arrayListCopy = new ArrayList<>(arrayList);
            for (NotificationCenterDelegate delegate : arrayListCopy) {
                delegate.didReceivedNotification(id, currentAccount, args);
            }
        }
    }
}
