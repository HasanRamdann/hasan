import React from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { ThemeType } from '../types/game';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES: Array<{
  id: ThemeType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  previewClass: string;
  accentColors: string[];
  badge: string;
}> = [
  {
    id: 'tactical_navy',
    titleAr: 'النمط البحري التكتيكي (Navy Modern)',
    titleEn: 'Tactical Navy Modern',
    descAr: 'تصميم بحري مريح للعين بألوان كحلية عميقة مع لمسات ذهبية ملاحية واضحة.',
    descEn: 'Deep tactical naval obsidian canvas with vibrant golden navigation accents.',
    previewClass: 'from-slate-950 via-slate-900 to-blue-950 border-amber-500/40',
    accentColors: ['#f59e0b', '#3b82f6', '#0f172a'],
    badge: 'كلاسيكي بحري',
  },
  {
    id: 'golden_tycoon',
    titleAr: 'النمط المالي الذهبي الفاخر (Golden Tycoon)',
    titleEn: 'Golden Tycoon Luxury',
    descAr: 'واجهة فاخرة تناسب كبار رجال الأعمال بتدرجات الذهب الإمبراطوري والأسود الملكي.',
    descEn: 'High-roller wealth aesthetic with polished gold and titanium black.',
    previewClass: 'from-stone-950 via-neutral-900 to-amber-950/80 border-yellow-400/60',
    accentColors: ['#eab308', '#ca8a04', '#1c1917'],
    badge: 'فاخر استثماري',
  },
  {
    id: 'cyber_radar',
    titleAr: 'رادار الملاحة السيبراني (Cyber Radar)',
    titleEn: 'Cyber Maritime Radar',
    descAr: 'شاشات ملاحة حديثة عالية التباين مع مؤشرات نيون زرقاء وخضراء رقمية.',
    descEn: 'Futuristic sonar radar bridge with glowing neon cyan and emerald accents.',
    previewClass: 'from-slate-950 via-cyan-950/40 to-slate-900 border-cyan-400/60',
    accentColors: ['#06b6d4', '#10b981', '#083344'],
    badge: 'مستقبلي سيبراني',
  },
  {
    id: 'emerald_cargo',
    titleAr: 'شحن الزمرد المستدام (Emerald Cargo)',
    titleEn: 'Emerald Cargo Green',
    descAr: 'تصميم شحن بحري مستدام يركز على الكفاءة البيئية وألوان الزمرد الأخضر الأنيق.',
    descEn: 'Modern green shipping aesthetic focused on eco-friendly maritime logistics.',
    previewClass: 'from-slate-950 via-emerald-950/40 to-teal-950 border-emerald-400/60',
    accentColors: ['#10b981', '#14b8a6', '#022c22'],
    badge: 'شحن مستدام',
  },
];

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, addNotification } = useGame();
  const isAr = settings.language === 'ar';

  if (!isOpen) return null;

  const handleSelectTheme = (themeId: ThemeType) => {
    soundFx.playClick();
    updateSettings({ theme: themeId });
    addNotification(
      `Interface theme changed to ${themeId.replace('_', ' ')}!`,
      `تم تغيير واجهة اللعبة إلى السمة المختارة بنجاح!`,
      'success'
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-5 my-auto text-slate-100"
        dir={isAr ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {isAr ? '🎨 تخصيص واجهة ومظهر اللعبة' : '🎨 Interface Theme & Visual Style'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'اختر المظهر الجمالي المفضل لديك للوحة التحكم والأزرار والمخططات'
                  : 'Select your preferred visual aesthetic for command bridge, buttons & charts.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 gap-3">
          {THEMES.map((th) => {
            const isSelected = settings.theme === th.id;
            return (
              <div
                key={th.id}
                onClick={() => handleSelectTheme(th.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all bg-gradient-to-br ${th.previewClass} ${
                  isSelected
                    ? 'ring-2 ring-amber-400 shadow-xl scale-[1.01]'
                    : 'opacity-85 hover:opacity-100 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{isAr ? th.titleAr : th.titleEn}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-500/30">
                    {th.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {isAr ? th.descAr : th.descEn}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{isAr ? 'الألوان:' : 'Palette:'}</span>
                    <div className="flex items-center gap-1.5">
                      {th.accentColors.map((col, idx) => (
                        <div
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="font-bold text-amber-400 flex items-center gap-1 text-xs">
                      <Check className="w-3.5 h-3.5" />
                      {isAr ? 'الواجهة النشطة الحالية' : 'Currently Active'}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 hover:text-white underline">
                      {isAr ? 'تطبيق هذا المظهر' : 'Apply Theme'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all"
          >
            {isAr ? 'تم وحفظ' : 'Done & Save'}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
