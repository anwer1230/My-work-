/**
 * TdApi.ts - Telegram Database Library (TDLib) Full API Types & Definitions
 * Matches official tdlib/td/generate/scheme/td_api.tl
 */

export namespace TdApi {
  // Base Object
  export interface Object {
    '@type': string;
    '@extra'?: string | number;
  }

  export interface Ok extends Object {
    '@type': 'ok';
  }

  export interface Error extends Object {
    '@type': 'error';
    code: number;
    message: string;
  }

  // Authorization States
  export type AuthorizationState =
    | AuthorizationStateWaitTdlibParameters
    | AuthorizationStateWaitPhoneNumber
    | AuthorizationStateWaitEmailAddress
    | AuthorizationStateWaitEmailCode
    | AuthorizationStateWaitCode
    | AuthorizationStateWaitOtherDeviceConfirmation
    | AuthorizationStateWaitRegistration
    | AuthorizationStateWaitPassword
    | AuthorizationStateReady
    | AuthorizationStateLoggingOut
    | AuthorizationStateClosing
    | AuthorizationStateClosed;

  export interface AuthorizationStateWaitTdlibParameters extends Object {
    '@type': 'authorizationStateWaitTdlibParameters';
  }
  export interface AuthorizationStateWaitPhoneNumber extends Object {
    '@type': 'authorizationStateWaitPhoneNumber';
  }
  export interface AuthorizationStateWaitEmailAddress extends Object {
    '@type': 'authorizationStateWaitEmailAddress';
  }
  export interface AuthorizationStateWaitEmailCode extends Object {
    '@type': 'authorizationStateWaitEmailCode';
  }
  export interface AuthorizationStateWaitCode extends Object {
    '@type': 'authorizationStateWaitCode';
    is_registered: boolean;
    terms_of_service?: string;
  }
  export interface AuthorizationStateWaitOtherDeviceConfirmation extends Object {
    '@type': 'authorizationStateWaitOtherDeviceConfirmation';
    link: string;
  }
  export interface AuthorizationStateWaitRegistration extends Object {
    '@type': 'authorizationStateWaitRegistration';
    terms_of_service?: string;
  }
  export interface AuthorizationStateWaitPassword extends Object {
    '@type': 'authorizationStateWaitPassword';
    password_hint?: string;
    has_recovery_email_address: boolean;
  }
  export interface AuthorizationStateReady extends Object {
    '@type': 'authorizationStateReady';
  }
  export interface AuthorizationStateLoggingOut extends Object {
    '@type': 'authorizationStateLoggingOut';
  }
  export interface AuthorizationStateClosing extends Object {
    '@type': 'authorizationStateClosing';
  }
  export interface AuthorizationStateClosed extends Object {
    '@type': 'authorizationStateClosed';
  }

  // User & Profiles
  export interface User extends Object {
    '@type': 'user';
    id: number | string;
    first_name: string;
    last_name?: string;
    username?: string;
    phone_number?: string;
    status: UserStatus;
    profile_photo?: ProfilePhoto;
    is_contact: boolean;
    is_mutual_contact: boolean;
    is_verified: boolean;
    is_premium: boolean;
    is_support: boolean;
    restriction_reason?: string;
    have_access: boolean;
    type: UserType;
    language_code?: string;
  }

  export type UserType =
    | { '@type': 'userTypeRegular' }
    | { '@type': 'userTypeDeleted' }
    | { '@type': 'userTypeBot'; can_join_groups: boolean; can_read_all_group_messages: boolean; is_inline: boolean }
    | { '@type': 'userTypeUnknown' };

  export type UserStatus =
    | { '@type': 'userStatusEmpty' }
    | { '@type': 'userStatusOnline'; expires: number }
    | { '@type': 'userStatusOffline'; was_online: number }
    | { '@type': 'userStatusRecently' }
    | { '@type': 'userStatusLastWeek' }
    | { '@type': 'userStatusLastMonth' };

  export interface ProfilePhoto extends Object {
    '@type': 'profilePhoto';
    id: string;
    small: File;
    big: File;
  }

  // Files
  export interface File extends Object {
    '@type': 'file';
    id: number | string;
    size: number;
    expected_size: number;
    local: LocalFile;
    remote: RemoteFile;
  }

  export interface LocalFile extends Object {
    '@type': 'localFile';
    path: string;
    can_be_downloaded: boolean;
    can_be_deleted: boolean;
    is_downloading_active: boolean;
    is_downloading_completed: boolean;
    download_offset: number;
    downloaded_prefix_size: number;
    downloaded_size: number;
  }

