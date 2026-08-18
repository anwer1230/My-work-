import { UserStory } from '../types/telegram';

export const INITIAL_STORIES: UserStory[] = [
  {
    id: 'story-durov',
    user: {
      id: 'durov',
      name: 'Pavel Durov',
      username: 'durov',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'offline',
      isVerified: true,
    },
    isViewed: false,
    stories: [
      {
        id: 'st-1',
        mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        mediaType: 'photo',
        timestamp: '2h ago',
        caption: 'Over 900 Million active users on Telegram this month! Freedom & Speed ⚡',
        viewsCount: 418290,
        reactionsCount: 84920,
      },
      {
        id: 'st-2',
        mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        mediaType: 'photo',
        timestamp: '1h ago',
        caption: 'Peaceful mountains in Switzerland 🏔️ Building the future of privacy.',
        viewsCount: 290120,
        reactionsCount: 42100,
      }
    ],
  },
  {
    id: 'story-elena',
    user: {
      id: 'elena_rostova',
      name: 'Elena Rostova',
      username: 'elena_r',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'online',
    },
    isViewed: false,
    stories: [
      {
        id: 'st-elena-1',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        mediaType: 'photo',
        timestamp: '4h ago',
        caption: 'New UI design sprint complete! Clean gradients and typography ✨',
        viewsCount: 1420,
        reactionsCount: 312,
      }
    ],
  },
  {
    id: 'story-sarah',
    user: {
      id: 'sarah_chen',
      name: 'Sarah Chen',
      username: 'sarah_c',
      avatarColor: 'from-emerald-500 to-teal-700',
      status: 'online',
    },
    isViewed: false,
    stories: [
      {
        id: 'st-sarah-1',
        mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        mediaType: 'photo',
        timestamp: '6h ago',
        caption: 'Shipping the new WebAssembly engine 🚀 Zero bundle overhead!',
        viewsCount: 920,
        reactionsCount: 184,
      }
    ],
  }
];
