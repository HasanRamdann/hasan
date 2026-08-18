import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  Globe2,
  TrendingUp,
  Factory,
  FileSpreadsheet,
  Landmark,
  Award,
  Users2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  FastForward,
  Bell,
  Star,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Sparkles,
  HelpCircle,
  BookOpen,
  Anchor,
  Compass,
  Crown,
  Globe,
  Shield,
  Flame,
  Palette,
  Save,
  HardDrive,
  CheckCircle2,
  Target,
  Zap,
  Radio,
  Cloud,
  CloudCheck,
  CloudUpload,
  User,
  LogIn,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { GlobalNewsTicker } from './GlobalNewsTicker';
import { AuthModal } from './AuthModal';
import { OnlineCommunityModal } from './OnlineCommunityModal';

export const Navbar: React.FC = () => {
  const {
    companyName,
    ceoName,
    companyAvatar,
    cash,
    netWorth,
    level,
    exp,
    expToNextLevel,
    reputation,
    ships,
    activeTab,
    setActiveTab,
    settings,
    updateSettings,
    notifications,
    removeNotification,
    worldEvents,
    marketPrices,
    commodities,
    resetGame,
    setIsHowToPlayOpen,
    setIsSaveManagerOpen,
    setIsThemeModalOpen,
    isSkillTreeOpen,
    setIsSkillTreeOpen,
    isQuestModalOpen,
    setIsQuestModalOpen,
    skillPoints,
    guidedQuests,
    isAutoSaving,
    lastSavedTimeText,
    startNewGame,
  } = useGame();

  const {
    currentUser,
    userProfile,
    isAdmin,
    setIsAuthModalOpen,
    setAuthModalMode,
    lastCloudSaveTime,
    isSyncingCloud,
  } = useAuth();

  const [showNotifs, setShowNotifs] = useState(false);
  const [isOnlineRadioOpen, setIsOnlineRadioOpen] = useState(false);
  const isAr = settings.language === 'ar';

  const inTransitCount = ships.filter((s) => s.status === 'transit').length;
  const unclaimedQuestsCount = guidedQuests.filter((q) => q.isCompleted && !q.isClaimed).length;

  const getAvatarIcon = () => {
    switch (companyAvatar) {
      case 'ship':
        return Ship;
      case 'compass':
        return Compass;
      case 'crown':
        return Crown;
      case 'globe':
        return Globe;
      case 'shield':
        return Shield;
      case 'falcon':
        return Flame;
      case 'star':
        return Award;
      case 'anchor':
      default:
        return Anchor;
    }
  };

  const AvatarIcon = getAvatarIcon();

  const tabs = [
    { id: 'command', icon: Compass, labelEn: 'Cockpit (1-Screen)', labelAr: 'اللوحة الشاملة (شاشة واحدة)' },
    { id: 'map', icon: Globe2, labelEn: 'World Map', labelAr: 'خريطة العالم' },
    { id: 'market', icon: TrendingUp, labelEn: 'Global Market', labelAr: 'البورصة والسلع' },
    { id: 'fleet', icon: Ship, labelEn: 'Fleet & Logistics', labelAr: 'الأسطول واللوجستيات', badge: inTransitCount > 0 ? inTransitCount : undefined },
    { id: 'industry', icon: Factory, labelEn: 'Manufacturing', labelAr: 'التصنيع والإنتاج' },
    { id: 'contracts', icon: FileSpreadsheet, labelEn: 'Contracts (B2B)', labelAr: 'العقود والمناقصات' },
    { id: 'finance', icon: Landmark, labelEn: 'Banking & Stocks', labelAr: 'البنك والأسهم' },
    { id: 'campaign', icon: Award, labelEn: 'Missions & Quests', labelAr: 'المهام والموسم' },
    { id: 'alliances', icon: Users2, labelEn: 'Alliances & Top', labelAr: 'التحالفات والمتصدرين' },
    ...(isAdmin ? [{ id: 'admin', icon: ShieldAlert, labelEn: 'Admin God-Mode', labelAr: '👑 لوحة الأدمن', badge: 'ROOT' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 select-none shadow-xl">
      {/* Top Status Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Company Logo */}
        <div
          onClick={() => {
            soundFx.playClick();
            startNewGame();
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title={isAr ? 'انقر لتعديل هوية وإعدادات الشركة' : 'Click to customize Company Setup'}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 group-hover:scale-105 transition-transform">
            <AvatarIcon className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                {isAr ? 'إمبراطورية التجارة' : 'Trade Empire'}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                  MMO
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-amber-300 font-medium group-hover:underline">{companyName}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span>{reputation} Rep</span>
              </span>
            </div>
          </div>
        </div>

        {/* Financial & Empire Metrics */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          {/* Liquid Cash */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-inner">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              $
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-medium">
                {isAr ? 'السيولة النقدية' : 'Liquid Cash'}
              </div>
              <div className="text-emerald-400 font-bold text-sm tracking-wide">
                ${cash.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Net Worth */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 hidden md:flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {isAr ? 'صافي الثروة' : 'Net Worth'}
              </div>
              <div className="text-indigo-300 font-bold text-sm">
                ${netWorth.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Level & EXP */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2.5">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-amber-400 font-bold uppercase">{isAr ? 'المستوى' : 'LVL'}</span>
              <span className="font-extrabold text-amber-300 text-sm leading-none">{level}</span>
            </div>
            <div className="w-20 sm:w-28 flex flex-col gap-1">
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>EXP</span>
                <span>{Math.round((exp / expToNextLevel) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (exp / expToNextLevel) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Controls: Auto-Save Status, Theme, Speed, Sound, Lang, Notifs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Guided Beginner Quests Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsQuestModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all relative ${
              unclaimedQuestsCount > 0
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title={isAr ? 'مسار مهام المبتدئين التفاعلي' : 'Guided Questline'}
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isAr ? 'المهام' : 'Quests'}</span>
            {unclaimedQuestsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
            )}
          </button>

          {/* CEO Skill Tree Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsSkillTreeOpen(true);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              skillPoints > 0
                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title={isAr ? `شجرة مهارات الرئيس التنفيذي (${skillPoints} نقاط متاحة)` : `CEO Skill Tree (${skillPoints} pts available)`}
          >
            <Zap className={`w-3.5 h-3.5 ${skillPoints > 0 ? 'text-indigo-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="hidden md:inline">{isAr ? 'المهارات' : 'Skills'}</span>
            {skillPoints > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-500 text-white font-extrabold">
                {skillPoints}
              </span>
            )}
          </button>

          {/* Live Auto-Save Button & Status Badge */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsSaveManagerOpen(true);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isAutoSaving
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20 scale-105'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title={isAr ? `إدارة الحفظ التلقائي والفتحات (آخر حفظ: ${lastSavedTimeText})` : `Save Manager (Last: ${lastSavedTimeText})`}
          >
            <HardDrive className={`w-3.5 h-3.5 ${isAutoSaving ? 'text-emerald-400 animate-spin' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">
              {isAutoSaving
                ? isAr
                  ? 'يتم الحفظ...'
                  : 'Saving...'
                : isAr
                  ? 'الحفظ التلقائي'
                  : 'Auto-Save'}
            </span>
          </button>

          {/* Theme Selector Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsThemeModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-slate-700 text-xs font-bold transition-all"
            title={isAr ? 'تغيير واجهة ومظهر اللعبة' : 'Change Theme'}
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{isAr ? 'الواجهة' : 'Theme'}</span>
          </button>

          {/* Online Global Radio & Chat Launcher */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsOnlineRadioOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 rounded-xl text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all shadow-sm shadow-emerald-500/10 relative"
            title={isAr ? 'الراديو العام وشات التجار المباشر' : 'Live Global Radio & Chat'}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden lg:inline">{isAr ? 'راديو التجار' : 'Radio'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
          </button>

          {/* Master Admin God-Mode Quick Trigger */}
          {isAdmin && (
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('admin');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-slate-950 rounded-xl font-black text-xs shadow-lg shadow-amber-500/25 animate-pulse transition-all transform active:scale-95"
              title={isAr ? 'لوحة تحكم القائد الأعلى (Admin God-Mode)' : 'Master Admin Control Panel'}
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isAr ? 'تحكم الأدمن' : 'Admin'}</span>
            </button>
          )}

          {/* Online Player Account & Cloud Save Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsAuthModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              currentUser && userProfile
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400/50 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-blue-400/50 text-blue-300 hover:from-blue-600/40 hover:to-indigo-600/40'
            }`}
            title={
              currentUser && userProfile
                ? isAr
                  ? `حساب أونلاين: @${userProfile.username} (حفظ سحابي نشط)`
                  : `Online: @${userProfile.username} (Cloud Save Active)`
                : isAr
                  ? 'تسجيل الدخول / إنشاء حساب لحفظ التقدم أونلاين'
                  : 'Login / Register for Online Cloud Saves'
            }
          >
            {currentUser && userProfile ? (
              <>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5" />
                </div>
                <span className="font-extrabold text-amber-200 max-w-[90px] truncate">
                  @{userProfile.username}
                </span>
                <Cloud className={`w-3.5 h-3.5 ${isSyncingCloud ? 'text-amber-400 animate-bounce' : 'text-emerald-400'}`} />
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-blue-300" />
                <span className="font-bold">{isAr ? 'حساب أونلاين' : 'Online Account'}</span>
              </>
            )}
          </button>

          {/* Game Speed Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex items-center">
            <button
              onClick={() => {
                soundFx.playClick();
                updateSettings({ isPaused: !settings.isPaused });
              }}
              title={settings.isPaused ? 'Resume' : 'Pause'}
              className={`p-1.5 rounded text-xs transition-colors ${
                settings.isPaused ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {settings.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                updateSettings({ gameSpeed: 1, isPaused: false });
              }}
              className={`px-1.5 py-0.5 text-xs font-semibold rounded transition-colors ${
                !settings.isPaused && settings.gameSpeed === 1
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                updateSettings({ gameSpeed: 2, isPaused: false });
              }}
              className={`px-1.5 py-0.5 text-xs font-semibold rounded transition-colors ${
                !settings.isPaused && settings.gameSpeed === 2
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                updateSettings({ gameSpeed: 5, isPaused: false });
              }}
              className={`px-1.5 py-0.5 text-xs font-semibold rounded transition-colors ${
                !settings.isPaused && settings.gameSpeed === 5
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5x
            </button>
          </div>

          {/* How to Play Guide Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsHowToPlayOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/50 rounded-xl text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm shadow-amber-500/10 animate-pulse"
            title={isAr ? 'دليل كيف تلعب اللعبة' : 'How to Play Guide'}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'كيف تلعب؟' : 'How to Play'}</span>
          </button>

          {/* Sound Mute */}
          <button
            onClick={() => {
              updateSettings({ soundEnabled: !settings.soundEnabled });
            }}
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className={`p-2 rounded-lg border transition-colors ${
              settings.soundEnabled
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => {
              soundFx.playClick();
              updateSettings({ language: isAr ? 'en' : 'ar' });
            }}
            className="px-2.5 py-1 text-xs font-bold bg-slate-900 border border-slate-800 rounded-lg text-amber-300 hover:bg-slate-800 transition-colors"
          >
            {isAr ? 'EN' : 'عربي'}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <div
                className={`absolute ${
                  isAr ? 'left-0' : 'right-0'
                } mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 max-h-96 overflow-y-auto`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    {isAr ? 'سجل إشعارات التجارة' : 'Trade Activity Log'}
                  </div>
                  <span className="text-[10px] text-slate-500">{notifications.length} events</span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-xl text-xs flex items-start justify-between gap-2 border ${
                        n.type === 'success'
                          ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                          : n.type === 'warning' || n.type === 'error'
                            ? 'bg-red-950/30 border-red-500/20 text-red-300'
                            : 'bg-slate-800/40 border-slate-700/40 text-slate-300'
                      }`}
                    >
                      <div>
                        <p className="leading-snug">{isAr ? n.msgAr : n.msgEn}</p>
                        <span className="text-[9px] opacity-60 mt-1 block">{n.time}</span>
                      </div>
                      <button
                        onClick={() => removeNotification(n.id)}
                        className="text-slate-500 hover:text-slate-300 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Global News Ticker Bar */}
      <GlobalNewsTicker />

      {/* Main Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-6 flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1.5">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap relative ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.badge !== undefined && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Prominent Center/Right How to Play Guide Launcher */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsHowToPlayOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-amber-500/30 border border-amber-300 transition-all whitespace-nowrap shrink-0 animate-bounce"
        >
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          <span>{isAr ? '📘 كيف تلعب اللعبة؟' : '📘 How to Play?'}</span>
        </button>
      </nav>

      {/* Online MMO Player Authentication Modal */}
      <AuthModal />

      {/* Online MMO Community Radio & Global Chat Modal */}
      <OnlineCommunityModal
        isOpen={isOnlineRadioOpen}
        onClose={() => setIsOnlineRadioOpen(false)}
      />
    </header>
  );
};

