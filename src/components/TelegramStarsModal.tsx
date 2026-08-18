import React, { useState } from 'react';
import {
  X,
  Star,
  Gift,
  Sparkles,
  TrendingUp,
  History,
  Send,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';

export interface TelegramGiftItem {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  starPrice: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  bgGradient: string;
}

export const TELEGRAM_GIFTS: TelegramGiftItem[] = [
  {
    id: 'gift_star',
    name: 'Shining Star',
    nameAr: 'نجمة متألقة',
    icon: '⭐',
    starPrice: 15,
    rarity: 'common',
    description: 'رمز تقدير لامع ومحبب للجميع',
    bgGradient: 'from-amber-500/20 to-yellow-600/20',
  },
  {
    id: 'gift_rose',
    name: 'Red Rose',
    nameAr: 'وردة حمراء',
    icon: '🌹',
    starPrice: 25,
    rarity: 'common',
    description: 'رمز للمحبة والامتنان والتقدير',
    bgGradient: 'from-rose-500/20 to-red-600/20',
  },
  {
    id: 'gift_cake',
    name: 'Birthday Cake',
    nameAr: 'كعكة الاحتفال',
    icon: '🎂',
    starPrice: 50,
    rarity: 'rare',
    description: 'كعكة احتفالية لذيذة بمناسبة خاصة',
    bgGradient: 'from-pink-500/20 to-purple-600/20',
  },
  {
    id: 'gift_rocket',
    name: 'Space Rocket',
    nameAr: 'صاروخ فضائي',
    icon: '🚀',
    starPrice: 100,
    rarity: 'rare',
    description: 'للمشاريع والمبدعين الذين ينطلقون بسرعة',
    bgGradient: 'from-sky-500/20 to-blue-600/20',
  },
  {
    id: 'gift_diamond',
    name: 'Pure Diamond',
    nameAr: 'ألماسة نادرة',
    icon: '💎',
    starPrice: 250,
    rarity: 'epic',
    description: 'هدية فاخرة تعبر عن القيمة الاستثنائية',
    bgGradient: 'from-cyan-500/20 to-indigo-600/20',
  },
  {
    id: 'gift_crown',
    name: 'Royal Crown',
    nameAr: 'تاج الملوك',
    icon: '👑',
    starPrice: 500,
    rarity: 'legendary',
    description: 'هدية ملكية مميزة ومحدودة الإصدار',
    bgGradient: 'from-amber-400/30 to-yellow-500/30',
  },
];

interface TelegramStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  recipientName?: string;
  recipientId?: string | number;
  onSendGift?: (gift: TelegramGiftItem, message: string, anonymous: boolean) => void;
  lang?: 'ar' | 'en';
}

