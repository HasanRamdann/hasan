import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { calculateCityDistance, calculateVoyageDuration, calculateVoyageFuelCost } from '../utils/gameMath';
import {
  TrendingUp,
  Fuel,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Calculator,
  ChevronDown,
  ChevronUp,
  Ship,
  Compass,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ProfitCalculatorCardProps {
  sourceCityId?: string;
  targetCityId?: string;
  commodityId?: string;
  quantity?: number;
  shipModelId?: string;
  initialCommodityId?: string | null;
  initialFromCityId?: string | null;
  className?: string;
}

export const ProfitCalculatorCard: React.FC<ProfitCalculatorCardProps> = ({
  sourceCityId: propSrcCityId,
  targetCityId: propDstCityId,
  commodityId: propCommId,
  quantity: propQty,
  shipModelId: propShipModelId,
  initialCommodityId,
  initialFromCityId,
  className = '',
}) => {
  const {
    cities,
    commodities,
    marketPrices,
    shipModels,
    ships,
    settings,
    unlockedSkills,
  } = useGame();

  const isAr = settings.language === 'ar';
  const cityList = useMemo(() => Object.values(cities), [cities]);

  // Interactive local states for calculator
  const [srcCityId, setSrcCityId] = useState<string>(
    propSrcCityId || initialFromCityId || 'alexandria'
  );
  const [dstCityId, setDstCityId] = useState<string>(
    propDstCityId || (initialFromCityId === 'athens' ? 'alexandria' : 'athens')
  );
  const [selectedCommId, setSelectedCommId] = useState<string>(
    propCommId || initialCommodityId || 'wheat'
  );
  const [cargoQuantity, setCargoQuantity] = useState<number>(propQty || 50);
  const [selectedShipModelId, setSelectedShipModelId] = useState<string>(
    propShipModelId || shipModels[0]?.id || 'cargo_boat_coastal'
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Sync with prop updates if passed dynamically
  useEffect(() => {
    if (initialFromCityId && cities[initialFromCityId]) {
      setSrcCityId(initialFromCityId);
      if (initialFromCityId === dstCityId) {
        const other = cityList.find((c) => c.id !== initialFromCityId);
        if (other) setDstCityId(other.id);
      }
    }
  }, [initialFromCityId, cities, dstCityId, cityList]);

  useEffect(() => {
    if (initialCommodityId) {
      setSelectedCommId(initialCommodityId);
    }
  }, [initialCommodityId]);

  // CEO Perk modifiers
  const marketDiscountBonus = unlockedSkills.includes('commerce_discount_2') ? 0.08 : 0;
  const portTaxDiscount = unlockedSkills.includes('commerce_tax_1') ? 0.35 : 0;
  const fleetSpeedBonus = unlockedSkills.includes('logistics_speed_1') ? 0.15 : 0;
  const fuelDiscountBonus = unlockedSkills.includes('logistics_fuel_2') ? 0.20 : 0;

  const calculation = useMemo(() => {
    if (!srcCityId || !dstCityId || !selectedCommId || cargoQuantity <= 0) return null;
    const srcCity = cities[srcCityId];
    const dstCity = cities[dstCityId];
    const comm = commodities.find((c) => c.id === selectedCommId);
    const mp = marketPrices[selectedCommId];
    const model = shipModels.find((m) => m.id === selectedShipModelId) || shipModels[0];

    if (!srcCity || !dstCity || !comm || !mp || !model) return null;

    // 1. Purchase cost at source port
    const srcSupplyMul = srcCity.exportSupply[selectedCommId] || 1.0;
    const baseBuyPrice = mp.currentPrice * srcSupplyMul * (1 - marketDiscountBonus);
    const effectiveSrcTax = srcCity.taxRate * (1 - portTaxDiscount);
    const buyUnitPrice = Math.round(baseBuyPrice * (1 + effectiveSrcTax));
    const totalBuyCost = buyUnitPrice * cargoQuantity;

    // 2. Expected sale revenue at destination port
    const dstDemandMul = dstCity.importDemand[selectedCommId] || 1.0;
    const baseSellPrice = mp.currentPrice * dstDemandMul;
    const effectiveDstTax = dstCity.taxRate * (1 - portTaxDiscount);
    const sellUnitPrice = Math.round(baseSellPrice * (1 - effectiveDstTax));
    const totalGrossRevenue = sellUnitPrice * cargoQuantity;

    // 3. Navigation, Distance & Fuel
    const distanceNm = calculateCityDistance(srcCity, dstCity);
    const durationSeconds = calculateVoyageDuration(
      distanceNm,
      model.speedKnots,
      1 + fleetSpeedBonus,
      settings.gameSpeed
    );
    const fuelCost = calculateVoyageFuelCost(
      distanceNm,
      model.fuelPer1000Km,
      fuelDiscountBonus
    );

    // 4. Net Profit calculation
    const netProfit = totalGrossRevenue - totalBuyCost - fuelCost;
    const profitMarginPercent = totalBuyCost > 0 ? Math.round((netProfit / totalBuyCost) * 100) : 0;
    const profitPerSecond = durationSeconds > 0 ? Math.round(netProfit / durationSeconds) : 0;
    const unitMargin = sellUnitPrice - buyUnitPrice;

    return {
      buyUnitPrice,
      totalBuyCost,
      sellUnitPrice,
      totalGrossRevenue,
      distanceNm,
      durationSeconds,
      fuelCost,
      netProfit,
      profitMarginPercent,
      profitPerSecond,
      unitMargin,
      srcCityName: isAr ? srcCity.nameAr : srcCity.name,
      dstCityName: isAr ? dstCity.nameAr : dstCity.name,
      commName: isAr ? comm.nameAr : comm.name,
      commIcon: comm.icon,
      modelName: isAr ? model.nameAr : model.name,
    };
  }, [
    srcCityId,
    dstCityId,
    selectedCommId,
    cargoQuantity,
    selectedShipModelId,
    cities,
    commodities,
    marketPrices,
    shipModels,
    isAr,
    marketDiscountBonus,
    portTaxDiscount,
    fleetSpeedBonus,
    fuelDiscountBonus,
    settings.gameSpeed,
  ]);

  const isProfitable = calculation ? calculation.netProfit > 0 : false;
  const isHighYield = calculation ? calculation.profitMarginPercent >= 30 : false;

  return (
    <div
      className={`bg-slate-900/95 border rounded-3xl p-5 shadow-2xl transition-all ${
        isHighYield
          ? 'border-amber-500/50 shadow-amber-500/10'
          : isProfitable
            ? 'border-emerald-500/40 shadow-emerald-500/10'
            : 'border-slate-800'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
              isHighYield
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : isProfitable
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}
          >
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>{isAr ? 'حاسبة وتوقع الأرباح الذكية للرحلات' : 'Live Voyage & Trade Profit Calculator'}</span>
              {isHighYield && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  {isAr ? 'فرصة ذهبية' : 'High Yield'}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'احسب العائد، استهلاك الوقود وصافي الربح المتوقع قبل شراء البضائع وتوجيه السفن'
                : 'Simulate revenue, fuel consumption, and net margin before launching voyages'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setIsExpanded(!isExpanded);
          }}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title={isAr ? 'إظهار / إخفاء عناصر التحكم' : 'Toggle Calculator Controls'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Interactive Selectors Section */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          {/* Source Port */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              {isAr ? 'ميناء الشراء (الانطلاق)' : 'Origin / Buy Port'}
            </label>
            <select
              value={srcCityId}
              onChange={(e) => setSrcCityId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {cityList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {isAr ? c.nameAr : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Port */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              {isAr ? 'ميناء البيع (الوجهة)' : 'Destination / Sell Port'}
            </label>
            <select
              value={dstCityId}
              onChange={(e) => setDstCityId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {cityList.map((c) => (
                <option key={c.id} value={c.id} disabled={c.id === srcCityId}>
                  {c.flag} {isAr ? c.nameAr : c.name} {c.id === srcCityId ? `(${isAr ? 'الميناء الحالي' : 'Current'})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Commodity Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              {isAr ? 'السلعة التجارية' : 'Commodity'}
            </label>
            <select
              value={selectedCommId}
              onChange={(e) => setSelectedCommId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              {commodities.map((comm) => (
                <option key={comm.id} value={comm.id}>
                  {comm.icon} {isAr ? comm.nameAr : comm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cargo Payload Quantity */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>{isAr ? 'حجم الحمولة' : 'Payload Quantity'}</span>
              <span className="text-amber-400">{cargoQuantity} {isAr ? 'طن' : 'Tons'}</span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={cargoQuantity}
              onChange={(e) => setCargoQuantity(parseInt(e.target.value) || 10)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>
      )}

      {/* Calculation Results Card */}
      {calculation ? (
        <div className="space-y-3 mt-3">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Purchase Outlay */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400">{isAr ? 'تكلفة الشراء الصافية' : 'Total Buy Outlay'}</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-100 mt-0.5">
                ${calculation.totalBuyCost.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">${calculation.buyUnitPrice} / {isAr ? 'طن' : 'ton'}</div>
            </div>

            {/* Target Gross Revenue */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400">{isAr ? 'إيرادات البيع المستهدفة' : 'Target Gross Revenue'}</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-100 mt-0.5">
                ${calculation.totalGrossRevenue.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">${calculation.sellUnitPrice} / {isAr ? 'طن' : 'ton'}</div>
            </div>

            {/* Fuel & Distance */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Fuel className="w-3 h-3 text-amber-400" />
                <span>{isAr ? 'مصاريف الوقود' : 'Fuel Cost & Dist'}</span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-amber-300 mt-0.5">
                -${calculation.fuelCost.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">{calculation.distanceNm} NM ({isAr ? 'ميل بحري' : 'nautical miles'})</div>
            </div>

            {/* Transit Time & Speed */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{isAr ? 'زمن الوصول والسرعة' : 'Voyage ETA'}</span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-cyan-300 mt-0.5">
                ~{calculation.durationSeconds}s
              </div>
              <div className="text-[10px] text-slate-500">${calculation.profitPerSecond}/s {isAr ? 'ربح بالثانية' : 'profit/sec'}</div>
            </div>
          </div>

          {/* Bottom Net Margin Summary Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
              isProfitable
                ? 'bg-gradient-to-r from-emerald-950/50 via-emerald-900/30 to-slate-950 border-emerald-500/50'
                : 'bg-gradient-to-r from-rose-950/50 via-rose-900/30 to-slate-950 border-rose-500/50'
            }`}
          >
            <div>
              <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>{isAr ? 'صافي الربح التقديري الصافي' : 'Estimated Net Voyage Profit'}</span>
                {calculation.unitMargin > 0 && (
                  <span className="text-emerald-400">
                    (+${calculation.unitMargin}/{isAr ? 'طن' : 't'})
                  </span>
                )}
              </div>
              <div
                className={`text-lg sm:text-2xl font-black flex items-center gap-2 mt-0.5 ${
                  isProfitable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span>{isProfitable ? '+' : ''}${calculation.netProfit.toLocaleString()}</span>
                <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-lg bg-slate-950/80 border border-slate-700">
                  {calculation.profitMarginPercent >= 0 ? `+${calculation.profitMarginPercent}%` : `${calculation.profitMarginPercent}%`} ROI
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400">{isAr ? 'مسار الرحلة والسلعة' : 'Voyage Route & Cargo'}</div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 justify-end">
                <span>{calculation.srcCityName}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 rtl:rotate-180" />
                <span>{calculation.dstCityName}</span>
                <span className="text-amber-300">({calculation.commIcon} {cargoQuantity}t)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-400">
          {isAr ? 'اختر موانئ وسلعة صالحة لبدء المحاكاة المالية' : 'Select valid ports and commodity to simulate trade returns'}
        </div>
      )}
    </div>
  );
};
