import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ShipModel, PlayerShip } from '../types/game';
import {
  Ship,
  Anchor,
  Zap,
  Shield,
  Fuel,
  Maximize2,
  Plus,
  Play,
  RotateCcw,
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Plane,
  Truck,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const FleetView: React.FC = () => {
  const {
    ships,
    shipModels,
    cities,
    commodities,
    cash,
    level,
    buyShip,
    sellShip,
    upgradeShip,
    dispatchShip,
    setAutoRoute,
    settings,
  } = useGame();

  const isAr = settings.language === 'ar';
  const [activeTab, setActiveTab] = useState<'my_fleet' | 'shipyard'>('my_fleet');
  const [selectedShipId, setSelectedShipId] = useState<string>(ships[0]?.id || '');
  const [newShipCustomName, setNewShipCustomName] = useState<string>('');

  const activeShip = ships.find((s) => s.id === selectedShipId) || ships[0];

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'truck':
        return <Truck className="w-5 h-5" />;
      case 'plane':
        return <Plane className="w-5 h-5" />;
      default:
        return <Ship className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub navigation: My Fleet vs Shipyard */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('my_fleet');
            }}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'my_fleet'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>{isAr ? `أسطولي التجاري (${ships.length})` : `My Active Fleet (${ships.length})`}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('shipyard');
            }}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'shipyard'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'حوض بناء وشراء السفن' : 'Shipyard & Fleet Store'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          {isAr ? 'السيولة المتاحة للشراء والتطوير:' : 'Available Capital:'}{' '}
          <strong className="text-emerald-400 font-bold">${cash.toLocaleString()}</strong>
        </div>
      </div>

      {activeTab === 'my_fleet' ? (
        /* MY ACTIVE FLEET VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left List of Owned Ships */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
              <span>{isAr ? 'السفن ومركبات النقل المملوكة' : 'Commissioned Vessels'}</span>
              <span>{ships.length} units</span>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {ships.map((ship) => {
                const model = shipModels.find((m) => m.id === ship.modelId);
                const currentCity = cities[ship.currentCityId];
                const destCity = ship.destinationCityId ? cities[ship.destinationCityId] : null;
                const isSelected = activeShip?.id === ship.id;
                const isTransit = ship.status === 'transit';

                return (
                  <div
                    key={ship.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedShipId(ship.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                          {getModelIcon(model?.type || 'boat')}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white leading-tight">{ship.customName}</h4>
                          <span className="text-[10px] text-slate-400">
                            {isAr ? model?.nameAr : model?.name}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isTransit
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isTransit ? (isAr ? 'في البحر' : 'Sailing') : isAr ? 'راسي' : 'Docked'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 mb-2">
                      <div>
                        <span className="text-slate-500">{isAr ? 'الموقع:' : 'Location:'} </span>
                        <strong>{isAr ? currentCity?.nameAr : currentCity?.name}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500">{isAr ? 'الحمولة:' : 'Hold:'} </span>
                        <strong className="text-amber-400">
                          {ship.cargoUsed}/{ship.capacity * (1 + ship.upgrades.holdExpansion * 0.2)}t
                        </strong>
                      </div>
                    </div>

                    {isTransit && destCity && (
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-amber-500 h-full rounded-full animate-pulse"
                          style={{
                            width: `${Math.min(
                              100,
                              ((Date.now() - (ship.voyageStartTime || 0)) / ship.voyageDurationMs) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Ship Control & Upgrade Center */}
          {activeShip && (
            <div className="lg:col-span-2 space-y-4">
              {/* Vessel Master Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex flex-wrap items-start justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      {getModelIcon(shipModels.find((m) => m.id === activeShip.modelId)?.type || 'boat')}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">{activeShip.customName}</h3>
                      <p className="text-xs text-slate-400">
                        {isAr
                          ? shipModels.find((m) => m.id === activeShip.modelId)?.nameAr
                          : shipModels.find((m) => m.id === activeShip.modelId)?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => sellShip(activeShip.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors"
                    >
                      {isAr ? 'بيع السفينة (استرداد 70%)' : 'Decommission (Sell 70%)'}
                    </button>
                  </div>
                </div>

                {/* Cargo on board summary */}
                <div className="mb-5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                    <span>{isAr ? 'البضائع المشحونة في عنابر السفينة:' : 'Cargo Currently On Board:'}</span>
                    <span className="text-amber-400">
                      {activeShip.cargoUsed} / {activeShip.capacity * (1 + activeShip.upgrades.holdExpansion * 0.2)} tons
                    </span>
                  </h4>

                  {Object.keys(activeShip.cargo).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(activeShip.cargo).map(([commId, qty]) => {
                        const comm = commodities.find((c) => c.id === commId);
                        return (
                          <div
                            key={commId}
                            className="bg-slate-900 border border-slate-700/70 px-3 py-1 rounded-xl text-xs flex items-center gap-2"
                          >
                            <span>{comm?.icon}</span>
                            <span className="font-bold text-slate-200">{isAr ? comm?.nameAr : comm?.name}:</span>
                            <span className="text-amber-400 font-extrabold">{qty} tons</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      {isAr ? 'العنابر فارغة حالياً. توجه إلى السوق لشراء البضائع.' : 'Cargo holds are currently empty. Visit the market to load goods.'}
                    </p>
                  )}
                </div>

                {/* Upgrades & Retrofitting Deck */}
                <div>
                  <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'تجهيزات وترقيات الأنظمة الملاحية' : 'Naval Retrofit & System Upgrades'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Engine Speed */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-200">
                            {isAr ? 'محركات السرعة النفاثة' : 'Engine Propulsion'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Lvl {activeShip.upgrades.engineLevel}/5 (+
                            {activeShip.upgrades.engineLevel * 15}% Speed)
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => upgradeShip(activeShip.id, 'engine')}
                        disabled={activeShip.upgrades.engineLevel >= 5}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all"
                      >
                        {activeShip.upgrades.engineLevel >= 5 ? 'MAX' : isAr ? 'ترقية' : 'Upgrade'}
                      </button>
                    </div>

                    {/* Cargo Hold Expansion */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-200">
                            {isAr ? 'توسعة عنابر الشحن' : 'Hold Expansion'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Lvl {activeShip.upgrades.holdExpansion}/5 (+
                            {activeShip.upgrades.holdExpansion * 20}% Cap)
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => upgradeShip(activeShip.id, 'hold')}
                        disabled={activeShip.upgrades.holdExpansion >= 5}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all"
                      >
                        {activeShip.upgrades.holdExpansion >= 5 ? 'MAX' : isAr ? 'ترقية' : 'Upgrade'}
                      </button>
                    </div>

                    {/* Fuel Efficiency */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                          <Fuel className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-200">
                            {isAr ? 'ترشيد استهلاك الوقود' : 'Fuel Optimizer'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Lvl {activeShip.upgrades.fuelEfficiency}/5 (-
                            {activeShip.upgrades.fuelEfficiency * 15}% Fuel)
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => upgradeShip(activeShip.id, 'fuel')}
                        disabled={activeShip.upgrades.fuelEfficiency >= 5}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all"
                      >
                        {activeShip.upgrades.fuelEfficiency >= 5 ? 'MAX' : isAr ? 'ترقية' : 'Upgrade'}
                      </button>
                    </div>

                    {/* Security & Armor */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-200">
                            {isAr ? 'تأمين وحماية ملاحية' : 'Hull Insurance'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Lvl {activeShip.upgrades.securityInsurance}/5 (Storm & Piracy Guard)
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => upgradeShip(activeShip.id, 'insurance')}
                        disabled={activeShip.upgrades.securityInsurance >= 5}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all"
                      >
                        {activeShip.upgrades.securityInsurance >= 5 ? 'MAX' : isAr ? 'ترقية' : 'Upgrade'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SHIPYARD VIEW */
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                {isAr ? 'أحواض بناء وتدشين الأساطيل البحرية والجوية' : 'Global Shipyard & Fleet Catalog'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              {isAr
                ? 'استثمر في ناقلات وسفن أضخم لزيادة حجم الشحنات وتحقيق أرباح مليونية في كل رحلة تجارية'
                : 'Commission larger freighters, tankers, and aircraft to scale cargo volumes and unlock multimillion-dollar trade runs.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shipModels.map((model) => {
                const isUnlocked = level >= model.minLevelRequired;
                const canAfford = cash >= model.baseCost;

                return (
                  <div
                    key={model.id}
                    className={`p-4 rounded-3xl border flex flex-col justify-between transition-all ${
                      isUnlocked
                        ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/50'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                            {getModelIcon(model.type)}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-white">
                              {isAr ? model.nameAr : model.name}
                            </h3>
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                              {model.type}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-extrabold text-emerald-400 text-sm">
                            ${model.baseCost.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {isAr ? `مستوى ${model.minLevelRequired}` : `Lvl ${model.minLevelRequired}`}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                        {isAr ? model.descriptionAr : model.description}
                      </p>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 mb-4">
                        <div>
                          <span className="text-[10px] text-slate-400 block">{isAr ? 'سعة الشحن:' : 'Cargo Hold:'}</span>
                          <strong className="text-amber-400 font-bold">{model.capacity} tons</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">{isAr ? 'السرعة القصوى:' : 'Max Speed:'}</span>
                          <strong className="text-blue-400 font-bold">{model.speedKnots} knots</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">{isAr ? 'تكلفة الوقود:' : 'Fuel / 1000km:'}</span>
                          <strong className="text-slate-200 font-bold">${model.fuelPer1000Km}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">{isAr ? 'الصيانة اليومية:' : 'Daily Maint:'}</span>
                          <strong className="text-slate-200 font-bold">${model.maintenanceDaily}/day</strong>
                        </div>
                      </div>
                    </div>

                    {/* Purchase button */}
                    <button
                      onClick={() => buyShip(model.id)}
                      disabled={!isUnlocked || !canAfford}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                        !isUnlocked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : !canAfford
                            ? 'bg-slate-800 text-red-400 border border-red-500/30'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {!isUnlocked
                          ? isAr
                            ? `يتطلب مستوى شركة ${model.minLevelRequired}`
                            : `Requires Level ${model.minLevelRequired}`
                          : !canAfford
                            ? isAr
                              ? 'السيولة غير كافية للشراء'
                              : 'Insufficient Funds'
                            : isAr
                              ? `شراء وتدشين السفينة ($${model.baseCost.toLocaleString()})`
                              : `Commission Vessel ($${model.baseCost.toLocaleString()})`}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
