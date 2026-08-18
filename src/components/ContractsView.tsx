import React from 'react';
import { useGame } from '../context/GameContext';
import { TradeContract } from '../types/game';
import {
  FileSpreadsheet,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  AlertTriangle,
  Building,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const ContractsView: React.FC = () => {
  const {
    availableContracts,
    activeContracts,
    cities,
    commodities,
    ships,
    level,
    acceptContract,
    deliverContract,
    settings,
  } = useGame();

  const isAr = settings.language === 'ar';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            {isAr ? 'عقود التوريد والمناقصات المؤسسية الدولية (B2B)' : 'Corporate & Sovereign Supply Contracts'}
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          {isAr
            ? 'وقع عقود توريد ضخمة مع الحكومات والشركات العالمية الكبرى، احرص على التسليم في الموعد لكسب السمعة ⭐ والأرباح.'
            : 'Sign high-volume supply tenders with governments and conglomerates. Deliver on time to maximize reputation and payouts.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Contracts Committed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                {isAr ? `العقود النشطة الملتزم بها (${activeContracts.length})` : `Active Committed Contracts (${activeContracts.length})`}
              </h3>
            </div>
          </div>

          {activeContracts.length > 0 ? (
            <div className="space-y-3">
              {activeContracts.map((contract) => {
                const comm = commodities.find((c) => c.id === contract.commodityId);
                const destCity = cities[contract.targetCityId];
                if (!comm || !destCity) return null;

                // Check local stock
                const warehouseQty = destCity.warehouseInventory[contract.commodityId] || 0;
                const dockedShipQty = ships
                  .filter((s) => s.currentCityId === contract.targetCityId && s.status === 'docked')
                  .reduce((sum, s) => sum + (s.cargo[contract.commodityId] || 0), 0);
                const totalStockHere = warehouseQty + dockedShipQty;
                const isReadyToDeliver = totalStockHere >= contract.requiredQuantity;

                return (
                  <div
                    key={contract.id}
                    className="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-3xl shadow-xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {contract.issuerType}
                        </span>
                        <h4 className="font-extrabold text-sm text-white mt-1">
                          {isAr ? contract.issuerNameAr : contract.issuerName}
                        </h4>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-emerald-400 text-sm">
                          +${contract.rewardCash.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-yellow-400 font-bold flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>+{contract.reputationReward} Rep</span>
                        </div>
                      </div>
                    </div>

                    {/* Cargo specifications */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-300">
                        <span>{isAr ? 'السلعة والكمية المطلوبة:' : 'Required Cargo:'}</span>
                        <strong className="text-amber-400">
                          {contract.requiredQuantity}t {comm.icon} {isAr ? comm.nameAr : comm.name}
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>{isAr ? 'ميناء التسليم المحدد:' : 'Target Port:'}</span>
                        <strong className="text-blue-400">
                          {isAr ? destCity.nameAr : destCity.name} ({isAr ? destCity.countryAr : destCity.country})
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                        <span>{isAr ? 'البضاعة المتوفرة في هذا الميناء حالياً:' : 'Stock Available at Destination:'}</span>
                        <span className={isReadyToDeliver ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          {totalStockHere} / {contract.requiredQuantity} tons
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => deliverContract(contract.id)}
                      disabled={!isReadyToDeliver}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                        isReadyToDeliver
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {isReadyToDeliver
                          ? isAr
                            ? 'تسليم الشحنة واستلام المكافأة المالية والسمعة'
                            : 'Fulfill & Claim Payout & Rep'
                          : isAr
                            ? `تحتاج لتوفير الشحنة في ميناء ${destCity.nameAr}`
                            : `Ship Cargo to ${destCity.name} First`}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl text-center space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {isAr ? 'لا توجد عقود نشطة قيد التنفيذ حالياً.' : 'No active tenders currently accepted.'}
              </p>
            </div>
          )}
        </div>

        {/* Available Tenders Market */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                {isAr ? `المناقصات والعقود المتاحة للتوقيع (${availableContracts.length})` : `Available Tenders Market (${availableContracts.length})`}
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {availableContracts.map((contract) => {
              const comm = commodities.find((c) => c.id === contract.commodityId);
              const destCity = cities[contract.targetCityId];
              const isLevelOk = level >= contract.minLevelRequired;
              if (!comm || !destCity) return null;

              return (
                <div
                  key={contract.id}
                  className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl shadow-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {contract.issuerType}
                      </span>
                      <h4 className="font-extrabold text-sm text-white mt-1">
                        {isAr ? contract.issuerNameAr : contract.issuerName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-emerald-400 text-sm">
                        +${contract.rewardCash.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-yellow-400 font-bold flex items-center justify-end gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>+{contract.reputationReward} Rep</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>{isAr ? 'المطلوب توريده:' : 'Required Cargo:'}</span>
                      <strong className="text-amber-400">
                        {contract.requiredQuantity}t {comm.icon} {isAr ? comm.nameAr : comm.name}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>{isAr ? 'ميناء الاستلام والتفريغ:' : 'Destination Port:'}</span>
                      <strong className="text-blue-400">
                        {isAr ? destCity.nameAr : destCity.name}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-800 text-[11px]">
                      <span>{isAr ? 'غرامة التأخير:' : 'Delay Penalty:'}</span>
                      <span className="text-red-400">-${contract.penaltyCash.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => acceptContract(contract.id)}
                    disabled={!isLevelOk}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                      isLevelOk
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>
                      {isLevelOk
                        ? isAr
                          ? 'توقيع والالتزام بالعقد'
                          : 'Sign & Accept Tender'
                        : isAr
                          ? `يتطلب مستوى شركة ${contract.minLevelRequired}`
                          : `Requires Company Level ${contract.minLevelRequired}`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
