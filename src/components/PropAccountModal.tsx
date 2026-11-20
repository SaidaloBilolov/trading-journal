import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Briefcase, 
  Check, 
  Trash2, 
  ShieldAlert, 
  DollarSign, 
  Layers, 
  TrendingUp, 
  ArrowRight,
  Building2,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Wallet
} from 'lucide-react';
import { PropAccount, Trade, AppUser } from '../types/journal';

interface PropAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: PropAccount[];
  activeAccountId: string;
  onSelectAccount: (id: string) => void;
  onAddAccount: (account: PropAccount) => void;
  onDeleteAccount: (id: string) => void;
  allTrades: Trade[];
  currentUser?: AppUser | null;
}

const FOREX_PROP_FIRMS = [
  'FTMO',
  'FundedNext',
  'Alpha Capital Group',
  'Funding Pips',
  'The Funded Trader (TFT)',
  'E8 Markets',
  'The5%ers',
  'Goat Funded Trader',
  'Boshqa FX Prop'
];

const FUTURES_PROP_FIRMS = [
  'Tradify',
  'Apex Trader Funding',
  'Topstep',
  'MyFundedFutures (MFFU)',
  'TradeDay',
  'Bulenox',
  'Take Profit Trader',
  'Boshqa Futures Prop'
];

const REAL_FUTURES_FIRMS = [
  'Tradovate Live / Real',
  'NinjaTrader Brokerage',
  'Interactive Brokers (IBKR)',
  'AMP Futures',
  'Binance / Bybit Futures',
  'EdgeClear',
  'Shaxsiy Futures Hisob',
  'Boshqa Real Futures'
];

const REAL_FOREX_FIRMS = [
  'Exness Real',
  'MetaTrader 4 / 5 (MT4/MT5)',
  'IC Markets Live',
  'OANDA',
  'Forex.com',
  'Pepperstone',
  'Shaxsiy Forex Depozit',
  'Boshqa FX Broker'
];

const BACKTEST_FIRMS = [
  'FxReplay',
  'TradingView Replay',
  'Tradovate Demo / Replay',
  'Backtest Jurnali',
  'Boshqa Backtest'
];

