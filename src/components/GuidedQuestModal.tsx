import React from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Compass,
  CheckCircle2,
  Gift,
  Lock,
  X,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';

interface GuidedQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedQuestModal: React.FC<GuidedQuestModalProps> = ({ isOpen, onClose }) => {
  const {
    guidedQuests,
    claimQuestReward,
    setActiveTab,
    settings,
  } = useGame();

  if (!isOpen) return null;

  const isAr = settings.language === 'ar';

  const handleClaim = (questId: string) => {
    soundFx.playFanfare();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    claimQuestReward(questId);
  };

  const handleNavigate = (tab: any) => {
    soundFx.playClick();
    setActiveTab(tab);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-4 sm:p-7 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'مسار مهام المبتدئين التفاعلي' : 'Beginner Guided Questline'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'أكمل المهام التوجيهية لكسب مكافآت مالية فورية وبناء أسطولك التجاري' : 'Complete step-by-step onboarding quests for instant cash, exp, and reputation rewards'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quests List */}
        <div className="py-4 overflow-y-auto space-y-3.5 flex-1">
          {guidedQuests.map((quest) => {
            const isReadyToClaim = quest.isCompleted && !quest.isClaimed;
            const progressPercent = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  quest.isClaimed
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                    : isReadyToClaim
                      ? 'bg-emerald-950/25 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                      quest.isClaimed
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : isReadyToClaim
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {quest.icon}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {isAr ? `خطوة ${quest.stepNumber} من ${quest.totalSteps}` : `Step ${quest.stepNumber} of ${quest.totalSteps}`}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-white">
                        {isAr ? quest.titleAr : quest.titleEn}
                      </h4>
                      {quest.isClaimed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 flex items-center gap-1 border border-slate-700">
                          <CheckCircle2 className="w-3 h-3" />
                          {isAr ? 'تم الإنجاز والمكافأة' : 'Completed & Claimed'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isAr ? quest.descAr : quest.descEn}
                    </p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 max-w-xs bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-300 ${
                            quest.isClaimed
                              ? 'bg-slate-600'
                              : isReadyToClaim
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {quest.currentCount} / {quest.targetCount} ({progressPercent}%)
                      </span>
                    </div>

                    {/* Rewards Preview */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-300 pt-0.5">
                      <span className="text-emerald-400 font-bold">
                        +${quest.rewardCash.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="text-amber-300">+{quest.rewardRep} Rep ⭐</span>
                      <span>•</span>
                      <span className="text-indigo-300">+{quest.rewardExp} EXP</span>
                    </div>
                  </div>
                </div>

                {/* Button */}
                <div className="shrink-0 w-full sm:w-auto">
                  {quest.isClaimed ? (
                    <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold text-center border border-slate-700">
                      {isAr ? 'تم الاستلام ✓' : 'Claimed ✓'}
                    </div>
                  ) : isReadyToClaim ? (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer animate-bounce"
                    >
                      <Gift className="w-4 h-4" />
                      <span>{isAr ? 'استلام المكافأة!' : 'Claim Reward!'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigate(quest.actionTab)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 hover:border-amber-500/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>{isAr ? 'انتقل للمكان' : 'Go to Tab'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};
