// Authentic Telegram Lottie Vector Animation Data & Custom Emoji Packs
// Designed for 60FPS fluid rendering and zero-latency loading

export interface LottieStickerItem {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  category: 'duck' | 'crypto' | 'party' | 'reaction' | 'dev' | 'premium';
  packName: string;
  lottieData: any;
  previewSvg?: string;
}

export interface CustomEmojiItem {
  code: string; // e.g. ":ton_gem:"
  name: string;
  nameAr: string;
  packName: string;
  emojiFallback: string;
  color: string;
  lottieData?: any;
  svgIcon: string;
}

// 1. Lottie JSON Generator Helpers for lightweight, ultra-smooth 60fps animations
export const LOTTIE_HEART_PULSE = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: 'Heart Pulse',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Heart Shape',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, t: 0, s: [90, 90, 100] },
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, t: 30, s: [120, 120, 100] },
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, t: 60, s: [100, 100, 100] },
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, t: 90, s: [125, 125, 100] },
            { t: 120, s: [90, 90, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [
                    [0, 0],
                    [-18, -18],
                    [-22, 14],
                    [0, 32],
                    [22, 14],
                    [18, -18],
                  ],
                  o: [
                    [0, 0],
                    [18, -18],
                    [0, 32],
                    [-22, 14],
                    [-18, -18],
                    [0, 0],
                  ],
                  v: [
                    [0, -15],
                    [35, -50],
                    [65, 0],
                    [0, 65],
                    [-65, 0],
                    [-35, -50],
                  ],
                },
              },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.95, 0.2, 0.3, 1] },
              o: { a: 0, k: 100 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
    },
  ],
};

export const LOTTIE_TON_GEM = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: 'TON Space Diamond',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Gem Body',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 60, s: [8] },
            { t: 120, s: [0] },
          ],
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 0] },
            { t: 60, s: [100, 92, 0] },
            { t: 120, s: [100, 100, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 60, s: [108, 108, 100] },
            { t: 120, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  v: [
                    [0, -65],
                    [60, -20],
                    [38, 55],
                    [-38, 55],
                    [-60, -20],
                  ],
                },
              },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.14, 0.58, 0.94, 1] },
              o: { a: 0, k: 100 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
    },
  ],
};

export const LOTTIE_FIRE_FLAME = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: 'Fire Flame',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Flame Outer',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-4] },
            { t: 45, s: [5] },
            { t: 90, s: [-4] },
          ],
        },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [95, 105, 100] },
            { t: 45, s: [105, 95, 100] },
            { t: 90, s: [95, 105, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [
                    [0, 0],
                    [20, 20],
                    [25, -20],
                    [-10, -35],
                    [-25, 20],
                    [-20, 20],
                  ],
                  o: [
                    [-20, -20],
                    [-25, -20],
                    [10, 35],
                    [25, 20],
                    [20, -20],
                    [0, 0],
                  ],
                  v: [
                    [0, -70],
                    [-45, -10],
                    [-40, 50],
                    [0, 70],
                    [45, 50],
                    [35, -20],
                  ],
                },
              },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [1.0, 0.42, 0.08, 1] },
              o: { a: 0, k: 100 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
    },
  ],
};

export const LOTTIE_PARTY_POPPER = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: 'Party Celebration',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Popper Cone',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-15] },
            { t: 30, s: [-30] },
            { t: 60, s: [-10] },
            { t: 90, s: [-15] },
          ],
        },
        p: { a: 0, k: [100, 110, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 30, s: [115, 115, 100] },
            { t: 90, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [
                    [-40, 50],
                    [40, 50],
                    [0, -40],
                  ],
                },
              },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.95, 0.75, 0.1, 1] },
              o: { a: 0, k: 100 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
    },
  ],
};

export const LOTTIE_ROCKET_BOOST = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: 'Rocket Launch',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Rocket Body',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 45 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [100, 105, 0] },
            { t: 45, s: [100, 85, 0] },
            { t: 90, s: [100, 105, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [95, 95, 100] },
            { t: 45, s: [108, 108, 100] },
            { t: 90, s: [95, 95, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [[0, 0], [15, 0], [0, 20], [-15, 0]],
                  o: [[0, -20], [-15, 0], [0, 0], [15, 0]],
                  v: [
                    [0, -50],
                    [25, 10],
                    [0, 50],
                    [-25, 10],
                  ],
                },
              },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.95, 0.25, 0.3, 1] },
              o: { a: 0, k: 100 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
    },
  ],
};

export const LOTTIE_DUCK_WINK = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: 'Duck Wink Mascot',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Duck Head',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-6] },
            { t: 60, s: [6] },
            { t: 120, s: [-6] },
          ],
        },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 60, s: [105, 105, 100] },
            { t: 120, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'el',
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [110, 110] },
            },
            {
              ty: 'fl',
              c: { a: 0, k: [1.0, 0.82, 0.15, 1] },
              o: { a: 0, k: 100 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
    },
  ],
};

