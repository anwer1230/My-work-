import React from 'react';

export interface MemberTagProps {
  role?: 'owner' | 'admin' | 'moderator' | 'vip' | 'bot' | 'member' | string;
  customTitle?: string;
  color?: string;
  lang?: 'ar' | 'en';
}

export const MemberTagBadge: React.FC<MemberTagProps> = ({
  role,
  customTitle,
  color,
  lang = 'ar',
}) => {
  if (!role && !customTitle) return null;

  const roleConfigs: Record<string, { labelAr: string; labelEn: string; icon: string; bg: string; color: string }> = {
    owner: {
      labelAr: 'مالك',
      labelEn: 'Owner',
      icon: 'fas fa-crown',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
    },
    creator: {
      labelAr: 'منشئ',
      labelEn: 'Creator',
      icon: 'fas fa-crown',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
    },
    admin: {
      labelAr: 'مشرف',
      labelEn: 'Admin',
      icon: 'fas fa-shield-alt',
      bg: 'rgba(56, 189, 248, 0.15)',
      color: '#38bdf8',
    },
    administrator: {
      labelAr: 'مشرف',
      labelEn: 'Admin',
      icon: 'fas fa-shield-alt',
      bg: 'rgba(56, 189, 248, 0.15)',
      color: '#38bdf8',
    },
    moderator: {
      labelAr: 'مراقب',
      labelEn: 'Moderator',
      icon: 'fas fa-user-shield',
      bg: 'rgba(168, 85, 247, 0.15)',
      color: '#a855f7',
    },
    vip: {
      labelAr: 'VIP',
      labelEn: 'VIP',
      icon: 'fas fa-star',
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
    },
    bot: {
      labelAr: 'بوت',
      labelEn: 'Bot',
      icon: 'fas fa-robot',
      bg: 'rgba(244, 63, 94, 0.15)',
      color: '#f43f5e',
    },
  };

  const key = (role || '').toLowerCase();
  const config = roleConfigs[key] || {
    labelAr: customTitle || role || 'عضو',
    labelEn: customTitle || role || 'Member',
    icon: 'fas fa-tag',
    bg: 'rgba(148, 163, 184, 0.12)',
    color: color || '#94a3b8',
  };

  const displayText = customTitle || (lang === 'ar' ? config.labelAr : config.labelEn);

  return (
    <span
      className="member-tag-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        padding: '1px 6px',
        borderRadius: 6,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}33`,
        marginLeft: lang === 'ar' ? 0 : 6,
        marginRight: lang === 'ar' ? 6 : 0,
        verticalAlign: 'middle',
        letterSpacing: '0.2px',
      }}
    >
      <i className={config.icon} style={{ fontSize: 9 }} />
      <span>{displayText}</span>
    </span>
  );
};
