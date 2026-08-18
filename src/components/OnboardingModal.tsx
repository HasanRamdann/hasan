import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import {
  ArchetypeType,
  CompanyAvatarType,
  StartingSetupConfig,
  ThemeType,
} from '../types/game';
import {
  Anchor,
  Ship,
  Compass,
  Globe,
  Crown,
  Shield,
  Flame,
  Award,
  Zap,
  Briefcase,
  Building2,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Palette,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isRestart?: boolean;
}

const AVATARS: Array<{ id: CompanyAvatarType; labelAr: string; labelEn: string; icon: any }> = [
  { id: 'anchor', labelAr: 'المرساة الذهبية', labelEn: 'Golden Anchor', icon: Anchor },
  { id: 'ship', labelAr: 'سفينة المحيط', labelEn: 'Ocean Vessel', icon: Ship },
  { id: 'compass', labelAr: 'بوصلة الملاحة', labelEn: 'Naval Compass', icon: Compass },
  { id: 'crown', labelAr: 'تاج الإمبراطورية', labelEn: 'Imperial Crown', icon: Crown },
  { id: 'globe', labelAr: 'شبكة التجارة', labelEn: 'Global Trade', icon: Globe },
  { id: 'shield', labelAr: 'درع الأمان', labelEn: 'Safe Shield', icon: Shield },
  { id: 'star', labelAr: 'نجمة الملاحة', labelEn: 'North Star', icon: Award },
  { id: 'falcon', labelAr: 'صقر الشحن', labelEn: 'Cargo Falcon', icon: Flame },
];

const HQ_PORTS: Array<{
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  flag: string;
  perkAr: string;
  perkEn: string;
  perkBadge: string;
}> = [
  {
    id: 'alexandria',
    nameAr: 'الإسكندرية',
    nameEn: 'Alexandria',
    countryAr: 'مصر',
    countryEn: 'Egypt',
    flag: '🇪🇬',
    perkAr: 'مركز البحر المتوسط وقناة السويس: صوامع حبوب مجانية +20% ووقود مخفض.',
    perkEn: 'Mediterranean & Suez Hub: +20% Grain Storage & Discounted Fuel.',
    perkBadge: 'بوابة المتوسط',
  },
  {
    id: 'rotterdam',
    nameAr: 'روتردام',
    nameEn: 'Rotterdam',
    countryAr: 'هولندا',
    countryEn: 'Netherlands',
    flag: '🇳🇱',
    perkAr: 'عاصمة الشحن الأوروبية: مستودع مركزي مجاني وسوق صفقات عالية القيمة.',
    perkEn: 'European Shipping Capital: Free central warehouse & premium contracts.',
    perkBadge: 'ميناء أوروبا',
  },
  {
    id: 'singapore',
    nameAr: 'سنغافورة',
    nameEn: 'Singapore',
    countryAr: 'سنغافورة',
    countryEn: 'Singapore',
    flag: '🇸🇬',
    perkAr: 'مضيق ملقا والمحيط الهندي: سرعة إبحار ومحركات تيربو أسرع بنسبة +25%.',
    perkEn: 'Malacca Strait Hub: +25% ship transit speed and turbo turnaround.',
    perkBadge: 'عصب آسيا',
  },
  {
    id: 'dubai',
    nameAr: 'دبي',
    nameEn: 'Dubai',
    countryAr: 'الإمارات',
    countryEn: 'UAE',
    flag: '🇦🇪',
    perkAr: 'مركز المال واللوجستيات: قرض بنكي أولي ميسر + عوائد نفط ومجوهرات.',
    perkEn: 'Finance & Energy Capital: Zero-interest starter loan perk + oil margins.',
    perkBadge: 'عاصمة التمويل',
  },
  {
    id: 'new_york',
    nameAr: 'نيويورك',
    nameEn: 'New York',
    countryAr: 'أمريكا',
    countryEn: 'USA',
    flag: '🇺🇸',
    perkAr: 'وول ستريت والتجارة الأطلسية: رأس مال استثماري إضافي + محفظة أسهم أولية.',
    perkEn: 'Wall St & Atlantic Hub: Extra starting capital + initial stock portfolio.',
    perkBadge: 'مركز التجارة الأطلسية',
  },
  {
    id: 'santos',
    nameAr: 'ريو دي جانيرو / سانتوس',
    nameEn: 'Rio / Santos',
    countryAr: 'البرازيل',
    countryEn: 'Brazil',
    flag: '🇧🇷',
    perkAr: 'إمبراطورية البن والسلع الزراعية: شحنة قهوة مجانية في المستودع وهوامش تصدير +35%.',
    perkEn: 'Coffee & Agro Titan: Free starter coffee inventory & +35% export profits.',
    perkBadge: 'عاصمة البن',
  },
];

