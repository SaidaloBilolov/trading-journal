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
  FlaskConical
} from 'lucide-react';
import { PropAccount, Trade } from '../types/journal';

interface PropAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: PropAccount[];
  activeAccountId: string;
  onSelectAccount: (id: string) => void;
  onAddAccount: (account: PropAccount) => void;
  onDeleteAccount: (id: string) => void;
  allTrades: Trade[];
}

const FIRM_OPTIONS = [
  'Backtest',
  'Tradify',
  'Apex Trader Funding',
  'Topstep',
  'FundedNext',
  'MyFundedFutures (MFFU)',
  'Alpha Capital Group',
  'TradeDay',
  'Shaxsiy / Real hisob',
  'Boshqa'
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
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [marketType, setMarketType] = useState<'futures' | 'forex' | 'backtest'>('futures');
  const [drawdownType, setDrawdownType] = useState<'trailing' | 'static'>('trailing');
  const [name, setName] = useState('');
  const [firm, setFirm] = useState('Tradify');
  const [initialBalance, setInitialBalance] = useState<number>(50000);
  const [trailingDrawdown, setTrailingDrawdown] = useState<number>(2000);
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(1000);
  const [maxContracts, setMaxContracts] = useState<number>(5);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleOpenAddFutures = () => {
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

  const handleOpenAddBacktest = () => {
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

    const newAcc: PropAccount = {
      id: `acc-${Date.now()}`,
      name: name.trim(),
      firm: firm.trim(),
      market_type: marketType,
      drawdown_type: drawdownType,
      initial_balance: Number(initialBalance) || 50000,
      trailing_drawdown_amount: Number(trailingDrawdown) || (drawdownType === 'static' ? 5000 : 2000),
      daily_loss_limit: Number(dailyLossLimit) || 1000,
      max_contracts: Number(maxContracts) || 5,
      created_at: new Date().toISOString(),
      is_active: false,
      description: description.trim(),
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
                Prop Hisoblar Menejeri
                <span className="text-xs bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {accounts.length} ta hisob
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tradify, Apex, Topstep va boshqa hisoblaringizni alohida kuzating va yangi prop hisob qo‘shing
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
          
          {/* Active Account Switcher Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-cyan-400" /> Mavjud Prop Hisoblar
              </span>
              {!showAddForm && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAddFutures}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
                    title="Futures prop hisobi qo‘shish (Trailing Drawdown)"
                  >
                    <span>⚡ + Futures Prop (Trailing DD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddForex}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                    title="Forex prop hisobi qo‘shish (Statik Drawdown)"
                  >
                    <span>🌐 + FX Prop (Statik DD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddBacktest}
                    className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 border border-purple-500/50 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    title="Yangi Backtest Notion jurnali ochish"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                    <span>+ Yangi Backtest</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((acc) => {
                const isActive = acc.id === activeAccountId;
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
                        ? acc.firm === 'Backtest'
                          ? 'bg-purple-950/30 border-purple-500/70 shadow-lg shadow-purple-950/40'
                          : 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        acc.firm === 'Backtest'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Faol
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-1">
                      {acc.firm === 'Backtest' ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-700/60 font-mono font-bold flex items-center gap-1">
                          <FlaskConical className="w-3 h-3 text-purple-400" /> Backtest Notion Jurnali
                        </span>
                      ) : acc.drawdown_type === 'static' ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono font-bold flex items-center gap-1">
                          <span>🌐 FX Prop (Statik DD)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono font-bold flex items-center gap-1">
                          <span>⚡ Futures (Trailing DD)</span>
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
                      {acc.drawdown_type === 'static' ? (
                        <span className="text-emerald-400 font-mono font-semibold" title="Statik: Sliv chegarasi ko‘tarilmaydi">
                          Statik DD: -${acc.trailing_drawdown_amount} (qat’iy)
                        </span>
                      ) : (
                        <span className="text-rose-400 font-mono" title="Trailing: Balans bilan birga ko‘tariladi">
                          Trailing DD: -${acc.trailing_drawdown_amount} (ko‘tariladi)
                        </span>
                      )}
                    </div>

                    {/* Delete action: Only Backtest accounts can be deleted, NOT real prop accounts! */}
                    {acc.firm === 'Backtest' || acc.id.includes('backtest') || acc.name.toLowerCase().includes('backtest') ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`"${acc.name}" backtest jurnali va unga tegishli barcha sdelkalarni o‘chirmoqchimisiz?`)) {
                            onDeleteAccount(acc.id);
                          }
                        }}
                        className="mt-3 w-full py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 hover:text-rose-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-rose-500/40 shadow-sm"
                        title="Backtest jurnalini o‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Backtestni o‘chirish</span>
                      </button>
                    ) : (
                      <div className="mt-3 w-full py-1.5 rounded-lg bg-slate-900/70 text-slate-400 text-[11px] font-mono flex items-center justify-center gap-1.5 border border-slate-800/80">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Prop Hisob (Himoyalangan)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Prop Account Form */}
          {showAddForm && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" /> Yangi Prop Hisob Ma’lumotlari
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
                {/* 1. Bozor turi va Drawdown qoidasi tanlash (Futures vs Forex) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMarketType('futures');
                      setDrawdownType('trailing');
                      setTrailingDrawdown(2000);
                      if (firm === 'FTMO') setFirm('Tradify');
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      marketType === 'futures'
                        ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-cyan-400 mb-1">
                      <span>⚡ Futures Prop</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                        Trailing DD (Ko‘tariladi)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Hisob foydasi oshgan sari sliv chegarasi ham pikdan 2K pastda ko‘tarilib boradi (Tradify, Apex, Topstep).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMarketType('forex');
                      setDrawdownType('static');
                      setTrailingDrawdown(5000);
                      if (firm === 'Apex Trader Funding' || firm === 'Tradify') setFirm('FTMO');
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      marketType === 'forex'
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-1">
                      <span>🌐 Forex / FX Prop</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                        Statik DD (Ko‘tarilmaydi)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Drawdown ko‘tarilmaydi! Boshlang‘ich balansdan (masalan $50k dan 5K = $45 000) qat’iy turadi (FTMO, FundedNext).
                    </p>
                  </button>
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
                      placeholder={drawdownType === 'static' ? 'masalan: FTMO 50K FX' : 'masalan: Apex 50K PA yoki Tradify'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Prop Firma */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Prop Firma / Platforma
                    </label>
                    <select
                      value={firm}
                      onChange={(e) => setFirm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      {FIRM_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Boshlang'ich Balans */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Boshlang‘ich Balans ($)</span>
                      <span className="text-slate-400 text-[11px] font-mono">${initialBalance.toLocaleString()}</span>
                    </label>
                    <div className="flex gap-1.5 mb-2">
                      {[25000, 50000, 100000, 200000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setInitialBalance(amt)}
                          className={`flex-1 py-1 text-[11px] font-mono rounded-lg border transition ${
                            initialBalance === amt
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          ${amt / 1000}k
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      required
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Drawdown ($) (Static or Trailing) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>{drawdownType === 'static' ? 'Statik Drawdown ($)' : 'Trailing Drawdown ($)'}</span>
                      </span>
                      <span className={`text-[11px] font-mono ${drawdownType === 'static' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {drawdownType === 'static' 
                          ? `Sliv: $${(initialBalance - trailingDrawdown).toLocaleString()} (ko‘tarilmaydi)` 
                          : `Pikdan -$${trailingDrawdown} (ko‘tariladi)`}
                      </span>
                    </label>
                    <div className="flex gap-1.5 mb-2">
                      {(drawdownType === 'static' ? [2500, 5000, 10000, 20000] : [1500, 2000, 2500, 3000]).map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTrailingDrawdown(amt)}
                          className={`flex-1 py-1 text-[11px] font-mono rounded-lg border transition ${
                            trailingDrawdown === amt
                              ? drawdownType === 'static'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                : 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      required
                      value={trailingDrawdown}
                      onChange={(e) => setTrailingDrawdown(Number(e.target.value))}
                      className={`w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none ${
                        drawdownType === 'static' ? 'focus:border-emerald-500' : 'focus:border-rose-500'
                      }`}
                    />
                  </div>

                  {/* Kunlik Zarar Limiti */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Kunlik Zarar Limiti ($)
                    </label>
                    <input
                      type="number"
                      value={dailyLossLimit}
                      onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Maksimal Mikro Kontraktlar */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Maksimal Mikro Kontraktlar
                    </label>
                    <input
                      type="number"
                      value={maxContracts}
                      onChange={(e) => setMaxContracts(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
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
                    placeholder="masalan: Evaluation bosqichi, 30 kunlik sinov..."
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
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
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
          <span>Har bir prop hisob o‘zining mustaqil grafigi va P&L kalendariga ega</span>
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
