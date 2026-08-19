import type { CSSProperties } from 'react';

export interface WallpaperOption {
  id: string;
  name: string;
  nameAr: string;
  category: 'patterns' | 'gradients' | 'nature' | 'custom';
  thumbnail: string;
  // CSS styling properties
  bgStyle: CSSProperties;
  overlayOpacity?: number; // 0 to 1 for darkness overlay
}

export const WALLPAPER_PRESETS: WallpaperOption[] = [
  {
    id: 'default',
    name: 'Classic Telegram Pattern',
    nameAr: 'نمط تيليجرام الكلاسيكي',
    category: 'patterns',
    thumbnail: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
    bgStyle: {
      backgroundColor: '#0c0f17',
      backgroundImage: `radial-gradient(circle, rgba(56, 189, 248, 0.15) 1.5px, transparent 1.5px), radial-gradient(circle, rgba(147, 197, 253, 0.1) 1px, transparent 1px)`,
      backgroundSize: '24px 24px, 48px 48px',
      backgroundPosition: '0 0, 12px 12px',
    },
    overlayOpacity: 0.2,
  },
  {
    id: 'telegram_doodle',
    name: 'Telegram Doodles',
    nameAr: 'رسومات تيليجرام التعبيرية',
    category: 'patterns',
    thumbnail: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)',
    bgStyle: {
      backgroundColor: '#08121f',
      backgroundImage: `radial-gradient(ellipse at top, #0c2340, #040810)`,
    },
    overlayOpacity: 0.15,
  },
  {
    id: 'constellations',
    name: 'Cosmic Constellations',
    nameAr: 'الأبراج والنجوم الكونية',
    category: 'patterns',
    thumbnail: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    bgStyle: {
      backgroundColor: '#09071b',
      backgroundImage: `radial-gradient(1px 1px at 20px 30px, #ffffff 100%, transparent), radial-gradient(1px 1px at 40px 70px, #ffffff 100%, transparent), radial-gradient(1.5px 1.5px at 90px 40px, #38bdf8 100%, transparent), radial-gradient(1px 1px at 160px 120px, #c084fc 100%, transparent), radial-gradient(2px 2px at 230px 190px, #ffffff 100%, transparent), radial-gradient(1.5px 1.5px at 290px 80px, #f43f5e 100%, transparent)`,
      backgroundSize: '320px 320px',
      backgroundRepeat: 'repeat',
    },
    overlayOpacity: 0.1,
  },
  {
    id: 'cyber_grid',
    name: 'Cyberpunk Neon Grid',
    nameAr: 'شبكة السايبربانك النيون',
    category: 'patterns',
    thumbnail: 'linear-gradient(135deg, #2e1065 0%, #030712 100%)',
    bgStyle: {
      backgroundColor: '#090514',
      backgroundImage: `linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px)`,
      backgroundSize: '32px 32px',
    },
    overlayOpacity: 0.2,
  },
  {
    id: 'geometric_mesh',
    name: 'Isometric Triangles',
    nameAr: 'مثلثات هندسية حديثة',
    category: 'patterns',
    thumbnail: 'linear-gradient(135deg, #042f2e 0%, #111827 100%)',
    bgStyle: {
      backgroundColor: '#061313',
      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.12) 0%, transparent 60%), linear-gradient(60deg, rgba(20, 184, 166, 0.04) 25%, transparent 25.5%, transparent 75%, rgba(20, 184, 166, 0.04) 75%), linear-gradient(120deg, rgba(20, 184, 166, 0.04) 25%, transparent 25.5%, transparent 75%, rgba(20, 184, 166, 0.04) 75%)`,
      backgroundSize: '100% 100%, 40px 70px, 40px 70px',
    },
    overlayOpacity: 0.25,
  },
  {
    id: 'sunset_glow',
    name: 'Sunset Amber Glow',
    nameAr: 'توهج غروب الشمس الدافئ',
    category: 'gradients',
    thumbnail: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #1c1917 100%)',
    bgStyle: {
      backgroundColor: '#140c06',
      backgroundImage: `linear-gradient(165deg, rgba(245, 158, 11, 0.18) 0%, rgba(225, 29, 72, 0.12) 40%, rgba(15, 10, 8, 0.95) 85%)`,
    },
    overlayOpacity: 0.2,
  },
  {
    id: 'emerald_aurora',
    name: 'Northern Emerald Aurora',
    nameAr: 'الشفق القطبي الزمردي',
    category: 'gradients',
    thumbnail: 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #0f172a 100%)',
    bgStyle: {
      backgroundColor: '#04120e',
      backgroundImage: `radial-gradient(circle at top right, rgba(16, 185, 129, 0.22) 0%, transparent 60%), radial-gradient(circle at bottom left, rgba(6, 95, 70, 0.2) 0%, transparent 50%), linear-gradient(180deg, #04120e 0%, #020806 100%)`,
    },
    overlayOpacity: 0.15,
  },
  {
    id: 'ocean_depths',
    name: 'Deep Pacific Abyss',
    nameAr: 'أعماق المحيط الهادئ',
    category: 'gradients',
    thumbnail: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #020617 100%)',
    bgStyle: {
      backgroundColor: '#030d17',
      backgroundImage: `radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(2, 132, 199, 0.15) 0%, transparent 50%), linear-gradient(180deg, #030d17 0%, #010408 100%)`,
    },
    overlayOpacity: 0.15,
  },
  {
    id: 'midnight_nebula',
    name: 'Deep Midnight Nebula',
    nameAr: 'سديم منتصف الليل البنفسجي',
    category: 'gradients',
    thumbnail: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 50%, #09090b 100%)',
    bgStyle: {
      backgroundColor: '#06030c',
      backgroundImage: `radial-gradient(circle at top left, rgba(168, 85, 247, 0.22) 0%, transparent 50%), radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.18) 0%, transparent 50%), linear-gradient(180deg, #06030c 0%, #020104 100%)`,
    },
    overlayOpacity: 0.15,
  },
  {
    id: 'alpine_mountains',
    name: 'Misty Alpine Peaks',
    nameAr: 'قمم الجبال الألبية الضبابية',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80',
    bgStyle: {
      backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&auto=format&fit=crop&q=85')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    overlayOpacity: 0.7,
  },
  {
    id: 'desert_dunes',
    name: 'Golden Desert Dunes',
    nameAr: 'كثبان الصحراء الذهبية',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&auto=format&fit=crop&q=80',
    bgStyle: {
      backgroundImage: `url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1600&auto=format&fit=crop&q=85')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    overlayOpacity: 0.65,
  },
  {
    id: 'tokyo_night',
    name: 'Tokyo Neon Cityscape',
    nameAr: 'أضواء طوكيو الليلية',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=300&auto=format&fit=crop&q=80',
    bgStyle: {
      backgroundImage: `url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&auto=format&fit=crop&q=85')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    overlayOpacity: 0.7,
  },
  {
    id: 'minimal_dots',
    name: 'Minimalist Subtle Grid',
    nameAr: 'نقاط شبكية هادئة وبسيطة',
    category: 'patterns',
    thumbnail: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    bgStyle: {
      backgroundColor: '#0a0a0c',
      backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
      backgroundSize: '16px 16px',
    },
    overlayOpacity: 0.1,
  },
];

export function getWallpaperStyle(wallpaperIdOrUrl: string): CSSProperties {
  // Check if it's a known preset ID
  const preset = WALLPAPER_PRESETS.find((p) => p.id === wallpaperIdOrUrl);
  if (preset) {
    return preset.bgStyle;
  }

  // If it starts with http or data:image, treat as custom image
  if (wallpaperIdOrUrl.startsWith('http') || wallpaperIdOrUrl.startsWith('data:image')) {
    return {
      backgroundImage: `url('${wallpaperIdOrUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  // Fallback to default preset
  return WALLPAPER_PRESETS[0].bgStyle;
}
