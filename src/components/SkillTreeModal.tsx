import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { SKILL_TREE_DEFINITIONS } from '../data/skillData';
import { SkillBranch, SkillDefinition } from '../types/game';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Award,
  Zap,
  Ship,
  TrendingUp,
  Factory,
  CheckCircle2,
  Lock,
  X,
  Star,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

interface SkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ isOpen, onClose }) => {
  const {
    level,
    skillPoints,
    unlockedSkills,
    unlockSkill,
    settings,
  } = useGame();

  const [selectedBranch, setSelectedBranch] = useState<SkillBranch>('logistics');

  if (!isOpen) return null;

  const isAr = settings.language === 'ar';

  const branches: Array<{ id: SkillBranch; icon: any; labelEn: string; labelAr: string; color: string }> = [
    { id: 'logistics', icon: Ship, labelEn: 'Logistics & Fleet', labelAr: 'اللوجستيات والملاحة', color: 'from-cyan-500 to-blue-600' },
    { id: 'commerce', icon: TrendingUp, labelEn: 'Commerce & Markets', labelAr: 'التجارة والأسواق', color: 'from-amber-500 to-yellow-600' },
    { id: 'industry', icon: Factory, labelEn: 'Industry & Capital', labelAr: 'الصناعة ورأس المال', color: 'from-emerald-500 to-teal-600' },
  ];

  const currentBranchSkills = SKILL_TREE_DEFINITIONS.filter((s) => s.branch === selectedBranch);

  const handleUnlock = (skill: SkillDefinition) => {
    soundFx.playClick();
    const success = unlockSkill(skill.id);
    if (success) {
      soundFx.playFanfare();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-4 sm:p-7 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'شجرة مهارات الرئيس التنفيذي' : 'CEO Talent & Skill Tree'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  LVL {level}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'طوّر قدرات شركتك لفتح مزايا دائمة في الشحن، التجارة، والصناعة' : 'Unlock permanent company perks for fleet, commerce, and manufacturing'}
              </p>
            </div>
          </div>

          {/* Available Skill Points Badge */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow-inner">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  {isAr ? 'نقاط المهارة' : 'Talent Points'}
                </div>
                <div className="text-sm font-black text-amber-300">
                  {skillPoints} {isAr ? 'نقطة متاحة' : 'Available'}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Branch Selector Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-3 border-b border-slate-800/80 shrink-0 overflow-x-auto no-scrollbar">
          {branches.map((branch) => {
            const Icon = branch.icon;
            const isSelected = selectedBranch === branch.id;
            const branchUnlockedCount = SKILL_TREE_DEFINITIONS.filter(
              (s) => s.branch === branch.id && unlockedSkills.includes(s.id)
            ).length;

            return (
              <button
                key={branch.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedBranch(branch.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? `bg-gradient-to-r ${branch.color} text-white shadow-lg`
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? branch.labelAr : branch.labelEn}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/50 text-slate-200 font-mono">
                  {branchUnlockedCount}/3
                </span>
              </button>
            );
          })}
        </div>

        {/* Skill Progression Tree View */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          {currentBranchSkills.map((skill, index) => {
            const isUnlocked = unlockedSkills.includes(skill.id);
            const isPrereqMet = !skill.prerequisiteId || unlockedSkills.includes(skill.prerequisiteId);
            const canAfford = skillPoints >= skill.costPoints;
            const isAvailable = !isUnlocked && isPrereqMet && canAfford;

            return (
              <div key={skill.id} className="relative">
                {/* Connecting Tree Line */}
                {index > 0 && (
                  <div className="w-0.5 h-4 bg-slate-700 mx-auto -my-1" />
                )}

                <div
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden ${
                    isUnlocked
                      ? 'bg-emerald-950/25 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : isAvailable
                        ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Skill Icon & Tier */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                        isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : isAvailable
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {skill.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                          Tier {skill.tier}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-white">
                          {isAr ? skill.nameAr : skill.nameEn}
                        </h4>
                        {isUnlocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {isAr ? 'مُفعّلة ونشطة' : 'Active Perk'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {isAr ? skill.descAr : skill.descEn}
                      </p>

                      {!isPrereqMet && (
                        <div className="text-[10px] text-amber-400/80 flex items-center gap-1 mt-1 font-semibold">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{isAr ? 'يتطلب تفعيل مهارة المستوى السابق أولاً' : 'Requires previous tier perk'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 w-full sm:w-auto">
                    {isUnlocked ? (
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center border border-emerald-500/30">
                        {isAr ? 'تم التطوير ✓' : 'Unlocked ✓'}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUnlock(skill)}
                        disabled={!isAvailable}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${
                          isAvailable
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 cursor-pointer animate-pulse'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>
                          {isAr
                            ? `تطوير (${skill.costPoints} نقطة)`
                            : `Unlock (${skill.costPoints} Pts)`}
                        </span>
                      </button>
                    )}
                  </div>
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
