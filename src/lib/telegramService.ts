import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { computeCheck } from 'telegram/Password';
import { NewMessage } from 'telegram/events';

const API_ID = 22043994;
const API_HASH = '56f64582b363d367280db96586b97801';

interface PendingAuth {
  client: TelegramClient;
  phoneCodeHash: string;
}

let activeClient: TelegramClient | null = null;
let currentActivePhone: string = '';
let currentSessionString: string = '';
const pendingAuths: Record<string, PendingAuth> = {};

let onNewMessageCallback: ((msgData: any) => void) | null = null;
let onSystemMessageCallback: ((sysData: any) => void) | null = null;

export function setNewMessageCallback(cb: (msgData: any) => void) {
  onNewMessageCallback = cb;
}

export function setSystemMessageCallback(cb: (sysData: any) => void) {
  onSystemMessageCallback = cb;
}

export function normalizeDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9');
}

export function normalizePhone(phone: string): string {
  let cleaned = normalizeDigits(phone.trim()).replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+') && cleaned.length > 5) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

export function getPhoneKey(phone: string): string {
  if (!phone) return '';
  return normalizeDigits(phone).replace(/[^\d]/g, '');
}

async function formatUserWithPhoto(client: TelegramClient, me: any, phone: string) {
  const firstName = me?.firstName || me?.first_name || 'مستخدم تليجرام';
  const lastName = me?.lastName || me?.last_name || '';
  const username = me?.username ? `@${me.username}` : (me?.phone ? `+${me.phone}` : '@user');

  let photo: string | null = null;
  try {
    const buffer = (await client.downloadProfilePhoto(me, { isBig: true }).catch(() => null))
      || (await client.downloadProfilePhoto(me, { isBig: false }).catch(() => null));
    if (buffer && buffer.length > 0) {
      photo = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
    }
  } catch (err) {
    // ignore
  }

  return {
    uid: me?.id ? String(me.id) : 'tg_me',
    id: me?.id ? String(me.id) : 'tg_me',
    first_name: firstName,
    last_name: lastName,
    name: `${firstName} ${lastName}`.trim(),
    username: username,
    phone: phone || (me?.phone ? `+${me.phone}` : ''),
    photo: photo,
    is_online: true,
  };
}

function formatUser(me: any, phone: string, photo: string | null = null) {
  const firstName = me?.firstName || me?.first_name || 'مستخدم تليجرام';
  const lastName = me?.lastName || me?.last_name || '';
  const username = me?.username ? `@${me.username}` : (me?.phone ? `+${me.phone}` : '@user');

  return {
    uid: me?.id ? String(me.id) : 'tg_me',
    id: me?.id ? String(me.id) : 'tg_me',
    first_name: firstName,
    last_name: lastName,
    name: `${firstName} ${lastName}`.trim(),
    username: username,
    phone: phone || (me?.phone ? `+${me.phone}` : ''),
    photo: photo,
    is_online: true,
  };
}

function parseSystemAction(action: any, senderName: string): { system_text: string; action_type: string } | null {
  if (!action) return null;

  const className = action.className || action._ || '';

  if (className.includes('MessageActionChatAddUser') || className.includes('AddUser')) {
    return {
      system_text: `👤 انضم ${senderName || 'عضو جديد'} إلى المجموعة`,
      action_type: 'user_joined',
    };
  }

  if (className.includes('MessageActionChatDeleteUser') || className.includes('DeleteUser')) {
    return {
      system_text: `🚪 غادر ${senderName || 'عضو'} المجموعة`,
      action_type: 'user_left',
    };
  }

  if (className.includes('MessageActionChatJoinedByLink') || className.includes('JoinedByLink')) {
    return {
      system_text: `👤 انضم ${senderName || 'عضو'} إلى المجموعة عبر رابط دعوة`,
      action_type: 'user_joined_by_link',
    };
  }

  if (className.includes('MessageActionChatCreate') || className.includes('CreateChat')) {
    return {
      system_text: `📝 تم إنشاء المجموعة بواسطة ${senderName || 'المشرف'}`,
      action_type: 'chat_created',
    };
  }

  if (className.includes('MessageActionChatEditTitle') || className.includes('EditTitle')) {
    const newTitle = action.title || 'اسم جديد';
    return {
      system_text: `📝 تم تغيير اسم المجموعة إلى: "${newTitle}"`,
      action_type: 'chat_title_changed',
    };
  }

  if (className.includes('MessageActionChatEditPhoto') || className.includes('EditPhoto')) {
    return {
      system_text: `🖼️ تم تغيير صورة المجموعة بواسطة ${senderName || 'المشرف'}`,
      action_type: 'chat_photo_changed',
    };
  }

  if (className.includes('MessageActionChatDeletePhoto') || className.includes('DeletePhoto')) {
    return {
      system_text: `🖼️ تم حذف صورة المجموعة بواسطة ${senderName || 'المشرف'}`,
      action_type: 'chat_photo_deleted',
    };
  }

  if (className.includes('MessageActionChatMigrateTo') || className.includes('MigrateTo')) {
    return {
      system_text: `⬆️ تم ترقية المجموعة إلى مجموعة عملاقة (Supergroup)`,
      action_type: 'chat_migrated',
    };
  }

  if (className.includes('MessageActionChannelCreate') || className.includes('CreateChannel')) {
    return {
      system_text: `📢 تم إنشاء القناة بواسطة ${senderName || 'المؤسس'}`,
      action_type: 'channel_created',
    };
  }

  if (className.includes('MessageActionPinMessage') || className.includes('PinMessage')) {
    return {
      system_text: `📌 تم تثبيت رسالة بواسطة ${senderName || 'المشرف'}`,
      action_type: 'message_pinned',
    };
  }

  if (className.includes('MessageActionChatAddAdmin') || className.includes('AddAdmin')) {
    return {
      system_text: `👑 تم تعيين ${senderName || 'عضو'} مشرفاً في المجموعة`,
      action_type: 'admin_added',
    };
  }

  if (className.includes('MessageActionChatRemoveAdmin') || className.includes('RemoveAdmin')) {
    return {
      system_text: `👑 تم إزالة صلاحيات المشرف عن ${senderName || 'عضو'}`,
      action_type: 'admin_removed',
    };
  }

  return null;
}

function setupClientEventHandlers(client: TelegramClient) {
  try {
    client.addEventHandler(async (event: any) => {
      const m = event.message;
      if (!m) return;

      const cid = m.chatId ? String(m.chatId) : (m.peerId?.userId || m.peerId?.channelId || m.peerId?.chatId ? String(m.peerId.userId || m.peerId.channelId || m.peerId.chatId) : 'unknown');
      const isOut = !!m.out;
      const senderName = isOut ? 'أنت' : 'تليجرام';

      // Check if message is a System Action
      const actionResult = parseSystemAction(m.action, senderName);

      let text = m.message || (m.media ? '[وسائط / ملف]' : '');
      let isSystem = false;
      let systemType: string | undefined = undefined;

      if (actionResult) {
        text = actionResult.system_text;
        isSystem = true;
        systemType = actionResult.action_type;
      }

      const formattedMsg = {
        id: `m_tg_${m.id}`,
        chat_id: cid,
        sender_id: m.senderId ? String(m.senderId) : (isOut ? 'me' : 'other'),
        sender_name: senderName,
        is_outgoing: isOut,
        from_me: isOut,
        date: Math.floor((m.date || Date.now() / 1000)),
        content: { type: 'text', text },
        text,
        type: isSystem ? 'system' : 'text',
        is_system: isSystem,
        system_type: systemType,
      };

      if (onNewMessageCallback) {
        onNewMessageCallback({
          chat_id: cid,
          message: formattedMsg,
        });
      }

      if (isSystem && onSystemMessageCallback) {
        onSystemMessageCallback({
          chat_id: cid,
          message: text,
          type: systemType,
          date: Math.floor((m.date || Date.now() / 1000)),
          is_system: true,
          is_me: isOut,
        });
      }
    }, new NewMessage({}));
  } catch (e) {
    console.error('Error attaching Telegram event handler:', e);
  }
}

export async function fetchDialogsSafe(client: TelegramClient): Promise<any[]> {
  try {
    const dialogs = await client.getDialogs({ limit: 50 });
    return dialogs.map((d: any) => {
      const rawId = d.id ? String(d.id) : (d.entity?.id ? String(d.entity.id) : String(Math.random()));
      const chatId = rawId.startsWith('-100') ? rawId.replace('-100', '') : rawId.replace('-', '');
      const numId = parseInt(chatId, 10) || Math.abs(parseInt(rawId, 10)) || Math.floor(Math.random() * 100000);

      const type = d.isGroup ? 'group' : d.isChannel ? 'channel' : d.isUser ? 'private' : (d.entity?.title ? 'group' : 'private');
      const isGroupOrChannel = type === 'group' || type === 'channel';
      const title = isGroupOrChannel
        ? (d.title || d.entity?.title || d.name || (d.entity?.username ? `@${d.entity.username}` : (type === 'channel' ? 'قناة تليجرام' : 'مجموعة تليجرام')))
        : (d.name || d.title || d.entity?.title || (d.entity?.firstName ? `${d.entity?.firstName || ''} ${d.entity?.lastName || ''}`.trim() : (d.entity?.username ? `@${d.entity.username}` : 'محادثة تليجرام')));
      const username = d.entity?.username ? `@${d.entity.username}` : undefined;

      let lastMsgText = d.message?.message || '';
      if (!lastMsgText && d.message?.media) {
        lastMsgText = '[وسائط / صورة]';
      }

      const lastMsgDate = d.message?.date ? Math.floor(d.message.date) : Math.floor(Date.now() / 1000);

      return {
        id: numId,
        raw_id: rawId,
        name: title || 'تليجرام',
        title: title || 'تليجرام',
        username: username,
        type: type,
        avatar: null,
        unread_count: d.unreadCount || 0,
        unread: d.unreadCount || 0,
        pinned: !!d.pinned,
        is_pinned: !!d.pinned,
        is_muted: false,
        is_archived: !!d.archived,
        last_msg: lastMsgText,
        lastMsg: lastMsgText,
        lastMsgDate: lastMsgDate,
        date: lastMsgDate,
        last_message: d.message
          ? {
              id: `m_tg_${d.message.id}`,
              chat_id: numId,
              sender_id: d.message.out ? 'me' : 'other',
              sender_name: d.message.out ? 'أنت' : title,
              is_outgoing: !!d.message.out,
              date: new Date(lastMsgDate * 1000).toISOString(),
              content: { type: 'text', text: lastMsgText || 'رسالة' },
              text: lastMsgText,
            }
          : undefined,
      };
    });
  } catch (e) {
    console.error('Error fetching dialogs from Telegram:', e);
    return [];
  }
}

export async function sendTelegramCode(phone: string): Promise<{ phoneCodeHash: string; isCodeViaApp?: boolean }> {
  const cleanPhone = normalizePhone(phone);
  const key = getPhoneKey(phone);

  const stringSession = new StringSession('');
  const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5,
    useWSS: false,
  });

  await client.connect();

  const res = await client.sendCode(
    {
      apiId: API_ID,
      apiHash: API_HASH,
    },
    cleanPhone
  );

  pendingAuths[key] = {
    client,
    phoneCodeHash: res.phoneCodeHash,
  };

  return {
    phoneCodeHash: res.phoneCodeHash,
    isCodeViaApp: res.isCodeViaApp,
  };
}

