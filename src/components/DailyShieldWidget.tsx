import React from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle, Award } from 'lucide-react';
import { UserSettings } from '../types/journal';

interface DailyShieldWidgetProps {
  todayTradeCount: number;
  todayNetPnl: number;
  todayWins: number;
  todayLosses: number;
  settings: UserSettings;
}

export const DailyShieldWidget: React.FC<DailyShieldWidgetProps> = ({
  todayTradeCount,
  todayNetPnl,
  todayWins,
  todayLosses,
  settings,
}) => {
  const remainingTrades = Math.max(0, settings.max_daily_trades - todayTradeCount);
  const tradesPercent = Math.min(100, (todayTradeCount / settings.max_daily_trades) * 100);

  // Daily Loss calculation
  const currentDailyLoss = todayNetPnl < 0 ? Math.abs(todayNetPnl) : 0;
  const remainingLossBuffer = Math.max(0, settings.max_daily_loss - currentDailyLoss);
  const lossPercent = Math.min(100, (currentDailyLoss / settings.max_daily_loss) * 100);

  const isTradeLimitExceeded = todayTradeCount >= settings.max_daily_trades;
  const isLossLimitExceeded = currentDailyLoss >= settings.max_daily_loss;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Bugungi Kunlik Qalqon
              {isTradeLimitExceeded || isLossLimitExceeded ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Qulflangan
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Faol Himoya
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Depozitni ortiqcha savdo (overtrading) va hissiyotlardan himoya qilish</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Bugungi natija:</span>
          <span className={`font-bold px-2.5 py-1 rounded-lg border ${
            todayNetPnl >= 0 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
          }`}>
            {todayNetPnl >= 0 ? '+' : ''}${todayNetPnl.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        
        {/* 1. Sdelkalar Soni Limiti */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Sdelkalar Soni</span>
            <span className="font-mono text-white font-bold">{todayTradeCount} / {settings.max_daily_trades} ta</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isTradeLimitExceeded ? 'bg-rose-500' : tradesPercent >= 66 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${tradesPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Ruxsat etilgan qoldiq:</span>
            <span className="font-mono font-bold text-slate-300">{remainingTrades} ta sdelka</span>
          </div>
        </div>

        {/* 2. Kunlik Zarar Chegarasi */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Kunlik Zarar Chegarasi</span>
            <span className="font-mono text-white font-bold">-${currentDailyLoss.toFixed(2)} / -${settings.max_daily_loss}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isLossLimitExceeded ? 'bg-rose-500' : lossPercent >= 66 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${lossPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Qolgan zarar buferi:</span>
            <span className="font-mono font-bold text-slate-300">${remainingLossBuffer.toFixed(2)}</span>
          </div>
        </div>

        {/* 3. Bugungi Yutuq/Zarar Nisbati */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bugungi Natijalar</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-3 my-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-500/20">
              <span>{todayWins} Yutuq</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono font-bold bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-500/20">
              <span>{todayLosses} Zarar</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            {todayTradeCount === 0 ? 'Bugun hali sdelka qilinmadi' : 'Har bir sdelkani qayd etib boring'}
          </span>
        </div>

      </div>
    </div>
  );
};
