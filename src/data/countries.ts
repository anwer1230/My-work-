export interface Country {
  name: string;
  nativeName: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: 'Yemen', nativeName: 'اليمن', code: 'YE', dialCode: '+967', flag: '🇾🇪' },
  { name: 'Saudi Arabia', nativeName: 'المملكة العربية السعودية', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Egypt', nativeName: 'مصر', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'United Arab Emirates', nativeName: 'الإمارات', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Kuwait', nativeName: 'الكويت', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Qatar', nativeName: 'قطر', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Oman', nativeName: 'عمان', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Bahrain', nativeName: 'البحرين', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Jordan', nativeName: 'الأردن', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
  { name: 'Iraq', nativeName: 'العراق', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
  { name: 'Syria', nativeName: 'سوريا', code: 'SY', dialCode: '+963', flag: '🇸🇾' },
  { name: 'Lebanon', nativeName: 'لبنان', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
  { name: 'Palestine', nativeName: 'فلسطين', code: 'PS', dialCode: '+970', flag: '🇵🇸' },
  { name: 'Morocco', nativeName: 'المغرب', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Algeria', nativeName: 'الجزائر', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Tunisia', nativeName: 'تونس', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'Libya', nativeName: 'ليبيا', code: 'LY', dialCode: '+218', flag: '🇱🇾' },
  { name: 'Sudan', nativeName: 'السودان', code: 'SD', dialCode: '+249', flag: '🇸🇩' },
  { name: 'United States', nativeName: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', nativeName: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Germany', nativeName: 'Deutschland', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', nativeName: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Russia', nativeName: 'Россия', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'Turkey', nativeName: 'Türkiye', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'India', nativeName: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'China', nativeName: '中国', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Canada', nativeName: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Brazil', nativeName: 'Brasil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
];