  export interface RemoteFile extends Object {
    '@type': 'remoteFile';
    id: string;
    unique_id: string;
    is_uploading_active: boolean;
    is_uploading_completed: boolean;
    uploaded_size: number;
  }

  // Chats
  export interface Chat extends Object {
    '@type': 'chat';
    id: number | string;
    type: ChatType;
    title: string;
    photo?: ChatPhotoInfo;
    permissions: ChatPermissions;
    last_message?: Message;
    positions: ChatPosition[];
    message_sender_id?: MessageSender;
    has_protected_content: boolean;
    is_marked_as_unread: boolean;
    is_blocked: boolean;
    has_scheduled_messages: boolean;
    can_be_deleted_only_for_self: boolean;
    can_be_deleted_for_all_users: boolean;
    can_be_reported: boolean;
    default_disable_notification: boolean;
    unread_count: number;
    last_read_inbox_message_id: number | string;
    last_read_outbox_message_id: number | string;
    unread_mention_count: number;
    unread_reaction_count: number;
    notification_settings: ChatNotificationSettings;
    theme_name?: string;
    action_bar?: any;
    draft_message?: DraftMessage;
  }

  export type ChatType =
    | { '@type': 'chatTypePrivate'; user_id: number | string }
    | { '@type': 'chatTypeBasicGroup'; basic_group_id: number | string }
    | { '@type': 'chatTypeSupergroup'; supergroup_id: number | string; is_channel: boolean }
    | { '@type': 'chatTypeSecret'; secret_chat_id: number | string; user_id: number | string };

  export interface ChatPosition extends Object {
    '@type': 'chatPosition';
    list: { '@type': 'chatListMain' } | { '@type': 'chatListArchive' } | { '@type': 'chatListFolder'; chat_folder_id: number };
    order: string;
    is_pinned: boolean;
  }

  export interface ChatPermissions extends Object {
    '@type': 'chatPermissions';
    can_send_messages: boolean;
    can_send_media_messages: boolean;
    can_send_polls: boolean;
    can_send_other_messages: boolean;
    can_add_web_page_previews: boolean;
    can_change_info: boolean;
    can_invite_users: boolean;
    can_pin_messages: boolean;
    can_manage_topics: boolean;
  }

  export interface ChatNotificationSettings extends Object {
    '@type': 'chatNotificationSettings';
    use_default_mute_for: boolean;
    mute_for: number;
    use_default_sound: boolean;
    sound_id: string;
    use_default_show_preview: boolean;
    show_preview: boolean;
    use_default_disable_pinned_message_notifications: boolean;
    disable_pinned_message_notifications: boolean;
    use_default_disable_mention_notifications: boolean;
    disable_mention_notifications: boolean;
  }

  export interface ChatPhotoInfo extends Object {
    '@type': 'chatPhotoInfo';
    small: File;
    big: File;
    has_animation: boolean;
  }

  // Messages
  export interface Message extends Object {
    '@type': 'message';
    id: number | string;
    sender_id: MessageSender;
    chat_id: number | string;
    sending_state?: MessageSendingState;
    scheduling_state?: any;
    is_outgoing: boolean;
    is_pinned: boolean;
    can_be_edited: boolean;
    can_be_forwarded: boolean;
    can_be_saved: boolean;
    can_be_deleted_only_for_self: boolean;
    can_be_deleted_for_all_users: boolean;
    can_get_added_reactions: boolean;
    can_get_statistics: boolean;
    can_get_message_thread: boolean;
    can_get_viewers: boolean;
    can_get_media_timestamp_links: boolean;
    has_timestamped_media: boolean;
    is_channel_post: boolean;
    contains_unread_mention: boolean;
    date: number;
    edit_date: number;
    forward_info?: MessageForwardInfo;
    interaction_info?: MessageInteractionInfo;
    reply_to_message_id: number | string;
    message_thread_id?: number | string;
    ttl: number;
    ttl_expires_in: number;
    via_bot_user_id: number | string;
    author_signature?: string;
    media_album_id?: string;
    content: MessageContent;
    reply_markup?: any;
  }

  export type MessageSender =
    | { '@type': 'messageSenderUser'; user_id: number | string }
    | { '@type': 'messageSenderChat'; chat_id: number | string };

  export type MessageSendingState =
    | { '@type': 'messageSendingStatePending' }
    | { '@type': 'messageSendingStateFailed'; error_code: number; error_message: string; can_retry: boolean };

