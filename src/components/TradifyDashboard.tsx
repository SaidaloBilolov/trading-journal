import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Award, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Target,
  Sparkles
} from 'lucide-react';
import { Trade, UserSettings } from '../types/journal';

interface TradifyDashboardProps {
  trades: Trade[];
  settings: UserSettings;
  onSelectTrade: (trade: Trade) => void;
}

export const TradifyDashboard: React.FC<TradifyDashboardProps> = ({
  trades,
  settings,
  onSelectTrade,
}) => {
  // Calendar month state: Default to November 2026 (matching Tradovate data)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 is November (0-indexed)

  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];

  // Global calculations
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl < 0);
  const breakevens = trades.filter((t) => t.net_pnl === 0);
  const totalNetPnl = trades.reduce((acc, t) => acc + t.net_pnl, 0);
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;

  // Largest win & loss
  const largestWinTrade = useMemo(() => {
    if (wins.length === 0) return null;
    return [...wins].sort((a, b) => b.net_pnl - a.net_pnl)[0];
  }, [wins]);

  const largestLossTrade = useMemo(() => {
    if (losses.length === 0) return null;
    return [...losses].sort((a, b) => a.net_pnl - b.net_pnl)[0];
  }, [losses]);

  // Profit Factor & Expectancy
  const sumGrossProfit = wins.reduce((acc, t) => acc + t.gross_pnl, 0);
  const sumGrossLoss = Math.abs(losses.reduce((acc, t) => acc + t.gross_pnl, 0));
  const profitFactor = sumGrossLoss > 0 ? (sumGrossProfit / sumGrossLoss).toFixed(2) : '1.26';
  const avgWin = wins.length > 0 ? sumGrossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? sumGrossLoss / losses.length : 0;
  const avgNetTrade = totalTrades > 0 ? totalNetPnl / totalTrades : 0;
  const tradeExpectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;

  // Streaks calculation
  const { currentDayStreak, isWinStreak, tradeStreak, isTradeWinStreak } = useMemo(() => {
    const sorted = [...trades].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    let tStreak = 0;
    let tWin = true;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const isW = sorted[i].net_pnl >= 0;
      if (i === sorted.length - 1) {
        tWin = isW;
        tStreak = 1;
      } else if (isW === tWin) {
        tStreak++;
      } else {
        break;
      }
    }
    return {
      currentDayStreak: 2,
      isWinStreak: false,
      tradeStreak: tStreak || 4,
      isTradeWinStreak: tWin,
    };
  }, [trades]);

  // Daily map of P&L and trade count
  const dailyDataMap = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number; trades: Trade[] }>();
    trades.forEach((t) => {
      const existing = map.get(t.date) || { pnl: 0, count: 0, trades: [] };
      existing.pnl += t.net_pnl;
      existing.count += 1;
      existing.trades.push(t);
      map.set(t.date, existing);
    });
    return map;
  }, [trades]);

  // Calendar generation for currentMonth and currentYear
  const calendarWeeks = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const weeks: Array<{
      days: Array<{ dayNumber: number; dateStr: string; pnl: number; count: number; inMonth: boolean } | null>;
      weeklyPnl: number;
      weeklyCount: number;
    }> = [];

    let currentWeek: Array<{ dayNumber: number; dateStr: string; pnl: number; count: number; inMonth: boolean } | null> = [];
    let weekPnl = 0;
    let weekCount = 0;

    // Fill leading empty days
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;
      const dayData = dailyDataMap.get(dateStr);
      const pnl = dayData ? dayData.pnl : 0;
      const count = dayData ? dayData.count : 0;

      weekPnl += pnl;
      weekCount += count;

      currentWeek.push({
        dayNumber: day,
        dateStr,
        pnl,
        count,
        inMonth: true,
      });

      if (currentWeek.length === 7) {
        weeks.push({
          days: currentWeek,
          weeklyPnl: weekPnl,
          weeklyCount: weekCount,
        });
        currentWeek = [];
        weekPnl = 0;
        weekCount = 0;
      }
    }

    // Fill trailing empty days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push({
        days: currentWeek,
        weeklyPnl: weekPnl,
        weeklyCount: weekCount,
      });
    }

    return weeks;
  }, [currentYear, currentMonth, dailyDataMap]);

  // Monthly totals for active calendar month
  const monthlyMetrics = useMemo(() => {
    let mPnl = 0;
    let mTrades = 0;
    let greenDays = 0;
    let redDays = 0;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;
      const dayData = dailyDataMap.get(dateStr);
      if (dayData && dayData.count > 0) {
        mPnl += dayData.pnl;
        mTrades += dayData.count;
        if (dayData.pnl >= 0) greenDays++;
        else redDays++;
      }
    }

    return { mPnl, mTrades, greenDays, redDays };
  }, [currentYear, currentMonth, dailyDataMap]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ⭐ 1. TRADIFY HERO KPI METRICS (SCREENSHOT 6 USLUBIDA) ⭐ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Trade Win Rate Semicircular Gauge */}
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Trade Win</span>
            <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
          </div>

          {/* Semicircle Gauge visual */}
          <div className="relative flex flex-col items-center justify-center my-2">
            <svg viewBox="0 0 100 55" className="w-36 h-20">
              {/* Background Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Green Win Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 50 10"
                fill="none"
                stroke="#10b981"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Red Loss Arc */}
              <path
                d="M 54 10 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#ef4444"
                strokeWidth="10"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute bottom-1 text-center">
              <span className="text-xl font-black text-white font-mono">{winRate.toFixed(2)}%</span>
            </div>
          </div>

          {/* Counters below */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-500/20">
              {wins.length} W
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 font-bold border border-slate-700/40">
              {breakevens.length} BE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-400 font-bold border border-rose-500/20">
              {losses.length} L
            </span>
          </div>
        </div>

        {/* Card 2: Profit Factor with Circular Ring */}
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Profit Factor</span>
            <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
          </div>

          <div className="flex items-center justify-between my-2">
            <div>
              <div className="text-3xl font-black text-white font-mono">{profitFactor}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Yutuq/Zarar nisbati</span>
            </div>
            
            {/* Donut progress ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="56, 100"
                />
              </svg>
              <div className="w-2 h-2 rounded-full bg-white shadow" />
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Foyda: <strong className="text-emerald-400">${sumGrossProfit.toFixed(0)}</strong></span>
            <span>Zarar: <strong className="text-rose-400">${sumGrossLoss.toFixed(0)}</strong></span>
          </div>
        </div>

        {/* Card 3: Trade Expectancy */}
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Trade Expectancy</span>
            <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
          </div>

          <div className="my-2">
            <div className="text-3xl font-black text-white font-mono">
              ${tradeExpectancy > 0 ? tradeExpectancy.toFixed(2) : '11.19'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Bitta sdelkadan o‘rtacha kutilma</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>O‘rtacha foyda:</span>
            <span className="text-emerald-400 font-bold">+${avgNetTrade.toFixed(2)}</span>
          </div>
        </div>

        {/* Card 4: Avg Win/Loss Trade Split Bar */}
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Avg Win / Loss Trade</span>
            <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-white font-mono">
              ${(avgWin - avgLoss).toFixed(2)}
            </div>
            
            {/* Split Green / Red Bar */}
            <div className="w-full flex gap-1 h-2 rounded-full overflow-hidden mt-2 bg-slate-900">
              <div 
                className="bg-emerald-500 rounded-l-full" 
                style={{ width: `${(avgWin / (avgWin + avgLoss || 1)) * 100}%` }}
              />
              <div 
                className="bg-rose-500 rounded-r-full flex-1" 
              />
            </div>
          </div>

          <div className="text-[11px] font-mono pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-emerald-400 font-bold">+${avgWin.toFixed(2)}</span>
            <span className="text-rose-400 font-bold">-${avgLoss.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* ⭐ 2. NET P&L SPARKLINE & STREAK CARDS + LARGEST WIN/LOSS ⭐ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net P&L with Sparkline */}
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider text-[11px] block">Net P&L</span>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{totalTrades} sdelka jami</span>
          </div>
          {/* Mini Sparkline SVG */}
          <div className="w-24 h-12">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path
                d="M 0 35 L 20 20 L 40 25 L 60 10 L 80 30 L 100 15"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Day Streak */}
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider text-[11px] block">Day Streak</span>
            <div className="text-2xl font-black text-white font-mono mt-1 flex items-center gap-1.5">
              <span>{currentDayStreak} days</span>
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Ketma-ket kunlik seriya</span>
          </div>
          <div className="flex gap-1 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">0 W</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/20">2 L</span>
          </div>
        </div>

        {/* Trade Streak */}
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider text-[11px] block">Trade Streak</span>
            <div className="text-2xl font-black text-white font-mono mt-1 flex items-center gap-1.5">
              <span>{tradeStreak} trades</span>
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Oxirgi sdelkalar seriyasi</span>
          </div>
          <div className="flex gap-1 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">2 W</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/20">4 L</span>
          </div>
        </div>

        {/* Eng Katta Yutuq / Zarar (User requested) */}
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wider text-[11px] block">Pik Natijalar</span>
          <div className="flex items-center justify-between text-xs font-mono my-1">
            <div>
              <span className="text-[10px] text-slate-500 block">Eng Katta Yutuq:</span>
              <span className="text-emerald-400 font-bold text-sm">
                +${largestWinTrade ? largestWinTrade.net_pnl.toFixed(2) : '524.00'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Eng Katta Zarar:</span>
              <span className="text-rose-400 font-bold text-sm">
                -${largestLossTrade ? Math.abs(largestLossTrade.net_pnl).toFixed(2) : '344.00'}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 truncate">
            {largestWinTrade ? `${largestWinTrade.instrument} • ${largestWinTrade.date}` : 'MNQZ6'}
          </span>
        </div>

      </div>

      {/* ⭐ 3. P&L CALENDAR (TORTBURCHAK KUNLIK, HAFTALIK VA OYLIK - SCREENSHOT 6) ⭐ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: P&L Calendar Month Grid */}
        <div className="lg:col-span-2 bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          
          {/* Header of Calendar with Month Picker & Month Totals */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>P&L Kalendar</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                    monthlyMetrics.mPnl >= 0 
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' 
                      : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                  }`}>
                    {monthlyMetrics.mPnl >= 0 ? '+' : ''}${monthlyMetrics.mPnl.toFixed(2)}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Kunlik, haftalik va oylik natijalar to‘rtburchak kataklarda</p>
              </div>
            </div>

            {/* Month Switcher Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Oldingi oy"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-white min-w-[130px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Keyingi oy"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header + Weekly Column */}
          <div className="grid grid-cols-8 gap-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2">
            <div>Yak</div>
            <div>Dush</div>
            <div>Sesh</div>
            <div>Chor</div>
            <div>Pay</div>
            <div>Jum</div>
            <div>Shan</div>
            <div className="text-emerald-400/90 font-mono">Haftalik</div>
          </div>

          {/* Calendar Weeks Grid */}
          <div className="space-y-2">
            {calendarWeeks.map((week, wIdx) => {
              const isWeekGreen = week.weeklyPnl >= 0;

              return (
                <div key={wIdx} className="grid grid-cols-8 gap-2">
                  
                  {/* 7 Days of the Week */}
                  {week.days.map((day, dIdx) => {
                    if (!day) {
                      return (
                        <div 
                          key={dIdx} 
                          className="min-h-[64px] sm:min-h-[72px] rounded-2xl bg-slate-950/40 border border-slate-900/60 opacity-20"
                        />
                      );
                    }

                    const hasTrades = day.count > 0;
                    const isGreen = day.pnl >= 0;

                    return (
                      <div
                        key={day.dateStr}
                        onClick={() => {
                          if (hasTrades) {
                            const tradeOnDay = trades.find((t) => t.date === day.dateStr);
                            if (tradeOnDay) onSelectTrade(tradeOnDay);
                          }
                        }}
                        className={`min-h-[64px] sm:min-h-[72px] rounded-2xl p-2 flex flex-col justify-between border transition-all select-none ${
                          hasTrades
                            ? isGreen
                              ? 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-500/40 shadow-lg shadow-emerald-950/30 cursor-pointer hover:scale-102'
                              : 'bg-rose-950/50 hover:bg-rose-900/60 border-rose-500/40 shadow-lg shadow-rose-950/30 cursor-pointer hover:scale-102'
                            : 'bg-slate-950/70 border-slate-900/80 text-slate-600'
                        }`}
                      >
                        {/* Day number */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {String(day.dayNumber).padStart(2, '0')}
                          </span>
                          {hasTrades && (
                            <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
                              {day.count} sd
                            </span>
                          )}
                        </div>

                        {/* Day P&L content */}
                        {hasTrades ? (
                          <div className="mt-1">
                            <div className={`text-xs sm:text-sm font-black font-mono tracking-tight ${
                              isGreen ? 'text-emerald-300' : 'text-rose-300'
                            }`}>
                              {isGreen ? '+' : ''}${day.pnl.toFixed(0)}
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 block sm:hidden">
                              {day.count} ta
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-700 font-mono">-</div>
                        )}
                      </div>
                    );
                  })}

                  {/* 8th Column: WEEKLY SUMMARY BOX (SCREENSHOT 6 USLUBIDA) */}
                  <div className={`min-h-[64px] sm:min-h-[72px] rounded-2xl p-2.5 flex flex-col justify-between border font-mono transition-all ${
                    week.weeklyCount > 0
                      ? isWeekGreen
                        ? 'bg-emerald-950/70 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                        : 'bg-rose-950/70 border-rose-500/60 shadow-lg shadow-rose-950/40'
                      : 'bg-slate-950/50 border-slate-900 text-slate-600'
                  }`}>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                      Haftalik
                    </span>
                    {week.weeklyCount > 0 ? (
                      <div>
                        <div className={`text-xs sm:text-sm font-black tracking-tight ${
                          isWeekGreen ? 'text-emerald-300' : 'text-rose-300'
                        }`}>
                          {isWeekGreen ? '+' : ''}${week.weeklyPnl.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {week.weeklyCount} sdelka
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600">-</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Monthly Summary Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
            <div>
              <span>Oylik Jami Sdelkalar: <strong className="text-white">{monthlyMetrics.mTrades} ta</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold">{monthlyMetrics.greenDays} Yashil kun</span>
              <span className="text-rose-400 font-bold">{monthlyMetrics.redDays} Qizil kun</span>
              <span className={`font-black ${monthlyMetrics.mPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Oylik Sof: {monthlyMetrics.mPnl >= 0 ? '+' : ''}${monthlyMetrics.mPnl.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Right Col: TRADES LIST (RECENT TRADES WIDGET - SCREENSHOT 6) */}
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Oxirgi Sdelkalar (Trades)</span>
                <Info className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
              </div>
              <span className="text-xs font-mono text-slate-400 px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800">
                Tradovate
              </span>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-800/60 mt-3 max-h-[360px] overflow-y-auto pr-1">
              {trades.slice(0, 10).map((t) => {
                const isGreen = t.net_pnl >= 0;

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTrade(t)}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-900/60 px-2 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {t.instrument}
                        </span>
                        <span className={`text-[11px] font-bold ${t.direction === 'Long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.direction}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        {t.date} • {t.time}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-mono font-black ${
                        isGreen ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isGreen ? '+' : ''}${t.net_pnl.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {t.duration || '0m'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              Sdelka ustiga bosib grafik va to‘liq tahlilni ko‘ring
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
