import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import {
  HelpCircle,
  Ship,
  TrendingUp,
  Factory,
  FileSpreadsheet,
  Landmark,
  Compass,
  DollarSign,
  Award,
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Package,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const { settings, setActiveTab } = useGame();
  const isAr = settings.language === 'ar';
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'basics',
      icon: Compass,
      color: 'from-amber-500 to-amber-600',
      badge: isAr ? 'الأساسيات' : 'Core Concept',
      titleEn: '1. The Goal: Build a Maritime Monopoly',
      titleAr: '١. الهدف: بناء إمبراطورية تجارة بحرية عالمية',
      descEn:
        'Welcome, Merchant Magnate! Your objective is to expand your maritime fleet, exploit international price disparities, build manufacturing empires, and dominate the global trade network.',
      descAr:
        'أهلاً بك يا قطب التجارة! هدفك هو تأسيس أسطول نقل بحري وجوي، استغلال فروق أسعار السلع بين القارات، بناء مصانع متقدمة لإنتاج سلع ثمينة، وتصدر قائمة التجار العالمية.',
      highlights: [
        {
          icon: DollarSign,
          titleEn: 'Initial Capital',
          titleAr: 'رأس المال الأولي',
          textEn: 'Start with $50,000 cash and your flagship cargo coaster at Alexandria Port (HQ).',
          textAr: 'تبدأ بسيولة 50,000$ وسفينة شحن ساحلية في ميناء الإسكندرية (المقر الرئيسي).',
        },
        {
          icon: Globe2,
          titleEn: '17 Global Ports',
          titleAr: '١٧ ميناءً عالمياً',
          textEn: 'Trade between Europe, Asia, the Middle East, the Americas, and Africa with real maritime distances.',
          textAr: 'تاجر بين كبرى موانئ العالم في آسيا، أوروبا، الشرق الأوسط، الأمريكيتين، وإفريقيا.',
        },
        {
          icon: Award,
          titleEn: 'Level & Reputation',
          titleAr: 'المستوى والسمعة التجارية',
          textEn: 'Gain EXP with every profitable voyage and contract to unlock giant supertankers and high-tier factories.',
          textAr: 'اكتسب نقاط الخبرة (EXP) مع كل صفقة وعقد لفتح ناقلات الحاويات العملاقة والمصانع الفائقة.',
        },
      ],
      actionTab: 'map',
      actionLabelEn: 'Explore World Map',
      actionLabelAr: 'استكشف خريطة الموانئ',
    },
    {
      id: 'trading',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      badge: isAr ? 'البورصة والتجارة' : 'Market & Arbitrage',
      titleEn: '2. Buy Low, Ship, & Sell High (Arbitrage)',
      titleAr: '٢. اشترِ بسعر رخيص، ابحر، وبِع بربح قياسي (Arbitrage)',
      descEn:
        'Commodity prices fluctuate dynamically based on local supply and demand, events, and port specialization. Buy goods where they are abundant and sell where they are in high demand.',
      descAr:
        'تتغير أسعار السلع لحظياً وفق العرض والطلب والأحداث العالمية. اشترِ المواد من موانئ الإنتاج الرخيصة وابحر لبيعها في موانئ الاستهلاك ذات الأسعار المرتفعة.',
      highlights: [
        {
          icon: Package,
          titleEn: 'Regional Specialization',
          titleAr: 'التخصص الإقليمي للموانئ',
          textEn: 'Buy Coffee cheaply in Rio/Santos, Crude Oil in Dubai & Jeddah, and Tech in Tokyo & Shanghai.',
          textAr: 'اشترِ البن برخص من ريو دي جانيرو، والنفط من دبي وجدة، والإلكترونيات من طوكيو وشنغهاي.',
        },
        {
          icon: Zap,
          titleEn: 'Arbitrage Radar',
          titleAr: 'رادار الصفقات الذهبية',
          textEn: 'Use the Global Market Radar to identify top profit margins (+50% to +180% per trip).',
          textAr: 'استعن بـ (رادار الصفقات) في صفحة البورصة لاقتناص أعلى فروق أسعار بأرباح تتجاوز +100%.',
        },
        {
          icon: ShieldCheck,
          titleEn: 'Warehouses & Port Branches',
          titleAr: 'المستودعات وفروع الموانئ',
          textEn: 'Establish port branches to lower import customs and stockpile goods in local warehouses.',
          textAr: 'افتح فروعاً في الموانئ لتخفيض الضرائب الجمركية وتخزين البضائع في المستودعات لبيعها وقت الذروة.',
        },
      ],
      actionTab: 'market',
      actionLabelEn: 'Check Global Market',
      actionLabelAr: 'افتح البورصة والسلع',
    },
    {
      id: 'fleet',
      icon: Ship,
      color: 'from-cyan-500 to-blue-600',
      badge: isAr ? 'الأسطول والترقيات' : 'Fleet & Logistics',
      titleEn: '3. Expand & Upgrade Your Fleet',
      titleAr: '٣. توسعة الأسطول وترقية المحركات وعنابر الشحن',
      descEn:
        'A merchant is only as strong as their transport capacity. Buy larger vessels, customize their loadouts, and dispatch them across sea lanes.',
      descAr:
        'قوة إمبراطوريتك تقاس بقدرة أسطولك على النقل السريع والآمن. اشترِ سفن شحن عملاقة وطائرات شحن وقم بترقيتها باستمرار.',
      highlights: [
        {
          icon: Ship,
          titleEn: '7 Ship & Craft Tiers',
          titleAr: '٧ فئات نقل برية وبحرية وجوية',
          textEn: 'From Coastal Freighters and Bulk Carriers to Panamax Giants and Transcontinental Cargo Jets.',
          textAr: 'من سفن الشحن الساحلية وناقلات الصب إلى سفن الحاويات العملاقة وطائرات الشحن النفاثة.',
        },
        {
          icon: Zap,
          titleEn: 'Vessel Upgrades',
          titleAr: 'ترقيات السرعة والحمولة',
          textEn: 'Upgrade Engines (faster arrival), Expand Cargo Holds (more tonnage), and Eco-Hulls (cut fuel costs).',
          textAr: 'رقِّ المحركات للإبحار السريع، ووسّع عنابر الشحن لحمل بضائع أكثر، وثبت هياكل الحماية.',
        },
        {
          icon: Globe2,
          titleEn: 'Real-time Navigation & ETA',
          titleAr: 'الملاحة الحية وزمن الوصول',
          textEn: 'Watch your vessels cross the seas in real time with dynamic weather and pirate hazard checks.',
          textAr: 'شاهد سفنك تبحر حياً على الخريطة مع حساب سرعة العقد البحرية وزمن الوصول التقديري (ETA).',
        },
      ],
      actionTab: 'fleet',
      actionLabelEn: 'Manage Fleet',
      actionLabelAr: 'إدارة وتطوير الأسطول',
    },
    {
      id: 'industry',
      icon: Factory,
      color: 'from-amber-500 to-orange-600',
      badge: isAr ? 'سلاسل التصنيع' : 'Industrial Chains',
      titleEn: '4. Industrial Manufacturing (+300% Profits)',
      titleAr: '٤. سلاسل الإنتاج والتصنيع (أرباح تفوق +300%)',
      descEn:
        'Turn raw materials into ultra-lucrative high-tech goods. Supply your own factories and sell finished luxury cars, robotics, and quantum microchips.',
      descAr:
        'حوّل المواد الخام إلى سلع تكنولوجية ومعدات صناعية باهظة الثمن. زوّد مصانعك بالمواد المطلوبة وانتج السيارات والروبوتات والرقائق الكمومية.',
      highlights: [
        {
          icon: Factory,
          titleEn: '4 Value-Added Tiers',
          titleAr: '٤ مستويات لسلاسل القيمة',
          textEn: 'Smelt Iron Ore + Coal into Steel, refine Polymers into Electronics, and assemble AI Robotics.',
          textAr: 'صهر الحديد والفحم لإنتاج الفولاذ، تكرير البوليمرات لإنتاج الإلكترونيات، وتجميع الروبوتات الذكية.',
        },
        {
          icon: TrendingUp,
          titleEn: 'Automated Factory Production',
          titleAr: 'إنتاج صناعي آلي مستمر',
          textEn: 'Factories produce every cycle when inputs exist in the local port warehouse, earning passive revenue.',
          textAr: 'تنتج مصانعك دورياً بمجرد توفر المواد في مستودع الميناء لتجني أرباحاً هائلة ومستمرة.',
        },
      ],
      actionTab: 'industry',
      actionLabelEn: 'Open Manufacturing',
      actionLabelAr: 'دخول مجمع التصنيع',
    },
    {
      id: 'contracts_finance',
      icon: FileSpreadsheet,
      color: 'from-indigo-500 to-purple-600',
      badge: isAr ? 'المناقصات والمالية' : 'Contracts & Finance',
      titleEn: '5. B2B Supply Contracts, Banking & Stocks',
      titleAr: '٥. عقود التوريد الحكومية، القروض البنكية والأسهم',
      descEn:
        'Deliver large-scale supply contracts for guaranteed mega-payouts, take bank loans for quick fleet scaling, and invest in global corporate equities.',
      descAr:
        'أبرم عقود توريد ضخمة للحكومات مقابل مكافآت بالملايين ونقاط سمعة، واستفد من القروض البنكية لشراء السفن مبكراً، واستثمر في أسهم الشركات.',
      highlights: [
        {
          icon: FileSpreadsheet,
          titleEn: 'B2B Government Tenders',
          titleAr: 'مناقصات وعقود التوريد',
          textEn: 'Accept contracts, deliver the required tons to target ports before deadline, and collect bonuses.',
          textAr: 'اقبل العقود وسلم الكميات المطلوبة في موانئ الوصول قبل انتهاء الوقت لجني المكافآت الضخمة.',
        },
        {
          icon: Landmark,
          titleEn: 'Credit Lines & Stock Market',
          titleAr: 'التسهيلات الائتمانية والأسهم',
          textEn: 'Borrow working capital to seize urgent trade deals and buy shares in Blue-Chip shipping companies for dividends.',
          textAr: 'اقترض سيولة لتمويل الصفقات العاجلة واشترِ أسهم كبرى الشركات للحصول على توزيعات أرباح سنوية.',
        },
      ],
      actionTab: 'contracts',
      actionLabelEn: 'View Contracts',
      actionLabelAr: 'عرض المناقصات والعقود',
    },
    {
      id: 'advanced_features',
      icon: Sparkles,
      color: 'from-amber-500 to-yellow-600',
      badge: isAr ? 'الميزات التفاعلية الجديدة' : 'Interactive Quests & Skills',
      titleEn: '6. Quests, CEO Talents, Calculator & Sea Encounters',
      titleAr: '٦. مسار المهام، شجرة مهارات الرئيس، حاسبة الأرباح وأحداث الإبحار',
      descEn:
        'Level up faster with guided quests, specialize your CEO talents across 3 distinct skill trees, predict voyage returns before departure, and make critical strategic choices during random sea events.',
      descAr:
        'أنجز مهام البداية التفاعلية خطوة بخطوة لجني مكافآت نقدية سريعة، طور شجرة مهارات الرئيس التنفيذي، وتوقع أرباح رحلاتك البحرية، وتفاعل مع أحداث وعواصف البحار.',
      highlights: [
        {
          icon: Award,
          titleEn: 'Guided Beginner Quests',
          titleAr: 'مسار مهام المبتدئين التفاعلي',
          textEn: 'Clear, step-by-step goals guiding your first trade, voyage, profit milestone, and factory expansion.',
          textAr: 'إرشادات ومكافآت خطوة بخطوة لشراء الشحنة الأولى، إرسال السفينة، وتحقيق الأرباح الأولى.',
        },
        {
          icon: Zap,
          titleEn: 'CEO Talent & Skill Tree',
          titleAr: 'شجرة مهارات الرئيس التنفيذي',
          textEn: 'Earn skill points upon leveling up to unlock fleet speed, cargo hold capacity, fuel cuts, and tax discounts.',
          textAr: 'اكسب نقاط مهارة مع كل ترقية لتسريع الأسطول، خفض استهلاك الوقود، وزيادة أرباح العقود والإنتاج.',
        },
        {
          icon: DollarSign,
          titleEn: 'Live Profit Calculator & Sea Events',
          titleAr: 'حاسبة الأرباح الحية وأحداث البحر',
          textEn: 'Real-time profit & voyage calculator before sailing + interactive narrative choices during oceanic storms and pirate encounters.',
          textAr: 'حاسبة فورية لحساب العائد وصافي الربح بدقة + أحداث وقرارات تفاعلية لمواجهة القراصنة وإنقاذ السفن الغارقة.',
        },
      ],
      actionTab: 'market',
      actionLabelEn: 'Start Trading',
      actionLabelAr: 'ابدأ التجارة الآن',
    },
    {
      id: 'cockpit_single_screen',
      icon: Compass,
      color: 'from-cyan-500 to-blue-600',
      badge: isAr ? 'وضع الشاشة الواحدة' : 'Single-Screen Cockpit',
      titleEn: '7. Single-Screen Cockpit & 1-Click Smart Trade',
      titleAr: '٧. اللوحة الشاملة (شاشة واحدة) والصفقة السريعة بنقرة واحدة',
      descEn:
        'Prefer playing without switching tabs? The Unified Cockpit puts the World Map, Port Terminals, Fleet Radar, Profit Estimator, and 1-Click Trade Launch on a single clean dashboard.',
      descAr:
        'هل تفضل اللعب بدون التنقل بين التابات الكثيرة؟ تتيح لك اللوحة الشاملة الموحدة التحكم في الخريطة، شراء وبيع البضائع، مراقبة حركة السفن، وإطلاق أول صفقة رابحة بضغطة زر واحدة من مكان واحد.',
      highlights: [
        {
          icon: Zap,
          titleEn: '1-Click Smart Beginner Trade',
          titleAr: 'صفقة البداية الذكية بنقرة واحدة',
          textEn: 'Instant automated purchase of high-margin goods (e.g. Wheat in Alexandria), loading onto your ship, and sailing to Athens for ~45% profit.',
          textAr: 'شراء فوري لأعلى السلع ربحية (كالقمح في الإسكندرية)، تحميلها على السفينة وإطلاق رحلتها إلى أثينا بنقرة زر واحدة.',
        },
        {
          icon: Globe2,
          titleEn: 'Click Any Port to Trade Instantly',
          titleAr: 'انقر على أي ميناء للتداول فوراً',
          textEn: 'Selecting any port on the map loads its live trade terminal, tax rates, and prices directly in the side panel without leaving.',
          textAr: 'اختيار أي ميناء على الخريطة يعرض أسعاره وضرائبه في اللوحة الجانبية للشراء والبيع الفوري دون مغادرة الشاشة.',
        },
        {
          icon: Ship,
          titleEn: 'Live Fleet Radar & Countdown Timers',
          titleAr: 'رادار الأسطول وعد التنازل للوصول',
          textEn: 'Monitor all sailing ships, cargo tons, destination ports, and arrival countdowns in real-time.',
          textAr: 'متابعة حية لجميع سفنك المبحرة وحمولتها وموانئ وجهتها والزمن المتبقي للوصول.',
        },
      ],
      actionTab: 'command',
      actionLabelEn: 'Open Unified Cockpit',
      actionLabelAr: 'افتح اللوحة الشاملة الآن',
    },
  ];

  const current = steps[activeStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    soundFx.playClick();
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    soundFx.playClick();
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleGoToTab = (tabId: string) => {
    soundFx.playClick();
    setActiveTab(tabId);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {isAr ? 'دليل إمبراطور التجارة (كيف تلعب)' : 'Merchant Guide (How to Play)'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  {isAr ? `خطوة ${activeStep + 1} من ${steps.length}` : `Step ${activeStep + 1} of ${steps.length}`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'تعلم أسرار التجارة والربح السريع وتوسعة الأسطول' : 'Master trade lanes, arbitrage profits & fleet expansion'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs Navigation */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveStep(idx);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Main Step Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title and Intro */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${current.color} text-slate-950 shadow-lg shrink-0`}>
                <StepIcon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-amber-300">
                  {isAr ? current.titleAr : current.titleEn}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isAr ? current.descAr : current.descEn}
                </p>
              </div>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {current.highlights.map((h, i) => {
              const HIcon = h.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-800/40 border border-slate-700/50 hover:border-amber-500/30 p-3.5 rounded-xl transition-colors space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                    <HIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isAr ? h.titleAr : h.titleEn}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? h.textAr : h.textEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Tab Shortcut Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleGoToTab(current.actionTab)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold transition-all"
            >
              <span>{isAr ? current.actionLabelAr : current.actionLabelEn}</span>
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={activeStep === 0}
            className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeStep === 0
                ? 'opacity-30 cursor-not-allowed border-slate-800 text-slate-600'
                : 'border-slate-700 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            <span>{isAr ? 'السابق' : 'Previous'}</span>
          </button>

          {/* Page Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundFx.playClick();
                  setActiveStep(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === activeStep ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
          >
            <span>
              {activeStep === steps.length - 1
                ? isAr
                  ? 'ابدأ التجارة الآن 🚀'
                  : 'Start Trading Now 🚀'
                : isAr
                  ? 'التالي'
                  : 'Next'}
            </span>
            <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
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