  export interface MessageForwardInfo extends Object {
    '@type': 'messageForwardInfo';
    origin: any;
    date: number;
    public_service_announcement_type?: string;
    from_chat_id: number | string;
    from_message_id: number | string;
  }

  export interface MessageInteractionInfo extends Object {
    '@type': 'messageInteractionInfo';
    view_count: number;
    forward_count: number;
    reply_info?: any;
    reactions?: any[];
  }

  export type MessageContent =
    | MessageText
    | MessagePhoto
    | MessageVideo
    | MessageAudio
    | MessageVoiceNote
    | MessageDocument
    | MessageSticker
    | MessageLocation
    | MessageContact
    | MessagePoll
    | MessageCall
    | MessageChatAddMembers
    | MessageChatDeleteMember
    | MessageChatChangeTitle;

  export interface FormattedText extends Object {
    '@type': 'formattedText';
    text: string;
    entities: TextEntity[];
  }

  export interface TextEntity extends Object {
    '@type': 'textEntity';
    offset: number;
    length: number;
    type: TextEntityType;
  }

  export type TextEntityType =
    | { '@type': 'textEntityTypeBold' }
    | { '@type': 'textEntityTypeItalic' }
    | { '@type': 'textEntityTypeUnderline' }
    | { '@type': 'textEntityTypeStrikethrough' }
    | { '@type': 'textEntityTypeCode' }
    | { '@type': 'textEntityTypePre' }
    | { '@type': 'textEntityTypeTextUrl'; url: string }
    | { '@type': 'textEntityTypeMention' }
    | { '@type': 'textEntityTypeHashtag' }
    | { '@type': 'textEntityTypeBotCommand' }
    | { '@type': 'textEntityTypeUrl' }
    | { '@type': 'textEntityTypeEmailAddress' }
    | { '@type': 'textEntityTypePhoneNumber' }
    | { '@type': 'textEntityTypeBankCardNumber' }
    | { '@type': 'textEntityTypeSpoiler' }
    | { '@type': 'textEntityTypeCustomEmoji'; custom_emoji_id: string };

  export interface MessageText extends Object {
    '@type': 'messageText';
    text: FormattedText;
    web_page?: any;
  }

  export interface MessagePhoto extends Object {
    '@type': 'messagePhoto';
    photo: Photo;
    caption: FormattedText;
    is_secret: boolean;
  }

  export interface Photo extends Object {
    '@type': 'photo';
    has_stickers: boolean;
    minithumbnail?: any;
    sizes: PhotoSize[];
  }

  export interface PhotoSize extends Object {
    '@type': 'photoSize';
    type: string;
    photo: File;
    width: number;
    height: number;
    progressive_sizes: number[];
  }

  export interface MessageVideo extends Object {
    '@type': 'messageVideo';
    video: Video;
    caption: FormattedText;
    is_secret: boolean;
  }

  export interface Video extends Object {
    '@type': 'video';
    duration: number;
    width: number;
    height: number;
    file_name: string;
    mime_type: string;
    has_stickers: boolean;
    supports_streaming: boolean;
    minithumbnail?: any;
    thumbnail?: PhotoSize;
    video: File;
  }

  export interface MessageAudio extends Object {
    '@type': 'messageAudio';
    audio: Audio;
    caption: FormattedText;
  }

  export interface Audio extends Object {
    '@type': 'audio';
    duration: number;
    title: string;
    performer: string;
    file_name: string;
    mime_type: string;
    album_cover_thumbnail?: PhotoSize;
    audio: File;
  }

  export interface MessageVoiceNote extends Object {
    '@type': 'messageVoiceNote';
    voice_note: VoiceNote;
    caption: FormattedText;
    is_listened: boolean;
  }

  export interface VoiceNote extends Object {
    '@type': 'voiceNote';
    duration: number;
    waveform: string;
    mime_type: string;
    voice: File;
  }

  export interface MessageDocument extends Object {
    '@type': 'messageDocument';
    document: Document;
    caption: FormattedText;
  }

  export interface Document extends Object {
    '@type': 'document';
    file_name: string;
    mime_type: string;
    thumbnail?: PhotoSize;
    document: File;
  }

  export interface MessageSticker extends Object {
    '@type': 'messageSticker';
    sticker: Sticker;
  }