export async function verifyTelegramCode(
  phone: string,
  code: string,
  phoneCodeHash?: string
): Promise<{ status: string; session?: string; user?: any; dialogs?: any[] }> {
  const cleanPhone = normalizePhone(phone);
  const cleanCode = normalizeDigits(code.trim());
  const key = getPhoneKey(phone);

  const authData = pendingAuths[key];
  const client = authData ? authData.client : activeClient;
  const hash = phoneCodeHash || (authData ? authData.phoneCodeHash : '');

  if (!client) {
    throw new Error('لم يتم العثور على جلسة مصادقة نشطة لهذا الرقم. يرجى إدخال الرقم مجدداً وإعادة المحاولة.');
  }

  // Check if client is already authorized
  try {
    if (await client.isUserAuthorized()) {
      activeClient = client;
      currentActivePhone = cleanPhone;
      if (pendingAuths[key]) delete pendingAuths[key];

      setupClientEventHandlers(client);
      const me = (await client.getMe()) as any;
      const sessionString = (client.session as StringSession).save();
      currentSessionString = sessionString;
      const userDialogs = await fetchDialogsSafe(client);
      const userWithPhoto = await formatUserWithPhoto(client, me, cleanPhone);

      return {
        status: 'authenticated',
        session: sessionString,
        user: userWithPhoto,
        dialogs: userDialogs,
      };
    }
  } catch (e) {
    console.log('User authorization check info:', e);
  }

  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: cleanPhone,
        phoneCodeHash: hash,
        phoneCode: cleanCode,
      })
    );

    activeClient = client;
    currentActivePhone = cleanPhone;
    if (pendingAuths[key]) delete pendingAuths[key];

    setupClientEventHandlers(client);
    const me = (await client.getMe()) as any;
    const sessionString = (client.session as StringSession).save();
    currentSessionString = sessionString;
    const userDialogs = await fetchDialogsSafe(client);
    const userWithPhoto = await formatUserWithPhoto(client, me, cleanPhone);

    return {
      status: 'authenticated',
      session: sessionString,
      user: userWithPhoto,
      dialogs: userDialogs,
    };
  } catch (error: any) {
    console.error('Telegram verify error details:', error);
    const errStr = String(error?.errorMessage || error?.message || error || '');

    if (errStr === 'SESSION_PASSWORD_NEEDED' || errStr.includes('SESSION_PASSWORD_NEEDED')) {
      return { status: 'wait_password' };
    }

    if (errStr.includes('PHONE_CODE_INVALID')) {
      throw new Error('رمز التحقق الذي أدخلته غير صحيح. يرجى التثبت من الرمز وإعادة المحاولة.');
    }
    if (errStr.includes('PHONE_CODE_EXPIRED')) {
      throw new Error('انتهت صلاحية رمز التحقق. يرجى طلب إرسال كود جديد.');
    }

    throw new Error(error?.errorMessage || error?.message || 'حدث خطأ أثناء التحقق من الكود مع تليجرام');
  }
}

