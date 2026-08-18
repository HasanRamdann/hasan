import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { TradeAlliance, LeaderboardPlayer } from '../types/game';
import {
  Users2,
  Trophy,
  Shield,
  Star,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Ship,
  Factory,
  Globe2,
  Radio,
  User,
  LogIn,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { OnlineCommunityModal } from './OnlineCommunityModal';

export const AlliancesView: React.FC = () => {
  const { alliances, leaderboard, joinAlliance, settings } = useGame();
  const { currentUser, userProfile, setIsAuthModalOpen } = useAuth();
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const isAr = settings.language === 'ar';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'التحالفات التجارية وراديو التجار المباشر' : 'Global Trade Alliances & Live MMO Radio'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'انضم إلى أقوى التكتلات الاقتصادية، وتحدث مع التجار واللاعبين مباشرة عبر الراديو العام، وتنافس في لوحة الشرف العالمية.'
              : 'Join premier trade syndicates, chat in real-time with captains worldwide via Global Radio, and climb the live leaderboards.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsCommunityOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{isAr ? '📻 راديو وتصنيف التجار المباشر' : '📻 Open Live Radio & Chat'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global MMO Leaderboard */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'لوحة الشرف وتصنيف أغنى الشركات' : 'Global Net Worth Leaderboard'}
              </h3>
            </div>
            <span className="text-xs text-slate-400">Real-time Ranking</span>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((player) => {
              const isTop3 = player.rank <= 3;

              return (
                <div
                  key={player.rank}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    player.isUser
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        player.rank === 1
                          ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/30'
                          : player.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : player.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      #{player.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <span>{player.countryFlag}</span>
                        <span>{player.name}</span>
                        {player.isUser && (
                          <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{player.companyName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-xs sm:text-sm text-emerald-400">
                      ${player.netWorth.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-2">
                      <span>🚢 {player.fleetCount}</span>
                      <span>🏭 {player.factoriesCount}</span>
                      <span>⭐ {player.reputation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trade Alliances */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users2 className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'التحالفات التجارية المتاحة' : 'Trade Alliances & Consortiums'}
              </h3>
            </div>
            <span className="text-xs text-slate-400">{alliances.length} alliances</span>
          </div>

          <div className="space-y-3">
            {alliances.map((alliance) => (
              <div
                key={alliance.id}
                className={`p-4 rounded-3xl border transition-all ${
                  alliance.isJoined
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        [{alliance.tag}]
                      </span>
                      <h4 className="font-extrabold text-sm text-white">
                        {isAr ? alliance.nameAr : alliance.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isAr ? 'القائد:' : 'Leader:'} {alliance.leader} • {alliance.membersCount}/{alliance.maxMembers}{' '}
                      {isAr ? 'عضو' : 'members'}
                    </p>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-900 text-slate-300 border border-slate-800">
                    Lvl {alliance.level}
                  </span>
                </div>

                {/* Alliance perks */}
                <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80 text-xs mb-3 text-emerald-300 font-semibold">
                  ⚡ {isAr ? alliance.perksDescriptionAr : alliance.perksDescription}
                </div>

                {/* Join button */}
                <button
                  onClick={() => joinAlliance(alliance.id)}
                  disabled={alliance.isJoined}
                  className={`w-full py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    alliance.isJoined
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  {alliance.isJoined ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? 'عضو نشط في التحالف' : 'Active Member'}</span>
                    </>
                  ) : (
                    <span>{isAr ? 'الانضمام للتحالف' : 'Join Alliance'}</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OnlineCommunityModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />
    </div>
  );
};