// 2. Full Animated Sticker Collection (Lottie TGS Format)
export const ANIMATED_TELEGRAM_STICKERS: LottieStickerItem[] = [
  {
    id: 'tg_st_duck_wink',
    name: 'Duck Mascot Wink',
    nameAr: 'بطة تيليجرام غمزة',
    emoji: '🦆',
    category: 'duck',
    packName: 'Telegram Official Ducks',
    lottieData: LOTTIE_DUCK_WINK,
  },
  {
    id: 'tg_st_ton_gem',
    name: 'TON Diamond Space',
    nameAr: 'جوهرة شبكة TON',
    emoji: '💎',
    category: 'crypto',
    packName: 'TON Ecosystem Animated',
    lottieData: LOTTIE_TON_GEM,
  },
  {
    id: 'tg_st_heart_pulse',
    name: 'Heart Beat Romance',
    nameAr: 'قلب ينبض بحب',
    emoji: '❤️',
    category: 'reaction',
    packName: 'Telegram Reactions Pack',
    lottieData: LOTTIE_HEART_PULSE,
  },
  {
    id: 'tg_st_fire_flame',
    name: 'Mega Fire Flame',
    nameAr: 'شعلة نار متوهجة',
    emoji: '🔥',
    category: 'reaction',
    packName: 'Telegram Reactions Pack',
    lottieData: LOTTIE_FIRE_FLAME,
  },
  {
    id: 'tg_st_party_popper',
    name: 'Party Confetti Popper',
    nameAr: 'احتفال وفرقعة حفلات',
    emoji: '🎉',
    category: 'party',
    packName: 'Celebrations & Events',
    lottieData: LOTTIE_PARTY_POPPER,
  },
  {
    id: 'tg_st_rocket_boost',
    name: 'Rocket To The Moon',
    nameAr: 'صاروخ إلى القمر',
    emoji: '🚀',
    category: 'crypto',
    packName: 'Telegram Stars & Boosts',
    lottieData: LOTTIE_ROCKET_BOOST,
  },
];

// 3. Custom Emoji Packs (Telegram Premium Custom Emojis)
export const TELEGRAM_CUSTOM_EMOJI_SETS: {
  packId: string;
  packName: string;
  packNameAr: string;
  emojis: CustomEmojiItem[];
}[] = [
  {
    packId: 'pack_ton_crypto',
    packName: 'TON & Web3 Stars',
    packNameAr: 'رموز TON ورموز العملات',
    emojis: [
      {
        code: ':ton_gem:',
        name: 'TON Diamond',
        nameAr: 'جوهرة TON',
        packName: 'TON & Web3 Stars',
        emojiFallback: '💎',
        color: '#0088cc',
        lottieData: LOTTIE_TON_GEM,
        svgIcon: '💎',
      },
      {
        code: ':star_gold:',
        name: 'Telegram Star',
        nameAr: 'نجمة تيليجرام الذهبية',
        packName: 'TON & Web3 Stars',
        emojiFallback: '⭐',
        color: '#f59e0b',
        lottieData: LOTTIE_PARTY_POPPER,
        svgIcon: '⭐',
      },
      {
        code: ':rocket_speed:',
        name: 'Moon Rocket',
        nameAr: 'صاروخ الارتفاع',
        packName: 'TON & Web3 Stars',
        emojiFallback: '🚀',
        color: '#ef4444',
        lottieData: LOTTIE_ROCKET_BOOST,
        svgIcon: '🚀',
      },
      {
        code: ':verified_badge:',
        name: 'Verified Checkmark',
        nameAr: 'شارة التوثيق الزرقاء',
        packName: 'TON & Web3 Stars',
        emojiFallback: '✅',
        color: '#2481cc',
        lottieData: LOTTIE_DUCK_WINK,
        svgIcon: '🛡️',
      },
    ],
  },
  {
    packId: 'pack_super_reactions',
    packName: 'Premium Animated Reactions',
    packNameAr: 'تفاعلات متحركة بريميوم',
    emojis: [
      {
        code: ':fire_glow:',
        name: 'Glowing Fire',
        nameAr: 'نار متوهجة',
        packName: 'Premium Animated Reactions',
        emojiFallback: '🔥',
        color: '#ff6600',
        lottieData: LOTTIE_FIRE_FLAME,
        svgIcon: '🔥',
      },
      {
        code: ':heart_beat:',
        name: 'Pulsing Heart',
        nameAr: 'قلب نابض',
        packName: 'Premium Animated Reactions',
        emojiFallback: '❤️',
        color: '#f43f5e',
        lottieData: LOTTIE_HEART_PULSE,
        svgIcon: '❤️',
      },
      {
        code: ':party_boom:',
        name: 'Party Popper',
        nameAr: 'فرقعة حفلة',
        packName: 'Premium Animated Reactions',
        emojiFallback: '🎉',
        color: '#eab308',
        lottieData: LOTTIE_PARTY_POPPER,
        svgIcon: '🎉',
      },
      {
        code: ':duck_wink:',
        name: 'Duck Wink',
        nameAr: 'بطة تيليجرام',
        packName: 'Premium Animated Reactions',
        emojiFallback: '🦆',
        color: '#eab308',
        lottieData: LOTTIE_DUCK_WINK,
        svgIcon: '🦆',
      },
      {
        code: ':sparkles_magic:',
        name: 'Magic Sparkles',
        nameAr: 'بريق سحري',
        packName: 'Premium Animated Reactions',
        emojiFallback: '✨',
        color: '#a855f7',
        lottieData: LOTTIE_HEART_PULSE,
        svgIcon: '✨',
      },
      {
        code: ':thumbs_up_flame:',
        name: 'Thumbs Up Power',
        nameAr: 'إعجاب قوي',
        packName: 'Premium Animated Reactions',
        emojiFallback: '👍',
        color: '#22c55e',
        lottieData: LOTTIE_DUCK_WINK,
        svgIcon: '👍',
      },
    ],
  },
];

// Flat lookup dictionary for instant matching by code
export const CUSTOM_EMOJIS_MAP: Record<string, CustomEmojiItem> = {};
TELEGRAM_CUSTOM_EMOJI_SETS.forEach((set) => {
  set.emojis.forEach((item) => {
    CUSTOM_EMOJIS_MAP[item.code] = item;
  });
});