export async function verifyTelegramPassword(phone: string, password: string) {
  const cleanPhone = normalizePhone(phone);
  const cleanPassword = normalizeDigits(password.trim());
  const key = getPhoneKey(phone);

  const client = pendingAuths[key]?.client || activeClient;

  if (!client) {
    throw new Error('جلسة منتهية، يرجى إدخال الرقم من جديد وإعادة المحاولة.');
  }

  try {
    const passwordSrpResult = await client.invoke(new Api.account.GetPassword());
    const passwordSrpCheck = await computeCheck(passwordSrpResult, cleanPassword);
    await client.invoke(
      new Api.auth.CheckPassword({
        password: passwordSrpCheck,
      })
    );

    activeClient = client;
    currentActivePhone = cleanPhone;
    if (pendingAuths[key]) delete pendingAuths[key];

    setupClientEventHandlers(client);
    const me = (await client.getMe()) as any;
    const sessionString = (client.session as StringSession).save();
    currentSessionString = sessionString;
    const userDialogs = await fetchDialogsSafe(client);
    const userWithPhoto = await formatUserWithPhoto(client, me, cleanPhone);

    return {
      status: 'authenticated',
      session: sessionString,
      user: userWithPhoto,
      dialogs: userDialogs,
    };
  } catch (error: any) {
    console.error('Telegram 2FA error details:', error);
    const errStr = String(error?.errorMessage || error?.message || error || '');

    if (errStr.includes('PASSWORD_HASH_INVALID')) {
      throw new Error('كلمة المرور السحابية غير صحيحة.');
    }

    throw new Error(error?.errorMessage || error?.message || 'كلمة المرور السحابية غير صحيحة');
  }
}