const ARCHETYPES: Array<{
  id: ArchetypeType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: any;
  bonusTagAr: string;
  bonusTagEn: string;
  color: string;
}> = [
  {
    id: 'merchant',
    titleAr: 'تاجر المحيطات',
    titleEn: 'Ocean Merchant',
    descAr: 'التركيز على شحن البضائع السائبة بين القارات، مع سفينة شحن كبيرة وشحنة أولية مجانية.',
    descEn: 'Master of bulk shipping across oceans with a higher cargo capacity ship and starter goods.',
    icon: Ship,
    bonusTagAr: 'سفينة أكبر + بضائع مجانية',
    bonusTagEn: 'Larger Ship + Starter Cargo',
    color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/50 text-cyan-300',
  },
  {
    id: 'industrial',
    titleAr: 'رائد الصناعة والإنتاج',
    titleEn: 'Industrial Tycoon',
    descAr: 'بناء سلاسل الإمداد والمصانع لتحويل المواد الخام إلى إلكترونيات وسيارات بأرباح مضاعفة.',
    descEn: 'Build production chains and factories converting raw materials into high-margin luxury goods.',
    icon: Building2,
    bonusTagAr: 'رأس مال صناعي إضافي + خصم مصانع',
    bonusTagEn: '+$25,000 Factory Fund + Build Discount',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-300',
  },
  {
    id: 'courier',
    titleAr: 'الملاح السريع Express',
    titleEn: 'Express Courier',
    descAr: 'سرعة الملاحة والتسليم الفوري لعقود التوريد السريعة، سفن خفيفة بمحركات أسرع +35%.',
    descEn: 'High-speed transit specialist dominating time-critical contracts with +35% ship speed.',
    icon: Zap,
    bonusTagAr: '+35% سرعة إبحار + أسطول سريع',
    bonusTagEn: '+35% Ship Speed + Dual Agile Vessels',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-300',
  },
  {
    id: 'mogul',
    titleAr: 'قطب الاستثمار والتمويل',
    titleEn: 'Finance Mogul',
    descAr: 'الاستثمار في أسهم الشركات العالمية، تمويل الشركات، وجني أرباح رأس المال والقروض.',
    descEn: 'Wall Street investor with starter shares in global corporations and high initial credit rating.',
    icon: Briefcase,
    bonusTagAr: 'محفظة أسهم أولية + سمعة أعلى',
    bonusTagEn: 'Starter Stock Portfolio + High Rep',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-300',
  },
];

