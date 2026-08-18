import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { CommandCenterView } from './components/CommandCenterView';
import { WorldMapView } from './components/WorldMapView';
import { MarketView } from './components/MarketView';
import { FleetView } from './components/FleetView';
import { IndustryView } from './components/IndustryView';
import { ContractsView } from './components/ContractsView';
import { FinanceView } from './components/FinanceView';
import { CampaignView } from './components/CampaignView';
import { AlliancesView } from './components/AlliancesView';
import { CityDetailModal } from './components/CityDetailModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SaveManagerModal } from './components/SaveManagerModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { GuidedQuestBanner } from './components/GuidedQuestBanner';
import { GuidedQuestModal } from './components/GuidedQuestModal';
import { SkillTreeModal } from './components/SkillTreeModal';
import { EncounterModal } from './components/EncounterModal';
import { NotificationToastContainer } from './components/NotificationToastContainer';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Palette,
  HardDrive,
  BookOpen,
  Radio,
} from 'lucide-react';
import { soundFx } from './utils/audio';

const GameMainContent: React.FC = () => {
  const {
    activeTab,
    settings,
    updateSettings,
    resetGame,
    isHowToPlayOpen,
    setIsHowToPlayOpen,
    isNewPlayer,
    setIsNewPlayer,
    isSaveManagerOpen,
    setIsSaveManagerOpen,
    isThemeModalOpen,
    setIsThemeModalOpen,
    isSkillTreeOpen,
    setIsSkillTreeOpen,
    isQuestModalOpen,
    setIsQuestModalOpen,
    activeEncounter,
    resolveEncounterChoice,
    startNewGame,
  } = useGame();

  const isAr = settings.language === 'ar';

  const getThemeContainerClass = () => {
    switch (settings.theme) {
      case 'golden_tycoon':
        return 'bg-stone-950 text-stone-100 selection:bg-yellow-500 selection:text-stone-950 theme-golden';
      case 'cyber_radar':
        return 'bg-slate-950 text-cyan-50 selection:bg-cyan-500 selection:text-slate-950 theme-cyber';
      case 'emerald_cargo':
        return 'bg-zinc-950 text-emerald-50 selection:bg-emerald-500 selection:text-zinc-950 theme-emerald';
      case 'tactical_navy':
      default:
        return 'bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 theme-navy';
    }
  };

  return (
    <div
      className={`min-h-screen ${getThemeContainerClass()} font-sans flex flex-col justify-between transition-colors duration-300`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div>
        {/* Top Sticky Navigation & Live Metrics Bar */}
        <Navbar />

        {/* Live Floating Notifications Toast with Auto-Dismiss Countdown Timer */}
        <NotificationToastContainer />

        {/* Main Content View Switcher */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-5">
          {/* Beginner Interactive Guided Questline Tracker Banner */}
          <GuidedQuestBanner />

          {activeTab === 'command' && <CommandCenterView />}
          {activeTab === 'map' && <WorldMapView />}
          {activeTab === 'market' && <MarketView />}
          {activeTab === 'fleet' && <FleetView />}
          {activeTab === 'industry' && <IndustryView />}
          {activeTab === 'contracts' && <ContractsView />}
          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'campaign' && <CampaignView />}
          {activeTab === 'alliances' && <AlliancesView />}
        </main>
      </div>

      {/* Global City Detail & Port Terminal Modal */}
      <CityDetailModal />

      {/* Beginner Guided Questline Modal */}
      <GuidedQuestModal
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
      />

      {/* CEO Talent & Skill Tree Modal */}
      <SkillTreeModal
        isOpen={isSkillTreeOpen}
        onClose={() => setIsSkillTreeOpen(false)}
      />

      {/* Live Naval Encounter Event Modal */}
      {activeEncounter && (
        <EncounterModal
          encounter={activeEncounter}
          onResolveChoice={resolveEncounterChoice}
        />
      )}

      {/* Player Startup / Setup Onboarding Modal */}
      <OnboardingModal
        isOpen={isNewPlayer}
        onClose={() => setIsNewPlayer(false)}
      />

      {/* Auto-Save & Save Slots Manager Modal */}
      <SaveManagerModal
        isOpen={isSaveManagerOpen}
        onClose={() => setIsSaveManagerOpen(false)}
      />

      {/* Interface Theme Customization Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Global How to Play Interactive Guide Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* Modern Status Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md mt-10 py-4 px-4 sm:px-8 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <strong className="text-slate-300">Trade Empire Online v1.2</strong>
          </span>
          <span>•</span>
          <span>
            {isAr
              ? 'محاكي التجارة العالمية والصناعة والاستثمار البحري'
              : 'Global Maritime & Economic Trade Simulation'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick theme modal button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsThemeModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title={isAr ? 'تخصيص الواجهة' : 'Change Theme'}
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Quick save modal button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsSaveManagerOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title={isAr ? 'إدارة الحفظ والنسخ الاحتياطي' : 'Save Slots'}
          >
            <HardDrive className="w-4 h-4" />
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              const newSound = !settings.soundEnabled;
              updateSettings({ soundEnabled: newSound });
              soundFx.setMuted(!newSound);
              if (newSound) soundFx.playClick();
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="Audio FX"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Restart / Setup Game */}
          <button
            onClick={() => {
              soundFx.playClick();
              startNewGame();
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors"
            title={isAr ? 'تخصيص الشركة وبدء إعداد جديد' : 'New Setup'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameMainContent />
    </GameProvider>
  );
}
