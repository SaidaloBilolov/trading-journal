import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Percent, 
  Zap,
  Info,
  Flame,
  ArrowDownCircle,
  Award,
  Calendar,
  Layers
} from 'lucide-react';
import { Trade, UserSettings } from '../types/journal';

interface AnalyticsChartsProps {
  trades: Trade[];
  settings: UserSettings;
  initialBalance?: number;
  trailingDrawdown?: number;
  accountName?: string;
  drawdownType?: 'trailing' | 'static';
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ 
  trades, 
  settings,
  initialBalance,
  trailingDrawdown = 2000,
  accountName = 'Tradify 50K',
  drawdownType = 'trailing'
}) => {
  // View mode for Equity Curve: 'daily' (Default - user requested) vs 'trades' (Micro)
  const [viewMode, setViewMode] = useState<'daily' | 'trades'>('daily');
  const [hoveredEquityPoint, setHoveredEquityPoint] = useState<any | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const initBal = initialBalance || settings.initial_balance || 50000;
  const trailingAmount = trailingDrawdown || 2000;
  const isStaticDD = drawdownType === 'static';

  // Chronologically sorted trades for proper timeline
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
    });
  }, [trades]);

  // Aggregate Daily P&L for Bar Chart and Daily Equity Curve
  const dailyPnL = useMemo(() => {
    const map = new Map<string, { date: string; pnl: number; trades: number; wins: number; losses: number }>();
    
    sortedTrades.forEach((t) => {
      const existing = map.get(t.date) || { date: t.date, pnl: 0, trades: 0, wins: 0, losses: 0 };
      existing.pnl += t.net_pnl;
      existing.trades += 1;
      if (t.net_pnl > 0) existing.wins += 1;
      else if (t.net_pnl < 0) existing.losses += 1;
      map.set(t.date, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [sortedTrades]);

  // 1. Daily End-of-Day (EOD) Equity Points (Clean, Non-crowded)
  const dailyEquityPoints = useMemo(() => {
    let runningBalance = initBal;
    let peakBalance = initBal;

    const points = [
      {
        index: 0,
        tradeId: 'start',
        date: 'Boshlanish',
        time: '',
        label: 'Boshlang‘ich Depozit',
        netPnl: 0,
        tradesCount: 0,
        balance: runningBalance,
        peakBalance: peakBalance,
        drawdownLimit: isStaticDD ? (initBal - trailingAmount) : (peakBalance - trailingAmount),
        buffer: trailingAmount,
      },
    ];

    dailyPnL.forEach((d, i) => {
      runningBalance += d.pnl;
      if (runningBalance > peakBalance) {
        peakBalance = runningBalance;
      }
      const ddLimit = isStaticDD ? (initBal - trailingAmount) : (peakBalance - trailingAmount);
      points.push({
        index: i + 1,
        tradeId: `day-${d.date}`,
        date: d.date,
        time: 'Kun oxiridagi yakun (EOD)',
        label: `${d.date} (${d.pnl >= 0 ? '+' : ''}$${d.pnl.toFixed(2)})`,
        netPnl: d.pnl,
        tradesCount: d.trades,
        balance: runningBalance,
        peakBalance: peakBalance,
        drawdownLimit: ddLimit,
        buffer: Math.max(0, runningBalance - ddLimit),
      });
    });

    return points;
  }, [dailyPnL, initBal, trailingAmount, isStaticDD]);

  // 2. Micro Trade-by-trade Equity Points
  const tradeEquityPoints = useMemo(() => {
    let runningBalance = initBal;
    let peakBalance = initBal;

    const points = [
      {
        index: 0,
        tradeId: 'start',
        date: 'Boshlanish',
        time: '',
        label: 'Boshlang‘ich Depozit',
        netPnl: 0,
        tradesCount: 0,
        balance: runningBalance,
        peakBalance: peakBalance,
        drawdownLimit: isStaticDD ? (initBal - trailingAmount) : (peakBalance - trailingAmount),
        buffer: trailingAmount,
      },
    ];

    sortedTrades.forEach((t, i) => {
      runningBalance += t.net_pnl;
      if (runningBalance > peakBalance) {
        peakBalance = runningBalance;
      }
      const ddLimit = isStaticDD ? (initBal - trailingAmount) : (peakBalance - trailingAmount);
      points.push({
        index: i + 1,
        tradeId: t.id,
        date: t.date,
        time: t.time,
        label: `${t.instrument} (${t.net_pnl >= 0 ? '+' : ''}$${t.net_pnl.toFixed(2)})`,
        netPnl: t.net_pnl,
        tradesCount: 1,
        balance: runningBalance,
        peakBalance: peakBalance,
        drawdownLimit: ddLimit,
        buffer: Math.max(0, runningBalance - ddLimit),
      });
    });

    return points;
  }, [sortedTrades, initBal, trailingAmount]);

  // Select active points based on mode
  const activeEquityPoints = viewMode === 'daily' ? dailyEquityPoints : tradeEquityPoints;

  // Key KPI Metrics
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl < 0);
  const totalNetPnl = trades.reduce((acc, t) => acc + t.net_pnl, 0);
  const totalCommission = trades.reduce((acc, t) => acc + t.commission, 0);
  const currentBalance = initBal + totalNetPnl;

  // Trailing Drawdown Current Peak & Limit
  const currentPeakBalance = Math.max(initBal, ...activeEquityPoints.map((p) => p.balance));
  const currentTrailingDrawdownLimit = currentPeakBalance - trailingAmount;
  const currentTrailingBuffer = Math.max(0, currentBalance - currentTrailingDrawdownLimit);
  const currentDrawdownFromPeak = currentBalance - currentPeakBalance;
  const trailingBufferPercent = Math.min(100, (currentTrailingBuffer / trailingAmount) * 100);

  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : '0';

  // Discipline Breakdown (A+ vs Violations)
  const aPlusTrades = trades.filter((t) => t.discipline === 'A_PLUS');
  const aPlusWins = aPlusTrades.filter((t) => t.net_pnl > 0);
  const aPlusNetPnl = aPlusTrades.reduce((acc, t) => acc + t.net_pnl, 0);
  const aPlusWinRate = aPlusTrades.length > 0 ? ((aPlusWins.length / aPlusTrades.length) * 100).toFixed(1) : '0';

  const violationTrades = trades.filter((t) => t.discipline === 'RULE_VIOLATION');
  const violationWins = violationTrades.filter((t) => t.net_pnl > 0);
  const violationNetPnl = violationTrades.reduce((acc, t) => acc + t.net_pnl, 0);
  const violationWinRate = violationTrades.length > 0 ? ((violationWins.length / violationTrades.length) * 100).toFixed(1) : '0';

  // SVG dimensions for Equity Curve
  const minBal = Math.min(...activeEquityPoints.map((p) => p.drawdownLimit)) - 100;
  const maxBal = Math.max(...activeEquityPoints.map((p) => p.peakBalance)) + 150;
  const range = maxBal - minBal || 1;

  const svgWidth = 840;
  const svgHeight = 300;
  const padX = 60;
  const padY = 30;

  const getX = (idx: number) => {
    if (activeEquityPoints.length <= 1) return padX;
    return padX + (idx / (activeEquityPoints.length - 1)) * (svgWidth - padX * 2);
  };

  const getY = (val: number) => {
    return svgHeight - padY - ((val - minBal) / range) * (svgHeight - padY * 2);
  };

  const linePath = activeEquityPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.balance)}`)
    .join(' ');

  const trailingLinePath = activeEquityPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.drawdownLimit)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(activeEquityPoints.length - 1)} ${svgHeight - padY} L ${getX(0)} ${svgHeight - padY} Z`;

  // Daily Bar Chart Dimensions
  const maxDailyPnl = Math.max(10, ...dailyPnL.map((d) => Math.abs(d.pnl)));

  // Hovered day for Bar Chart
  const hoveredDay = hoveredBarIndex !== null ? dailyPnL[hoveredBarIndex] : null;

  return (
    <div className="space-y-6">
      
      {/* 1. Summary KPI Metric Cards in Uzbek */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Joriy Balans */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Joriy Balans</span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1">
            Boshlang‘ich: ${initBal.toLocaleString()}
          </div>
        </div>

        {/* Qolgan Trailing Bufer */}
        <div className={`border rounded-3xl p-5 shadow-xl transition-all ${
          currentTrailingBuffer < 300 
            ? 'bg-rose-950/40 border-rose-600/50 text-rose-300' 
            : currentTrailingBuffer < 600
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
            : 'bg-slate-900/90 border-slate-800 text-emerald-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Trailing Bufer
            </span>
            {currentTrailingBuffer < 300 && <Flame className="w-4 h-4 text-rose-500 animate-pulse" />}
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1">
            ${currentTrailingBuffer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1">
            Sliv: ${currentTrailingDrawdownLimit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Sof P&L */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Sof Foyda/Zarar</span>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${totalNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toFixed(2)}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1">
            {totalTrades} ta sdelka ({winRate}% WR)
          </div>
        </div>

        {/* Pikdan Drawdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Pik Balans</span>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-1">
            ${currentPeakBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1">
            Pikdan tushish: <span className={currentDrawdownFromPeak < 0 ? 'text-rose-400' : 'text-slate-400'}>${currentDrawdownFromPeak.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Trailing Drawdown Visual Bar Alert */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-2 gap-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white font-sans">
              2K Trailing Drawdown Qalqoni ({accountName})
            </span>
          </div>
          <div className="text-slate-400 font-mono">
            Pik: <strong className="text-cyan-300">${currentPeakBalance.toFixed(2)}</strong> | Chegara (Pik - 2K): <strong className="text-rose-400">${currentTrailingDrawdownLimit.toFixed(2)}</strong> | Xavfsiz bufer: <strong className={currentTrailingBuffer < 500 ? 'text-rose-400' : 'text-emerald-400'}>${currentTrailingBuffer.toFixed(2)}</strong>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              currentTrailingBuffer < 300 ? 'bg-rose-500 animate-pulse' : currentTrailingBuffer < 600 ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(5, trailingBufferPercent)}%` }}
          />
        </div>
      </div>

      {/* 2. Balans O‘sishi va Tushishi Grafigi (Equity Curve + Dynamic Trailing Line) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Balans O‘sishi va Trailing Drawdown Grafigi (Equity Curve)</span>
            </h3>
            <p className="text-xs text-slate-400">
              {viewMode === 'daily' 
                ? '⭐ Kunlik yakuniy balans (EOD) o‘sishi va tushishi — ortiqcha maydalashmagan toza ko‘rinish' 
                : 'Har bir sdelka bo‘yicha batafsil mikrografik'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Switcher: Daily (EOD) vs All Trades */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  viewMode === 'daily'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Kunlik (EOD)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('trades')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  viewMode === 'trades'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Har bir sdelka ({trades.length})</span>
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
                <span className="text-slate-300">Depozit Balansi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-rose-500 rounded-full border-dashed" />
                <span className="text-rose-400 font-semibold">Trailing DD (-2K)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative mt-4 overflow-x-auto">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            className="w-full h-auto min-h-[260px] overflow-visible"
          >
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.15, 0.4, 0.65, 0.9].map((ratio) => {
              const yVal = padY + ratio * (svgHeight - padY * 2);
              const labelVal = maxBal - ratio * range;
              return (
                <g key={ratio}>
                  <line 
                    x1={padX} 
                    y1={yVal} 
                    x2={svgWidth - padX} 
                    y2={yVal} 
                    stroke="#1e293b" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={padX - 8} 
                    y={yVal + 3} 
                    fill="#64748b" 
                    fontSize="10" 
                    textAnchor="end" 
                    fontFamily="monospace"
                  >
                    ${labelVal.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#equityGrad)" />

            {/* 🔴 DYNAMIC TRAILING DRAWDOWN LINE (Pikdan -2K) 🔴 */}
            <path 
              d={trailingLinePath} 
              fill="none" 
              stroke="#f43f5e" 
              strokeWidth="2" 
              strokeDasharray="6 3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* 🟢 MAIN BALANCE EQUITY LINE 🟢 */}
            <path 
              d={linePath} 
              fill="none" 
              stroke="#34d399" 
              strokeWidth={viewMode === 'daily' ? '3' : '2'} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Interactive Points on hover */}
            {activeEquityPoints.map((point, idx) => {
              const cx = getX(idx);
              const cy = getY(point.balance);
              const isHovered = hoveredEquityPoint?.index === idx;

              // Size: slightly larger dots in daily mode for effortless hovering
              const radius = isHovered 
                ? (viewMode === 'daily' ? 7 : 6) 
                : (viewMode === 'daily' ? 4.5 : 2.5);

              return (
                <g 
                  key={point.tradeId + idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredEquityPoint(point)}
                  onMouseLeave={() => setHoveredEquityPoint(null)}
                >
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={radius} 
                    fill="#030712" 
                    stroke={point.netPnl >= 0 ? '#10b981' : '#f43f5e'} 
                    strokeWidth={viewMode === 'daily' ? '3' : '2'} 
                    className="transition-all duration-150"
                  />
                  {/* Invisible hit area for easier mouse hovering */}
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={14} 
                    fill="transparent" 
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredEquityPoint && (
            <div className="absolute top-2 right-4 p-4 rounded-2xl bg-slate-950/95 border border-emerald-500/50 shadow-2xl text-xs space-y-1.5 font-mono pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-slate-300 font-sans font-bold flex items-center justify-between gap-4">
                <span className="text-white text-sm">{hoveredEquityPoint.date}</span>
                <span className="text-[11px] text-slate-400">{hoveredEquityPoint.time}</span>
              </div>
              
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
                <span className="text-slate-400">Kunlik P&L:</span>
                <span className={`font-bold text-sm ${hoveredEquityPoint.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hoveredEquityPoint.netPnl >= 0 ? '+' : ''}${hoveredEquityPoint.netPnl.toFixed(2)}
                  {hoveredEquityPoint.tradesCount > 0 && (
                    <span className="text-slate-400 font-normal text-xs ml-1">({hoveredEquityPoint.tradesCount} sdelka)</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Joriy Balans:</span>
                <span className="text-white text-sm font-black">
                  ${hoveredEquityPoint.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-[11px]">
                <span className="text-slate-400">Pik Balans:</span>
                <span className="text-cyan-400 font-bold">
                  ${hoveredEquityPoint.peakBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-[11px]">
                <span className="text-slate-400">Trailing Sliv Limiti:</span>
                <span className="text-rose-400 font-bold">
                  ${hoveredEquityPoint.drawdownLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-xs font-bold pt-1 border-t border-slate-800">
                <span className="text-amber-400">Qolgan Bufer:</span>
                <span className={hoveredEquityPoint.buffer < 500 ? 'text-rose-400' : 'text-emerald-400'}>
                  ${hoveredEquityPoint.buffer.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. Kunlik P&L Ustunli Grafigi & Intizom Tahlili */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kunlik P&L Ustunli Grafigi (Daily P&L Bar Chart) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
          
          {/* Header with Hover Details Live Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span>Kunlik P&L Ustunli Grafigi</span>
              </h3>
              <p className="text-xs text-slate-400">Yashil kunlar va qizil kunlar tahlili</p>
            </div>

            {/* Interactive Hover Badge (NEVER CLIPPED) */}
            {hoveredDay ? (
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/50 font-mono text-xs flex items-center gap-2 animate-in fade-in duration-100 shadow-lg">
                <span className="text-white font-bold">{hoveredDay.date}:</span>
                <span className={`font-bold ${hoveredDay.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hoveredDay.pnl >= 0 ? '+' : ''}${hoveredDay.pnl.toFixed(2)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  ({hoveredDay.trades} sdelka, {hoveredDay.wins}W / {hoveredDay.losses}L)
                </span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-[11px] text-slate-500">
                Ustun ustiga sichqonchani olib boring 👆
              </div>
            )}
          </div>

          <div className="relative mt-4">
            {dailyPnL.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">Hali ma’lumotlar mavjud emas</div>
            ) : (
              <div className="overflow-x-auto pt-10 pb-2 custom-scrollbar">
                <div className="flex items-end justify-between gap-3 h-52 min-w-[700px] px-3 border-b border-slate-800 pb-1">
                  {dailyPnL.map((day, idx) => {
                    const isGreen = day.pnl >= 0;
                    const barHeightPct = Math.min(100, (Math.abs(day.pnl) / maxDailyPnl) * 100);
                    const isHovered = hoveredBarIndex === idx;

                    return (
                      <div 
                        key={day.date}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      >
                        {/* Floating Tooltip Directly Above the Bar */}
                        {isHovered && (
                          <div className="absolute -top-9 bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-xl text-[11px] font-mono whitespace-nowrap z-30 shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                            <span className={isGreen ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {isGreen ? '+' : ''}${day.pnl.toFixed(2)}
                            </span>
                            <span className="text-slate-400 ml-1">({day.trades} ta)</span>
                          </div>
                        )}

                        {/* Bar Body */}
                        <div 
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-150 ${
                            isGreen 
                              ? 'bg-emerald-500 hover:bg-emerald-400' 
                              : 'bg-rose-500 hover:bg-rose-400'
                          } ${isHovered ? 'scale-110 shadow-lg shadow-emerald-950 ring-2 ring-white/50' : ''}`}
                          style={{ height: `${Math.max(10, barHeightPct)}%` }}
                        />

                        {/* Date Label */}
                        <span className={`text-[10px] font-mono mt-2 truncate max-w-full font-semibold transition-colors ${
                          isHovered ? 'text-white font-bold' : 'text-slate-400'
                        }`}>
                          {day.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 px-3">
                  <span>← 2026-10-08</span>
                  <span>Barcha kunlar to‘liq aks etgan (gorizontal surish mumkin)</span>
                  <span>2026-11-20 →</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Intizom Tahlili (A+ vs Qoidasiz Sdelkalar Solishtiruvi) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Intizom Tahlili: Qoida vs Qoidabuzarlik</span>
            </h3>
            <p className="text-xs text-slate-400">Qoidaga amal qilish va emotsional kirish natijalari solishtiruvi</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            
            {/* Qoida bo'yicha (A+) */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>Qoida bo‘yicha (A+)</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {aPlusNetPnl >= 0 ? '+' : ''}${aPlusNetPnl.toFixed(2)}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {aPlusTrades.length} ta sdelka ({aPlusWinRate}% WR)
              </div>
            </div>

            {/* Qoidasiz / Sweep'siz */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>Qoidasiz / Sweep‘siz</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {violationNetPnl >= 0 ? '+' : ''}${violationNetPnl.toFixed(2)}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {violationTrades.length} ta sdelka ({violationWinRate}% WR)
              </div>
            </div>

          </div>

          <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Sessiya Sweep qoidasiga amal qilish ulushi:</span>
              <strong className="text-emerald-400 font-mono">
                {totalTrades > 0 ? ((trades.filter((t) => t.session_sweep).length / totalTrades) * 100).toFixed(1) : 0}%
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Jami to‘langan komissiya (Tradovate):</span>
              <strong className="text-rose-400 font-mono">-${totalCommission.toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>O‘rtacha sdelka sof daromadi:</span>
              <strong className={`font-mono ${totalTrades > 0 && totalNetPnl / totalTrades >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalTrades > 0 ? (totalNetPnl / totalTrades >= 0 ? '+' : '') + (totalNetPnl / totalTrades).toFixed(2) : '$0.00'}
              </strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
