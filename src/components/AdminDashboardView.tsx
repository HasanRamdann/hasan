import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Crown,
  DollarSign,
  Zap,
  Ship,
  Factory,
  Globe2,
  TrendingUp,
  Award,
  Sparkles,
  RefreshCw,
  Plus,
  Flame,
  CheckCircle2,
  Volume2,
  Layers,
  Radio,
  Sliders,
  Send,
  Building2,
  Trash2,
  Fuel,
  Compass,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { COMMODITIES, SHIP_MODELS, PRODUCTION_RECIPES, CITIES, WORLD_EVENTS_POOL } from '../data/worldData';

export const AdminDashboardView: React.FC = () => {
  const {
    cash,
    bankBalance,
    debt,
    level,
    exp,
    reputation,
    skillPoints,
    ships,
    factories,
    cities,
    stocks,
    worldEvents,
    settings,
    companyName,
    ceoName,
    setCashDirectly,
    addCashDirectly,
    setBankBalanceDirectly,
    setDebtDirectly,
    setLevelDirectly,
    setReputationDirectly,
    setSkillPointsDirectly,
    unlockAllSkillsDirectly,
    completeAllQuestsDirectly,
    maxAllShipsDirectly,
    instantFinishAllVoyages,
    addShipInstantly,
    maxAllWarehousesAndBranches,
    fillAllWarehousesDirectly,
    buildAllFactoriesInstantly,
    spawnCustomWorldEvent,
    clearAllWorldEvents,
    boostAllStockPrices,
    grantStockShares,
    setCustomMarketPrice,
    resetMarketPricesToNormal,
    addNotification,
  } = useGame();

  const {
    isAdmin,
    userProfile,
    onlinePlayers,
    sendGlobalChatMessage,
  } = useAuth();

  const isAr = settings.language === 'ar';

  const [activeSection, setActiveSection] = useState<'treasury' | 'fleet' | 'industry' | 'ports' | 'events' | 'stocks' | 'broadcast'>('treasury');
  const [customCashInput, setCustomCashInput] = useState<string>('10000000');
  const [customLevelInput, setCustomLevelInput] = useState<string>('50');
  const [customRepInput, setCustomRepInput] = useState<string>('500');
  const [selectedShipModel, setSelectedShipModel] = useState<string>(SHIP_MODELS[3]?.id || 'freighter_heavy');
  const [customShipName, setCustomShipName] = useState<string>('');
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleMaxGodMode = () => {
    addCashDirectly(100000000);
    setLevelDirectly(99);
    setReputationDirectly(1000);
    setDebtDirectly(0);
    setSkillPointsDirectly(50);
    unlockAllSkillsDirectly();
    completeAllQuestsDirectly();
    maxAllShipsDirectly();
    instantFinishAllVoyages();
    maxAllWarehousesAndBranches();
    fillAllWarehousesDirectly(1000);
    buildAllFactoriesInstantly();
    boostAllStockPrices(5);
    clearAllWorldEvents();
    soundFx.playReward();
    showFeedback(isAr ? '⚡ تم تفعيل وضع القوة المطلقة (GOD MODE) بنجاح!' : '⚡ Full GOD MODE activated successfully!');
    addNotification('MASTER GOD-MODE ACTIVATED', 'تم تفعيل وضع القوة الإدارية المطلقة بنجاح!', 'success');
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setIsBroadcasting(true);
    const textToSend = `📢 [إعلان إداري عاجل / ADMIN BROADCAST]: ${broadcastText.trim()}`;
    await sendGlobalChatMessage(textToSend);
    setBroadcastText('');
    setIsBroadcasting(false);
    showFeedback(isAr ? 'تم إرسال الإعلان لجميع اللاعبين في السيرفر!' : 'Broadcast broadcasted across the global server!');
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Top Admin Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-2 border-red-500/40 p-5 sm:p-7 shadow-2xl shadow-red-950/40">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-amber-500 to-yellow-500 p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isAr ? 'صلاحيات المدير العام' : 'MASTER ADMIN / GOD-MODE'}</span>
                </span>
                <span className="text-xs text-amber-400/80 font-mono">ROOT ACCESS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isAr ? 'لوحة تحكم القائد الأعلى والإدارة الشاملة' : 'Supreme Commander & Admin God Control'}
              </h2>
              <p className="text-xs text-slate-300">
                {isAr
                  ? 'تحكم مطلق في السيولة، الأساطيل، المصانع، الأسواق، أسعار العالم، الكوارث، وشات السيرفر'
                  : 'Omnipotent control over Treasury, Fleet, Industry, Markets, World Events & Global Server'}
              </p>
            </div>
          </div>

          {/* Quick One-Click God-Mode Button */}
          <button
            onClick={handleMaxGodMode}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{isAr ? '⚡ تفعيل وضع القوة المطلقة الشامل (Max God-Mode)' : '⚡ Activate Full GOD-MODE'}</span>
          </button>
        </div>

        {/* Live Admin Telemetry Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'السيولة الحالية' : 'Cash'}</div>
            <div className="text-sm font-black text-emerald-400 truncate">${cash.toLocaleString()}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'المستوى' : 'Level'}</div>
            <div className="text-sm font-black text-amber-400">{level}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'السمعة' : 'Reputation'}</div>
            <div className="text-sm font-black text-cyan-400">{reputation}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'سفن الأسطول' : 'Ships'}</div>
            <div className="text-sm font-black text-blue-400">{ships.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'المصانع النشطة' : 'Factories'}</div>
            <div className="text-sm font-black text-purple-400">{factories.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">{isAr ? 'اللاعبين أونلاين' : 'Online Players'}</div>
            <div className="text-sm font-black text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span>{onlinePlayers.length || 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Admin Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'treasury', icon: DollarSign, labelEn: 'Treasury & Wealth', labelAr: 'الخزينة والأموال' },
          { id: 'fleet', icon: Ship, labelEn: 'Fleet & Voyages', labelAr: 'الأسطول والرحلات' },
          { id: 'industry', icon: Factory, labelEn: 'Factories & Industry', labelAr: 'المصانع والإنتاج' },
          { id: 'ports', icon: Globe2, labelEn: 'Ports & Warehouses', labelAr: 'الموانئ والمستودعات' },
          { id: 'events', icon: Flame, labelEn: 'World Events & Crises', labelAr: 'الأحداث والكوارث' },
          { id: 'stocks', icon: TrendingUp, labelEn: 'Stock Market', labelAr: 'البورصة والأسهم' },
          { id: 'broadcast', icon: Radio, labelEn: 'Global Broadcast', labelAr: 'شات السيرفر والإعلانات' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveSection(tab.id as any);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: TREASURY & WEALTH */}
      {activeSection === 'treasury' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          {/* Quick Cash Buttons Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{isAr ? 'حقن السيولة الفورية (Cash Injection)' : 'Instant Cash Injection'}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: '+$1,000,000', amount: 1000000 },
                { label: '+$10,000,000', amount: 10000000 },
                { label: '+$50,000,000', amount: 50000000 },
                { label: '+$100,000,000', amount: 100000000 },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    addCashDirectly(btn.amount);
                    showFeedback(`+${btn.label} ${isAr ? 'تمت إضافتها للخزينة!' : 'added to cash!'}`);
                  }}
                  className="py-3 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl font-black text-xs transition-colors text-center"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Custom Cash Amount */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300">
                {isAr ? 'تعيين رصيد كاش محدد ($):' : 'Set Exact Cash Balance ($):'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customCashInput}
                  onChange={(e) => setCustomCashInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    const val = Number(customCashInput) || 0;
                    setCashDirectly(val);
                    showFeedback(isAr ? `تم تعيين رصيد الكاش إلى $${val.toLocaleString()}` : `Cash set to $${val.toLocaleString()}`);
                  }}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs"
                >
                  {isAr ? 'تطبيق الرصيد' : 'Set Cash'}
                </button>
              </div>
            </div>

            {/* Debt & Bank Clears */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => {
                  setDebtDirectly(0);
                  showFeedback(isAr ? 'تم تسديد وتصفير كافة ديون البنك بالكامل!' : 'All bank debts wiped to $0!');
                }}
                className="py-2.5 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs"
              >
                {isAr ? 'تصفير كافة ديون البنك ($0)' : 'Clear All Debts ($0)'}
              </button>
              <button
                onClick={() => {
                  setBankBalanceDirectly(50000000);
                  showFeedback(isAr ? 'تم إيداع $50M في الحساب البنكي الاستثماري!' : 'Deposited $50M in Bank Vault!');
                }}
                className="py-2.5 px-4 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold text-xs"
              >
                {isAr ? 'إيداع $50M في البنك' : 'Deposit $50M in Bank'}
              </button>
            </div>
          </div>

          {/* Level, Reputation & Skills Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>{isAr ? 'المستوى والسمعة ونقاط المهارات' : 'Level, Rep & Skill Tree'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">{isAr ? 'المستوى (Level 1-99):' : 'Level (1-99):'}</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={customLevelInput}
                    onChange={(e) => setCustomLevelInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  />
                  <button
                    onClick={() => {
                      const lvl = Number(customLevelInput) || 1;
                      setLevelDirectly(lvl);
                      showFeedback(isAr ? `تم تعيين المستوى إلى ${lvl}` : `Level set to ${lvl}`);
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    {isAr ? 'تعيين' : 'Set'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">{isAr ? 'السمعة التجارية (Rep):' : 'Reputation:'}</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={customRepInput}
                    onChange={(e) => setCustomRepInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  />
                  <button
                    onClick={() => {
                      const rep = Number(customRepInput) || 10;
                      setReputationDirectly(rep);
                      showFeedback(isAr ? `تم تعيين السمعة إلى ${rep}` : `Reputation set to ${rep}`);
                    }}
                    className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    {isAr ? 'تعيين' : 'Set'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Skills & Quests Cheats */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  unlockAllSkillsDirectly();
                  setSkillPointsDirectly(50);
                  showFeedback(isAr ? 'تم فتح كافة مواهب ومهارات شجرة القائد مع +50 نقطة مهارة!' : 'All Talent Skills Unlocked with +50 Skill Points!');
                }}
                className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-2xl font-black text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{isAr ? '🔓 فتح كافة مهارات الشجرة القيادية + 50 نقطة' : 'Unlock All Skills + 50 Points'}</span>
              </button>

              <button
                onClick={() => {
                  completeAllQuestsDirectly();
                  showFeedback(isAr ? 'تم إكمال وصرف كافة المهام والموسم مع مكافآت الملايين!' : 'All Quests & Missions Completed Instantly!');
                }}
                className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 rounded-2xl font-black text-xs flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-yellow-400" />
                <span>{isAr ? '🏆 إكمال كافة المهام والمهام التوجيهية وتوزيع مكافآتها' : 'Complete All Quests & Claim Rewards'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: FLEET & VOYAGES */}
      {activeSection === 'fleet' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Instant Fleet Controls Bar */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-blue-400 flex items-center gap-2">
                <Ship className="w-4 h-4" />
                <span>{isAr ? 'تحكمات الملاحة والأسطول الفورية' : 'Fleet & Instant Navigation Controls'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'تسريع الوصول، الترقية القصوى، وتزويد الوقود لجميع السفن' : 'Instant arrival, max upgrades and fuel refilling for all ships'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  instantFinishAllVoyages();
                  showFeedback(isAr ? '⚡ وصلت جميع السفن المبحرة إلى موانئ الوصول فوراً!' : 'All sailing ships arrived at destination ports instantly!');
                }}
                className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-black text-xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? '⚡ إنهاء كافة الرحلات البحرية فوراً' : 'Instant Finish All Voyages'}</span>
              </button>

              <button
                onClick={() => {
                  maxAllShipsDirectly();
                  showFeedback(isAr ? 'تمت ترقية كافة محركات، عنابر، ووقود سفنك للمستوى الأقصى!' : 'Max upgraded all ship engines, holds & efficiency!');
                }}
                className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-black text-xs flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? '⭐ ترقية أسطولك بالكامل للمستوى 5' : 'Max Upgrade All Fleet'}</span>
              </button>
            </div>
          </div>

          {/* Ship Spawner */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              {isAr ? 'استدعاء سفينة أو طائرة جديدة للأسطول مجاناً:' : 'Spawn Free Ship / Aircraft to Fleet:'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">{isAr ? 'نوع الطراز:' : 'Model Type:'}</label>
                <select
                  value={selectedShipModel}
                  onChange={(e) => setSelectedShipModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  {SHIP_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {isAr ? m.nameAr : m.name} ({m.capacity}T - {m.speedKnots} knots)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">{isAr ? 'اسم السفينة المخصص (اختياري):' : 'Custom Ship Name (Optional):'}</label>
                <input
                  type="text"
                  value={customShipName}
                  onChange={(e) => setCustomShipName(e.target.value)}
                  placeholder={isAr ? 'مثال: عروس البحر الأحمر' : 'e.g. Titan Queen'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    addShipInstantly(selectedShipModel, customShipName.trim() || undefined);
                    setCustomShipName('');
                    showFeedback(isAr ? 'تم استدعاء السفينة وإضافتها لأسطولك بنجاح!' : 'Ship spawned and added to your fleet!');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'استدعاء وإضافة للأسطول' : 'Spawn Ship'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FACTORIES & INDUSTRY */}
      {activeSection === 'industry' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-purple-400 flex items-center gap-2">
                <Factory className="w-4 h-4" />
                <span>{isAr ? 'المجمعات الصناعية والإنتاج الفوري' : 'Industrial Overdrive & Instant Factories'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'تشييد مصانع الأغذية، الإلكترونيات، الصلب، والسيارات في كافة موانئ العالم مجاناً' : 'Build high-tech manufacturing plants across all global ports for free'}
              </p>
            </div>

            <button
              onClick={() => {
                buildAllFactoriesInstantly();
                showFeedback(isAr ? 'تم تشييد كافة خطوط الإنتاج والمصانع في موانئ العالم مجاناً!' : 'All industrial factories constructed globally for free!');
              }}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <Factory className="w-4 h-4" />
              <span>{isAr ? '🏭 تشييد جميع المصانع في كافة موانئ العالم بضغطة زر' : 'Build All Factories Globally (1-Click)'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {PRODUCTION_RECIPES.map((rec) => (
              <div key={rec.id} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span>{rec.icon}</span>
                    <span>{isAr ? rec.nameAr : rec.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                    {rec.output.quantity}x / {rec.durationSeconds}s
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr ? rec.facilityTypeAr : rec.facilityType} • {rec.output.commodityId}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: PORTS & WAREHOUSES */}
      {activeSection === 'ports' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-cyan-400 flex items-center gap-2">
                <Globe2 className="w-4 h-4" />
                <span>{isAr ? 'السيطرة على الموانئ ومستودعات العالم' : 'Global Ports & Warehouses Omnipotence'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'فتح فروع تجارية في كافة موانئ العالم، ترقية السعة لـ 50,000 طن، وملء المخازن' : 'Unlock all trade branches, max warehouse capacity to 50k tons, and fill inventories'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  maxAllWarehousesAndBranches();
                  showFeedback(isAr ? 'تم فتح فروع تجارية وترقية مستودعات كافة موانئ العالم!' : 'Opened branches & maxed warehouses in all world ports!');
                }}
                className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-black text-xs flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? '🏰 فتح فروع وترقية مستودعات العالم' : 'Max All Ports & Branches'}</span>
              </button>

              <button
                onClick={() => {
                  fillAllWarehousesDirectly(1000);
                  showFeedback(isAr ? 'تم ملء كافة مستودعات العالم بـ 1000 طن من كل سلعة مجاناً!' : 'Filled all warehouses with 1000 tons of every commodity!');
                }}
                className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-black text-xs flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? '📦 ملء المستودعات بـ 1000 طن بضائع مجانية' : 'Fill Warehouses with 1k Tons'}</span>
              </button>
            </div>
          </div>

          {/* Market Price Modifiers */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              {isAr ? 'التلاعب بالأسعار العالمية وسوق السلع:' : 'Global Commodity Price Manipulation:'}
            </h4>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  COMMODITIES.forEach((c) => {
                    setCustomMarketPrice(c.id, 1);
                  });
                  showFeedback(isAr ? 'تم خفض كافة أسعار الشراء في العالم إلى $1 للشراء المجاني!' : 'Set all world market prices to $1 for free purchasing!');
                }}
                className="py-2.5 px-4 bg-green-500/15 hover:bg-green-500/25 text-green-300 border border-green-500/30 rounded-xl font-bold text-xs"
              >
                {isAr ? '💲 خفض كافة أسعار الشراء في العالم إلى $1' : 'Set All Prices to $1 (Free Buy)'}
              </button>

              <button
                onClick={() => {
                  COMMODITIES.forEach((c) => {
                    setCustomMarketPrice(c.id, c.basePrice * 20);
                  });
                  showFeedback(isAr ? 'تم رفع أسعار البيع 20x لتحقيق أرباح فلكية!' : 'Boosted all commodity sale prices 20x for massive profits!');
                }}
                className="py-2.5 px-4 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs"
              >
                {isAr ? '💰 رفع أسعار البيع 20x (أرباح خيالية)' : 'Boost Sale Prices 20x'}
              </button>

              <button
                onClick={() => {
                  resetMarketPricesToNormal();
                  showFeedback(isAr ? 'تمت إعادة ضبط أسعار الأسواق للوضع الطبيعي' : 'Market prices restored to normal baseline');
                }}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة ضبط الأسعار للوضع الافتراضي' : 'Reset Prices to Default'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: WORLD EVENTS & CRISES */}
      {activeSection === 'events' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-yellow-400 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span>{isAr ? 'التحكم في الأحداث والأزمات العالمية' : 'World Events & Crisis Management'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'إطلاق طفرات اقتصادية، أو مسح الكوارث والعواصف النشطة بضغطة زر' : 'Trigger economic booms or cancel all active disasters and storms'}
              </p>
            </div>

            <button
              onClick={() => {
                clearAllWorldEvents();
                showFeedback(isAr ? 'تم مسح وإلغاء كافة الأحداث السلبية والكوارث النشطة في العالم!' : 'Cleared all active world events and storms!');
              }}
              className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl font-black text-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>{isAr ? 'مسح كافة الكوارث النشطة فوراً' : 'Clear All Active Crises'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {WORLD_EVENTS_POOL.map((ev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                <div className="font-bold text-xs text-amber-300">
                  {isAr ? ev.titleAr : ev.title}
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr ? ev.descriptionAr : ev.description}
                </p>
                <button
                  onClick={() => {
                    spawnCustomWorldEvent(ev);
                    showFeedback(isAr ? `تم إطلاق حدث: ${ev.titleAr}!` : `Triggered event: ${ev.title}!`);
                  }}
                  className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'إطلاق هذا الحدث الآن' : 'Trigger This Event'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: STOCKS */}
      {activeSection === 'stocks' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-indigo-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{isAr ? 'السيطرة على البورصة وأسهم الشركات' : 'Stock Market Overlord Controls'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'منح حزم أسهم مجانية للسيطرة على الشركات والحصول على أرباح بالملايين' : 'Grant stock shares for massive quarterly dividends and 10x stock prices'}
              </p>
            </div>

            <button
              onClick={() => {
                boostAllStockPrices(10);
                showFeedback(isAr ? 'تمت مضاعفة أسعار كافة أسهم البورصة 10x!' : 'Boosted all stock prices 10x!');
              }}
              className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl font-black text-xs flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'مضاعفة أسعار الأسهم 10x' : '10x All Stock Prices'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stocks.map((st) => (
              <div key={st.symbol} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-white">{st.symbol} - {isAr ? st.nameAr : st.name}</div>
                    <div className="text-[11px] text-slate-400">${st.currentPrice} / share</div>
                  </div>
                  <div className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    {st.playerShares || 0} Owned
                  </div>
                </div>

                <button
                  onClick={() => {
                    grantStockShares(st.symbol, 10000);
                    showFeedback(isAr ? `تم منحك 10,000 سهم في شركة ${st.nameAr} مجاناً!` : `Granted 10,000 shares in ${st.name}!`);
                  }}
                  className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? '+10,000 سهم مجاني' : '+10k Free Shares'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: GLOBAL BROADCAST & ONLINE PLAYERS */}
      {activeSection === 'broadcast' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Server Broadcast Form */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span>{isAr ? 'بث إعلان إداري عاجل لجميع اللاعبين (Server-Wide Announcement)' : 'Server-Wide Admin Broadcast'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'سيظهر هذا الإعلان بشعار الأدمن الذهبي في شات التجارة العالمي لكل اللاعبين المتصلين بالسيرفر حالياً.'
                : 'This message will appear with the Golden Admin badge across the Global Live Trade Chat for all online players.'}
            </p>

            <form onSubmit={handleSendBroadcast} className="flex gap-2">
              <input
                type="text"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder={isAr ? 'اكتب الإعلان الإداري هنا... مثال: مكافأة مضاعفة لكل التجار اليوم!' : 'Write admin announcement here...'}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isBroadcasting || !broadcastText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isAr ? 'بث الإعلان' : 'Broadcast'}</span>
              </button>
            </form>
          </div>

          {/* Online Players Server Directory */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-green-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                <span>{isAr ? 'قائمة اللاعبين المتصلين بالسيرفر' : 'Live Connected Players'}</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">
                {onlinePlayers.length || 1} {isAr ? 'قبطان متصل' : 'Captains Online'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {onlinePlayers.length > 0 ? (
                onlinePlayers.map((player) => (
                  <div key={player.uid} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                        ⚓
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{player.username}</span>
                          {player.isAdmin && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-black">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-amber-400">{player.companyName}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">Lvl {player.level}</div>
                      <div className="text-[10px] text-slate-400">${player.netWorth?.toLocaleString() || '50,000'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 rounded-2xl bg-slate-950/50 text-center text-xs text-slate-400">
                  {isAr ? 'أنت اللاعب الرئيسي المتصل حالياً بالسيرفر' : 'You are currently the primary captain connected to the server'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