export const PropAccountModal: React.FC<PropAccountModalProps> = ({
  isOpen,
  onClose,
  accounts,
  activeAccountId,
  onSelectAccount,
  onAddAccount,
  onDeleteAccount,
  allTrades,
  currentUser,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [accountType, setAccountType] = useState<'prop' | 'real' | 'backtest'>('prop');
  const [marketType, setMarketType] = useState<'futures' | 'forex' | 'backtest'>('futures');
  const [drawdownType, setDrawdownType] = useState<'trailing' | 'static'>('trailing');
  const [name, setName] = useState('');
  const [firm, setFirm] = useState('Tradify');
  const [initialBalance, setInitialBalance] = useState<number>(50000);
  const [trailingDrawdown, setTrailingDrawdown] = useState<number>(2000);
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(1000);
  const [maxContracts, setMaxContracts] = useState<number>(5);
  const [description, setDescription] = useState('');

  const currentFirms =
    accountType === 'real'
      ? marketType === 'forex'
        ? REAL_FOREX_FIRMS
        : REAL_FUTURES_FIRMS
      : marketType === 'forex'
        ? FOREX_PROP_FIRMS
        : marketType === 'backtest'
          ? BACKTEST_FIRMS
          : FUTURES_PROP_FIRMS;

  if (!isOpen) return null;

  const handleOpenAddFutures = () => {
    setAccountType('prop');
    setMarketType('futures');
    setDrawdownType('trailing');
    setName('Apex 50K');
    setFirm('Apex Trader Funding');
    setInitialBalance(50000);
    setTrailingDrawdown(2000);
    setDailyLossLimit(1000);
    setMaxContracts(5);
    setDescription('Futures prop hisobi (Trailing Drawdown ko‘tariladi)');
    setShowAddForm(true);
  };

  const handleOpenAddForex = () => {
    setAccountType('prop');
    setMarketType('forex');
    setDrawdownType('static');
    setName('FTMO 50K (FX)');
    setFirm('FTMO');
    setInitialBalance(50000);
    setTrailingDrawdown(5000); // 10% static DD
    setDailyLossLimit(2500); // 5% daily loss
    setMaxContracts(10);
    setDescription('Forex / FX prop hisobi (Statik Drawdown ko‘tarilmaydi, qat’iy $45 000 da turadi)');
    setShowAddForm(true);
  };

  const handleOpenAddReal = () => {
    setAccountType('real');
    setMarketType('futures');
    setDrawdownType('static');
    setName('Mening Real Hisobim (Futures)');
    setFirm('Tradovate Live / Real');
    setInitialBalance(1000); // default 1000$, user can change to any number freely
    setTrailingDrawdown(200); // 20% max risk
    setDailyLossLimit(100);
    setMaxContracts(2);
    setDescription('Shaxsiy jonli real hisob (Real depozit)');
    setShowAddForm(true);
  };

  const handleOpenAddBacktest = () => {
    setAccountType('backtest');
    setMarketType('backtest');
    setDrawdownType('trailing');
    setName('Backtest (FxReplay)');
    setFirm('Backtest');
    setInitialBalance(50000);
    setTrailingDrawdown(2000);
    setDailyLossLimit(1000);
    setMaxContracts(5);
    setDescription('FxReplay / TradingView tarixiy sinov Notion jurnali');
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const ownerTag = `owner:${currentUser?.username || 'said'}`;
    const fullDesc = description.trim() ? `${ownerTag} | ${description.trim()}` : ownerTag;

    const newAcc: PropAccount = {
      id: `acc-${Date.now()}`,
      name: name.trim(),
      firm: firm.trim(),
      market_type: marketType,
      account_type: accountType,
      drawdown_type: drawdownType,
      initial_balance: Number(initialBalance) || (accountType === 'real' ? 1000 : 50000),
      trailing_drawdown_amount: Number(trailingDrawdown) || (drawdownType === 'static' ? 5000 : 2000),
      daily_loss_limit: Number(dailyLossLimit) || 1000,
      max_contracts: Number(maxContracts) || 5,
      created_at: new Date().toISOString(),
      is_active: false,
      description: fullDesc,
    };

    onAddAccount(newAcc);
    setName('');
    setDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Hisoblar Menejeri (Prop, Real & Backtest)
                <span className="text-xs bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {accounts.length} ta hisob
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Prop firmalar, shaxsiy real depozitlar va backtest hisoblaringizni alohida kuzating
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Action Header & Quick Add Buttons */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-cyan-400" /> Mavjud Hisoblar
              </span>
              {!showAddForm && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAddReal}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                    title="Real jonli shaxsiy hisob qo‘shish (Futures yoki Forex)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>💎 + Real Hisob</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddFutures}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
                    title="Futures prop hisobi qo‘shish (Trailing Drawdown)"
                  >
                    <span>⚡ + Futures Prop</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddForex}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                    title="Forex prop hisobi qo‘shish (Statik Drawdown)"
                  >
                    <span>🌐 + FX Prop</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddBacktest}
                    className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 border border-purple-500/50 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    title="Yangi Backtest Notion jurnali ochish"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                    <span>🧪 + Backtest</span>
                  </button>
                </div>
              )}
            </div>

            {/* Account Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((acc) => {
                const isActive = acc.id === activeAccountId;
                const isReal = acc.account_type === 'real' || acc.name.toLowerCase().includes('real') || acc.firm.toLowerCase().includes('real') || acc.firm.toLowerCase().includes('live');
                const isBacktest = acc.firm === 'Backtest' || acc.account_type === 'backtest' || acc.id.includes('backtest') || acc.name.toLowerCase().includes('backtest');
                
                const accTrades = allTrades.filter(
                  (t) => (t.account_id || 'acc-tradify') === acc.id
                );
                const accNetPnl = accTrades.reduce((sum, t) => sum + t.net_pnl, 0);
                const accBalance = acc.initial_balance + accNetPnl;
                const accWins = accTrades.filter((t) => t.net_pnl > 0).length;
                const accWinRate = accTrades.length > 0 ? ((accWins / accTrades.length) * 100).toFixed(1) : '0';

                return (
                  <div
                    key={acc.id}
                    onClick={() => onSelectAccount(acc.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer relative ${
                      isActive
                        ? isReal
                          ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                          : isBacktest
                          ? 'bg-purple-950/30 border-purple-500/70 shadow-lg shadow-purple-950/40'
                          : 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : isReal
                        ? 'bg-slate-950/60 border-amber-500/30 hover:border-amber-500/60 hover:bg-slate-900/40'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isReal
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : isBacktest
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Faol
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {isReal ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-600/70 font-mono font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Real Hisob ({acc.market_type === 'forex' ? 'FX' : 'Futures'})
                        </span>
                      ) : isBacktest ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-700/60 font-mono font-bold flex items-center gap-1">
                          <FlaskConical className="w-3 h-3 text-purple-400" /> Backtest Jurnali
                        </span>
                      ) : acc.drawdown_type === 'static' ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono font-bold flex items-center gap-1">
                          <span>🌐 FX Prop (Statik DD)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono font-bold flex items-center gap-1">
                          <span>⚡ Futures Prop (Trailing DD)</span>
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-medium">
                        {acc.firm}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base truncate">{acc.name}</h3>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Balans:</span>
                        <span className="font-bold font-mono text-white text-sm">
                          ${accBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Sof P&L:</span>
                        <span className={`font-bold font-mono text-sm ${accNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {accNetPnl >= 0 ? '+' : ''}${accNetPnl.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{accTrades.length} ta sdelka ({accWinRate}% WR)</span>
                      {isReal ? (
                        <span className="text-amber-400 font-mono font-medium">
                          Boshlang‘ich: ${acc.initial_balance.toLocaleString()}
                        </span>
                      ) : acc.drawdown_type === 'static' ? (
                        <span className="text-emerald-400 font-mono font-semibold" title="Statik: Sliv chegarasi ko‘tarilmaydi">
                          Statik DD: -${acc.trailing_drawdown_amount}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-mono" title="Trailing: Balans bilan birga ko‘tariladi">
                          Trailing DD: -${acc.trailing_drawdown_amount}
                        </span>
                      )}
                    </div>

                    {/* Delete action: Real accounts and Backtest accounts can be deleted if created by mistake */}
                    {isBacktest || isReal || (acc.id !== 'acc-tradify' && acc.id !== 'acc-shaxzod-prop') ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const typeLabel = isReal ? 'real hisobni' : 'backtest jurnalini';
                          if (window.confirm(`"${acc.name}" ${typeLabel} va unga tegishli barcha sdelkalarni o‘chirmoqchimisiz?`)) {
                            onDeleteAccount(acc.id);
                          }
                        }}
                        className="mt-3 w-full py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 hover:text-rose-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-rose-500/40 shadow-sm"
                        title="Hisobni o‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>{isReal ? 'Real hisobni o‘chirish' : 'Backtestni o‘chirish'}</span>
                      </button>
                    ) : (
                      <div className="mt-3 w-full py-1.5 rounded-lg bg-slate-900/70 text-slate-400 text-[11px] font-mono flex items-center justify-center gap-1.5 border border-slate-800/80">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Asosiy Prop Hisob (Himoyalangan)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Account Form */}
          {showAddForm && (
            <div className={`p-5 rounded-2xl bg-slate-950/90 border space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 ${
              accountType === 'real'
                ? 'border-amber-500/50 shadow-xl shadow-amber-950/30'
                : 'border-cyan-500/30'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  {accountType === 'real' ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Yangi Real (Jonli / Shaxsiy) Hisob Ma’lumotlari</span>
                    </>
                  ) : accountType === 'backtest' ? (
                    <>
                      <FlaskConical className="w-4 h-4 text-purple-400" />
                      <span>Yangi Backtest Jurnali Ma’lumotlari</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-cyan-400" />
                      <span>Yangi Prop Hisob Ma’lumotlari</span>
                    </>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Bekor qilish
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Bozor turi tanlash: Futures yoki Forex (FX) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Bozor Turini Tanlang:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMarketType('futures');
                        if (accountType === 'real') {
                          setFirm('Tradovate Live / Real');
                          if (!name || name.includes('Forex') || name.includes('FX')) {
                            setName('Real Futures Hisobim');
                          }
                        } else {
                          setFirm('Tradify');
                          setDrawdownType('trailing');
                          if (!name || name.includes('FTMO')) setName('Tradify 50K');
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition ${
                        marketType === 'futures'
                          ? accountType === 'real'
                            ? 'bg-amber-950/50 border-amber-500 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                            : 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center gap-2 font-bold text-xs mb-1 ${
                        accountType === 'real' ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        <span>⚡ Futures Bozor</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-mono">
                          MNQ, NQ, MES, MGC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Tradovate, NinjaTrader, Interactive Brokers yoki Binance/Bybit fyuchers hisoblari.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMarketType('forex');
                        setDrawdownType('static');
                        if (accountType === 'real') {
                          setFirm('Exness Real');
                          if (!name || name.includes('Futures')) {
                            setName('Real Forex Hisobim');
                          }
                        } else {
                          setFirm('FTMO');
                          if (!name || name.includes('Tradify') || name.includes('Apex')) setName('FTMO 50K (FX)');
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition ${
                        marketType === 'forex'
                          ? accountType === 'real'
                            ? 'bg-amber-950/50 border-amber-500 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                            : 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center gap-2 font-bold text-xs mb-1 ${
                        accountType === 'real' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        <span>🌐 Forex / FX Bozor</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-mono">
                          EURUSD, GBPUSD, XAUUSD
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Exness, MetaTrader 4/5, IC Markets yoki boshqa Forex shaxsiy brokerlik hisoblari.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Hisob nomi */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Hisob Nomi <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={accountType === 'real' ? 'masalan: Real Depozit $1 000 yoki Exness Real' : 'masalan: Apex 50K yoki FTMO 50K'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Broker / Firma */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>{accountType === 'real' ? 'Broker / Platforma' : 'Prop Firma'}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        accountType === 'real'
                          ? 'bg-amber-500/20 text-amber-300'
                          : marketType === 'forex' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {accountType === 'real' ? '💎 Real Shaxsiy' : marketType === 'forex' ? '🌐 FX Prop' : '⚡ Futures Prop'}
                      </span>
                    </label>
                    <select
                      value={firm}
                      onChange={(e) => setFirm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      {currentFirms.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Boshlang'ich Balans (Qo'lda kiritish) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-white">
                        <Wallet className="w-3.5 h-3.5 text-amber-400" />
                        <span>Boshlang‘ich Balans ($) [Qo‘lda erkin kiriting]</span>
                      </span>
                      <span className="text-amber-400 text-xs font-mono font-bold">
                        ${Number(initialBalance || 0).toLocaleString()}
                      </span>
                    </label>
                    
                    {/* Tezkor tugmalar (Real va Prop uchun mos) */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(accountType === 'real' ? [500, 1000, 2500, 5000, 10000, 25000, 50000] : [25000, 50000, 100000, 150000, 200000]).map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setInitialBalance(amt)}
                          className={`flex-1 min-w-[55px] py-1 text-[11px] font-mono rounded-lg border transition ${
                            initialBalance === amt
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          ${amt >= 1000 ? `${amt / 1000}k` : amt}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        required
                        min={1}
                        step="any"
                        placeholder="Balansni qo‘lda kiriting (masalan: 1000, 2500, 500...)"
                        value={initialBalance || ''}
                        onChange={(e) => setInitialBalance(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      💡 Istalgan summani qo‘lda yozishingiz mumkin (masalan: 500, 750, 1200, 10000 va hokazo).
                    </p>
                  </div>

                  {/* Drawdown / Xavf Chegarasi ($) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Maksimal Risk / Drawdown ($)</span>
                      </span>
                      <span className="text-[11px] font-mono text-rose-400">
                        -${trailingDrawdown}
                      </span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={trailingDrawdown}
                      onChange={(e) => setTrailingDrawdown(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Kunlik Loss Limit ($) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Kunlik Xavf Limiti ($)</span>
                      <span className="text-[11px] font-mono text-amber-400">
                        -${dailyLossLimit}
                      </span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={dailyLossLimit}
                      onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                </div>

                {/* Izoh */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Qo‘shimcha Izoh / Eslatma
                  </label>
                  <input
                    type="text"
                    placeholder="masalan: Oylik maqsad 10%, 1 kontrakt bilan ishlash..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-lg ${
                      accountType === 'real'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                    }`}
                  >
                    <Check className="w-4 h-4" /> Hisobni Saqlash
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Har bir hisob (Real, Prop yoki Backtest) o‘zining mustaqil grafigi va P&L kalendariga ega</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
};
