import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import {
  User,
  KeyRound,
  Building2,
  Crown,
  Sparkles,
  CloudUpload,
  Globe2,
  Anchor,
  Compass,
  Ship,
  Award,
  Flame,
  Shield,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Radio,
  Layers,
  MapPin,
  TrendingUp,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ArchetypeType, CompanyAvatarType } from '../types/game';

const AVATAR_OPTIONS: Array<{ id: CompanyAvatarType; icon: string; labelEn: string; labelAr: string }> = [
  { id: 'anchor', icon: '⚓', labelEn: 'Royal Anchor', labelAr: 'المرساة الملكية' },
  { id: 'crown', icon: '👑', labelEn: 'Golden Crown', labelAr: 'التاج الذهبي' },
  { id: 'compass', icon: '🧭', labelEn: 'Naval Compass', labelAr: 'بوصلة البحار' },
  { id: 'ship', icon: '🚢', labelEn: 'Mega Liner', labelAr: 'الأسطول التجاري' },
  { id: 'falcon', icon: '🦅', labelEn: 'Cargo Falcon', labelAr: 'صقر الشحن' },
  { id: 'star', icon: '⭐', labelEn: 'North Star', labelAr: 'نجمة الملاحة' },
];

const ARCHETYPES: Array<{
  id: ArchetypeType;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: string;
}> = [
  {
    id: 'merchant',
    nameAr: 'تاجر السلع الذكي (Commodity Tycoon)',
    nameEn: 'Commodity Tycoon',
    descAr: 'خصم 10% على تكاليف الصفقات وعلاوة ربح +15% في بيع البضائع الموسمية.',
    descEn: '10% discount on trade costs & +15% bonus profit on seasonal demand.',
    icon: '📦',
  },
  {
    id: 'industrial',
    nameAr: 'الحوت الصناعي (Industrial Giant)',
    nameEn: 'Industrial Giant',
    descAr: 'سرعة إنتاج مضاعفة في المصانع ومستودع مركزي إضافي مجاناً.',
    descEn: 'Boosted factory production speed and free bonus central storage.',
    icon: '🏭',
  },
  {
    id: 'courier',
    nameAr: 'قبطان المحيطات والسرعة (Master Courier)',
    nameEn: 'Master Courier',
    descAr: 'سرعة إبحار للأسطول أعلى بنسبة 25% مع توفير كبير في وقود السفن.',
    descEn: '+25% ship transit speed with optimized bunker fuel efficiency.',
    icon: '🧭',
  },
];

const HQ_PORTS = [
  { id: 'alexandria', nameAr: 'الإسكندرية 🇪🇬', nameEn: 'Alexandria 🇪🇬', badgeAr: 'بوابة المتوسط وقناة السويس' },
  { id: 'rotterdam', nameAr: 'روتردام 🇳🇱', nameEn: 'Rotterdam 🇳🇱', badgeAr: 'عاصمة الشحن والمستودعات' },
  { id: 'singapore', nameAr: 'سنغافورة 🇸🇬', nameEn: 'Singapore 🇸🇬', badgeAr: 'مضيق ملقا والمحيط الهندي' },
  { id: 'dubai', nameAr: 'دبي 🇦🇪', nameEn: 'Dubai 🇦🇪', badgeAr: 'محور التجارة العالمية والذهب' },
];