export const TelegramStarsModal: React.FC<TelegramStarsModalProps> = ({
  isOpen,
  onClose,
  profile,
  recipientName = 'صديق تيليجرام',
  onSendGift,
  lang = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'gifts' | 'history'>('gifts');
  const [starsBalance, setStarsBalance] = useState<number>(() => {
    const saved = localStorage.getItem('tg_stars_balance');
    return saved ? parseInt(saved, 10) : 350;
  });
  const [selectedGift, setSelectedGift] = useState<TelegramGiftItem | null>(TELEGRAM_GIFTS[0]);
  const [giftNote, setGiftNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [giftSuccess, setGiftSuccess] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(100);

  if (!isOpen) return null;

  const handleSendSelectedGift = () => {
    if (!selectedGift) return;
    if (starsBalance < selectedGift.starPrice) {
      alert(lang === 'ar' ? 'رصيد النجوم غير كافٍ! يرجى شحن الرصيد أولاً.' : 'Insufficient Stars balance!');
      setActiveTab('balance');
      return;
    }

    const newBalance = starsBalance - selectedGift.starPrice;
    setStarsBalance(newBalance);
    localStorage.setItem('tg_stars_balance', String(newBalance));

    // Save gift to history
    const historyItem = {
      id: Date.now(),
      type: 'sent_gift',
      gift: selectedGift,
      recipient: recipientName,
      date: new Date().toISOString(),
      note: giftNote,
    };
    const savedHist = JSON.parse(localStorage.getItem('tg_stars_history') || '[]');
    localStorage.setItem('tg_stars_history', JSON.stringify([historyItem, ...savedHist]));

    if (onSendGift) {
      onSendGift(selectedGift, giftNote, isAnonymous);
    }

    setGiftSuccess(true);
    setTimeout(() => {
      setGiftSuccess(false);
      onClose();
    }, 2000);
  };

  const handleTopup = (stars: number) => {
    const newBalance = starsBalance + stars;
    setStarsBalance(newBalance);
    localStorage.setItem('tg_stars_balance', String(newBalance));
    alert(lang === 'ar' ? `تم شحن ${stars} ⭐ بنجاح إلى محفظة تيليجرام!` : `Successfully added ${stars} ⭐!`);
  };

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-4 select-none font-['Cairo',sans-serif]">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" />

      {/* Main Container */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Glowing Stars */}
        <div className="relative p-6 bg-gradient-to-b from-amber-500/20 via-zinc-900 to-zinc-950 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center text-zinc-950 font-black text-2xl">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-zinc-100">
                  {isAr ? 'نجوم وهدايا تيليجرام' : 'Telegram Stars & Gifts'}
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Stars v11+
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isAr ? 'تفاعل، ادعم القنوات والمبدعين، وأرسل هدايا مميزة' : 'Send gifts, support channels & react with Stars'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="px-6 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{isAr ? 'رصيدك الحالي:' : 'Your Balance:'}</span>
            <span className="text-lg font-black text-amber-400 flex items-center gap-1">
              ⭐ {starsBalance.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('balance')}
            className="text-xs bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 px-3 py-1.5 rounded-xl font-bold border border-amber-500/30 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'شحن رصيد' : 'Top up'}</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-950/60">
          <button
            onClick={() => setActiveTab('gifts')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'gifts'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{isAr ? 'إرسال هدية' : 'Send a Gift'}</span>
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'balance'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isAr ? 'شراء النجوم' : 'Buy Stars'}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{isAr ? 'السجل والمعاملات' : 'History'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {giftSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-4xl border border-emerald-500/40 animate-bounce">
                🎉
              </div>
              <h4 className="text-xl font-bold text-zinc-100">
                {isAr ? 'تم إرسال الهدية بنجاح!' : 'Gift Sent Successfully!'}
              </h4>
              <p className="text-xs text-zinc-400 max-w-xs">
                {isAr
                  ? `تم إرسال هدية ${selectedGift?.nameAr} إلى ${recipientName} مع بطاقة الإهداء.`
                  : `Sent ${selectedGift?.name} to ${recipientName}.`}
              </p>
            </div>
          ) : activeTab === 'gifts' ? (
            <>
              {/* Recipient info */}
              <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">{isAr ? 'المستلم:' : 'Recipient:'}</span>
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  {recipientName}
                </span>
              </div>

              {/* Gift Grid */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2.5">
                  {isAr ? 'اختر الهدية المخصصة:' : 'Choose a Gift:'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {TELEGRAM_GIFTS.map((g) => {
                    const isSelected = selectedGift?.id === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGift(g)}
                        className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all group relative overflow-hidden bg-gradient-to-b ${g.bgGradient} ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/40 scale-[1.03]'
                            : 'border-zinc-800 hover:border-zinc-700 hover:scale-[1.01]'
                        }`}
                      >
                        <span className="text-3xl mb-1 group-hover:scale-125 transition-transform duration-200">
                          {g.icon}
                        </span>
                        <span className="text-xs font-bold text-zinc-100 truncate w-full">
                          {isAr ? g.nameAr : g.name}
                        </span>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-black text-amber-400">
                          <span>⭐</span>
                          <span>{g.starPrice}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gift Note */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  {isAr ? 'رسالة الإهداء (اختياري):' : 'Gift message (optional):'}
                </label>
                <input
                  type="text"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder={isAr ? 'مثال: شكراً لك على المجهود الرائع!' : 'e.g. Thanks for your great support!'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400/80 transition-colors"
                />
              </div>

              {/* Anonymous Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-400"
                />
                <span>{isAr ? 'إرسال الهدية بشكل مجهول (إخفاء اسمك في المحادثة)' : 'Send anonymously'}</span>
              </label>

              {/* Action Button */}
              <button
                onClick={handleSendSelectedGift}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isAr
                    ? `إرسال الهدية (${selectedGift?.starPrice} ⭐)`
                    : `Send Gift (${selectedGift?.starPrice} ⭐)`}
                </span>
              </button>
            </>
          ) : activeTab === 'balance' ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-zinc-900 border border-amber-500/20 rounded-2xl text-center space-y-2">
                <span className="text-4xl">⭐</span>
                <h4 className="text-sm font-bold text-zinc-100">
                  {isAr ? 'شحن وتعبئة رصيد النجوم' : 'Top up Telegram Stars'}
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {isAr
                    ? 'النجوم هي عملة رقمية داخلية تتيح لك دعم القنوات، والتفاعل الفاخر، والحصول على وسائط حصرية.'
                    : 'Stars let you support creators and send gifts across chats.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { stars: 50, price: '$0.99', popular: false },
                  { stars: 100, price: '$1.99', popular: false },
                  { stars: 250, price: '$4.99', popular: true },
                  { stars: 500, price: '$9.99', popular: false },
                  { stars: 1000, price: '$18.99', popular: false },
                  { stars: 2500, price: '$44.99', popular: false },
                ].map((pack) => (
                  <button
                    key={pack.stars}
                    onClick={() => handleTopup(pack.stars)}
                    className={`p-3.5 rounded-2xl border text-center transition-all hover:scale-[1.02] flex flex-col items-center justify-between ${
                      pack.popular
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                        : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                    }`}
                  >
                    {pack.popular && (
                      <span className="text-[9px] bg-amber-400 text-zinc-950 font-black px-2 py-0.5 rounded-full mb-1">
                        {isAr ? 'الأكثر طلباً' : 'Popular'}
                      </span>
                    )}
                    <span className="text-lg font-black text-amber-400">⭐ {pack.stars}</span>
                    <span className="text-xs font-bold text-zinc-300 mt-1">{pack.price}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? 'معاملات آمنة ومحمية عبر بنية تليجرام الرسمية.' : 'Secure transactions protected via Telegram protocol.'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-zinc-300 mb-2">
                {isAr ? 'سجل الهدايا والمعاملات الأخيرة:' : 'Recent Transactions:'}
              </h5>
              {(() => {
                const hist = JSON.parse(localStorage.getItem('tg_stars_history') || '[]');
                if (hist.length === 0) {
                  return (
                    <div className="py-8 text-center text-zinc-500 text-xs">
                      {isAr ? 'لا توجد معاملات سابقة بعد.' : 'No transactions yet.'}
                    </div>
                  );
                }
                return hist.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.gift?.icon || '⭐'}</span>
                      <div>
                        <div className="font-bold text-zinc-200">
                          {isAr ? item.gift?.nameAr : item.gift?.name}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {isAr ? `إلى: ${item.recipient}` : `To: ${item.recipient}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-amber-400">-{item.gift?.starPrice} ⭐</div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-zinc-950 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Telegram Android v11 Stars Protocol</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