export async function restoreTelegramSession(sessionString: string): Promise<{ status: string; user?: any; dialogs?: any[] }> {
  if (!sessionString || sessionString.trim() === '') {
    throw new Error('رمز الجلسة غير متوفر');
  }

  const stringSession = new StringSession(sessionString.trim());
  const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5,
    useWSS: false,
  });

  await client.connect();

  const isAuth = await client.isUserAuthorized();
  if (!isAuth) {
    throw new Error('انتهت صلاحية الجلسة السحابية. يرجى تسجيل الدخول مجدداً.');
  }

  activeClient = client;
  currentSessionString = sessionString;
  setupClientEventHandlers(client);

  const me = (await client.getMe()) as any;
  const user = await formatUserWithPhoto(client, me, me?.phone ? `+${me.phone}` : '');
  currentActivePhone = user.phone;

  const userDialogs = await fetchDialogsSafe(client);

  return {
    status: 'authenticated',
    user,
    dialogs: userDialogs,
  };
}

export async function logoutTelegram(): Promise<boolean> {
  if (activeClient) {
    try {
      await activeClient.disconnect();
    } catch (e) {}
  }
  activeClient = null;
  currentActivePhone = '';
  currentSessionString = '';
  return true;
}

export async function getTelegramChatMessages(chatId: number | string, limit: number = 200, offsetId: number = 0): Promise<any[]> {
  if (!activeClient) return [];

  try {
    const fetchLimit = Math.min(Math.max(limit, 1), 200);
    const msgs = await activeClient.getMessages(chatId, {
      limit: fetchLimit,
      offsetId: offsetId > 0 ? offsetId : undefined,
    });
    return msgs.map((m: any) => {
      const isOut = !!m.out;
      const date = m.date ? Math.floor(m.date) : Math.floor(Date.now() / 1000);
      const text = m.message || (m.media ? '[وسائط / ملف]' : '');
      const senderName = m.sender
        ? (m.sender.firstName ? `${m.sender.firstName} ${m.sender.lastName || ''}`.trim() : m.sender.title || 'مستخدم')
        : isOut
        ? 'أنت'
        : 'تليجرام';

      return {
        id: `m_tg_${m.id}`,
        chat_id: Number(chatId) || chatId,
        sender_id: m.senderId ? String(m.senderId) : (isOut ? 'me' : 'other'),
        sender_name: senderName,
        is_outgoing: isOut,
        from_me: isOut,
        date: date,
        type: m.media ? 'photo' : 'text',
        content: { type: m.media ? 'photo' : 'text', text: text || 'رسالة' },
        text: text || 'رسالة',
      };
    }).reverse();
  } catch (e) {
    console.error('Error fetching chat messages from Telegram:', e);
    return [];
  }
}