const THEMES: Array<{
  id: ThemeType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  previewClass: string;
  badge: string;
}> = [
  {
    id: 'tactical_navy',
    titleAr: 'النمط البحري التكتيكي',
    titleEn: 'Tactical Navy Modern',
    descAr: 'واجهة أعماق البحار الكحلية مع خطوط ملاحية ذهبية واضحة ومريحة للعين.',
    descEn: 'Deep naval obsidian canvas with vibrant golden navigation accents.',
    previewClass: 'from-slate-950 via-slate-900 to-blue-950 border-amber-500/40',
    badge: 'كلاسيكي بحري',
  },
  {
    id: 'golden_tycoon',
    titleAr: 'النمط المالي الذهبي الفاخر',
    titleEn: 'Golden Tycoon Luxury',
    descAr: 'أجواء الأثرياء وكبار رجال الأعمال بتدرجات الذهب الإمبراطوري والأسود الملكي.',
    descEn: 'High-roller wealth aesthetic with polished gold and jet-black titanium.',
    previewClass: 'from-stone-950 via-neutral-900 to-amber-950/80 border-yellow-400/60',
    badge: 'فاخر استثماري',
  },
  {
    id: 'cyber_radar',
    titleAr: 'رادار الملاحة السيبراني',
    titleEn: 'Cyber Maritime Radar',
    descAr: 'شاشات تحكم ملاحية نيون حديثة بألوان السيان والزمرد الرقمي المتقدم.',
    descEn: 'Futuristic sonar radar dashboard with high-contrast glowing neon cyan.',
    previewClass: 'from-slate-950 via-cyan-950/40 to-slate-900 border-cyan-400/60',
    badge: 'مستقبلي سيبراني',
  },
  {
    id: 'emerald_cargo',
    titleAr: 'شحن الزمرد المستدام',
    titleEn: 'Emerald Cargo Green',
    descAr: 'طابع لوجستي حديث يركز على الشحن الأخضر والملاحة المستدامة بألوان الزمرد.',
    descEn: 'Modern green shipping aesthetic focused on sustainable eco-maritime transport.',
    previewClass: 'from-slate-950 via-emerald-950/40 to-teal-950 border-emerald-400/60',
    badge: 'شحن مستدام',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  isRestart = false,
}) => {
  const { settings, applyStartingSetup, companyName, ceoName, hqCityId } = useGame();
  const isAr = settings.language === 'ar';

  const [step, setStep] = useState<number>(1);
  const [selectedCeo, setSelectedCeo] = useState<string>(ceoName || 'Captain Hasan');
  const [selectedCompany, setSelectedCompany] = useState<string>(companyName || 'Nile Star Logistics');
  const [selectedAvatar, setSelectedAvatar] = useState<CompanyAvatarType>('anchor');
  const [selectedHq, setSelectedHq] = useState<string>(hqCityId || 'alexandria');
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeType>('merchant');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(settings.theme || 'tactical_navy');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'standard' | 'hardcore'>('standard');

  if (!isOpen) return null;

  const handleFinish = () => {
    soundFx.playFanfare();
    const config: StartingSetupConfig = {
      ceoName: selectedCeo.trim() || (isAr ? 'القبطان حسن' : 'Captain Hasan'),
      companyName: selectedCompany.trim() || (isAr ? 'شركة نجمة النيل للشحن' : 'Nile Star Logistics'),
      companyAvatar: selectedAvatar,
      hqCityId: selectedHq,
      archetype: selectedArchetype,
      theme: selectedTheme,
      difficulty: selectedDifficulty,
    };
    applyStartingSetup(config);
    if (onClose) onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-lg animate-fade-in overflow-y-auto">
      <div
        className="bg-slate-900/95 border border-amber-500/40 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-auto border-t-2 border-t-amber-400 max-h-[92vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header & Step Indicator */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  {isRestart
                    ? isAr
                      ? '⚙️ إعداد بداية جديدة / تغيير الشركة'
                      : '⚙️ New Setup / Company Profile'
                    : isAr
                      ? '🚢 تأسيس إمبراطوريتك التجارية'
                      : '🚢 Found Your Trade Empire'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'خصص هوية شركتك، ميناء الانطلاق، التخصص الاستثماري ومظهر الواجهة'
                    : 'Customize your CEO identity, starting port, archetype & visual interface theme'}
                </p>
              </div>
            </div>

            {/* Step Badge */}
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
              {isAr ? `الخطوة ${step} من 4` : `Step ${step} of 4`}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body with Step Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh]">
          {/* STEP 1: CEO & Company Identity */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  <span>{isAr ? '1. هوية القائد وشعار الشركة' : '1. CEO & Company Identity'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr
                    ? 'اختر اسمك كمدير تنفيذي، اسم شركة الملاحة، والشعار الذي سيرفرف على أسطولك'
                    : 'Choose your CEO name, shipping company brand, and naval emblem for your fleet.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {isAr ? '👤 اسم القبطان / المدير التنفيذي:' : '👤 CEO / Captain Name:'}
                  </label>
                  <input
                    type="text"
                    value={selectedCeo}
                    onChange={(e) => setSelectedCeo(e.target.value)}
                    placeholder={isAr ? 'مثال: القبطان حسن' : 'e.g. Captain Hasan'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {isAr ? '🏢 اسم شركة الشحن والتجارة:' : '🏢 Shipping Enterprise Name:'}
                  </label>
                  <input
                    type="text"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    placeholder={isAr ? 'مثال: شركة نجمة النيل للشحن' : 'e.g. Nile Star Logistics'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  {isAr ? '⚓ اختر شعار ورمز الشركة الرسمي:' : '⚓ Select Official Company Emblem:'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVATARS.map((av) => {
                    const Icon = av.icon;
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedAvatar(av.id);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20 scale-105'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold text-center leading-tight truncate w-full">
                          {isAr ? av.labelAr : av.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  {isAr ? '🎯 مستوى صعوبة البداية ورأس المال:' : '🎯 Starting Difficulty & Funds:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'easy', labelAr: 'ميسر ($100,000)', labelEn: 'Casual ($100k)', descAr: 'رأس مال وفير وسهولة أكبر للمبتدئين', descEn: 'High cash & forgiving economy' },
                    { id: 'standard', labelAr: 'قياسي متوازن ($60,000)', labelEn: 'Standard ($60k)', descAr: 'التجربة الواقعية الموصى بها', descEn: 'Balanced & realistic simulation' },
                    { id: 'hardcore', labelAr: 'تحدي صعب ($30,000)', labelEn: 'Hardcore ($30k)', descAr: 'رأس مال محدود وتكاليف دقيقة', descEn: 'Tight cash & demanding market' },
                  ].map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedDifficulty(diff.id as any);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedDifficulty === diff.id
                          ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-amber-300">
                        {isAr ? diff.labelAr : diff.labelEn}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {isAr ? diff.descAr : diff.descEn}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Headquarters & Starting Port */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <span>{isAr ? '2. اختيار المقر الرئيسي وميناء الانطلاق' : '2. Headquarters & Starting Port'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr
                    ? 'كل ميناء يمنحك ميزة استراتيجية حصرية وموقعاً جغرافياً يؤثر على كفاءة طرق الشحن الأولى'
                    : 'Each port offers a unique geographic perk, starting warehouse stock, and strategic routes.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HQ_PORTS.map((port) => {
                  const isSelected = selectedHq === port.id;
                  return (
                    <div
                      key={port.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedHq(port.id);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-500/20 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{port.flag}</span>
                            <div>
                              <div className="text-sm font-bold text-white">
                                {isAr ? port.nameAr : port.nameEn}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {isAr ? port.countryAr : port.countryEn}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {port.perkBadge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mt-2">
                          {isAr ? port.perkAr : port.perkEn}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">ID: {port.id}</span>
                        {isSelected && (
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {isAr ? 'تم الاختيار' : 'Selected'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Specialization & Starting Archetype */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>{isAr ? '3. التخصص الاستثماري وميزة البداية' : '3. Specialization Archetype'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr
                    ? 'حدد هوية شركتك التنافسية للحصول على مكافآت وبداية مخصصة لأسلوب لعبك'
                    : 'Choose your competitive strategic archetype for tailored starting perks and bonuses.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ARCHETYPES.map((arch) => {
                  const Icon = arch.icon;
                  const isSelected = selectedArchetype === arch.id;
                  return (
                    <div
                      key={arch.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedArchetype(arch.id);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? `bg-gradient-to-br ${arch.color} shadow-xl scale-[1.02]`
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                              <Icon className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="text-sm font-bold text-white">
                              {isAr ? arch.titleAr : arch.titleEn}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {isAr ? arch.descAr : arch.descEn}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                          ✨ {isAr ? arch.bonusTagAr : arch.bonusTagEn}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Visual Theme & Interface Customization */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  <span>{isAr ? '4. اختيار واجهة ومظهر اللعبة المفضلة' : '4. Choose Interface & Theme'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr
                    ? 'اختر السمة الجمالية والألوان التي تفضلها للوحة التحكم وشاشات الملاحة (يمكن تغييرها دائماً)'
                    : 'Select your preferred aesthetic theme and palette for the command bridge (can be changed anytime).'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((th) => {
                  const isSelected = selectedTheme === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedTheme(th.id);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all bg-gradient-to-br ${th.previewClass} ${
                        isSelected
                          ? 'ring-2 ring-amber-400 shadow-2xl scale-[1.02]'
                          : 'opacity-85 hover:opacity-100 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-bold text-white">
                          {isAr ? th.titleAr : th.titleEn}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 border border-amber-500/30">
                          {th.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {isAr ? th.descAr : th.descEn}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-amber-400" />
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        </div>
                        {isSelected && (
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {isAr ? 'الواجهة المحددة' : 'Active Theme'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary recap box */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs flex items-center justify-between flex-wrap gap-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">{isAr ? 'الملخص:' : 'Summary:'}</span>
                  <span>{selectedCompany}</span>
                  <span className="text-slate-500">|</span>
                  <span>{selectedCeo}</span>
                  <span className="text-slate-500">|</span>
                  <span className="capitalize">{selectedHq} HQ</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">
                  💾 {isAr ? 'ميزة الحفظ التلقائي مفعلة' : 'Auto-Save Enabled'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setStep((s) => s - 1);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              <span>{isAr ? 'السابق' : 'Previous'}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setStep((s) => s + 1);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>{isAr ? 'التالي' : 'Next Step'}</span>
              <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? '🚀 تدشين الإمبراطورية والانطلاق!' : '🚀 Launch Trade Empire!'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
