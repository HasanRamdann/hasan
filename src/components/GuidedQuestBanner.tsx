import React from 'react';
import { useGame } from '../context/GameContext';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Compass,
  CheckCircle2,
  Gift,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Award,
} from 'lucide-react';

interface GuidedQuestBannerProps {
  onOpenQuestModal: () => void;
}

export const GuidedQuestBanner: React.FC<GuidedQuestBannerProps> = ({ onOpenQuestModal }) => {
  const {
    guidedQuests,
    claimQuestReward,
    setActiveTab,
    settings,
  } = useGame();

  const isAr = settings.language === 'ar';

  // Find the first non-claimed quest
  const currentQuest = guidedQuests.find((q) => !q.isClaimed);

  // If all quests completed and claimed
  if (!currentQuest) {
    return (
      <div className="bg-gradient-to-r from-amber-950/40 via-emerald-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-3 sm:p-4 text-slate-100 flex items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl text-amber-300">
            🏆
          </div>
          <div>
            <div className="font-extrabold text-sm text-amber-300 flex items-center gap-1.5">
              <span>{isAr ? 'أكملت جميع مهام مسار المبتدئين بنجاح!' : 'All Beginner Quests Mastered!'}</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs text-slate-400">
              {isAr ? 'إمبراطوريتك التجارية الآن جاهزة للتوسع والسيطرة العالمية.' : 'Your maritime trading empire is ready for global dominion.'}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenQuestModal}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors shrink-0"
        >
          {isAr ? 'سجل الإنجازات' : 'View Milestones'}
        </button>
      </div>
    );
  }

  const isReadyToClaim = currentQuest.isCompleted && !currentQuest.isClaimed;
  const progressPercent = Math.min(100, Math.round((currentQuest.currentCount / currentQuest.targetCount) * 100));

  const handleClaim = () => {
    soundFx.playFanfare();
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    claimQuestReward(currentQuest.id);
  };

  const handleNavigateToTab = () => {
    soundFx.playClick();
    setActiveTab(currentQuest.actionTab);
  };

  return (
    <div
      className={`rounded-2xl p-3 sm:p-4 border transition-all text-slate-100 relative overflow-hidden ${
        isReadyToClaim
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border-emerald-500/70 shadow-lg shadow-emerald-500/15 animate-pulse'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left Side: Quest Info */}
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
              isReadyToClaim
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {currentQuest.icon}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isAr ? `المهمة ${currentQuest.stepNumber} من ${currentQuest.totalSteps}` : `Quest ${currentQuest.stepNumber} of ${currentQuest.totalSteps}`}
              </span>
              <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                {isAr ? currentQuest.titleAr : currentQuest.titleEn}
              </h3>
            </div>

            <p className="text-[11px] text-slate-300 line-clamp-1">
              {isAr ? currentQuest.descAr : currentQuest.descEn}
            </p>

            {/* Progress Bar & Counter */}
            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    isReadyToClaim ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-300 shrink-0">
                {currentQuest.currentCount} / {currentQuest.targetCount} ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Reward & Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
          {/* Rewards Preview */}
          <div className="text-right rtl:text-left text-[10px] space-y-0.5 px-2">
            <div className="text-emerald-400 font-extrabold">+${currentQuest.rewardCash.toLocaleString()}</div>
            <div className="text-amber-300">+{currentQuest.rewardRep} Rep | +{currentQuest.rewardExp} EXP</div>
          </div>

          {/* Action Trigger */}
          {isReadyToClaim ? (
            <button
              onClick={handleClaim}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer animate-bounce"
            >
              <Gift className="w-4 h-4" />
              <span>{isAr ? 'استلام المكافأة!' : 'Claim Reward!'}</span>
            </button>
          ) : (
            <button
              onClick={handleNavigateToTab}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 hover:border-amber-500/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{isAr ? 'انتقل للمكان' : 'Go to Tab'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onOpenQuestModal}
            className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title={isAr ? 'عرض جميع المهام' : 'View all quests'}
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