export async function sendTelegramChatMessage(chatId: number | string, text: string): Promise<any> {
  if (!activeClient) {
    throw new Error('لا يوجد اتصال نشط مع خوادم تليجرام. يرجى تسجيل الدخول أولاً.');
  }

  try {
    const res = await activeClient.sendMessage(chatId, { message: text });
    const now = Math.floor(Date.now() / 1000);
    return {
      id: `m_tg_${res.id}`,
      chat_id: Number(chatId) || chatId,
      sender_id: 'me',
      sender_name: 'أنت',
      is_outgoing: true,
      from_me: true,
      date: now,
      content: { type: 'text', text },
      text,
      type: 'text',
    };
  } catch (e: any) {
    console.error('Error sending message to Telegram:', e);
    throw new Error(e?.message || 'تعذر إرسال الرسالة عبر تليجرام');
  }
}

export async function getActiveTelegramDialogs(): Promise<any[]> {
  if (!activeClient) return [];
  return await fetchDialogsSafe(activeClient);
}

export function isTelegramClientActive(): boolean {
  return !!activeClient;
}

export function getActiveSessionString(): string {
  return currentSessionString;
}

export async function downloadTelegramProfilePhoto(peerId: string | number): Promise<string | null> {
  if (!activeClient) return null;
  try {
    const pStr = String(peerId).trim();
    const entity = pStr === 'me' ? await activeClient.getMe() : await activeClient.getEntity(pStr).catch(() => null);
    if (!entity) return null;

    const buffer = await activeClient.downloadProfilePhoto(entity, { isBig: false }).catch(() => null);
    if (buffer && buffer.length > 0) {
      return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
    }
  } catch (e) {
    // silently fail
  }
  return null;
}

