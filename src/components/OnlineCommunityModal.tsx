import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import {
  MessageSquare,
  Users,
  Trophy,
  Send,
  Radio,
  CloudCheck,
  CloudUpload,
  Sparkles,
  X,
  Globe2,
  Shield,
  Crown,
  Ship,
  TrendingUp,
  DollarSign,
  User,
  Zap,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface OnlineCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnlineCommunityModal: React.FC<OnlineCommunityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    userProfile,
    isOnline,
    globalChatMessages,
    sendGlobalChatMessage,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useAuth();

  const {
    companyName,
    ceoName,
    cash,
    reputation,
    ships,
    level,
    settings,
    saveGameCloud,
  } = useGame();

  const isAr = settings.language === 'ar';
  const [activeTab, setActiveTab] = useState<'chat' | 'leaderboard'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      setAuthModalMode('login');
      return;
    }

    setIsSending(true);
    await sendGlobalChatMessage(chatInput.trim());
    setChatInput('');
    setIsSending(false);
  };

  const QUICK_PHRASES = [
    { en: '⚓ Setting sail for Alexandria!', ar: '⚓ أسطولي يبحر الآن إلى الإسكندرية!' },
    { en: '📈 High profit margin on Electronics!', ar: '📈 أرباح قياسية في تجارة الإلكترونيات!' },
    { en: '🌾 Surplus wheat available in Europe!', ar: '🌾 فائض قمح متاح للشراء في أوروبا!' },
    { en: '💎 Looking for strategic trade alliances.', ar: '💎 أبحث عن تحالفات تجارية استراتيجية.' },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full h-[85vh] max-h-[640px] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  {isAr ? 'مركز الاتصال والتواصل العالمي أونلاين' : 'Global Online Trade Radio'}
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isAr ? 'متصل بالشبكة' : 'LIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'تواصل مع قادة الأساطيل والتجار العالميين وتابع المتصدرين'
                  : 'Live trade communication with captains & empire leaders worldwide'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-3 flex items-center gap-2 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('chat');
            }}
            className={`pb-2 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'chat'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isAr ? 'شات التجارة المباشر' : 'Global Radio Chat'}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('leaderboard');
            }}
            className={`pb-2 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'leaderboard'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{isAr ? 'قائمة متصدري التجارة' : 'Tycoons Leaderboard'}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/70 p-4">
            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {globalChatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
                  <MessageSquare className="w-8 h-8 opacity-40 text-slate-400" />
                  <p className="text-xs font-semibold">
                    {isAr ? 'كن أول من يبث رسالة على راديو التجارة العالمي!' : 'Be the first captain to broadcast on the global trade frequency!'}
                  </p>
                </div>
              ) : (
                globalChatMessages.map((msg) => {
                  const isMe = currentUser && msg.senderId === currentUser.uid;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 items-start ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
                        {msg.senderAvatar === 'crown' ? '👑' : msg.senderAvatar === 'compass' ? '🧭' : msg.senderAvatar === 'ship' ? '🚢' : '⚓'}
                      </div>

                      <div
                        className={`max-w-[78%] rounded-2xl p-3 text-xs space-y-1 ${
                          isMe
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-100 rounded-tr-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-amber-300 text-[11px]">
                              {msg.senderUsername}
                            </span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Lvl {msg.senderLevel}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="text-[10px] text-cyan-400 font-semibold">{msg.senderCompany}</div>
                        <p className="text-xs leading-relaxed text-slate-100 font-normal break-words">{msg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatInput(isAr ? phrase.ar : phrase.en)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 whitespace-nowrap transition-colors"
                >
                  {isAr ? phrase.ar : phrase.en}
                </button>
              ))}
            </div>

            {/* Chat Input Form */}
            {currentUser ? (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-800 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isAr ? 'اكتب رسالتك لجميع التجار والقباطنة...' : 'Broadcast to all captains...'}
                  maxLength={160}
                  className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSending}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إرسال' : 'Send'}</span>
                </button>
              </form>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs shrink-0">
                <span className="text-amber-300 font-semibold">
                  {isAr ? 'سجل دخولك أو أنشئ حساباً للمشاركة في شات التجار العالمي' : 'Sign in to broadcast in global trade chat'}
                </span>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsAuthModalOpen(true);
                    setAuthModalMode('login');
                  }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-colors"
                >
                  {isAr ? 'دخول / تسجيل' : 'Login'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* LEADERBOARD TAB */
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/70">
            {/* Top 3 Podium Simulation / Live Ranks */}
            <div className="space-y-2">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/30">
                    👑 1
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span>{companyName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {isAr ? 'أنت (القبطان)' : 'YOU'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{ceoName} • Lvl {level}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-emerald-400">${cash.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">{ships.length} {isAr ? 'سفن في الأسطول' : 'fleet ships'}</div>
                </div>
              </div>

              {/* Sample Online Competitors */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center border border-slate-700">
                    🥈 2
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Nordic Titan Lines</div>
                    <div className="text-[10px] text-slate-400">Capt. Erikson • Lvl 12</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">$480,000</div>
                  <div className="text-[10px] text-slate-400">7 ships</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center border border-slate-700">
                    🥉 3
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Silk Road Global Logistics</div>
                    <div className="text-[10px] text-slate-400">Capt. Wei • Lvl 9</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">$295,000</div>
                  <div className="text-[10px] text-slate-400">5 ships</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
