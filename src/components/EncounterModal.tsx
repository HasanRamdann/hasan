import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { EncounterChoice } from '../types/game';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Ship,
  Sparkles,
  ShieldCheck,
  Fuel,
  DollarSign,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const EncounterModal: React.FC = () => {
  const {
    activeEncounter,
    resolveEncounterChoice,
    settings,
  } = useGame();

  const [resolvingChoice, setResolvingChoice] = useState<EncounterChoice | null>(null);
  const [resolutionResult, setResolutionResult] = useState<{
    success: boolean;
    rewardTextEn: string;
    rewardTextAr: string;
  } | null>(null);

  if (!activeEncounter) return null;

  const isAr = settings.language === 'ar';

  const handleSelectChoice = (choice: EncounterChoice) => {
    setResolvingChoice(choice);
    soundFx.playClick();

    // Execute choice in context
    const result = resolveEncounterChoice(choice.id);

    if (result.success) {
      soundFx.playFanfare();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      soundFx.playAlert();
    }

    setResolutionResult(result);
  };

  const handleClose = () => {
    setResolvingChoice(null);
    setResolutionResult(null);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl shadow-amber-500/20 text-slate-100 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Resolution Screen */}
        {resolutionResult ? (
          <div className="text-center py-6 space-y-4">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl ${
                resolutionResult.success
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {resolutionResult.success ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {resolutionResult.success
                  ? isAr
                    ? 'نجاح باهر ومكافأة قياسية!'
                    : 'Action Successful!'
                  : isAr
                    ? 'تعثرت المحاولة ولكن تم تدارك الموقف'
                    : 'Action Failed with Complications'}
              </h3>
              <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                {isAr ? resolutionResult.rewardTextAr : resolutionResult.rewardTextEn}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm"
            >
              {isAr ? 'متابعة الرحلة البحرية' : 'Resume Voyage'}
            </button>
          </div>
        ) : (
          /* Encounter Question & Choices Screen */
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
                  {activeEncounter.icon}
                </span>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                    {isAr ? 'حدث بحري تفاعلي عاجل' : 'NAVAL LIVE ENCOUNTER'}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeEncounter.shipName}</span>
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg animate-pulse">
                {isAr ? 'يتطلب قرارك' : 'Action Required'}
              </span>
            </div>

            {/* Title & Description */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isAr ? activeEncounter.titleAr : activeEncounter.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isAr ? activeEncounter.descAr : activeEncounter.descEn}
              </p>
            </div>

            {/* Choices Grid */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'اختر كيف سيتعامل طاقمك مع الموقف:' : 'Choose your tactical response:'}
              </div>

              {activeEncounter.choices.map((choice) => {
                const successRatePercent = Math.round(choice.successRate * 100);
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice)}
                    className="w-full text-start p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 transition-all group flex flex-col gap-2 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                        {isAr ? choice.labelAr : choice.labelEn}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-cyan-300 shrink-0">
                        {isAr ? `نسبة النجاح: ${successRatePercent}%` : `Success: ${successRatePercent}%`}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr ? choice.descAr : choice.descEn}
                    </p>

                    {/* Cost & Payoff preview badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                      {choice.costCash && (
                        <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                          {isAr ? `التكلفة: -$${choice.costCash.toLocaleString()}` : `Cost: -$${choice.costCash.toLocaleString()}`}
                        </span>
                      )}
                      {choice.rewardCash && (
                        <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                          {isAr ? `المكافأة: +$${choice.rewardCash.toLocaleString()}` : `Reward: +$${choice.rewardCash.toLocaleString()}`}
                        </span>
                      )}
                      {choice.rewardRep && (
                        <span className="text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          +{choice.rewardRep} Rep ⭐
                        </span>
                      )}
                      {choice.rewardExp && (
                        <span className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          +{choice.rewardExp} EXP
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
