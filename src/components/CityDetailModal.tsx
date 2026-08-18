import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import {
  X,
  Anchor,
  Warehouse,
  Building2,
  Ship,
  TrendingUp,
  Percent,
  Plus,
  ArrowRightLeft,
  ArrowRight,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const CityDetailModal: React.FC = () => {
  const {
    cities,
    selectedCityId,
    setSelectedCityId,
    commodities,
    ships,
    cash,
    openBranch,
    upgradeWarehouse,
    settings,
  } = useGame();

  const [selectedDockedShipId, setSelectedDockedShipId] = useState<string>('');
  const [transferCommId, setTransferCommId] = useState<string>('coffee');
  const [transferQty, setTransferQty] = useState<number>(10);

  const isAr = settings.language === 'ar';

  if (!selectedCityId) return null;

  const city = cities[selectedCityId];
  if (!city) return null;

  const dockedShips = ships.filter((s) => s.currentCityId === city.id && s.status === 'docked');
  const selectedDockedShip = ships.find((s) => s.id === (selectedDockedShipId || dockedShips[0]?.id));

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setSelectedCityId(null)}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Anchor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-white">{isAr ? city.nameAr : city.name}</h2>
                <span className="text-xs text-slate-400">
                  {isAr ? city.countryAr : city.country} • {isAr ? city.regionAr : city.region}
                </span>
              </div>
              <p className="text-xs text-slate-300 italic mt-0.5">
                {isAr ? city.specialtyDescriptionAr : city.specialtyDescription}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedCityId(null);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Port Status & Corporate Office */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="font-bold">{isAr ? 'الفرع والمقر التجاري:' : 'Corporate Branch:'}</span>
            </div>
            {city.hasBranch ? (
              <div className="text-emerald-400 font-extrabold flex items-center gap-1 pt-1">
                <CheckCircle className="w-4 h-4" />
                <span>{isAr ? 'فرع معتمد نشط (خصم ضرائب + صناعة)' : 'Authorized Active Branch'}</span>
              </div>
            ) : (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'فرع غير مؤسس ($50,000)' : 'No Branch ($50,000)'}</span>
                <button
                  onClick={() => openBranch(city.id)}
                  disabled={cash < 50000}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  {isAr ? 'تأسيس فرع' : 'Open Office'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-indigo-400" />
              <span className="font-bold">{isAr ? 'رسوم وضريبة الميناء:' : 'Customs & Port Tax:'}</span>
            </div>
            <div className="text-slate-100 font-extrabold text-sm pt-1">
              {Math.round(city.taxRate * 100)}%
              {city.hasBranch && (
                <span className="text-[10px] text-emerald-400 ml-2 font-normal">
                  ({isAr ? 'مخفضة بفضل الفرع' : 'Branch Discount Active'})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Warehouse Inventory Deck */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-xs text-white">
                {isAr ? 'مستودع الميناء المخصص لشركتك' : 'Port Warehouse Storage'}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 font-bold">
                {city.warehouseUsed} / {city.warehouseCapacity} tons
              </span>
              <button
                onClick={() => upgradeWarehouse(city.id)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-lg text-[11px] font-bold transition-colors"
              >
                +5,000t ($40k)
              </button>
            </div>
          </div>

          {/* Stored goods chips */}
          <div className="pt-2">
            {Object.keys(city.warehouseInventory).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(city.warehouseInventory).map(([commId, qty]) => {
                  const comm = commodities.find((c) => c.id === commId);
                  return (
                    <div
                      key={commId}
                      className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <span>{comm?.icon}</span>
                      <span className="text-slate-300 font-medium">{isAr ? comm?.nameAr : comm?.name}:</span>
                      <strong className="text-amber-400 font-extrabold">{qty}t</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                {isAr ? 'المستودع فارغ في هذا الميناء.' : 'No cargo stored in this port warehouse.'}
              </p>
            )}
          </div>
        </div>

        {/* Docked Vessels in this City */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs text-white">
              {isAr ? `السفن الراسية في رصيف الميناء (${dockedShips.length})` : `Vessels Currently Docked (${dockedShips.length})`}
            </h3>
          </div>

          {dockedShips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dockedShips.map((s) => (
                <div key={s.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>🚢 {s.customName}</span>
                    <span className="text-amber-400 font-extrabold">{s.cargoUsed}/{s.capacity}t</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {isAr ? 'لا توجد سفن لشركتك راسية في هذا الميناء حالياً.' : 'No company vessels currently docked in this port.'}
            </p>
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
