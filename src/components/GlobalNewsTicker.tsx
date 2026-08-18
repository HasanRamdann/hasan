import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { WorldEvent, Commodity } from '../types/game';
import {
  Radio,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Clock,
  Globe2,
  ChevronRight,
  Pause,
  Play,
  Flame,
  Ship,
  DollarSign,
  Maximize2,
  X,
  Compass,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Info,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const GlobalNewsTicker: React.FC = () => {
  const {
    worldEvents,
    marketPrices,
    commodities,
    cities,
    settings,
    setActiveTab,
    setSelectedCityId,
    triggerWorldEvent,
  } = useGame();

  const isAr = settings.language === 'ar';
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tickerSpeed, setTickerSpeed] = useState<'normal' | 'fast'>('normal');
  const [selectedEvent, setSelectedEvent] = useState<WorldEvent | null>(null);
  const [isBulletinOpen, setIsBulletinOpen] = useState<boolean>(false);

  const getEventBadge = (ev: WorldEvent) => {
    if (ev.id?.includes('strike') || ev.title.toLowerCase().includes('strike')) {
      return {
        labelEn: 'PORT STRIKE',
        labelAr: 'إضراب موانئ',
        bg: 'bg-red-500/20 text-red-300 border-red-500/40',
        icon: '🚨',
      };
    }
    if (ev.id?.includes('discovery') || ev.title.toLowerCase().includes('discovery') || ev.title.toLowerCase().includes('route')) {
      return {
        labelEn: 'NEW TRADE ROUTE',
        labelAr: 'ممر تجاري جديد',
        bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        icon: '⚡',
      };
    }
    if (ev.type === 'weather') {
      return {
        labelEn: 'WEATHER DISRUPTION',
        labelAr: 'تقلبات جوية',
        bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: '🌪️',
      };
    }
    if (ev.type === 'tech') {
      return {
        labelEn: 'TECH BOOM',
        labelAr: 'طفرة تكنولوجية',
        bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        icon: '🤖',
      };
    }
    if (ev.priceMultiplier < 1) {
      return {
        labelEn: 'SUPPLY SURPLUS',
        labelAr: 'فائض معروض',
        bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: '🌾',
      };
    }
    return {
      labelEn: 'MARKET SHIFT',
      labelAr: 'تغير بالأسعار',
      bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: '📊',
    };
  };

  const activeEventsList = worldEvents.length > 0 ? worldEvents : [];

  // Top trending commodities for ticker
  const topCommodityHighlights = commodities.slice(0, 6);

  return (
    <>
      {/* Ticker Bar Container */}
      <div
        className={`relative z-30 bg-slate-950/95 border-t border-b border-slate-800 text-xs overflow-hidden flex items-center shadow-lg transition-all ${
          isPaused ? 'ticker-paused' : ''
        }`}
      >
        {/* Left Live Indicator Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-r border-slate-800 shrink-0 z-10 shadow-md">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-black text-[11px] text-red-400 tracking-wider uppercase">
              <Radio className="w-3 h-3 text-red-400 animate-pulse" />
              <span>{isAr ? 'عاجل التجارة الدولية' : 'GLOBAL TRADE WIRE'}</span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold">
              {worldEvents.length} {isAr ? 'أحداث تؤثر على الأسعار' : 'Live Market Events'}
            </span>
          </div>
        </div>

        {/* Scrolling Marquee Area */}
        <div className="flex-1 overflow-hidden relative ticker-container select-none py-1.5 cursor-grab active:cursor-grabbing">
          {/* Subtle gradient fades on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          <div
            className={`flex items-center gap-8 ${
              isAr ? 'animate-ticker-rtl' : 'animate-ticker-ltr'
            } ${tickerSpeed === 'fast' ? 'animate-ticker-fast' : ''}`}
          >
            {/* First Set of Items */}
            <div className="flex items-center gap-8 shrink-0">
              {activeEventsList.map((ev) => {
                const badge = getEventBadge(ev);
                const pricePct = Math.round((ev.priceMultiplier - 1) * 100);
                const isPositive = pricePct >= 0;

                return (
                  <div
                    key={`ev-1-${ev.id}`}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedEvent(ev);
                    }}
                    className="flex items-center gap-2.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all shrink-0 group"
                    title={isAr ? 'انقر لعرض تفاصيل الحدث وتأثير الأسعار' : 'Click to inspect event & trade advisory'}
                  >
                    {/* Badge */}
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.bg}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{isAr ? badge.labelAr : badge.labelEn}</span>
                    </span>

                    {/* Title */}
                    <span className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors text-xs">
                      {isAr ? ev.titleAr : ev.title}
                    </span>

                    {/* Price Multiplier Pill */}
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                        isPositive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-blue-400" />
                      )}
                      <span>
                        {ev.affectedCommodityIds.slice(0, 2).join(', ')} {isPositive ? `+${pricePct}%` : `${pricePct}%`}
                      </span>
                    </span>

                    {/* Countdown */}
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      <Clock className="w-2.5 h-2.5 text-amber-400" />
                      <span>{Math.round(ev.remainingSeconds)}s</span>
                    </span>
                  </div>
                );
              })}

              {/* Commodity Live Prices Section */}
              <div className="flex items-center gap-4 px-3 py-1 bg-slate-900/60 border border-slate-800/80 rounded-xl shrink-0">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {isAr ? 'البورصة:' : 'MARKET:'}
                </span>
                {topCommodityHighlights.map((comm) => {
                  const mp = marketPrices[comm.id];
                  if (!mp) return null;
                  const isUp = mp.trend === 'up';
                  return (
                    <div key={`comm-1-${comm.id}`} className="flex items-center gap-1 text-[11px]">
                      <span>{comm.icon}</span>
                      <span className="text-slate-300 font-semibold">{isAr ? comm.nameAr : comm.name}</span>
                      <span className="text-white font-bold">${mp.currentPrice}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {mp.change24hPercent >= 0 ? `+${mp.change24hPercent}%` : `${mp.change24hPercent}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Duplicate Set for Seamless Continuous Scrolling */}
            <div className="flex items-center gap-8 shrink-0">
              {activeEventsList.map((ev) => {
                const badge = getEventBadge(ev);
                const pricePct = Math.round((ev.priceMultiplier - 1) * 100);
                const isPositive = pricePct >= 0;

                return (
                  <div
                    key={`ev-2-${ev.id}`}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedEvent(ev);
                    }}
                    className="flex items-center gap-2.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all shrink-0 group"
                    title={isAr ? 'انقر لعرض تفاصيل الحدث وتأثير الأسعار' : 'Click to inspect event & trade advisory'}
                  >
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.bg}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{isAr ? badge.labelAr : badge.labelEn}</span>
                    </span>

                    <span className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors text-xs">
                      {isAr ? ev.titleAr : ev.title}
                    </span>

                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                        isPositive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-blue-400" />
                      )}
                      <span>
                        {ev.affectedCommodityIds.slice(0, 2).join(', ')} {isPositive ? `+${pricePct}%` : `${pricePct}%`}
                      </span>
                    </span>

                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      <Clock className="w-2.5 h-2.5 text-amber-400" />
                      <span>{Math.round(ev.remainingSeconds)}s</span>
                    </span>
                  </div>
                );
              })}

              <div className="flex items-center gap-4 px-3 py-1 bg-slate-900/60 border border-slate-800/80 rounded-xl shrink-0">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {isAr ? 'البورصة:' : 'MARKET:'}
                </span>
                {topCommodityHighlights.map((comm) => {
                  const mp = marketPrices[comm.id];
                  if (!mp) return null;
                  const isUp = mp.trend === 'up';
                  return (
                    <div key={`comm-2-${comm.id}`} className="flex items-center gap-1 text-[11px]">
                      <span>{comm.icon}</span>
                      <span className="text-slate-300 font-semibold">{isAr ? comm.nameAr : comm.name}</span>
                      <span className="text-white font-bold">${mp.currentPrice}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {mp.change24hPercent >= 0 ? `+${mp.change24hPercent}%` : `${mp.change24hPercent}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Action & Control Buttons */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/90 border-l border-slate-800 shrink-0 z-10">
          {/* Pause / Resume Ticker Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsPaused(!isPaused);
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isPaused ? (isAr ? 'استئناف الشريط' : 'Resume Ticker') : (isAr ? 'إيقاف الشريط مؤقتاً' : 'Pause Ticker')}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current text-emerald-400" /> : <Pause className="w-3 h-3" />}
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              setTickerSpeed(tickerSpeed === 'normal' ? 'fast' : 'normal');
            }}
            className={`px-1.5 py-0.5 rounded text-[10px] font-black border transition-colors ${
              tickerSpeed === 'fast'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={isAr ? 'سرعة التمرير' : 'Scroll Speed'}
          >
            {tickerSpeed === 'fast' ? '2x' : '1x'}
          </button>

          {/* Trigger Random Global Event Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              triggerWorldEvent();
            }}
            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/50 hover:to-amber-600/50 border border-amber-500/40 text-amber-300 rounded-lg text-[10px] font-extrabold transition-all"
            title={isAr ? 'توليد حدث وأزمة سوق عالمية فوراً' : 'Spawn Random Global Market Event'}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">{isAr ? 'حدث جديد' : 'New Event'}</span>
          </button>

          {/* All News Archive Bulletin Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsBulletinOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold transition-colors"
            title={isAr ? 'عرض نشرة الأحداث العالمية الكاملة' : 'Global Events Bulletin'}
          >
            <FileText className="w-3 h-3 text-indigo-400" />
            <span className="hidden md:inline">{isAr ? 'النشرة' : 'Bulletin'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 relative z-10 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${
                      getEventBadge(selectedEvent).bg
                    }`}
                  >
                    <span>{getEventBadge(selectedEvent).icon}</span>
                    <span>{isAr ? getEventBadge(selectedEvent).labelAr : getEventBadge(selectedEvent).labelEn}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{Math.round(selectedEvent.remainingSeconds)}s {isAr ? 'متبقية' : 'remaining'}</span>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {isAr ? selectedEvent.titleAr : selectedEvent.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description Briefing */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <div className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                {isAr ? 'التقرير الإخباري المباشر' : 'Official Intelligence Wire'}
              </div>
              <p>{isAr ? selectedEvent.descriptionAr : selectedEvent.description}</p>
            </div>

            {/* Market Impact & Affected Commodities */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                {isAr ? 'السلع المتأثرة ومضاعف الأسعار:' : 'Impacted Commodities & Price Shift:'}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedEvent.affectedCommodityIds.map((commId) => {
                  const comm = commodities.find((c) => c.id === commId);
                  const mp = marketPrices[commId];
                  const pricePct = Math.round((selectedEvent.priceMultiplier - 1) * 100);
                  const isPositive = pricePct >= 0;

                  return (
                    <div
                      key={commId}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{comm?.icon || '📦'}</span>
                        <div>
                          <div className="font-bold text-xs text-white">
                            {comm ? (isAr ? comm.nameAr : comm.name) : commId}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ${mp?.currentPrice || comm?.basePrice}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-black px-2 py-1 rounded-md ${
                          isPositive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {isPositive ? `+${pricePct}%` : `${pricePct}%`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Affected Regions / Ports */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                {isAr ? 'المناطق والموانئ المستهدفة:' : 'Affected Global Hubs & Regions:'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedEvent.affectedRegions.map((region) => (
                  <span
                    key={region}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Globe2 className="w-3 h-3 text-indigo-400" />
                    <span>{region}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Merchant Strategy Advisory */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {isAr ? 'نصيحة واستراتيجية التداول الذكي:' : 'Merchant Advisory:'}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedEvent.priceMultiplier > 1
                  ? isAr
                    ? 'الأسعار في ذروتها بالموانئ المتأثرة! اشترِ السلع من موانئ مستقرة بأسعار رخيصة وقم بشحنها فوراً للمنطقة المتأثرة لجني أعلى هامش ربح.'
                    : 'Prices are surging in affected zones! Purchase low from unaffected ports and ship urgently for massive arbitrage margins.'
                  : isAr
                    ? 'وفرة وفائض في المعروض بالمنطقة! هذه فرصة لشراء السلعة بتخفيضات كبرى وتخزينها في مستودعاتك قبل انتهاء الحدث.'
                    : 'Surplus discount active! Great opportunity to stock up inventory cheaply before standard market equilibrium returns.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('market');
                  setSelectedEvent(null);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{isAr ? 'فتح شاشة البورصة والسلع' : 'Go to Market Terminal'}</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('command');
                  setSelectedEvent(null);
                }}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'اللوحة الشاملة' : 'Cockpit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Events Bulletin & Archive Modal */}
      {isBulletinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isAr ? 'النشرة الإخبارية للأحداث العالمية والأسواق' : 'Global Events & Market Intelligence Bulletin'}
                  </h3>
                  <div className="text-xs text-slate-400">
                    {worldEvents.length} {isAr ? 'أحداث نشطة حالياً في الموانئ' : 'Active geopolitical & trade events'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsBulletinOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of all active world events */}
            <div className="space-y-3">
              {worldEvents.map((ev) => {
                const badge = getEventBadge(ev);
                const pricePct = Math.round((ev.priceMultiplier - 1) * 100);
                const isPositive = pricePct >= 0;

                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${badge.bg}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{isAr ? badge.labelAr : badge.labelEn}</span>
                      </span>

                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.round(ev.remainingSeconds)}s {isAr ? 'متبقية' : 'remaining'}</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-white">{isAr ? ev.titleAr : ev.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{isAr ? ev.descriptionAr : ev.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'السلع:' : 'Commodities:'}</span>
                        <div className="flex gap-1">
                          {ev.affectedCommodityIds.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-200"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'
                        }`}
                      >
                        {isPositive ? `+${pricePct}% Price Spike` : `${pricePct}% Price Drop`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsBulletinOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                {isAr ? 'إغلاق النشرة' : 'Close Bulletin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
