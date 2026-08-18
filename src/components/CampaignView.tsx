import React from 'react';
import { useGame } from '../context/GameContext';
import { Mission } from '../types/game';
import {
  Award,
  CheckCircle2,
  Lock,
  Gift,
  Star,
  DollarSign,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const CampaignView: React.FC = () => {
  const { missions, claimMissionReward, settings } = useGame();
  const isAr = settings.language === 'ar';

  const completedCount = missions.filter((m) => m.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Campaign Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {isAr ? 'مسار الحملة والمهام الاستراتيجية (Campaign)' : 'Merchant Empire Campaign & Objectives'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'أكمل المهام القيادية لتنمية إمبراطوريتك من تاجر صغير إلى ملياردير عالمي'
                  : 'Fulfill milestone objectives to scale from an ambitious trader into a world tycoon.'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">{isAr ? 'الإنجاز الإجمالي:' : 'Total Progress:'}</span>
            <div className="text-sm font-extrabold text-amber-400">
              {completedCount} / {missions.length} {isAr ? 'مهام مكتملة' : 'Completed'}
            </div>
          </div>
        </div>

        {/* Global Season Timer */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-bold">
              {isAr ? 'الموسم الاقتصادي الأول: فتح الطرق البحرية الجديدة' : 'Season 1: Age of Global Oceanic Corridors'}
            </span>
          </div>
          <span className="text-amber-400 font-bold">48 {isAr ? 'يوماً متبقية' : 'days remaining'}</span>
        </div>
      </div>

      {/* Missions Roadmap Cards */}
      <div className="space-y-3">
        {missions.map((mission, idx) => {
          const progressPct = Math.min(100, Math.round((mission.currentValue / mission.targetValue) * 100));

          return (
            <div
              key={mission.id}
              className={`p-4 rounded-3xl border transition-all ${
                mission.isClaimed
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : mission.isCompleted
                    ? 'bg-gradient-to-r from-slate-900 to-slate-850 border-amber-500/80 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                      mission.isClaimed
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : mission.isCompleted
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {mission.isClaimed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-white">{isAr ? mission.titleAr : mission.title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {isAr ? mission.descriptionAr : mission.description}
                    </p>
                  </div>
                </div>

                {/* Reward & Claim Button */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-400">
                      +${mission.rewardCash.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-yellow-400 font-bold flex items-center justify-end gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>+{mission.rewardRep} Rep</span>
                    </div>
                  </div>

                  {mission.isCompleted && !mission.isClaimed && (
                    <button
                      onClick={() => claimMissionReward(mission.id)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 animate-bounce"
                    >
                      <Gift className="w-4 h-4" />
                      <span>{isAr ? 'استلام المكافأة' : 'Claim Reward'}</span>
                    </button>
                  )}

                  {mission.isClaimed && (
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      {isAr ? 'تم الاستلام ✓' : 'Claimed ✓'}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>
                    {isAr ? 'التقدم:' : 'Progress:'} {mission.currentValue.toLocaleString()} / {mission.targetValue.toLocaleString()}
                  </span>
                  <span className="font-bold text-amber-400">{progressPct}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
