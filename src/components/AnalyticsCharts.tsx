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
  Award
} from 'lucide-react';
import { Trade, UserSettings } from '../types/journal';

interface AnalyticsChartsProps {
  trades: Trade[];
  settings: UserSettings;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ trades, settings }) => {
  const [hoveredEquityPoint, setHoveredEquityPoint] = useState<any | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Chronologically sorted trades for proper timeline
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
    });
  }, [trades]);

  // Equity Curve with Dynamic Trailing Drawdown (-$2,000 trailing from Peak)
  const equityPoints = useMemo(() => {
    let runningBalance = settings.initial_balance;
    let peakBalance = settings.initial_balance;

    const points = [
      {
        index: 0,
        tradeId: 'start',
        date: 'Boshlanish',
        time: '',
        instrument: 'Boshlang‘ich Balans',
        netPnl: 0,
        balance: runningBalance,
        peakBalance: peakBalance,
        drawdownLimit: peakBalance - 2000,
        buffer: 2000,
      },
    ];

    sortedTrades.forEach((t, i) => {
      runningBalance += t.net_pnl;
      if (runningBalance > peakBalance) {
        peakBalance = runningBalance;
      }
      const ddLimit = peakBalance - 2000;
      points.push({
        index: i + 1,
        tradeId: t.id,
        date: t.date,
        time: t.time,
        instrument: t.instrument,
        netPnl: t.net_pnl,
        balance: runningBalance,
        peakBalance: peakBalance,
        drawdownLimit: ddLimit,
        buffer: Math.max(0, runningBalance - ddLimit),
      });
    });

    return points;
  }, [sortedTrades, settings.initial_balance]);

  // Aggregate Daily P&L for Bar Chart
  const dailyPnL = useMemo(() => {
    const map = new Map<string, { date: string; pnl: number; trades: number }>();
    
    sortedTrades.forEach((t) => {
      const existing = map.get(t.date) || { date: t.date, pnl: 0, trades: 0 };
      existing.pnl += t.net_pnl;
      existing.trades += 1;
      map.set(t.date, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [sortedTrades]);

  // Key KPI Metrics
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl < 0);
  const totalNetPnl = trades.reduce((acc, t) => acc + t.net_pnl, 0);
  const totalCommission = trades.reduce((acc, t) => acc + t.commission, 0);
  const currentBalance = settings.initial_balance + totalNetPnl;

  // Trailing Drawdown Current Peak & Limit
  const currentPeakBalance = Math.max(settings.initial_balance, ...equityPoints.map((p) => p.balance));
  const currentTrailingDrawdownLimit = currentPeakBalance - 2000;
  const currentTrailingBuffer = Math.max(0, currentBalance - currentTrailingDrawdownLimit);
  const currentDrawdownFromPeak = currentBalance - currentPeakBalance;
  const trailingBufferPercent = Math.min(100, (currentTrailingBuffer / 2000) * 100);

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
  const minBal = Math.min(...equityPoints.map((p) => p.drawdownLimit)) - 100;
  const maxBal = Math.max(...equityPoints.map((p) => p.peakBalance)) + 150;
  const range = maxBal - minBal || 1;

  const svgWidth = 840;
  const svgHeight = 300;
  const padX = 60;
  const padY = 30;

  const getX = (idx: number) => {
    if (equityPoints.length <= 1) return padX;
    return padX + (idx / (equityPoints.length - 1)) * (svgWidth - padX * 2);
  };

  const getY = (val: number) => {
    return svgHeight - padY - ((val - minBal) / range) * (svgHeight - padY * 2);
  };

  const linePath = equityPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.balance)}`)
    .join(' ');

  const trailingLinePath = equityPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.drawdownLimit)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(equityPoints.length - 1)} ${svgHeight - padY} L ${getX(0)} ${svgHeight - padY} Z`;

  // Daily Bar Chart Dimensions
  const maxDailyPnl = Math.max(10, ...dailyPnL.map((d) => Math.abs(d.pnl)));

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
            Boshlang‘ich: ${settings.initial_balance.toLocaleString()}
          </div>
        </div>

        {/* Qolgan Trailing Bufer */}
        <div className={`border rounded-3xl p-5 shadow-xl transition-all ${
          currentTrailingBuffer < 300 
            ? 'bg-rose-950/40 border-rose-500/60 text-rose-300' 
            : currentTrailingBuffer < 600
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
            : 'bg-slate-900/90 border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Qolgan Bufer (2k Sliv)</span>
            {currentTrailingBuffer < 300 ? (
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
            currentTrailingBuffer < 300 ? 'text-rose-400' : currentTrailingBuffer < 600 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            ${currentTrailingBuffer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Sliv chegarasi: ${currentTrailingDrawdownLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Sof Foyda / Zarar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Sof Foyda / Zarar</span>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
            totalNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {totalNetPnl >= 0 ? '+' : ''}${totalNetPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1">
            Komissiya: -${totalCommission.toFixed(2)}
          </div>
        </div>

        {/* Yutuq Foizi (Win Rate) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Yutuq Foizi (Win Rate)</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {winRate}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {wins.length} Yutuq / {losses.length} Zarar ({totalTrades} jami)
          </div>
        </div>

      </div>

      {/* ⭐ TRAILING DRAWDOWN DYNAMIC MONITOR CARD (PIKDAN -2K PASTDA) ⭐ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span>Dinamik Trailing Drawdown Nazoratchisi</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  -2K Qoidasi
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Balans ko‘tarilganda sliv chegarasi ham yuqoriga ergashadi (Pik balansdan roppa-rosa $2,000 pastda turadi).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Pik Balans (Eng Yuqori)</span>
              <span className="text-emerald-400 font-bold text-sm">
                ${currentPeakBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Hozirgi Sliv Chegarasi</span>
              <span className="text-rose-400 font-bold text-sm">
                ${currentTrailingDrawdownLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Trailing Buffer Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              Sliv chegarasigacha qolgan masofa: <strong className={currentTrailingBuffer < 300 ? 'text-rose-400' : 'text-emerald-400'}>${currentTrailingBuffer.toFixed(2)}</strong>
            </span>
            <span className="text-slate-400">
              Pikdan tushish: <strong className={currentDrawdownFromPeak < 0 ? 'text-rose-400' : 'text-emerald-400'}>${currentDrawdownFromPeak.toFixed(2)}</strong> (Maks: $2,000)
            </span>
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
      </div>

      {/* 2. Balans O‘sishi va Tushishi Grafigi (Equity Curve + Dynamic Trailing Line) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Balans O‘sishi va Trailing Drawdown Grafigi (Equity Curve)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Depozit o‘sishi (yashil) va unga ergashuvchi 2K Trailing Drawdown chegarasi (qizil uzuq chiziq)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
              <span className="text-slate-300">Depozit Balansi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500 rounded-full border-dashed" />
              <span className="text-rose-400 font-semibold">Trailing Drawdown (Pik - 2k)</span>
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
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Interactive Points on hover */}
            {equityPoints.map((point, idx) => {
              const cx = getX(idx);
              const cy = getY(point.balance);
              const isHovered = hoveredEquityPoint?.index === idx;

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
                    r={isHovered ? 6 : 3} 
                    fill="#030712" 
                    stroke={point.netPnl >= 0 ? '#10b981' : '#f43f5e'} 
                    strokeWidth="2.5" 
                    className="transition-all"
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredEquityPoint && (
            <div className="absolute top-2 right-4 p-3.5 rounded-2xl bg-slate-950/95 border border-slate-700 shadow-2xl text-xs space-y-1.5 font-mono pointer-events-none z-20">
              <div className="text-slate-400 font-sans font-bold flex items-center justify-between gap-4">
                <span>{hoveredEquityPoint.instrument}</span>
                <span className="text-[11px] text-slate-500">{hoveredEquityPoint.date} {hoveredEquityPoint.time}</span>
              </div>
              <div className="text-white text-sm font-black">
                Balans: ${hoveredEquityPoint.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-emerald-400 text-[11px]">
                Pik Balans: ${hoveredEquityPoint.peakBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-rose-400 text-[11px]">
                Trailing Sliv Chegarasi: ${hoveredEquityPoint.drawdownLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-amber-300 font-bold text-[11px] pt-1 border-t border-slate-800">
                Qolgan Bufer: ${hoveredEquityPoint.buffer.toFixed(2)}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. Kunlik P&L Ustunli Grafigi & Intizom Tahlili */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kunlik P&L Ustunli Grafigi (Daily P&L Bar Chart) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Kunlik P&L Ustunli Grafigi</span>
            </h3>
            <p className="text-xs text-slate-400">Yashil kunlar va qizil kunlar tahlili</p>
          </div>

          <div className="relative mt-5">
            {dailyPnL.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">Hali ma’lumotlar mavjud emas</div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="flex items-end justify-between gap-2.5 h-48 min-w-[680px] px-2 border-b border-slate-800 pb-1">
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
                        <div 
                          className={`w-full max-w-[24px] rounded-t transition-all ${
                            isGreen 
                              ? 'bg-emerald-500 hover:bg-emerald-400' 
                              : 'bg-rose-500 hover:bg-rose-400'
                          } ${isHovered ? 'scale-110 shadow-lg shadow-emerald-950' : ''}`}
                          style={{ height: `${Math.max(8, barHeightPct)}%` }}
                        />
                        <span className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-full font-semibold">
                          {day.date.slice(5)}
                        </span>

                        {/* Tooltip */}
                        {isHovered && (
                          <div className="absolute -top-12 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-mono whitespace-nowrap z-20 shadow-2xl">
                            <span className={isGreen ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {isGreen ? '+' : ''}${day.pnl.toFixed(2)}
                            </span>
                            <span className="text-slate-400 ml-1.5">({day.trades} sdelka)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1.5 px-2">
                  <span>← Oktyabr 2026</span>
                  <span>Barcha kunlar to‘liq aks etgan (surish mumkin)</span>
                  <span>Noyabr 2026 →</span>
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
              <div className="text-xs text-slate-300 font-mono space-y-0.5 pt-1 border-t border-emerald-900/50">
                <div>Yutuq foizi: <strong className="text-emerald-400">{aPlusWinRate}%</strong></div>
                <div>Sdelkalar soni: <strong>{aPlusTrades.length} ta</strong></div>
              </div>
            </div>

            {/* Qoidasiz / Sweep'siz */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>Qoidasiz / Sweep‘siz</span>
              </div>
              <div className="text-2xl font-black text-rose-300 font-mono">
                {violationNetPnl >= 0 ? '+' : ''}${violationNetPnl.toFixed(2)}
              </div>
              <div className="text-xs text-slate-300 font-mono space-y-0.5 pt-1 border-t border-rose-900/50">
                <div>Yutuq foizi: <strong className="text-rose-400">{violationWinRate}%</strong></div>
                <div>Sdelkalar soni: <strong>{violationTrades.length} ta</strong></div>
              </div>
            </div>

          </div>

          {/* Psychology Eye-Opener insight banner */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Xulosa:</strong> Qoidalarga qat’iy amal qilingan sdelkalar barqaror o‘sishni ta’minlaydi. 
              {violationNetPnl < 0 && (
                <span className="text-rose-400 font-semibold ml-1">
                  Qoidasiz savdolardan voz kechish orqali siz ${Math.abs(violationNetPnl).toFixed(2)} tejab qolgan bo‘lar edingiz!
                </span>
              )}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
