import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CommodityTier, Commodity, City } from '../types/game';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  ShoppingCart,
  Package,
  Ship,
  Warehouse,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ProfitCalculatorCard } from './ProfitCalculatorCard';

export const MarketView: React.FC = () => {
  const {
    commodities,
    marketPrices,
    cities,
    ships,
    cash,
    buyCommodity,
    sellCommodity,
    settings,
  } = useGame();

  const isAr = settings.language === 'ar';

  // Filters & State
  const [selectedTier, setSelectedTier] = useState<CommodityTier | 'all'>('all');
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('coffee');
  const [selectedCityId, setSelectedCityId] = useState<string>('alexandria');
  const [tradeTarget, setTradeTarget] = useState<'warehouse' | 'ship'>('warehouse');
  const [selectedShipId, setSelectedShipId] = useState<string>(ships[0]?.id || '');
  const [tradeQuantity, setTradeQuantity] = useState<number>(10);
  const [activeMode, setActiveMode] = useState<'buy' | 'sell'>('buy');

  const selectedCommodity = commodities.find((c) => c.id === selectedCommodityId) || commodities[0];
  const selectedCity = cities[selectedCityId] || (Object.values(cities) as City[])[0];
  const marketPriceObj = marketPrices[selectedCommodity.id] || {
    currentPrice: selectedCommodity.basePrice,
    previousPrice: selectedCommodity.basePrice,
    basePrice: selectedCommodity.basePrice,
    priceHistory: [selectedCommodity.basePrice],
    change24hPercent: 0,
    trend: 'stable',
    globalStockPiles: 50000,
  };

  const dockedShipsInCity = ships.filter((s) => s.currentCityId === selectedCityId && s.status === 'docked');
  const activeShip = ships.find((s) => s.id === selectedShipId);

  // Available stock calculation
  const warehouseStock = selectedCity?.warehouseInventory[selectedCommodity.id] || 0;
  const shipStock = activeShip?.cargo[selectedCommodity.id] || 0;
  const currentHeldStock = tradeTarget === 'warehouse' ? warehouseStock : shipStock;

  // Max buy capacity
  const targetAvailableTons =
    tradeTarget === 'warehouse'
      ? selectedCity.warehouseCapacity - selectedCity.warehouseUsed
      : activeShip
        ? activeShip.capacity * (1 + activeShip.upgrades.holdExpansion * 0.2) - activeShip.cargoUsed
        : 0;

  const maxAffordableUnits = Math.max(
    0,
    Math.floor(cash / Math.max(1, marketPriceObj.currentPrice * (1 + selectedCity.taxRate)))
  );
  const maxHoldableUnits = Math.max(0, Math.floor(targetAvailableTons / selectedCommodity.weightPerUnit));
  const maxBuyQty = Math.min(maxAffordableUnits, maxHoldableUnits);
  const maxSellQty = currentHeldStock;

  // Price calculations
  const supplyMultiplier = selectedCity.exportSupply[selectedCommodity.id] || 1.0;
  const demandMultiplier = selectedCity.importDemand[selectedCommodity.id] || 1.0;

  const buyUnitPrice = Math.round(marketPriceObj.currentPrice * supplyMultiplier);
  const sellUnitPrice = Math.round(marketPriceObj.currentPrice * demandMultiplier);

  const activeUnitPrice = activeMode === 'buy' ? buyUnitPrice : sellUnitPrice;
  const subtotal = activeUnitPrice * tradeQuantity;
  const tax = Math.round(subtotal * selectedCity.taxRate);
  const totalAmount = activeMode === 'buy' ? subtotal + tax : subtotal - tax;

  // Filtered commodities list
  const filteredCommodities = commodities.filter(
    (c) => selectedTier === 'all' || c.tier === selectedTier
  );

  // High-Yield Arbitrage Opportunities Radar Scanner
  const arbitrageRoutes = [
    {
      commId: 'coffee',
      fromCity: 'rio_santos',
      toCity: 'alexandria',
      marginPercent: 62,
    },
    {
      commId: 'electronics',
      fromCity: 'shanghai',
      toCity: 'rotterdam',
      marginPercent: 54,
    },
    {
      commId: 'crude_oil',
      fromCity: 'jeddah',
      toCity: 'shanghai',
      marginPercent: 48,
    },
    {
      commId: 'quantum_chips',
      fromCity: 'tokyo',
      toCity: 'new_york',
      marginPercent: 78,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Arbitrage Opportunities Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Market Overview Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {isAr ? 'البورصة العالمية وسوق السلع الحية' : 'Global Commodity Exchange'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'أسعار فورية تتأثر بالعرض، الطلب، الأحداث الجوية والصفقات'
                    : 'Real-time prices driven by supply, demand, weather events & global fleets'}
                </p>
              </div>
            </div>

            {/* Tier Filters */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['all', 1, 2, 3, 4] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedTier(t);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    selectedTier === t
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'all'
                    ? isAr
                      ? 'الكل'
                      : 'All'
                    : isAr
                      ? `المستوى ${t}`
                      : `Tier ${t}`}
                </button>
              ))}
            </div>
          </div>

          {/* Commodities Grid Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredCommodities.map((comm) => {
              const mp = marketPrices[comm.id] || {
                currentPrice: comm.basePrice,
                priceHistory: [comm.basePrice],
                change24hPercent: 0,
                trend: 'stable',
              };
              const isSelected = selectedCommodityId === comm.id;
              const isUp = mp.trend === 'up';
              const isDown = mp.trend === 'down';

              // Generate Mini SVG Sparkline
              const history = mp.priceHistory.length > 1 ? mp.priceHistory : [comm.basePrice, comm.basePrice];
              const minP = Math.min(...history);
              const maxP = Math.max(...history);
              const range = Math.max(1, maxP - minP);
              const points = history
                .map((val, idx) => {
                  const x = (idx / (history.length - 1)) * 60;
                  const y = 22 - ((val - minP) / range) * 18;
                  return `${x},${y}`;
                })
                .join(' ');

              return (
                <div
                  key={comm.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCommodityId(comm.id);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-gradient-to-br from-slate-800 to-slate-850 border-amber-500/80 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{comm.icon}</span>
                      <div>
                        <h4 className="font-bold text-xs text-white leading-tight">
                          {isAr ? comm.nameAr : comm.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Tier {comm.tier}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-sm text-slate-100">${mp.currentPrice}</div>
                      <div
                        className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                          isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : isDown ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        <span>{mp.change24hPercent >= 0 ? `+${mp.change24hPercent}%` : `${mp.change24hPercent}%`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sparkline chart */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'الأساس:' : 'Base:'} ${comm.basePrice}
                    </span>
                    <svg width="60" height="24" className="overflow-visible">
                      <polyline
                        fill="none"
                        stroke={isUp ? '#34d399' : isDown ? '#f87171' : '#94a3b8'}
                        strokeWidth="1.5"
                        points={points}
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Profit Arbitrage Opportunities Radar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'رادار الصفقات الأعلى ربحية' : 'Arbitrage Opportunity Radar'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {isAr
                ? 'فروق الأسعار بين الموانئ تتيح تحقيق أرباح طائلة عبر النقل البحري'
                : 'Regional price spreads allow massive margins via strategic maritime trade'}
            </p>

            <div className="space-y-2.5">
              {arbitrageRoutes.map((arb, i) => {
                const comm = commodities.find((c) => c.id === arb.commId);
                const from = cities[arb.fromCity];
                const to = cities[arb.toCity];
                if (!comm || !from || !to) return null;

                return (
                  <div
                    key={i}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedCommodityId(comm.id);
                      setSelectedCityId(from.id);
                      setActiveMode('buy');
                    }}
                    className="p-3 bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                        <span>{comm.icon}</span>
                        <span>{isAr ? comm.nameAr : comm.name}</span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        +{arb.marginPercent}% Profit
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{isAr ? from.nameAr : from.name}</span>
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                      <span>{isAr ? to.nameAr : to.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              {isAr
                ? 'نصيحة: اشترِ القهوة من سانتوس واشحنها إلى الإسكندرية لتحقيق أول أرباح ضخمة!'
                : 'Tip: Purchase coffee in Santos and ship to Alexandria for massive starter returns!'}
            </p>
          </div>
        </div>
      </div>

      {/* Live Profit & Voyage Estimator Calculator Card */}
      <ProfitCalculatorCard
        initialCommodityId={selectedCommodityId}
        initialFromCityId={selectedCityId}
      />

      {/* Interactive Trade Terminal Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
              {selectedCommodity.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">
                  {isAr ? selectedCommodity.nameAr : selectedCommodity.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                  Tier {selectedCommodity.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? selectedCommodity.descriptionAr : selectedCommodity.description}
              </p>
            </div>
          </div>

          {/* Buy / Sell Mode Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveMode('buy');
              }}
              className={`px-6 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeMode === 'buy'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'شراء بضاعة (BUY)' : 'BUY CARGO'}
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveMode('sell');
              }}
              className={`px-6 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeMode === 'sell'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'بيع بضاعة (SELL)' : 'SELL CARGO'}
            </button>
          </div>
        </div>

        {/* Trade Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location & Target Selector */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isAr ? '1. الميناء المستهدف للتداول:' : '1. Trading Port Location:'}
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => {
                  soundFx.playClick();
                  setSelectedCityId(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-amber-300 focus:outline-none focus:border-amber-500"
              >
                {(Object.values(cities) as City[]).map((c) => (
                  <option key={c.id} value={c.id}>
                    {isAr ? c.nameAr : c.name} ({isAr ? c.countryAr : c.country}) - Tax: {Math.round(c.taxRate * 100)}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isAr ? '2. المستودع أو السفينة المحددة:' : '2. Target Warehouse / Vessel:'}
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setTradeTarget('warehouse')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    tradeTarget === 'warehouse'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Warehouse className="w-4 h-4" />
                  <span>{isAr ? 'مستودع الميناء' : 'Port Warehouse'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTradeTarget('ship')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    tradeTarget === 'ship'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Ship className="w-4 h-4" />
                  <span>{isAr ? 'عنبر السفينة' : 'Ship Hold'}</span>
                </button>
              </div>

              {tradeTarget === 'ship' && (
                <div>
                  {dockedShipsInCity.length > 0 ? (
                    <select
                      value={selectedShipId}
                      onChange={(e) => setSelectedShipId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {dockedShipsInCity.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.customName} ({s.cargoUsed}/{s.capacity} tons)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-amber-400/90 italic bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                      {isAr
                        ? 'لا توجد سفن راسية في هذا الميناء حالياً! اختر مستودع الميناء أو أرسل سفينة إلى هنا.'
                        : 'No ships docked in this port right now! Use warehouse or dispatch a vessel here.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quantity & Calculation */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold text-slate-300">{isAr ? '3. الكمية (بالأطنان):' : '3. Quantity (Tons):'}</label>
                <span className="text-slate-400">
                  {isAr ? 'المتوفر بحوزتك:' : 'Held stock:'} <strong className="text-amber-300">{currentHeldStock}t</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={activeMode === 'buy' ? Math.max(1, maxBuyQty) : Math.max(1, maxSellQty)}
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick % buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[10, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      const maxVal = activeMode === 'buy' ? maxBuyQty : maxSellQty;
                      const calculated = Math.max(1, Math.floor((maxVal * pct) / 100));
                      setTradeQuantity(calculated);
                    }}
                    className="py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-semibold border border-slate-800"
                  >
                    {pct === 100 ? (isAr ? 'الكل' : 'MAX') : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage capacity info */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'سعة التخزين المتاحة:' : 'Storage space available:'}</span>
                <span className="text-slate-200 font-bold">{Math.round(targetAvailableTons)} tons</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'وزن الشحنة الإجمالي:' : 'Total cargo weight:'}</span>
                <span className="text-amber-400 font-bold">{tradeQuantity * selectedCommodity.weightPerUnit} tons</span>
              </div>
            </div>
          </div>

          {/* Invoice & Execution */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-300 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>{isAr ? 'تفاصيل الفاتورة المالية' : 'Trade Invoice Summary'}</span>
                <span className="text-amber-400">
                  {activeMode === 'buy' ? (isAr ? 'شراء' : 'BUY') : isAr ? 'بيع' : 'SELL'}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'سعر الوحدة بالطن:' : 'Unit price / ton:'}</span>
                <span className="text-slate-200 font-bold">${activeUnitPrice}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'القيمة الإجمالية:' : 'Subtotal:'}</span>
                <span className="text-slate-200">${subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>
                  {isAr ? 'ضريبة الميناء' : 'Port Tax'} ({Math.round(selectedCity.taxRate * 100)}%):
                </span>
                <span className="text-slate-400">${tax.toLocaleString()}</span>
              </div>

              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-extrabold text-white">
                <span>{activeMode === 'buy' ? (isAr ? 'المبلغ المطلوب دفعه:' : 'Total Cost:') : isAr ? 'صافي العائد النقدي:' : 'Net Revenue:'}</span>
                <span className={activeMode === 'buy' ? 'text-emerald-400' : 'text-amber-400'}>
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={() => {
                if (activeMode === 'buy') {
                  buyCommodity(selectedCityId, selectedCommodity.id, tradeQuantity, tradeTarget, selectedShipId);
                } else {
                  sellCommodity(selectedCityId, selectedCommodity.id, tradeQuantity, tradeTarget, selectedShipId);
                }
              }}
              className={`w-full mt-4 py-3 rounded-xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                activeMode === 'buy'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {activeMode === 'buy'
                  ? isAr
                    ? `تأكيد شراء ${tradeQuantity} طن (${selectedCommodity.nameAr})`
                    : `Confirm Buy ${tradeQuantity}t (${selectedCommodity.name})`
                  : isAr
                    ? `تأكيد بيع ${tradeQuantity} طن (${selectedCommodity.nameAr})`
                    : `Confirm Sell ${tradeQuantity}t (${selectedCommodity.name})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