  export interface Sticker extends Object {
    '@type': 'sticker';
    set_id: string;
    width: number;
    height: number;
    emoji: string;
    format: { '@type': 'stickerFormatWebp' } | { '@type': 'stickerFormatTgs' } | { '@type': 'stickerFormatWebm' };
    thumbnail?: PhotoSize;
    sticker: File;
  }

  export interface MessageLocation extends Object {
    '@type': 'messageLocation';
    location: Location;
    live_period: number;
    expires_in: number;
    heading: number;
    proximity_alert_radius: number;
  }

  export interface Location extends Object {
    '@type': 'location';
    latitude: number;
    longitude: number;
    horizontal_accuracy: number;
  }

  export interface MessageContact extends Object {
    '@type': 'messageContact';
    contact: Contact;
  }

  export interface Contact extends Object {
    '@type': 'contact';
    phone_number: string;
    first_name: string;
    last_name: string;
    vcard: string;
    user_id: number | string;
  }

  export interface MessagePoll extends Object {
    '@type': 'messagePoll';
    poll: Poll;
  }

  export interface Poll extends Object {
    '@type': 'poll';
    id: string;
    question: string;
    options: PollOption[];
    total_voter_count: number;
    recent_voter_user_ids: (number | string)[];
    is_anonymous: boolean;
    type: any;
    open_period: number;
    close_date: number;
    is_closed: boolean;
  }

  export interface PollOption extends Object {
    '@type': 'pollOption';
    text: string;
    voter_count: number;
    vote_percentage: number;
    is_chosen: boolean;
    is_being_chosen: boolean;
  }

  export interface MessageCall extends Object {
    '@type': 'messageCall';
    isVideo: boolean;
    discard_reason: any;
    duration: number;
  }

  export interface MessageChatAddMembers extends Object {
    '@type': 'messageChatAddMembers';
    member_user_ids: (number | string)[];
  }

  export interface MessageChatDeleteMember extends Object {
    '@type': 'messageChatDeleteMember';
    user_id: number | string;
  }

  export interface MessageChatChangeTitle extends Object {
    '@type': 'messageChatChangeTitle';
    title: string;
  }

  export interface DraftMessage extends Object {
    '@type': 'draftMessage';
    reply_to_message_id: number | string;
    date: number;
    input_message_text: any;
  }

  // Updates from TDLib
  export type Update =
    | UpdateAuthorizationState
    | UpdateNewMessage
    | UpdateMessageSendSucceeded
    | UpdateMessageSendFailed
    | UpdateMessageContent
    | UpdateMessageEdited
    | UpdateDeleteMessages
    | UpdateUser
    | UpdateUserStatus
    | UpdateNewChat
    | UpdateChatTitle
    | UpdateChatPhoto
    | UpdateChatLastMessage
    | UpdateChatPosition
    | UpdateChatReadInbox
    | UpdateChatReadOutbox
    | UpdateChatUnreadMentionCount
    | UpdateChatNotificationSettings
    | UpdateConnectionState;

  export interface UpdateAuthorizationState extends Object {
    '@type': 'updateAuthorizationState';
    authorization_state: AuthorizationState;
  }

  export interface UpdateNewMessage extends Object {
    '@type': 'updateNewMessage';
    message: Message;
  }

  export interface UpdateMessageSendSucceeded extends Object {
    '@type': 'updateMessageSendSucceeded';
    message: Message;
    old_message_id: number | string;
  }

  export interface UpdateMessageSendFailed extends Object {
    '@type': 'updateMessageSendFailed';
    message: Message;
    old_message_id: number | string;
    error_code: number;
    error_message: string;
  }

  export interface UpdateMessageContent extends Object {
    '@type': 'updateMessageContent';
    chat_id: number | string;
    message_id: number | string;
    new_content: MessageContent;
  }

  export interface UpdateMessageEdited extends Object {
    '@type': 'updateMessageEdited';
    chat_id: number | string;
    message_id: number | string;
    edit_date: number;
    reply_markup?: any;
  }

  export interface UpdateDeleteMessages extends Object {
    '@type': 'updateDeleteMessages';
    chat_id: number | string;
    message_ids: (number | string)[];
    is_permanent: boolean;
    from_cache: boolean;
  }

  export interface UpdateUser extends Object {
    '@type': 'updateUser';
    user: User;
  }

  export interface UpdateUserStatus extends Object {
    '@type': 'updateUserStatus';
    user_id: number | string;
    status: UserStatus;
  }

  export interface UpdateNewChat extends Object {
    '@type': 'updateNewChat';
    chat: Chat;
  }

