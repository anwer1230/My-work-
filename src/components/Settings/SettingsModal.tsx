import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Palette, 
  Sliders, 
  Lock, 
  Volume2, 
  Database, 
  Check, 
  Camera, 
  Sparkles,
  Smartphone,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Sparkle
} from 'lucide-react';
import { User, AppSettings, ThemeMode } from '../../types/telegram';
import { WALLPAPER_PRESETS, WallpaperOption, getWallpaperStyle } from '../../data/wallpapers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  settings: AppSettings;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
}

export const THEMES: { id: ThemeMode; name: string; color: string; bg: string }[] = [
  { id: 'dark', name: 'Telegram Dark', color: '#0ea5e9', bg: '#171717' },
  { id: 'telegram', name: 'Classic Blue', color: '#38bdf8', bg: '#0f172a' },
  { id: 'midnight', name: 'Midnight AMOLED', color: '#6366f1', bg: '#000000' },
  { id: 'emerald', name: 'Emerald Forest', color: '#10b981', bg: '#064e3b' },
  { id: 'sunset', name: 'Sunset Amber', color: '#f59e0b', bg: '#451a03' },
  { id: 'light', name: 'Day Light', color: '#0284c7', bg: '#f8fafc' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'privacy'>('profile');
  const [wallpaperCategory, setWallpaperCategory] = useState<'all' | 'patterns' | 'gradients' | 'nature' | 'custom'>('all');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  // Profile edit states
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [phone, setPhone] = useState(currentUser.phone || '');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      username: username.replace(/^@/, ''),
      bio,
      phone,
    });
    onClose();
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateSettings({ wallpaper: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customImageUrl.trim()) {
      onUpdateSettings({ wallpaper: customImageUrl.trim() });
      setCustomImageUrl('');
      setShowUrlInput(false);
    }
  };

  const filteredWallpapers = wallpaperCategory === 'all' 
    ? WALLPAPER_PRESETS 
    : WALLPAPER_PRESETS.filter((w) => w.category === wallpaperCategory);

  const isCustomWallpaper = !WALLPAPER_PRESETS.some((w) => w.id === settings.wallpaper);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh] animate-in zoom-in-95 select-none">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-neutral-100 text-base">Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 p-1.5 bg-neutral-950/60 border-b border-neutral-800/80 text-xs font-semibold text-center">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'profile' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <UserIcon className="w-4 h-4" /> Profile
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-2 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'appearance' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Palette className="w-4 h-4" /> Appearance
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'privacy' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Lock className="w-4 h-4" /> Privacy
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="relative group cursor-pointer">
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover shadow-md ring-2 ring-sky-500/50"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                      {name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-sky-400 font-medium cursor-pointer hover:underline">
                  Change Profile Photo
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Username</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-neutral-500 text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl pl-8 pr-3.5 py-2 text-sm text-neutral-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500 rounded-xl px-3.5 py-2 text-sm text-neutral-100 focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Color Themes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">Color Theme</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => onUpdateSettings({ theme: th.id })}
                      className={`p-3 rounded-2xl border flex items-center gap-3 text-left transition-all ${
                        settings.theme === th.id
                          ? 'border-sky-500 bg-sky-500/15 ring-2 ring-sky-500/20'
                          : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/40'
                      }`}
                    >
                      <div 
                        style={{ backgroundColor: th.color }} 
                        className="w-6 h-6 rounded-full border-2 border-white/20 shadow-xs shrink-0" 
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-neutral-200 truncate">{th.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Wallpaper Gallery */}
              <div className="p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-neutral-200">Chat Background & Wallpaper</span>
                  </div>
                  {settings.wallpaper !== 'default' && (
                    <button
                      onClick={() => onUpdateSettings({ wallpaper: 'default' })}
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
                      title="Reset to default"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>

                {/* Wallpaper Categories Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-[11px]">
                  {(['all', 'patterns', 'gradients', 'nature'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setWallpaperCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-colors whitespace-nowrap ${
                        wallpaperCategory === cat
                          ? 'bg-sky-500 text-white'
                          : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Live Wallpapers Grid */}
                <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {filteredWallpapers.map((wp) => {
                    const isSelected = settings.wallpaper === wp.id;
                    const isImageThumbnail = wp.thumbnail.startsWith('http');

                    return (
                      <button
                        key={wp.id}
                        onClick={() => onUpdateSettings({ wallpaper: wp.id })}
                        className={`group relative h-20 rounded-xl overflow-hidden border transition-all text-left flex flex-col justify-end p-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-sky-400 ring-2 ring-sky-500/50 shadow-md shadow-sky-500/20'
                            : 'border-neutral-800 hover:border-neutral-600'
                        }`}
                        title={wp.name}
                      >
                        {/* Background Thumbnail Preview */}
                        {isImageThumbnail ? (
                          <img 
                            src={wp.thumbnail} 
                            alt={wp.name} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div 
                            style={{ background: wp.thumbnail }} 
                            className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        {/* Subtle dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                        {/* Name & Active Indicator */}
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <span className="text-[10px] font-semibold text-white truncate max-w-[80%] leading-tight drop-shadow-xs">
                            {wp.name}
                          </span>
                          {isSelected && (
                            <span className="p-0.5 bg-sky-500 text-white rounded-full shrink-0 shadow-xs">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Wallpaper Actions (Upload & URL) */}
                <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 rounded-xl text-xs font-medium cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCustomFileUpload} 
                      className="hidden" 
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      showUrlInput
                        ? 'bg-sky-500 text-white border-sky-500'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Image Link</span>
                  </button>
                </div>

                {/* Custom URL Input Field */}
                {showUrlInput && (
                  <form onSubmit={handleApplyCustomUrl} className="flex gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-sky-500 rounded-xl px-3 py-1.5 text-xs text-neutral-100 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={!customImageUrl.trim()}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Custom Wallpaper Indicator */}
                {isCustomWallpaper && (
                  <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="text-sky-300 font-medium">Custom Wallpaper Active</span>
                    </div>
                    <button
                      onClick={() => onUpdateSettings({ wallpaper: 'default' })}
                      className="text-xs text-neutral-400 hover:text-neutral-200 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Message Bubble Radius Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-300">Message Corners Radius</span>
                  <span className="font-mono text-sky-400">{settings.bubbleRadius}px</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={24}
                  value={settings.bubbleRadius}
                  onChange={(e) => onUpdateSettings({ bubbleRadius: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Sharp (4px)</span>
                  <span>Default (14px)</span>
                  <span>Pill (24px)</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3 border-t border-neutral-800/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">Sound Effects</span>
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">Fluid Animations</span>
                  <input
                    type="checkbox"
                    checked={settings.animations}
                    onChange={(e) => onUpdateSettings({ animations: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">Send with Enter (Shift+Enter for newline)</span>
                  <input
                    type="checkbox"
                    checked={settings.sendOnEnter}
                    onChange={(e) => onUpdateSettings({ sendOnEnter: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-neutral-950/60 rounded-2xl border border-neutral-800 flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-neutral-200">End-to-End Encryption</div>
                  <div className="text-neutral-400 mt-0.5 text-[11px] leading-relaxed">
                    Voice calls, secret messages, and media transfers are encrypted with modern cryptographic keys.
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-950/60 rounded-2xl border border-neutral-800 space-y-3">
                <div className="font-semibold text-neutral-200">Privacy Permissions</div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Last Seen & Online</span>
                  <span className="text-sky-400 font-medium">Everybody</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Profile Photo</span>
                  <span className="text-sky-400 font-medium">Everybody</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Voice Calls</span>
                  <span className="text-sky-400 font-medium">My Contacts</span>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-950/60 rounded-2xl border border-neutral-800 flex items-start gap-3">
                <Database className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-neutral-200">Storage & Cache Usage</div>
                  <div className="text-neutral-400 mt-0.5 text-[11px]">
                    24.8 MB local media cache. Auto-cleans older temporary assets.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
