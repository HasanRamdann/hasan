import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CorporationStock, BankLoan } from '../types/game';
import {
  Landmark,
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldCheck,
  Building2,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const FinanceView: React.FC = () => {
  const {
    stocks,
    loans,
    cash,
    debt,
    reputation,
    buyStock,
    sellStock,
    takeLoan,
    repayLoan,
    settings,
  } = useGame();

  const isAr = settings.language === 'ar';
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>(stocks[0]?.symbol || 'SUEZ');
  const [tradeSharesCount, setTradeSharesCount] = useState<number>(100);

  const selectedStock = stocks.find((s) => s.symbol === selectedStockSymbol) || stocks[0];
  const playerPortfolioValuation = stocks.reduce((sum, s) => sum + s.playerShares * s.currentPrice, 0);

  return (
    <div className="space-y-6">
      {/* Financial Portfolio Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
            $
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">{isAr ? 'السيولة النقدية' : 'Liquid Cash'}</div>
            <div className="text-lg font-extrabold text-emerald-400">${cash.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">{isAr ? 'محفظة الأسهم' : 'Stock Portfolio'}</div>
            <div className="text-lg font-extrabold text-indigo-300">
              ${playerPortfolioValuation.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-xl font-bold">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">{isAr ? 'إجمالي الديون والالتزامات' : 'Bank Liabilities'}</div>
            <div className="text-lg font-extrabold text-red-400">${debt.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Stock Exchange & Banking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Stock Market */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'بورصة الأوراق المالية والاستثمار في الشركات' : 'Global Stock Exchange (Equities)'}
              </h3>
            </div>
            <span className="text-xs text-slate-400">{stocks.length} listed mega-corps</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stocks.map((stock) => {
              const isSelected = selectedStockSymbol === stock.symbol;
              const isUp = stock.currentPrice >= stock.previousPrice;
              const changePct = Math.round(
                ((stock.currentPrice - stock.previousPrice) / Math.max(1, stock.previousPrice)) * 100
              );

              return (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedStockSymbol(stock.symbol);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] text-slate-400">{isAr ? stock.sectorAr : stock.sector}</span>
                      </div>
                      <h4 className="font-bold text-xs text-white mt-1 leading-tight">
                        {isAr ? stock.nameAr : stock.name}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-sm text-slate-100">${stock.currentPrice}</div>
                      <div
                        className={`text-[10px] font-bold flex items-center justify-end ${
                          isUp ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{changePct >= 0 ? `+${changePct}%` : `${changePct}%`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                    <span>
                      {isAr ? 'أسهمك المملوكة:' : 'Owned:'}{' '}
                      <strong className="text-amber-300 font-bold">{stock.playerShares} shares</strong>
                    </span>
                    <span>
                      {isAr ? 'توزيعات السهم:' : 'Dividend:'}{' '}
                      <strong className="text-emerald-400">${stock.dividendPerShare}/yr</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trade Stock Box */}
          {selectedStock && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200">
                  {isAr ? 'تنفيذ أوامر الأسهم:' : 'Execute Equity Order:'} {selectedStock.symbol} (
                  {isAr ? selectedStock.nameAr : selectedStock.name})
                </span>
                <span className="text-slate-400">
                  {isAr ? 'سعر السهم:' : 'Price:'} <strong className="text-white">${selectedStock.currentPrice}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'عدد الأسهم:' : 'Shares Quantity:'}</label>
                  <input
                    type="number"
                    min="1"
                    value={tradeSharesCount}
                    onChange={(e) => setTradeSharesCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={() => buyStock(selectedStock.symbol, tradeSharesCount)}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
                  >
                    {isAr ? 'شراء أسهم (Buy)' : 'Buy Shares'}
                  </button>
                  <button
                    onClick={() => sellStock(selectedStock.symbol, tradeSharesCount)}
                    disabled={selectedStock.playerShares < tradeSharesCount}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
                  >
                    {isAr ? 'بيع أسهم (Sell)' : 'Sell Shares'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Banking Loans & Credit Lines */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Landmark className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              {isAr ? 'التسهيلات الائتمانية والقروض البنكية' : 'Bank Credit Lines & Loans'}
            </h3>
          </div>

          <div className="space-y-3">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  loan.isActive
                    ? 'bg-slate-950 border-red-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-xs text-white">{isAr ? loan.nameAr : loan.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      {loan.termDays} {isAr ? 'يوماً' : 'days'} • {Math.round(loan.interestRateAnnual * 100)}% APR
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-amber-400">${loan.principal.toLocaleString()}</div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400">
                    {loan.isActive ? (isAr ? 'القسط اليومي:' : 'Daily:') : isAr ? 'يتطلب سمعة:' : 'Req Rep:'}{' '}
                    <strong className="text-slate-200">
                      {loan.isActive ? `$${loan.dailyInstallment}` : `${loan.minReputation}⭐`}
                    </strong>
                  </span>

                  {loan.isActive ? (
                    <button
                      onClick={() => repayLoan(loan.id)}
                      className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-bold transition-colors"
                    >
                      {isAr ? 'سداد مبكر' : 'Payoff'}
                    </button>
                  ) : (
                    <button
                      onClick={() => takeLoan(loan.id)}
                      disabled={reputation < loan.minReputation}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-[11px] rounded-xl transition-colors"
                    >
                      {isAr ? 'طلب القرض' : 'Apply'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
