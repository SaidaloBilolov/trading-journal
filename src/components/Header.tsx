import React from 'react';
import { 
  ShieldCheck, 
  Table, 
  BarChart3, 
  Settings, 
  CloudCheck, 
  CloudOff,
  Flame,
  Calendar,
  Building2,
  ChevronDown,
  FlaskConical,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserSettings, PropAccount, AppUser } from '../types/journal';

interface HeaderProps {
  activeTab: 'checklist' | 'notion' | 'tradify' | 'analytics';
  setActiveTab: (tab: 'checklist' | 'notion' | 'tradify' | 'analytics') => void;
  currentBalance: number;
  totalNetPnl: number;
  peakBalance?: number;
  settings: UserSettings;
  isSupabaseConnected: boolean;
  activeAccount?: PropAccount;
  accounts: PropAccount[];
  currentUser?: AppUser | null;
  onSelectAccount?: (id: string) => void;
  onOpenPropModal: () => void;
  onOpenNewTrade: () => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  onLogout?: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentBalance,
  totalNetPnl,
  peakBalance,
  settings,
  isSupabaseConnected,
  activeAccount,
  accounts,
  currentUser,
  onSelectAccount,
  onOpenPropModal,
  onOpenNewTrade,
  onOpenSettings,
  onOpenLogin,
  onLogout,
  onExportExcel,
  onExportPDF,
}) => {
  const isStaticDD = activeAccount?.drawdown_type === 'static';
  const drawdownAmount = activeAccount?.trailing_drawdown_amount || (isStaticDD ? 5000 : 2000);
  const initialBalance = activeAccount?.initial_balance || settings.initial_balance || 50000;
  const effectivePeak = peakBalance || Math.max(initialBalance, currentBalance);
  // Statik (Forex) bo'lsa sliv ko'tarilmaydi, initialBalance - drawdownAmount da qat'iy turadi.
  // Trailing (Futures) bo'lsa pik bilan birga ko'tariladi.
  const drawdownLimit = isStaticDD 
    ? (initialBalance - drawdownAmount) 
    : (effectivePeak - drawdownAmount);
  const remainingBuffer = Math.max(0, currentBalance - drawdownLimit);
  const bufferPercent = Math.min(100, (remainingBuffer / drawdownAmount) * 100);

  // Buffer warning level
  const isBufferCritical = remainingBuffer <= 300;
  const isBufferWarning = remainingBuffer <= 600;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    Trading Journal By Said <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">PRO</span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Professional Savdo Jurnali va Intizom Nazorati
                </p>
              </div>
            </div>

            {/* Mobile quick actions */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title="Sozlamalar"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Balance & Drawdown Buffer Monitor */}
          <div className="flex items-center gap-3 overflow-x-auto py-1">
            {/* Active User Profile Pill with Logout */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition shadow-sm text-left ${
                  currentUser?.username === 'shaxzod'
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                  currentUser?.username === 'shaxzod'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {currentUser?.avatar || 'SB'}
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold leading-none">
                    Treydir
                  </span>
                  <span className="text-xs font-bold text-white block leading-tight mt-0.5">
                    {currentUser?.name || "Saida'lo (Said)"}
                  </span>
                </div>
              </div>

              {/* Explicit Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition"
                  title="Hisobdan chiqish (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Account Switcher Pill (Prop / Real / Backtest) */}
            <button
              onClick={onOpenPropModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition shadow-sm text-left shrink-0 ${
                activeAccount?.account_type === 'real' || activeAccount?.name?.toLowerCase().includes('real')
                  ? 'bg-amber-950/30 hover:bg-amber-900/50 border-amber-500/50 text-amber-300'
                  : activeAccount?.firm === 'Backtest' || activeAccount?.account_type === 'backtest'
                  ? 'bg-purple-950/30 hover:bg-purple-900/50 border-purple-500/50 text-purple-300'
                  : 'bg-cyan-950/30 hover:bg-cyan-900/50 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
              }`}
              title="Hisobni tanlash yoki yangi qo‘shish"
            >
              <div className={`p-1 rounded-lg ${
                activeAccount?.account_type === 'real' || activeAccount?.name?.toLowerCase().includes('real')
                  ? 'bg-amber-500/10 text-amber-400'
                  : activeAccount?.firm === 'Backtest' || activeAccount?.account_type === 'backtest'
                  ? 'bg-purple-500/10 text-purple-400'
                  : 'bg-cyan-500/10 text-cyan-400'
              }`}>
                {activeAccount?.account_type === 'real' || activeAccount?.name?.toLowerCase().includes('real') ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : activeAccount?.firm === 'Backtest' || activeAccount?.account_type === 'backtest' ? (
                  <FlaskConical className="w-3.5 h-3.5" />
                ) : (
                  <Building2 className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <span className={`text-[9px] uppercase tracking-wider block font-bold leading-none ${
                  activeAccount?.account_type === 'real' || activeAccount?.name?.toLowerCase().includes('real')
                    ? 'text-amber-400'
                    : activeAccount?.firm === 'Backtest' || activeAccount?.account_type === 'backtest'
                    ? 'text-purple-400'
                    : 'text-cyan-400/80'
                }`}>
                  {activeAccount?.account_type === 'real' || activeAccount?.name?.toLowerCase().includes('real')
                    ? 'Real Hisob'
                    : activeAccount?.firm === 'Backtest' || activeAccount?.account_type === 'backtest'
                    ? 'Backtest'
                    : 'Prop Hisob'}
                </span>
                <span className="text-xs font-bold font-mono text-white flex items-center gap-1 leading-tight mt-0.5">
                  {activeAccount?.name || 'Tradify 50K'}
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </span>
              </div>
            </button>

            {/* Joriy Balans Card */}
            <div className="bg-[#0b101b] border border-slate-800/80 rounded-2xl px-3.5 py-1.5 min-w-[150px] shadow-inner">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                Joriy Balans
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-base font-bold text-white font-mono tracking-tight">
                  ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[11px] font-semibold font-mono ${totalNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Qolgan Xavfsiz Bufer Card (Trailing -2K) */}
            <div className={`border rounded-2xl px-3.5 py-1.5 min-w-[210px] transition-all shadow-inner ${
              isBufferCritical 
                ? 'bg-rose-950/40 border-rose-600/50 text-rose-300' 
                : isBufferWarning
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-[#0b101b] border-slate-800/80 text-emerald-400'
            }`}>
              <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">
                <span className="flex items-center gap-1 shrink-0">
                  {isBufferCritical && <Flame className="w-3 h-3 text-rose-500 animate-pulse" />}
                  Qolgan Bufer
                </span>
                <span className="font-mono text-slate-500 text-[10px] shrink-0 font-medium">
                  Sliv: ${drawdownLimit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {isStaticDD ? '(Statik)' : ''}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base font-bold font-mono tracking-tight">
                  ${remainingBuffer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">erkin risk</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isBufferCritical ? 'bg-rose-500' : isBufferWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(5, Math.min(100, bufferPercent))}%` }}
                />
              </div>
            </div>

            {/* Supabase Connection Status Pill */}
            <button
              onClick={onOpenSettings}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                isSupabaseConnected
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-[#0b101b] border-slate-800 text-slate-400 hover:bg-slate-800/80'
              }`}
              title="Supabase ulanishi va sozlamalar"
            >
              {isSupabaseConnected ? (
                <>
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Supabase Ulandi</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mahalliy Rejim (Demo)</span>
                </>
              )}
            </button>
          </div>

          {/* Settings Action Button */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all shrink-0"
              title="Sozlamalar va Supabase"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs in Uzbek */}
        <div className="flex space-x-1 border-t border-slate-900 pt-1 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tradify')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'tradify'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Kalendar & Natijalar (P&L)</span>
          </button>

          <button
            onClick={() => setActiveTab('notion')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'notion'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Notion Jurnali (To‘liq Jadval)</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'checklist'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Nazorat & Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistika & 2K Drawdown</span>
          </button>

          {/* Dedicated Backtest Notion Tab */}
          <button
            onClick={() => {
              const backtestAcc = accounts.find((a) => a.firm === 'Backtest' || a.id === 'acc-backtest');
              if (backtestAcc && onSelectAccount) {
                onSelectAccount(backtestAcc.id);
              }
              setActiveTab('notion');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeAccount?.firm === 'Backtest' && activeTab === 'notion'
                ? 'bg-purple-600/25 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950 ring-1 ring-purple-500/50'
                : 'text-purple-400 border-purple-800/50 hover:bg-purple-950/40 hover:border-purple-600'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-purple-400" />
            <span>🔬 Backtest Jurnali (Notion)</span>
          </button>
        </div>

      </div>
    </header>
  );
};
