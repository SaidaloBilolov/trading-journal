import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Zap, 
  RotateCcw, 
  ArrowRight, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChecklistItem, UserSettings } from '../types/journal';

interface PreTradeChecklistProps {
  items: ChecklistItem[];
  settings: UserSettings;
  todayTradeCount: number;
  todayNetPnl: number;
  onOpenTradeWithChecklist: (score: number, total: number, sweepPassed: boolean) => void;
}

export const PreTradeChecklist: React.FC<PreTradeChecklistProps> = ({
  items,
  settings,
  todayTradeCount,
  todayNetPnl,
  onOpenTradeWithChecklist,
}) => {
  // Checkbox states stored by item id
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({
    'session-sweep': false,
    'htf-zone': false,
    'ltf-confirmation': false,
    'clear-target': false,
    'risk-and-shield': false,
  });

  const activeItems = items.filter((item) => item.enabled);
  const totalCount = activeItems.length;
  
  // Calculate score
  const currentScore = activeItems.filter((item) => checkedMap[item.id]).length;
  
  // Check mandatory session sweep
  const sessionSweepItem = activeItems.find((it) => it.id === 'session-sweep');
  const isSessionSweepChecked = sessionSweepItem ? Boolean(checkedMap['session-sweep']) : true;

  // Rules: Green pass ONLY IF minimum score achieved AND session sweep is checked
  const isGreenLight = currentScore >= settings.min_checklist_score && isSessionSweepChecked;

  // Shield checks
  const isTradeLimitReached = todayTradeCount >= settings.max_daily_trades;
  const isDailyLossBreached = todayNetPnl <= -settings.max_daily_loss;
  const isShieldLocked = isTradeLimitReached || isDailyLossBreached;

  const handleToggle = (id: string) => {
    setCheckedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      
      // If newly became green light, trigger celebration
      const newScore = activeItems.filter((item) => next[item.id]).length;
      const sweepNow = next['session-sweep'];
      if (newScore >= settings.min_checklist_score && sweepNow && !isGreenLight) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10b981', '#34d399', '#059669', '#6ee7b7'],
          });
        } catch {
          // Ignore
        }
      }

      return next;
    });
  };

  const handleReset = () => {
    const empty: Record<string, boolean> = {};
    activeItems.forEach((it) => {
      empty[it.id] = false;
    });
    setCheckedMap(empty);
  };

  const handleCreateTrade = () => {
    onOpenTradeWithChecklist(currentScore, totalCount, isSessionSweepChecked);
  };

  return (
    <div className="space-y-6">
      
      {/* Kunlik Qalqon (Daily Shield) Alert if locked */}
      {isShieldLocked && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 shadow-2xl flex items-start gap-4 animate-bounce">
          <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-wide">
              DIQQAT: KUNLIK QALQON ISHGA TUSHDI — SAVDONI TO‘XTATING!
            </h3>
            <p className="text-xs text-rose-300">
              {isTradeLimitReached && `Bugungi maksimal sdelkalar limiti (${settings.max_daily_trades} ta) to‘ldi.`}
              {isTradeLimitReached && isDailyLossBreached && ' '}
              {isDailyLossBreached && `Kunlik zarar chegarasi (-$${settings.max_daily_loss}) buzildi.`}
              {' '}Bozor bilan urushmang, ertangi yangi sessiyani kuting!
            </p>
          </div>
        </div>
      )}

      {/* Main Checklist Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        
        {/* Glow background accent */}
        <div 
          className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isGreenLight ? 'bg-emerald-500/15' : 'bg-rose-500/10'
          }`}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> 1-Bosqich: Intizom Nazorati
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Min. ruxsat: {settings.min_checklist_score}/{totalCount}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5 tracking-tight">
              Savdodan Oldingi Majburiy Tekshiruv
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Tugmani bosishdan oldin har bir shartni xolisona belgilang. Shartlar to‘liq bajarilmagunicha bozorga kirmang!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Belgilangan shartlarni qayta tozalash"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tozalash</span>
            </button>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm font-bold text-white shadow-inner">
              <span className={isGreenLight ? 'text-emerald-400' : 'text-amber-400'}>{currentScore}</span>
              <span className="text-slate-500"> / {totalCount} ball</span>
            </div>
          </div>
        </div>

        {/* 1. KATTA HOLAT BANNERI (STATUS BANNER) */}
        <div className="my-6">
          {isGreenLight ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-teal-950/80 border-2 border-emerald-500/80 shadow-2xl shadow-emerald-950/60 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 animate-pulse">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                        YASHIL RUXSAT
                      </span>
                      <span className="text-xs text-emerald-300 font-mono">Ball: {currentScore}/{totalCount} (A+ Setup)</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                      SAVDO QILISH MUMKIN — SETUP TASDIQLANDI
                    </h3>
                    <p className="text-xs text-emerald-200/80 mt-0.5">
                      Sessiya Sweep va barcha asosiy shartlar to‘liq bajarildi. Xotirjamlik bilan reja asosida kiring.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCreateTrade}
                  disabled={isShieldLocked}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-slate-950 shadow-xl transition-all ${
                    isShieldLocked
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/40 hover:scale-105 active:scale-95'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ Shu Tekshiruv Bilan Sdelka Ochish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className={`p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
              !isSessionSweepChecked
                ? 'bg-rose-950/70 border-rose-500/80 shadow-2xl shadow-rose-950/60'
                : 'bg-amber-950/50 border-amber-500/70 shadow-xl shadow-amber-950/40'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    !isSessionSweepChecked 
                      ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 shadow-rose-500/20 animate-pulse'
                      : 'bg-amber-500/20 border border-amber-500/50 text-amber-400 shadow-amber-500/20'
                  }`}>
                    {!isSessionSweepChecked ? (
                      <XCircle className="w-7 h-7" />
                    ) : (
                      <AlertTriangle className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        !isSessionSweepChecked
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-400 text-slate-950'
                      }`}>
                        {!isSessionSweepChecked ? 'QIZIL TAQIQ' : 'KUTISH REJIMI'}
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        Hozirgi ball: {currentScore} / {totalCount} (Kamida {settings.min_checklist_score} ta shart kerak)
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                      {!isSessionSweepChecked
                        ? 'DIQQAT: SWEEP BO‘LMAGAN — KIRMA, SWEEP BO‘LGUNCHA KUT!'
                        : 'KUTING — SHARTLAR TO‘LIQ EMAS (SWEEP BO‘LMASA KIRMA)'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {!isSessionSweepChecked
                        ? 'Osiyo, London yoki avvalgi sessiya likvidligi olinmasdan savdoga kirish — depozitni xavf ostiga qo‘yadi!'
                        : 'Shartlarni to‘liq bajarilmaguncha sabr bilan kuting. Bozor orqasidan quvishingiz shart emas.'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800 text-center sm:text-right">
                  <span className="block font-medium text-slate-300">Bozor har doim imkoniyat beradi</span>
                  <span className="text-[11px] text-slate-500">Shoshilmaslik — professional treyder odati</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. CHECKLIST ITEMS LIST */}
        <div className="space-y-3.5">
          {activeItems.map((item, index) => {
            const isChecked = Boolean(checkedMap[item.id]);
            const isSweep = item.id === 'session-sweep';

            return (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-200 select-none ${
                  isChecked
                    ? isSweep
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-850/80 border-emerald-500/40 bg-slate-900'
                    : isSweep
                    ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700/80'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  
                  {/* Custom High-Contrast Checkbox */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : isSweep
                          ? 'border-2 border-rose-500/70 bg-rose-950/30'
                          : 'border-2 border-slate-700 bg-slate-900 group-hover:border-slate-500'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Title and Strategy description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                      <h4 className={`text-sm sm:text-base font-bold transition-colors ${
                        isChecked ? 'text-white' : 'text-slate-200'
                      }`}>
                        {item.title}
                      </h4>
                      {item.is_mandatory && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Majburiy Shart
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Status indicator pill */}
                  <div className="hidden sm:block shrink-0 pt-0.5">
                    <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
                      isChecked
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isSweep
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}>
                      {isChecked ? 'Bajarildi' : 'Kutilmoqda'}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Strategy Reminder Footer */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Optimal savdo vaqti: <strong>17:00 – 21:00 (NY Ochiq sessiyasi)</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <span>Risk chegarasi: <strong>1 mikro (MNQ/MGC) • ~$40-45 SL</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
};
