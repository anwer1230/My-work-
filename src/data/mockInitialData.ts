import { Chat, ChatFolder, Message, UserProfile } from '../types';

export const initialUserProfile: UserProfile = {
  id: '',
  uid: '',
  name: '',
  first_name: '',
  last_name: '',
  username: '',
  phone: '',
  bio: '',
  photo: null,
  has_2fa: false,
  hint_2fa: '',
};

export const initialFolders: ChatFolder[] = [
  { id: 'all', title: 'الكل', icon: '💬', chat_ids: [] },
];

export const initialChats: Chat[] = [];

export const initialMessagesMap: Record<number, Message[]> = {};