export async function getTelegramProfilePhotos(peerId: string | number, limit: number = 10): Promise<Array<{ id: string; date: number; photo_url: string; width?: number; height?: number }>> {
  if (!activeClient) return [];
  try {
    const pStr = String(peerId).trim();
    const entity: any = pStr === 'me' ? await activeClient.getMe() : await activeClient.getEntity(pStr).catch(() => null);
    if (!entity) return [];

    const results: Array<{ id: string; date: number; photo_url: string; width?: number; height?: number }> = [];

    // Safe GramJS MTProto invocation for User Profile Photos
    try {
      let photos: any[] = [];
      const res: any = await activeClient.invoke(
        new Api.photos.GetUserPhotos({
          userId: entity,
          offset: 0,
          maxId: BigInt(0) as any,
          limit: limit,
        })
      ).catch(() => null);

      if (res && res.photos) {
        photos = res.photos;
      }

      if (Array.isArray(photos) && photos.length > 0) {
        for (const photo of photos) {
          try {
            const buffer = await activeClient.downloadMedia(photo, {}).catch(() => null);
            if (buffer && buffer.length > 0) {
              results.push({
                id: String(photo.id || Math.random()),
                date: photo.date || Math.floor(Date.now() / 1000),
                photo_url: `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`,
              });
            }
          } catch (err) {
            // Ignore single media item download error
          }
        }
      }
    } catch (_) {}

    // Fallback to downloading primary profile photo if list download didn't return any
    if (results.length === 0) {
      const singleBuffer = await activeClient.downloadProfilePhoto(entity, { isBig: true }).catch(() => null);
      if (singleBuffer && singleBuffer.length > 0) {
        results.push({
          id: 'primary',
          date: Math.floor(Date.now() / 1000),
          photo_url: `data:image/jpeg;base64,${Buffer.from(singleBuffer).toString('base64')}`,
        });
      }
    }

    return results;
  } catch (e) {
    console.error('Error in getTelegramProfilePhotos for peer:', peerId, e);
    return [];
  }
}

export async function getTelegramFullUser(): Promise<any> {
  if (!activeClient) return null;
  try {
    const me: any = await activeClient.getMe();
    const fullUser: any = await activeClient.invoke(
      new Api.users.GetFullUser({
        id: new Api.InputUserSelf(),
      })
    ).catch(() => null);

    let photo: string | null = null;
    try {
      const buffer = (await activeClient.downloadProfilePhoto(me, { isBig: true }).catch(() => null))
        || (await activeClient.downloadProfilePhoto(me, { isBig: false }).catch(() => null));
      if (buffer && buffer.length > 0) {
        photo = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
      }
    } catch (_) {}

    return {
      me,
      fullUser,
      photo,
    };
  } catch (e) {
    console.error('Error getting Telegram full user:', e);
    return null;
  }
}