  export interface UpdateChatTitle extends Object {
    '@type': 'updateChatTitle';
    chat_id: number | string;
    title: string;
  }

  export interface UpdateChatPhoto extends Object {
    '@type': 'updateChatPhoto';
    chat_id: number | string;
    photo?: ChatPhotoInfo;
  }

  export interface UpdateChatLastMessage extends Object {
    '@type': 'updateChatLastMessage';
    chat_id: number | string;
    last_message?: Message;
    positions: ChatPosition[];
  }

  export interface UpdateChatPosition extends Object {
    '@type': 'updateChatPosition';
    chat_id: number | string;
    position: ChatPosition;
  }

  export interface UpdateChatReadInbox extends Object {
    '@type': 'updateChatReadInbox';
    chat_id: number | string;
    last_read_inbox_message_id: number | string;
    unread_count: number;
  }

  export interface UpdateChatReadOutbox extends Object {
    '@type': 'updateChatReadOutbox';
    chat_id: number | string;
    last_read_outbox_message_id: number | string;
  }

  export interface UpdateChatUnreadMentionCount extends Object {
    '@type': 'updateChatUnreadMentionCount';
    chat_id: number | string;
    unread_mention_count: number;
  }

  export interface UpdateChatNotificationSettings extends Object {
    '@type': 'updateChatNotificationSettings';
    chat_id: number | string;
    notification_settings: ChatNotificationSettings;
  }

  export interface UpdateConnectionState extends Object {
    '@type': 'updateConnectionState';
    state:
      | { '@type': 'connectionStateWaitingForNetwork' }
      | { '@type': 'connectionStateConnectingToProxy' }
      | { '@type': 'connectionStateConnecting' }
      | { '@type': 'connectionStateUpdating' }
      | { '@type': 'connectionStateReady' };
  }

  // Core Request Types
  export interface SetTdlibParameters extends Object {
    '@type': 'setTdlibParameters';
    use_test_dc?: boolean;
    database_directory?: string;
    files_directory?: string;
    use_file_database?: boolean;
    use_chat_info_database?: boolean;
    use_message_database?: boolean;
    use_secret_chats?: boolean;
    api_id: number;
    api_hash: string;
    system_language_code: string;
    device_model: string;
    system_version: string;
    application_version: string;
    enable_storage_optimizer?: boolean;
    ignore_file_names?: boolean;
  }

  export interface CheckDatabaseEncryptionKey extends Object {
    '@type': 'checkDatabaseEncryptionKey';
    encryption_key?: string;
  }

  export interface SetAuthenticationPhoneNumber extends Object {
    '@type': 'setAuthenticationPhoneNumber';
    phone_number: string;
    settings?: any;
  }

  export interface CheckAuthenticationCode extends Object {
    '@type': 'checkAuthenticationCode';
    code: string;
  }

  export interface RegisterUser extends Object {
    '@type': 'registerUser';
    first_name: string;
    last_name?: string;
  }

  export interface CheckAuthenticationPassword extends Object {
    '@type': 'checkAuthenticationPassword';
    password: string;
  }

  export interface LogOut extends Object {
    '@type': 'logOut';
  }

  export interface GetChats extends Object {
    '@type': 'getChats';
    chat_list?: any;
    limit: number;
  }

  export interface GetChat extends Object {
    '@type': 'getChat';
    chat_id: number | string;
  }

  export interface GetChatHistory extends Object {
    '@type': 'getChatHistory';
    chat_id: number | string;
    from_message_id: number | string;
    offset: number;
    limit: number;
    only_local: boolean;
  }

  export interface SendMessage extends Object {
    '@type': 'sendMessage';
    chat_id: number | string;
    message_thread_id?: number | string;
    reply_to_message_id?: number | string;
    options?: any;
    reply_markup?: any;
    input_message_content: any;
  }

  export interface ViewMessages extends Object {
    '@type': 'viewMessages';
    chat_id: number | string;
    message_thread_id?: number | string;
    message_ids: (number | string)[];
    force_read: boolean;
  }

  export interface DeleteMessages extends Object {
    '@type': 'deleteMessages';
    chat_id: number | string;
    message_ids: (number | string)[];
    revoke: boolean;
  }

  export interface JoinChatByInviteLink extends Object {
    '@type': 'joinChatByInviteLink';
    invite_link: string;
  }

  export interface CheckChatInviteLink extends Object {
    '@type': 'checkChatInviteLink';
    invite_link: string;
  }
}