export const OnlineAuthGate: React.FC = () => {
  const {
    registerWithUsername,
    loginWithUsername,
    loginAsMasterAdmin,
    enterAsGuest,
    onlinePlayers,
    isOnline,
  } = useAuth();

  const {
    setCompanyName,
    setCeoName,
    setCompanyAvatar,
    saveGameCloud,
    loadGameCloud,
    applyStartingSetup,
    settings,
  } = useGame();

  const isAr = settings.language === 'ar';

  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('Alexandria Star');
  const [ceo, setCeo] = useState('Captain Sinbad');
  const [avatar, setAvatar] = useState<CompanyAvatarType>('anchor');
  const [archetype, setArchetype] = useState<ArchetypeType>('merchant');
  const [hqPort, setHqPort] = useState('alexandria');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg(isAr ? 'يرجى إدخال اسم المستخدم وكلمة المرور' : 'Please enter your username and password');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithUsername(username.trim(), password);

    if (res.success) {
      setSuccessMsg(
        isAr
          ? 'تم تسجيل الدخول بنجاح! جاري تحميل وتحديث إمبراطوريتك من السحابة...'
          : 'Login successful! Restoring empire progress from cloud...'
      );
      await loadGameCloud();
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      setErrorMsg(res.error || (isAr ? 'بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى' : 'Invalid login credentials'));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setErrorMsg(isAr ? 'يرجى كتابة اسم مستخدم صالح' : 'Please enter a valid username');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isAr ? 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    const res = await registerWithUsername(
      username.trim(),
      password,
      company.trim() || 'Alexandria Star',
      ceo.trim() || 'Captain',
      avatar
    );

    if (res.success) {
      // Apply starting custom setup
      applyStartingSetup({
        companyName: company.trim() || 'Alexandria Star',
        ceoName: ceo.trim() || 'Captain',
        avatar,
        archetype,
        hqCityId: hqPort,
        difficulty: 'standard',
      });

      setCompanyName(company.trim() || 'Alexandria Star');
      setCeoName(ceo.trim() || 'Captain');
      setCompanyAvatar(avatar);

      setSuccessMsg(
        isAr
          ? 'تم إنشاء حسابك أونلاين بنجاح! جاري مزامنة بيانات البداية سحابياً...'
          : 'Account created! Initializing and syncing starting progress to cloud...'
      );

      // Auto save newly configured state
      setTimeout(async () => {
        await saveGameCloud();
        setIsSubmitting(false);
      }, 1000);
    } else {
      setIsSubmitting(false);
      setErrorMsg(res.error || (isAr ? 'تعذر إنشاء الحساب' : 'Failed to create account'));
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950 font-sans"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Visual Ambient Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-600/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-xl w-full space-y-6 relative z-10 py-6">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-slate-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400">
              {isAr ? 'الخوادم السحابية متصلة ومباشرة ☁️' : 'Cloud MMO Servers Live ☁️'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-xl shadow-amber-500/20 border border-amber-300/40 text-slate-950 font-black text-2xl">
              ⚓
            </div>
            <div className="text-right sm:text-start">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>TRADE EMPIRE</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                  ONLINE
                </span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-amber-400/90">
                {isAr
                  ? 'إمبراطورية التجارة والملاحة العالمية أونلاين'
                  : 'Global Maritime & Commercial Empire Simulator'}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isAr
              ? 'سجل دخولك أو أنشئ حسابك لبناء أسطولك التجاري، السيطرة على الأسواق العالمية، وحفظ تقدمك سحابياً.'
              : 'Sign in or register to command merchant fleets, dominate global trade routes, and auto-sync your cloud empire.'}
          </p>
        </div>

        {/* Main Portal Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/60 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeMode === 'login'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setActiveMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeMode === 'register'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAr ? 'إنشاء حساب قبطان جديد' : 'New Account'}</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Master Admin Fast-Access Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-950 to-amber-950/70 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
                👑
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>{isAr ? 'حساب القائد الأعلى والأدمن المباشر' : 'Master Admin Credentials'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-500/25 text-red-400 text-[10px] font-mono font-bold">ROOT</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                  User: <span className="text-amber-400 font-bold">admin</span> | Pass: <span className="text-amber-400 font-bold">admin123456</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                setErrorMsg(null);
                const res = await loginAsMasterAdmin();
                setIsSubmitting(false);
                if (res.success) {
                  setSuccessMsg(isAr ? '⚡ تم تسجيل الدخول بصلاحيات المدير العام (Master Admin)! جاري الدخول...' : '⚡ Logged in as Master Admin!');
                  await loadGameCloud().catch(() => {});
                } else {
                  setErrorMsg(res.error || 'Failed to login as admin');
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-transform shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isAr ? 'دخول فوري كأدمن ⚡' : 'Instant Admin Login ⚡'}</span>
            </button>
          </div>

          {/* SIGN IN FORM */}
          {activeMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'اسم المستخدم (Username)' : 'Username'}</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isAr ? 'مثال: sindbad_2026' : 'e.g. captain_sinbad'}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'كلمة المرور (Password)' : 'Password'}</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{isAr ? 'تسجيل الدخول ومزامنة الإمبراطورية' : 'Sign In & Launch Empire'}</span>
              </button>
            </form>
          )}

          {/* REGISTER NEW ACCOUNT FORM */}
          {activeMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'اسم المستخدم (عربي أو إنجليزي)' : 'Username (Any language)'}</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isAr ? 'مثال: حسن أو captain_sinbad' : 'e.g. captain_sinbad or hasan'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'كلمة المرور (6+ خانات)' : 'Password (6+)'}</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isAr ? 'اسم شركة الشحن' : 'Company Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'اسم القبطان / المدير' : 'CEO Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={ceo}
                    onChange={(e) => setCeo(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Crest Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {isAr ? 'شعار الشركة الملكي:' : 'Company Crest:'}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setAvatar(av.id);
                      }}
                      className={`p-2 rounded-xl text-xl flex items-center justify-center border transition-all ${
                        avatar === av.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                      title={isAr ? av.labelAr : av.labelEn}
                    >
                      {av.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Starting Port Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isAr ? 'الميناء والمقر الرئيسي للبداية:' : 'Starting HQ Port:'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HQ_PORTS.map((port) => (
                    <button
                      key={port.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setHqPort(port.id);
                      }}
                      className={`p-2.5 rounded-xl border text-right text-xs transition-all ${
                        hqPort === port.id
                          ? 'bg-blue-600/20 border-blue-400 text-blue-200 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-white">{port.nameAr}</div>
                      <div className="text-[10px] text-slate-400 truncate">{port.badgeAr}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudUpload className="w-4 h-4" />
                )}
                <span>{isAr ? 'إنشاء الحساب وبدء اللعب أونلاين' : 'Register & Start Empire'}</span>
              </button>
            </form>
          )}

          {/* Guest Play Divider & Action */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                soundFx.playClick();
                enterAsGuest();
              }}
              className="text-slate-400 hover:text-amber-400 transition-colors font-bold flex items-center gap-1.5"
            >
              <span>{isAr ? '🎮 أو المتابعة واللعب كزائر (بدون حساب)' : '🎮 Or continue as Guest'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-[11px] text-slate-400">
              {isAr ? 'سيرفر التجارة العالمية 2026' : 'Global Trade Server 2026'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
