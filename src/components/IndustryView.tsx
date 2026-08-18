import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ProductionRecipe, PlayerFactory, City } from '../types/game';
import {
  Factory,
  Hammer,
  Play,
  Pause,
  ArrowRight,
  TrendingUp,
  Boxes,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Plus,
  Zap,
  Building,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const IndustryView: React.FC = () => {
  const {
    factories,
    productionRecipes,
    cities,
    commodities,
    cash,
    buildFactory,
    toggleFactory,
    upgradeFactory,
    settings,
  } = useGame();

  const isAr = settings.language === 'ar';
  const [selectedCityId, setSelectedCityId] = useState<string>('alexandria');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(productionRecipes[0]?.id || '');

  const availableCitiesForBuilding: City[] = (Object.values(cities) as City[]).filter(
    (c) => c.hasBranch || c.id === 'alexandria'
  );

  return (
    <div className="space-y-6">
      {/* Visual Supply Chain Interactive Flowchart Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            {isAr ? 'سلاسل التوريد والإنتاج الصناعي المتكاملة' : 'Integrated Value Chains & Supply Networks'}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {isAr
            ? 'حوّل المواد الخام إلى سلع تكنولوجية وسيارات وروبوتات لتحقيق هوامش أرباح خيالية تصل إلى +300%!'
            : 'Convert raw commodities into vehicles, smart electronics, and quantum chips for margins exceeding +300%!'}
        </p>

        {/* Visual Multi-Tier Flowchart Node Tree */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Chain 1: Metals & Automotive */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <span>⛏️</span>
              <span>{isAr ? 'سلسلة صناعة السيارات الثقيلة' : 'Automotive & Heavy Industry'}</span>
            </h4>
            <div className="flex items-center flex-wrap gap-1 text-[11px] text-slate-300">
              <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">⛏️ Iron Ore + 🪨 Coal</span>
              <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 font-bold text-blue-300">
                🔩 Steel Mill
              </span>
              <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/30 font-extrabold">
                🚗 Vehicles (+$3,800)
              </span>
            </div>
          </div>

          {/* Chain 2: Energy & Petrochemicals */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <span>🛢️</span>
              <span>{isAr ? 'سلسلة الطاقة والبتروكيماويات' : 'Petrochemicals & Plastics'}</span>
            </h4>
            <div className="flex items-center flex-wrap gap-1 text-[11px] text-slate-300">
              <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">🛢️ Crude Oil</span>
              <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 font-bold text-amber-300">
                ⛽ Refinery
              </span>
              <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/30 font-extrabold">
                🧪 Polymers & 🔋 Batteries
              </span>
            </div>
          </div>

          {/* Chain 3: High-Tech & Robotics */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-1.5">
              <span>🔬</span>
              <span>{isAr ? 'سلسلة الروبوتات والرقائق الكمومية' : 'Robotics & Quantum Tech'}</span>
            </h4>
            <div className="flex items-center flex-wrap gap-1 text-[11px] text-slate-300">
              <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">📱 Electronics + 🧱 Copper</span>
              <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 font-bold text-indigo-300">
                🔬 AI Cleanroom
              </span>
              <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg border border-purple-500/30 font-extrabold">
                🤖 Robotics & Chips ($32k)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Factories Deck & Factory Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Factories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                {isAr ? `المجمعات والمصانع النشطة (${factories.length})` : `Active Manufacturing Lines (${factories.length})`}
              </h3>
            </div>
          </div>

          {factories.length > 0 ? (
            <div className="space-y-3">
              {factories.map((fac) => {
                const recipe = productionRecipes.find((r) => r.id === fac.recipeId);
                const city = cities[fac.cityId];
                const outComm = commodities.find((c) => c.id === recipe?.output.commodityId);
                if (!recipe || !city || !outComm) return null;

                return (
                  <div
                    key={fac.id}
                    className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
                            {recipe.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-white">
                                {isAr ? recipe.nameAr : recipe.name}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                                Lvl {fac.level}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {isAr ? city.nameAr : city.name} ({isAr ? city.countryAr : city.country}) •{' '}
                              {fac.cyclesCompleted} {isAr ? 'دورة مكتملة' : 'cycles done'}
                            </p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFactory(fac.id)}
                            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                              fac.isProducing
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {fac.isProducing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => upgradeFactory(fac.id)}
                            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 rounded-xl text-xs font-bold transition-colors"
                          >
                            {isAr ? 'ترقية المصنع' : 'Upgrade Lvl'}
                          </button>
                        </div>
                      </div>

                      {/* Inputs -> Output Recipe Box */}
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-300">
                          <span className="text-slate-500">{isAr ? 'المواد المستهلكة:' : 'Consumes:'}</span>
                          {recipe.inputs.map((inp, idx) => {
                            const c = commodities.find((comm) => comm.id === inp.commodityId);
                            return (
                              <span key={idx} className="font-semibold text-slate-200">
                                {inp.quantity}t {c?.icon} {isAr ? c?.nameAr : c?.name}
                                {idx < recipe.inputs.length - 1 ? ' + ' : ''}
                              </span>
                            );
                          })}
                        </div>

                        <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />

                        <div className="flex items-center gap-1 font-bold text-emerald-400">
                          <span>{isAr ? 'الإنتاج:' : 'Yield:'}</span>
                          <span>
                            +{recipe.output.quantity * fac.level}t {outComm.icon} {isAr ? outComm.nameAr : outComm.name}
                          </span>
                        </div>
                      </div>

                      {/* Production Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>{fac.isProducing ? (isAr ? 'خط الإنتاج قيد التشغيل...' : 'Production active...') : isAr ? 'متوقف مؤقتاً' : 'Paused'}</span>
                          <span className="font-bold text-amber-400">{Math.round(fac.cycleProgress)}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${fac.cycleProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-slate-900/60 border border-slate-800 border-dashed rounded-3xl text-center space-y-3">
              <Factory className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="font-bold text-sm text-slate-300">
                {isAr ? 'لم تقم ببناء أي مصنع بعد' : 'No Active Factories Built Yet'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isAr
                  ? 'اختر مجمعاً صناعياً من القائمة الجانبية وشيده في إحدى المدن المتاح بها فرع رسمي لشركتك.'
                  : 'Select an industrial facility from the panel and build it in an authorized port branch.'}
              </p>
            </div>
          )}
        </div>

        {/* Build New Factory Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl h-fit">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Plus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              {isAr ? 'تشييد مجمع صناعي جديد' : 'Commission New Facility'}
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* City Selection */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                {isAr ? '1. الميناء المختار للإنشاء:' : '1. Target City / Port:'}
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
              >
                {availableCitiesForBuilding.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isAr ? c.nameAr : c.name} ({isAr ? c.countryAr : c.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Recipe Selection */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                {isAr ? '2. نوع المنشأة وخط الإنتاج:' : '2. Facility & Production Recipe:'}
              </label>
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
              >
                {productionRecipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.icon} {isAr ? r.nameAr : r.name} - Setup: ${r.setupCost.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipe Spec details */}
            {(() => {
              const r = productionRecipes.find((rec) => rec.id === selectedRecipeId);
              if (!r) return null;
              const canAfford = cash >= r.setupCost;

              return (
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'نوع المنشأة:' : 'Facility Type:'}</span>
                    <strong className="text-slate-200">{isAr ? r.facilityTypeAr : r.facilityType}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'زمن الدورة:' : 'Cycle Duration:'}</span>
                    <strong className="text-blue-400">{r.durationSeconds}s</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'تكلفة الإنشاء والتأسيس:' : 'Setup Capital:'}</span>
                    <strong className="text-emerald-400">${r.setupCost.toLocaleString()}</strong>
                  </div>

                  <button
                    onClick={() => buildFactory(selectedCityId, r.id)}
                    disabled={!canAfford}
                    className={`w-full mt-3 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-800 text-red-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {canAfford
                        ? isAr
                          ? `تشييد المصنع الآن ($${r.setupCost.toLocaleString()})`
                          : `Build Facility ($${r.setupCost.toLocaleString()})`
                        : isAr
                          ? 'السيولة غير كافية'
                          : 'Insufficient Capital'}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
