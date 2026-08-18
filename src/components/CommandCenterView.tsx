import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { City, PlayerShip, Commodity } from '../types/game';
import {
  Globe2,
  Ship,
  TrendingUp,
  Anchor,
  Navigation,
  Sparkles,
  ArrowRight,
  Zap,
  Play,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Award,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Compass,
  Layers,
  Fuel,
  Maximize2,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const CommandCenterView: React.FC = () => {
  const {
    cash,
    reputation,
    level,
    cities,
    ships,
    commodities,
    marketPrices,
    shipModels,
    selectedCityId,
    setSelectedCityId,
    selectedShipId,
    setSelectedShipId,
    buyCommodity,
    sellCommodity,
    dispatchShip,
    settings,
    guidedQuests,
    claimQuestReward,
    setIsHowToPlayOpen,
    setIsQuestModalOpen,
    setIsSkillTreeOpen,
    skillPoints,
    unlockedSkills,
  } = useGame();

  const isAr = settings.language === 'ar';
  const cityList: City[] = useMemo(() => Object.values(cities), [cities]);

  // Current active city (defaults to first ship's city or Alexandria)
  const activeShip = useMemo(
    () => ships.find((s) => s.id === selectedShipId) || ships[0] || null,
    [ships, selectedShipId]
  );

  const [activePortId, setActivePortId] = useState<string>(
    selectedCityId || activeShip?.currentCityId || 'alexandria'
  );

  const currentCity = cities[activePortId] || cities['alexandria'] || cityList[0];

  const [hoveredCity, setHoveredCity] = useState<City | null>(null);

  // Quick Trade inputs inside the single view
  const [quickTradeCommId, setQuickTradeCommId] = useState<string>('wheat');
  const [tradeQuantity, setTradeQuantity] = useState<number>(30);
  const [quickDestCityId, setQuickDestCityId] = useState<string>('athens');

  // CEO talent perks
  const marketDiscountBonus = unlockedSkills.includes('commerce_discount_2') ? 0.08 : 0;
  const portTaxDiscount = unlockedSkills.includes('commerce_tax_1') ? 0.35 : 0;

  // Find top 3 most profitable trade routes available from current active port
  const hotTradeRoutes = useMemo(() => {
    if (!currentCity) return [];
    const routes: Array<{
      comm: Commodity;
      dstCity: City;
      buyPrice: number;
      sellPrice: number;
      netUnitProfit: number;
      roiPercent: number;
    }> = [];

    commodities.forEach((comm) => {
      const mp = marketPrices[comm.id];
      if (!mp) return;
      const srcSupplyMul = currentCity.exportSupply[comm.id] || 1.0;
      const baseBuy = mp.currentPrice * srcSupplyMul * (1 - marketDiscountBonus);
      const buyPrice = Math.round(baseBuy * (1 + currentCity.taxRate * (1 - portTaxDiscount)));

      cityList.forEach((dst) => {
        if (dst.id === currentCity.id) return;
        const dstDemandMul = dst.importDemand[comm.id] || 1.0;
        const baseSell = mp.currentPrice * dstDemandMul;
        const sellPrice = Math.round(baseSell * (1 - dst.taxRate * (1 - portTaxDiscount)));
        const netUnitProfit = sellPrice - buyPrice;
        if (netUnitProfit > 0) {
          const roiPercent = Math.round((netUnitProfit / buyPrice) * 100);
          routes.push({
            comm,
            dstCity: dst,
            buyPrice,
            sellPrice,
            netUnitProfit,
            roiPercent,
          });
        }
      });
    });

    return routes.sort((a, b) => b.roiPercent - a.roiPercent).slice(0, 3);
  }, [currentCity, commodities, marketPrices, cityList, marketDiscountBonus, portTaxDiscount]);

  // One-Click Beginner Automated Guided Trade Action
  const handleAutoBeginnerTrade = () => {
    soundFx.playClick();
    const idleShip = ships.find((s) => s.status === 'docked') || ships[0];
    if (!idleShip) return;

    const shipPort = cities[idleShip.currentCityId] || currentCity;
    const capacityAvailable = idleShip.capacity - idleShip.cargoUsed;
    if (capacityAvailable <= 0) {
      // If already full, dispatch to Athens or best demand city
      dispatchShip(idleShip.id, 'athens');
      return;
    }

    // Buy affordable wheat or best cargo
    const commId = 'wheat';
    const mp = marketPrices[commId]?.currentPrice || 120;
    const unitPrice = Math.round(mp * (shipPort.exportSupply[commId] || 0.8));
    const maxAffordable = Math.floor(cash / unitPrice);
    const qtyToBuy = Math.min(capacityAvailable, Math.max(10, maxAffordable > 10 ? 30 : maxAffordable));

    if (qtyToBuy > 0) {
      buyCommodity(shipPort.id, commId, qtyToBuy, 'ship', idleShip.id);
    }
    // Set destination and dispatch
    const targetDest = shipPort.id === 'athens' ? 'alexandria' : 'athens';
    setTimeout(() => {
      dispatchShip(idleShip.id, targetDest);
    }, 200);
  };

  // Helper to compute ship current interpolated position in %
  const getShipCoords = (ship: PlayerShip) => {
    const srcCity = cities[ship.currentCityId];
    if (ship.status !== 'transit' || !ship.destinationCityId || !ship.voyageStartTime) {
      return srcCity ? { x: srcCity.coords.x, y: srcCity.coords.y } : { x: 50, y: 50 };
    }
    const dstCity = cities[ship.destinationCityId];
    if (!srcCity || !dstCity) return { x: 50, y: 50 };

    const elapsed = Date.now() - ship.voyageStartTime;
    const progress = Math.min(1, Math.max(0, elapsed / (ship.voyageDurationMs || 1)));

    return {
      x: srcCity.coords.x + (dstCity.coords.x - srcCity.coords.x) * progress,
      y: srcCity.coords.y + (dstCity.coords.y - srcCity.coords.y) * progress,
      progress,
    };
  };

  const selectedComm = commodities.find((c) => c.id === quickTradeCommId) || commodities[0];
  const selectedCommPrice = marketPrices[quickTradeCommId];
  const unitBuyPrice = selectedComm && selectedCommPrice
    ? Math.round(
        selectedCommPrice.currentPrice *
          (currentCity.exportSupply[quickTradeCommId] || 1.0) *
          (1 - marketDiscountBonus) *
          (1 + currentCity.taxRate * (1 - portTaxDiscount))
      )
    : 100;

  const unitSellPrice = selectedComm && selectedCommPrice
    ? Math.round(
        selectedCommPrice.currentPrice *
          (currentCity.importDemand[quickTradeCommId] || 1.0) *
          (1 - currentCity.taxRate * (1 - portTaxDiscount))
      )
    : 100;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner: Beginner Quick-Start Story & 1-Click Action Wizard */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                {isAr ? 'لوحة التحكم الشاملة (الكل في شاشة واحدة)' : 'Unified Cockpit (Single Screen Mode)'}
              </span>
              {skillPoints > 0 && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsSkillTreeOpen(true);
                  }}
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{skillPoints} {isAr ? 'نقاط مهارة متاحة' : 'Skill Points'}</span>
                </button>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {isAr
                ? 'تحكّم في إمبراطوريتك التجارية كاملة من نافذة واحدة دون تشتت'
                : 'Run Your Entire Maritime Trade Empire from a Single Screen'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'اختر الميناء، اشترِ السلع بأسعار رخيصة، اشحن أسطولك، وانطلق لجني أرباح الرحلات فوراً مع متابعة حية لموقع السفن والأسعار.'
                : 'Select ports directly on the map, buy discounted commodities, load your fleet, and dispatch voyages with live progress tracking.'}
            </p>
          </div>

          {/* 1-Click Guided First Trade Wizard Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleAutoBeginnerTrade}
              className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/30 border border-amber-300 transform hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 fill-slate-950 stroke-none" />
              <div className="text-left rtl:text-right">
                <div>{isAr ? '🚀 تنفيذ أول صفقة رابحة بنقرة واحدة' : '🚀 Launch 1-Click Smart Trade'}</div>
                <div className="text-[10px] opacity-80 font-semibold">
                  {isAr ? 'شراء قمح + شحن السفينة + إبحار لأثينا (+45% ربح)' : 'Buy Wheat + Load Cargo + Sail to Athens (+45% ROI)'}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setIsHowToPlayOpen(true);
              }}
              className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'شرح القصة وقواعد اللعبة' : 'Game Story Guide'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Single-Screen Grid: Left (Interactive World Map & Fleet) + Right (Quick Port Trade Terminal) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: World Map + Live Fleet Status */}
        <div className="lg:col-span-8 space-y-5">
          {/* Interactive World Map Widget */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  {isAr ? 'خريطة الموانئ والأسطول المباشر' : 'Live Interactive World Map & Ports'}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{isAr ? 'انقر على أي ميناء لاختياره فوراً' : 'Click any port to select'}</span>
              </div>
            </div>

            {/* SVG Visual Map Container */}
            <div className="relative w-full aspect-[16/9] min-h-[300px] sm:min-h-[360px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/80 shadow-inner">
              {/* Radar Grid Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

              {/* SVG Canvas */}
              <svg className="w-full h-full absolute inset-0 select-none">
                {/* Visual Trade Lines for active ships */}
                {ships.map((ship) => {
                  if (ship.status !== 'transit' || !ship.destinationCityId) return null;
                  const src = cities[ship.currentCityId];
                  const dst = cities[ship.destinationCityId];
                  if (!src || !dst) return null;
                  return (
                    <g key={`route-${ship.id}`}>
                      <line
                        x1={`${src.coords.x}%`}
                        y1={`${src.coords.y}%`}
                        x2={`${dst.coords.x}%`}
                        y2={`${dst.coords.y}%`}
                        stroke="rgba(99, 102, 241, 0.4)"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                    </g>
                  );
                })}

                {/* Cities / Ports Markers */}
                {cityList.map((city) => {
                  const isSelected = city.id === activePortId;
                  const shipsDockedHere = ships.filter((s) => s.status === 'docked' && s.currentCityId === city.id);

                  return (
                    <g
                      key={city.id}
                      onClick={() => {
                        soundFx.playClick();
                        setActivePortId(city.id);
                        setSelectedCityId(city.id);
                        if (shipsDockedHere.length > 0) {
                          setSelectedShipId(shipsDockedHere[0].id);
                        }
                      }}
                      onMouseEnter={() => setHoveredCity(city)}
                      onMouseLeave={() => setHoveredCity(null)}
                      className="cursor-pointer group"
                    >
                      {/* Selection Pulse Ring */}
                      {isSelected && (
                        <circle
                          cx={`${city.coords.x}%`}
                          cy={`${city.coords.y}%`}
                          r="14"
                          fill="rgba(245, 158, 11, 0.2)"
                          className="animate-ping"
                        />
                      )}

                      {/* City Pin Node */}
                      <circle
                        cx={`${city.coords.x}%`}
                        cy={`${city.coords.y}%`}
                        r={isSelected ? 7 : 5}
                        className={`transition-all duration-300 ${
                          isSelected
                            ? 'fill-amber-400 stroke-white stroke-2'
                            : shipsDockedHere.length > 0
                              ? 'fill-emerald-400 stroke-slate-900 stroke-2'
                              : 'fill-indigo-400 hover:fill-amber-300 stroke-slate-900 stroke-1'
                        }`}
                      />

                      {/* Port Label */}
                      <text
                        x={`${city.coords.x}%`}
                        y={`${city.coords.y + 4.5}%`}
                        textAnchor="middle"
                        className={`text-[10px] font-extrabold select-none transition-all ${
                          isSelected
                            ? 'fill-amber-300 text-[11px] font-black'
                            : 'fill-slate-300 opacity-85 group-hover:fill-white group-hover:opacity-100'
                        }`}
                      >
                        {isAr ? city.nameAr : city.name}
                      </text>

                      {/* Ship Docked Badge */}
                      {shipsDockedHere.length > 0 && (
                        <g transform={`translate(0, -10)`}>
                          <circle
                            cx={`${city.coords.x}%`}
                            cy={`${city.coords.y - 2}%`}
                            r="4"
                            className="fill-emerald-500 stroke-slate-950 stroke-1"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Animated Sailing Ships */}
                {ships.map((ship) => {
                  const pos = getShipCoords(ship);
                  const isShipSelected = ship.id === activeShip?.id;
                  return (
                    <g
                      key={`ship-${ship.id}`}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedShipId(ship.id);
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={`${pos.x}%`}
                        cy={`${pos.y}%`}
                        r={isShipSelected ? 9 : 7}
                        className={`${
                          ship.status === 'transit'
                            ? 'fill-cyan-400/30 stroke-cyan-400 stroke-2 animate-pulse'
                            : 'fill-emerald-400/30 stroke-emerald-400 stroke-2'
                        }`}
                      />
                      <circle
                        cx={`${pos.x}%`}
                        cy={`${pos.y}%`}
                        r="3"
                        className={ship.status === 'transit' ? 'fill-cyan-300' : 'fill-emerald-300'}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover City Tooltip Box */}
              {hoveredCity && (
                <div
                  className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs z-30 pointer-events-none"
                >
                  <div className="font-extrabold text-white flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? hoveredCity.nameAr : hoveredCity.name}</span>
                    <span className="text-[10px] text-slate-400">({isAr ? hoveredCity.countryAr : hoveredCity.country})</span>
                  </div>
                  <div className="text-[11px] text-amber-400 mt-0.5">
                    {isAr ? hoveredCity.specialtyDescriptionAr : hoveredCity.specialtyDescription}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Port Switcher Pills */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">
                {isAr ? 'الموانئ السريعة:' : 'Quick Ports:'}
              </span>
              {cityList.slice(0, 7).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActivePortId(c.id);
                    setSelectedCityId(c.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    c.id === activePortId
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Anchor className="w-3 h-3" />
                  <span>{isAr ? c.nameAr : c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Active Fleet Radar Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  {isAr ? 'حالة السفن والأسطول اللوجستي' : 'Live Fleet Status & Voyages'}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                {ships.filter((s) => s.status === 'transit').length} / {ships.length} {isAr ? 'سفن مبحرة' : 'Sailing'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ships.map((ship) => {
                const isSelected = ship.id === activeShip?.id;
                const isSailing = ship.status === 'transit';
                const shipCity = cities[ship.currentCityId];
                const destCity = ship.destinationCityId ? cities[ship.destinationCityId] : null;

                const elapsed = ship.voyageStartTime ? Date.now() - ship.voyageStartTime : 0;
                const remainingSeconds = Math.max(0, Math.ceil((ship.voyageDurationMs - elapsed) / 1000));

                return (
                  <div
                    key={ship.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedShipId(ship.id);
                      if (!isSailing) {
                        setActivePortId(ship.currentCityId);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isSailing ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          <Ship className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{ship.customName}</div>
                          <div className="text-[10px] text-slate-400">
                            {isSailing
                              ? `${isAr ? 'مبحرة إلى' : 'Sailing to'} ${destCity ? (isAr ? destCity.nameAr : destCity.name) : ''}`
                              : `${isAr ? 'راسية في' : 'Docked at'} ${shipCity ? (isAr ? shipCity.nameAr : shipCity.name) : ''}`}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSailing
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isSailing ? (isAr ? 'في البحر' : 'In Transit') : (isAr ? 'جاهزة للشحن' : 'Ready')}
                      </span>
                    </div>

                    {/* Progress / Cargo Bar */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>{isAr ? 'الحمولة:' : 'Cargo:'} {ship.cargoUsed} / {ship.capacity} {isAr ? 'طن' : 'Tons'}</span>
                        {isSailing && (
                          <span className="text-cyan-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {remainingSeconds}s
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isSailing ? 'bg-gradient-to-r from-cyan-500 to-indigo-500' : 'bg-emerald-500'
                          }`}
                          style={{
                            width: isSailing
                              ? `${Math.min(100, Math.round((elapsed / (ship.voyageDurationMs || 1)) * 100))}%`
                              : `${Math.min(100, Math.round((ship.cargoUsed / ship.capacity) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Quick Interactive Port Trade Terminal */}
        <div className="lg:col-span-4 space-y-5">
          {/* Port Buy/Sell Terminal Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  <Anchor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">{isAr ? currentCity.nameAr : currentCity.name}</h3>
                  <div className="text-[10px] text-slate-400">{isAr ? 'منصة التجارة والشحن الفوري' : 'Live Trade & Cargo Terminal'}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {isAr ? 'ضريبة' : 'Tax'}: {Math.round(currentCity.taxRate * 100)}%
              </span>
            </div>

            {/* Select Commodity to Trade */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                {isAr ? 'اختر السلعة المراد تداولها:' : 'Select Commodity to Trade:'}
              </label>
              <select
                value={quickTradeCommId}
                onChange={(e) => setQuickTradeCommId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {commodities.map((comm) => {
                  const mp = marketPrices[comm.id];
                  return (
                    <option key={comm.id} value={comm.id}>
                      {comm.icon} {isAr ? comm.nameAr : comm.name} — ${mp?.currentPrice || comm.basePrice}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Quantity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>{isAr ? 'الكمية المطلوبة:' : 'Quantity to Trade:'}</span>
                <span className="text-amber-400 font-extrabold">{tradeQuantity} {isAr ? 'طن' : 'Tons'}</span>
              </div>
              <input
                type="range"
                min={5}
                max={activeShip ? activeShip.capacity : 100}
                step={5}
                value={tradeQuantity}
                onChange={(e) => setTradeQuantity(parseInt(e.target.value) || 5)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5t</span>
                <span>{Math.round((activeShip?.capacity || 100) / 2)}t</span>
                <span>{activeShip?.capacity || 100}t</span>
              </div>
            </div>

            {/* Buy / Sell Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {/* Buy & Load directly onto Active Ship */}
              <button
                onClick={() => {
                  if (!activeShip) return;
                  soundFx.playClick();
                  buyCommodity(currentCity.id, quickTradeCommId, tradeQuantity, 'ship', activeShip.id);
                }}
                disabled={cash < unitBuyPrice * tradeQuantity || activeShip?.status === 'transit'}
                className={`p-3 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  cash >= unitBuyPrice * tradeQuantity && activeShip?.status !== 'transit'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{isAr ? 'شراء وشحن' : 'Buy & Load'}</span>
                </div>
                <span className="text-[10px] font-medium opacity-90">
                  ${(unitBuyPrice * tradeQuantity).toLocaleString()} (${unitBuyPrice}/t)
                </span>
              </button>

              {/* Sell from Active Ship */}
              <button
                onClick={() => {
                  if (!activeShip) return;
                  soundFx.playClick();
                  sellCommodity(currentCity.id, quickTradeCommId, tradeQuantity, 'ship', activeShip.id);
                }}
                disabled={!activeShip || (activeShip.cargo[quickTradeCommId] || 0) <= 0 || activeShip.status === 'transit'}
                className={`p-3 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  activeShip && (activeShip.cargo[quickTradeCommId] || 0) > 0 && activeShip.status !== 'transit'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{isAr ? 'بيع الشحنة' : 'Sell Cargo'}</span>
                </div>
                <span className="text-[10px] font-medium opacity-90">
                  +${(unitSellPrice * tradeQuantity).toLocaleString()} (${unitSellPrice}/t)
                </span>
              </button>
            </div>

            {/* Quick Voyage Dispatcher */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                {isAr ? 'إطلاق الرحلة إلى ميناء الوجهة:' : 'Dispatch Ship to Destination Port:'}
              </label>
              <div className="flex gap-2">
                <select
                  value={quickDestCityId}
                  onChange={(e) => setQuickDestCityId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {cityList
                    .filter((c) => c.id !== currentCity.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.nameAr : c.name} ({isAr ? c.countryAr : c.country})
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => {
                    if (!activeShip) return;
                    soundFx.playClick();
                    dispatchShip(activeShip.id, quickDestCityId);
                  }}
                  disabled={!activeShip || activeShip.status === 'transit'}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    activeShip && activeShip.status !== 'transit'
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isAr ? 'إبحار' : 'Sail'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top 3 Most Profitable Routes Widget */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="font-extrabold text-xs sm:text-sm text-white">
                  {isAr ? 'أعلى فرص الأرباح من هذا الميناء' : 'Top Profitable Trade Opportunities'}
                </h4>
              </div>
            </div>

            <div className="space-y-2">
              {hotTradeRoutes.map((route) => (
                <div
                  key={`${route.comm.id}-${route.dstCity.id}`}
                  onClick={() => {
                    soundFx.playClick();
                    setQuickTradeCommId(route.comm.id);
                    setQuickDestCityId(route.dstCity.id);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{route.comm.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                        {isAr ? route.comm.nameAr : route.comm.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>{isAr ? currentCity.nameAr : currentCity.name}</span>
                        <ArrowRight className="w-2.5 h-2.5 rtl:rotate-180 text-amber-400" />
                        <span>{isAr ? route.dstCity.nameAr : route.dstCity.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left">
                    <div className="text-xs font-black text-emerald-400">+{route.roiPercent}% ROI</div>
                    <div className="text-[10px] text-slate-400">+${route.netUnitProfit}/t</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
