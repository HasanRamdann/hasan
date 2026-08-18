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
  CloudCheck,
  X,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Globe2,
  Anchor,
  Compass,
  Ship,
  Award,
  Flame,
  Shield,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

const AVATAR_OPTIONS = [
  { id: 'anchor', icon: '⚓', labelEn: 'Royal Anchor', labelAr: 'المرساة الملكية' },
  { id: 'crown', icon: '👑', labelEn: 'Golden Crown', labelAr: 'التاج الذهبي' },
  { id: 'compass', icon: '🧭', labelEn: 'Naval Compass', labelAr: 'بوصلة البحار' },
  { id: 'ship', icon: '🚢', labelEn: 'Mega Liner', labelAr: 'الأسطول التجاري' },
  { id: 'flame', icon: '🔥', labelEn: 'Phoenix Merchant', labelAr: 'عنقاء التجارة' },
  { id: 'globe', icon: '🌐', labelEn: 'Global Pioneer', labelAr: 'رائد عالمي' },
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    registerWithUsername,
    loginWithUsername,
    loginAsMasterAdmin,
    currentUser,
    userProfile,
    logoutUser,
    exitGuestSession,
    lastCloudSaveTime,
    isSyncingCloud,
  } = useAuth();

  const {
    companyName,
    ceoName,
    companyAvatar,
    setCompanyName,
    setCeoName,
    setCompanyAvatar,
    saveGameCloud,
    loadGameCloud,
    settings,
    cash,
    reputation,
    ships,
    level,
  } = useGame();

  const isAr = settings.language === 'ar';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [customCompany, setCustomCompany] = useState(companyName || 'Alexandria Star');
  const [customCeo, setCustomCeo] = useState(ceoName || 'Captain');
  const [selectedAvatar, setSelectedAvatar] = useState(companyAvatar || 'anchor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال اسم مستخدم صالح' : 'Please enter a valid username');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isAr ? 'كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام' : 'Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    const res = await registerWithUsername(
      username.trim(),
      password,
      customCompany.trim() || companyName,
      customCeo.trim() || ceoName,
      selectedAvatar
    );

    setIsSubmitting(false);

    if (res.success) {
      setCompanyName(customCompany.trim() || companyName);
      setCeoName(customCeo.trim() || ceoName);
      setCompanyAvatar(selectedAvatar);
      setSuccessMsg(
        isAr
          ? 'تم إنشاء الحساب بنجاح وتأمينه سحابياً! جاري رفع إمبراطوريتك...'
          : 'Account created successfully! Syncing your empire to the cloud...'
      );
      // Auto save current progress into the newly created account
      setTimeout(async () => {
        await saveGameCloud();
        setIsAuthModalOpen(false);
      }, 1200);
    } else {
      setErrorMsg(res.error || (isAr ? 'تعذر إنشاء الحساب' : 'Registration failed'));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg(isAr ? 'يرجى إدخال اسم المستخدم وكلمة المرور' : 'Please enter username and password');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithUsername(username.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(isAr ? 'تم تسجيل الدخول بنجاح! جاري تحميل تقدمك...' : 'Login successful! Loading your empire...');
      // Load cloud save
      setTimeout(async () => {
        await loadGameCloud();
        setIsAuthModalOpen(false);
      }, 1000);
    } else {
      setErrorMsg(res.error || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {currentUser
                  ? isAr
                    ? 'الملف الشخصي والحفظ السحابي'
                    : 'Online Profile & Cloud Sync'
                  : authModalMode === 'login'
                    ? isAr
                      ? 'تسجيل الدخول للاعب'
                      : 'Captain Sign In'
                    : isAr
                      ? 'إنشاء حساب جديد وحفظ أونلاين'
                      : 'Create Online Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser
                  ? isAr
                    ? 'حسابك مؤمن ومتصل بسحابة الخوادم العالمية'
                    : 'Connected to global cloud servers'
                  : isAr
                    ? 'احفظ تقدم أسطولك وثروتك واستمر في اللعب من أي جهاز'
                    : 'Save your fleet progress and play seamlessly across devices'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsAuthModalOpen(false);
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In: Show Profile & Cloud Sync Card */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl shadow-lg border border-amber-400/40">
                    {AVATAR_OPTIONS.find((a) => a.id === (userProfile?.avatar || companyAvatar))?.icon || '⚓'}
                  </div>
                  <div>
                    <div className="font-black text-sm text-white flex items-center gap-1.5">
                      <span>{userProfile?.username || username}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                        {isAr ? 'متصل أونلاين' : 'Online'}
                      </span>
                    </div>
                    <div className="text-xs text-amber-400 font-semibold">{companyName}</div>
                    <div className="text-[11px] text-slate-400">
                      {isAr ? 'القبطان:' : 'CEO:'} {ceoName} • {isAr ? 'المستوى' : 'Lvl'} {level}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="p-2 bg-slate-900 rounded-xl">
                  <div className="text-[10px] text-slate-400">{isAr ? 'السيولة' : 'Cash'}</div>
                  <div className="text-xs font-bold text-emerald-400">${cash.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl">
                  <div className="text-[10px] text-slate-400">{isAr ? 'الأسطول' : 'Fleet'}</div>
                  <div className="text-xs font-bold text-cyan-400">{ships.length} {isAr ? 'سفينة' : 'ships'}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl">
                  <div className="text-[10px] text-slate-400">{isAr ? 'السمعة' : 'Rep'}</div>
                  <div className="text-xs font-bold text-amber-400">{reputation}</div>
                </div>
              </div>
            </div>

            {/* Cloud Status */}
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-300">
                <CloudCheck className="w-4 h-4 text-indigo-400" />
                <span>
                  {lastCloudSaveTime
                    ? `${isAr ? 'آخر حفظ سحابي:' : 'Last Cloud Sync:'} ${lastCloudSaveTime}`
                    : isAr
                      ? 'تم تفعيل المزامنة السحابية الفورية'
                      : 'Cloud sync active'}
                </span>
              </div>
              <button
                onClick={async () => {
                  soundFx.playClick();
                  await saveGameCloud();
                }}
                disabled={isSyncingCloud}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                {isSyncingCloud ? <Sparkles className="w-3 h-3 animate-spin" /> : <CloudUpload className="w-3 h-3" />}
                <span>{isAr ? 'حفظ الآن' : 'Sync Now'}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={async () => {
                  soundFx.playClick();
                  await loadGameCloud();
                  setIsAuthModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CloudUpload className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'استرجاع من السحابة' : 'Restore from Cloud'}</span>
              </button>

              <button
                onClick={async () => {
                  soundFx.playClick();
                  await logoutUser();
                  exitGuestSession();
                  setIsAuthModalOpen(false);
                }}
                className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs transition-colors"
              >
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Forms */
          <div className="space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setAuthModalMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-black rounded-xl transition-all ${
                  authModalMode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setAuthModalMode('register');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-black rounded-xl transition-all ${
                  authModalMode === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'حساب جديد' : 'New Account'}
              </button>
            </div>

            {/* Error / Success Alerts */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Master Admin Fast-Access Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-950 to-amber-950/70 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                  👑
                </div>
                <div>
                  <div className="text-[11px] font-black text-white flex items-center gap-1.5">
                    <span>{isAr ? 'حساب الأدمن المباشر' : 'Master Admin Credentials'}</span>
                    <span className="px-1 py-0.2 rounded bg-red-500/25 text-red-400 text-[9px] font-mono">ROOT</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">
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
                    setSuccessMsg(isAr ? '⚡ تم تسجيل الدخول بصلاحيات القائد الأعلى (Master Admin)!' : '⚡ Logged in as Master Admin!');
                    setTimeout(() => setIsAuthModalOpen(false), 1000);
                  } else {
                    setErrorMsg(res.error || 'Failed to login as admin');
                  }
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 font-black rounded-lg text-[11px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform shrink-0"
              >
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>{isAr ? 'دخول كأدمن ⚡' : 'Admin Login ⚡'}</span>
              </button>
            </div>

            {authModalMode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'اسم المستخدم (Username)' : 'Username'}</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isAr ? 'مثال: sindbad_2026' : 'e.g. captain_alex'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'كلمة المرور' : 'Password'}</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>{isAr ? 'تسجيل الدخول وتحميل التقدم' : 'Sign In & Load Save'}</span>
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'اسم المستخدم (فريد)' : 'Unique Username'}</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isAr ? 'اسم المستخدم بالإنجليزية أو أرقام' : 'e.g. tycoon_maritime'}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'كلمة المرور (6 خانات فأكثر)' : 'Password (min 6 characters)'}</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-cyan-400" />
                      <span>{isAr ? 'اسم الشركة' : 'Company Name'}</span>
                    </label>
                    <input
                      type="text"
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>{isAr ? 'اسم القبطان' : 'Captain Name'}</span>
                    </label>
                    <input
                      type="text"
                      value={customCeo}
                      onChange={(e) => setCustomCeo(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Avatar Picker */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    {isAr ? 'شعار الشركة الملكي:' : 'Company Crest:'}
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedAvatar(av.id);
                        }}
                        className={`p-2 rounded-xl text-xl flex items-center justify-center border transition-all ${
                          selectedAvatar === av.id
                            ? 'bg-amber-500/20 border-amber-500 shadow-md scale-105'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                        title={isAr ? av.labelAr : av.labelEn}
                      >
                        {av.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <CloudUpload className="w-4 h-4" />
                  )}
                  <span>{isAr ? 'إنشاء الحساب وحفظ الإمبراطورية أونلاين' : 'Register & Save Empire Online'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