export async function getTelegramContacts(): Promise<any[]> {
  if (!activeClient) return [];
  try {
    const res: any = await activeClient.invoke(
      new Api.contacts.GetContacts({
        hash: BigInt(0) as any,
      })
    );
    if (res && res.users) {
      return res.users.map((u: any) => {
        let statusStr = 'offline';
        let statusText = 'آخر ظهور قريباً';
        if (u.status) {
          if (u.status.className === 'UserStatusOnline' || u.status._ === 'userStatusOnline') {
            statusStr = 'online';
            statusText = 'متصل الآن';
          } else if (u.status.className === 'UserStatusRecently' || u.status._ === 'userStatusRecently') {
            statusStr = 'recently';
            statusText = 'آخر ظهور قريباً';
          } else if (u.status.wasOnline) {
            const date = new Date(u.status.wasOnline * 1000);
            statusText = `آخر ظهور ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          }
        }
        return {
          id: u.id ? String(u.id) : Math.random().toString(),
          first_name: u.firstName || '',
          last_name: u.lastName || '',
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'جهة اتصال',
          phone: u.phone ? `+${u.phone}` : '',
          username: u.username ? `@${u.username}` : undefined,
          status: statusStr,
          status_text: statusText,
          is_online: statusStr === 'online',
          mutual: !!u.mutualContact,
        };
      });
    }
  } catch (e) {
    console.error('Error getting Telegram contacts:', e);
  }
  return [];
}

export async function updateTelegramProfile(params: { firstName?: string; lastName?: string; about?: string }): Promise<boolean> {
  if (!activeClient) return false;
  try {
    await activeClient.invoke(
      new Api.account.UpdateProfile({
        firstName: params.firstName,
        lastName: params.lastName,
        about: params.about,
      })
    );
    return true;
  } catch (e) {
    console.error('Error updating Telegram profile:', e);
    return false;
  }
}

export async function updateTelegramUsername(username: string): Promise<boolean> {
  if (!activeClient) return false;
  try {
    const cleanUsername = username.replace('@', '').trim();
    await activeClient.invoke(
      new Api.account.UpdateUsername({
        username: cleanUsername,
      })
    );
    return true;
  } catch (e) {
    console.error('Error updating Telegram username:', e);
    return false;
  }
}

export async function getTelegramAuthorizations(): Promise<any[]> {
  if (!activeClient) return [];
  try {
    const res: any = await activeClient.invoke(new Api.account.GetAuthorizations());
    if (res && res.authorizations) {
      return res.authorizations.map((a: any) => ({
        id: String(a.hash || Math.random()),
        device_name: `${a.deviceModel || 'جهاز تليجرام'} (${a.platform || 'تطبيق'})`,
        app_name: a.appName || 'Telegram App',
        app_version: a.appVersion || 'v10.0',
        ip: a.ip || '185.220.101.4',
        location: `${a.country || 'المملكة العربية السعودية'}`,
        last_active: a.current ? 'نشط الآن (هذا الجهاز)' : (a.dateActive ? new Date(a.dateActive * 1000).toLocaleString() : 'مؤخراً'),
        is_current: !!a.current,
        platform: String(a.platform || '').toLowerCase().includes('android') || String(a.platform || '').toLowerCase().includes('ios') ? 'mobile' : 'web',
      }));
    }
  } catch (e) {
    console.error('Error getting Telegram authorizations:', e);
  }
  return [];
}

export async function resetTelegramAuthorizations(): Promise<boolean> {
  if (!activeClient) return false;
  try {
    await activeClient.invoke(new Api.auth.ResetAuthorizations());
    return true;
  } catch (e) {
    console.error('Error resetting Telegram authorizations:', e);
    return false;
  }
}
