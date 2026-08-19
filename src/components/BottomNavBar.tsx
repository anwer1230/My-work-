import React from 'react';

export type BottomNavTab = 'chats' | 'contacts' | 'automation' | 'settings';

interface BottomNavBarProps {
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
  unreadTotal?: number;
  lang?: 'ar' | 'en';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  unreadTotal = 0,
  lang = 'ar',
}) => {
  const tabs: { id: BottomNavTab; labelAr: string; labelEn: string; icon: string; badge?: number }[] = [
    {
      id: 'chats',
      labelAr: 'المحادثات',
      labelEn: 'Chats',
      icon: 'fas fa-comments',
      badge: unreadTotal > 0 ? unreadTotal : undefined,
    },
    {
      id: 'contacts',
      labelAr: 'جهات الاتصال',
      labelEn: 'Contacts',
      icon: 'fas fa-user-friends',
    },
    {
      id: 'automation',
      labelAr: 'الأتمتة والـ AI',
      labelEn: 'AI & Automation',
      icon: 'fas fa-wand-magic-sparkles',
    },
    {
      id: 'settings',
      labelAr: 'الإعدادات',
      labelEn: 'Settings',
      icon: 'fas fa-cog',
    },
  ];

  return (
    <div
      id="telegram-bottom-nav"
      className="bottom-nav-container"
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 45,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: 'var(--surface, #1e293b)',
        borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
        padding: '6px 12px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            id={`nav-btn-${t.id}`}
            onClick={() => onSelectTab(t.id)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 16px',
              borderRadius: 16,
              color: isActive ? 'var(--tg-blue, #38bdf8)' : 'var(--text2, #94a3b8)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 28,
                borderRadius: 14,
                background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                transition: 'background 0.2s ease',
              }}
            >
              <i className={t.icon} style={{ fontSize: 16, transition: 'transform 0.2s ease' }} />
              {t.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '1.5px solid var(--surface, #1e293b)',
                  }}
                >
                  {t.badge > 99 ? '99+' : t.badge}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.2px',
                whiteSpace: 'nowrap',
              }}
            >
              {lang === 'ar' ? t.labelAr : t.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
};
