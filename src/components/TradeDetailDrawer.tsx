import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  ExternalLink, 
  Edit3, 
  Trash2,
  Brain,
  Target,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  Sparkles
} from 'lucide-react';
import { Trade } from '../types/journal';

interface TradeDetailDrawerProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onUpdateLink?: (tradeId: string, newUrl: string) => void;
}

export const TradeDetailDrawer: React.FC<TradeDetailDrawerProps> = ({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateLink,
}) => {
  const [chartLinkInput, setChartLinkInput] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkSavedToast, setLinkSavedToast] = useState(false);

  useEffect(() => {
    if (trade) {
      setChartLinkInput(trade.chart_url || '');
      setIsEditingLink(false);
    }
  }, [trade]);

  if (!isOpen || !trade) return null;

  const isProfit = trade.net_pnl > 0;
  const isLoss = trade.net_pnl < 0;

  // Calculate points gained / lost
  const pointDiff = trade.direction === 'Long' 
    ? trade.exit_price - trade.entry_price 
    : trade.entry_price - trade.exit_price;

  // Calculate theoretical risk (SL distance)
  const riskPoints = Math.abs(trade.entry_price - trade.stop_loss);
  const rewardRatio = riskPoints > 0 ? (pointDiff / riskPoints).toFixed(2) : '1:1';

  const handleSaveLink = () => {
    if (onUpdateLink) {
      onUpdateLink(trade.id, chartLinkInput.trim());
      setIsEditingLink(false);
      setLinkSavedToast(true);
      setTimeout(() => setLinkSavedToast(false), 2500);
    }
  };

  const handleClearLink = () => {
    setChartLinkInput('');
    if (onUpdateLink) {
      onUpdateLink(trade.id, '');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-black text-white font-mono bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                {trade.instrument}
              </span>
              {trade.direction === 'Long' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Long (Buy)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Short (Sell)
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Net P&L Hero Card */}
            <div className={`p-6 rounded-3xl border-2 text-center transition-all ${
              isProfit 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                : isLoss
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Sof Natija (Net P&L)
              </span>
              <div className="text-4xl font-black font-mono tracking-tight">
                {isProfit ? '+' : ''}${trade.net_pnl.toFixed(2)}
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <span>Yalpi: ${trade.gross_pnl.toFixed(2)}</span>
                <span>•</span>
                <span>Komissiya: -${trade.commission.toFixed(2)}</span>
                <span>•</span>
                <span>Nuqta: {pointDiff > 0 ? '+' : ''}{pointDiff.toFixed(2)} pts</span>
              </div>
            </div>

            {/* ⭐ FOYDALANUVCHI LINKI VA GRAFIK KO'RINIShI (USER REQUESTED FEATURE) ⭐ */}
            <div className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Sdelka Grafiki / Skrinshot Havolasi</span>
                      {linkSavedToast && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-bold animate-pulse">
                          Saqlandi!
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400">TradingView yoki rasm havolasini qo‘yish</p>
                  </div>
                </div>

                {trade.chart_url && !isEditingLink && (
                  <button
                    onClick={() => setIsEditingLink(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Linkni tahrirlash</span>
                  </button>
                )}
              </div>

              {/* Link Input Section */}
              {(!trade.chart_url || isEditingLink) ? (
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://www.tradingview.com/x/... yoki rasm havolasi"
                      value={chartLinkInput}
                      onChange={(e) => setChartLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveLink();
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono shadow-inner"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {isEditingLink && (
                      <button
                        type="button"
                        onClick={() => setIsEditingLink(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                      >
                        Bekor qilish
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveLink}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-950/40"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Havolani Saqlash</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Link Display & Interactive Preview */
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <LinkIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-slate-300 font-mono truncate">
                        {trade.chart_url}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={trade.chart_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm"
                      >
                        <span>Ochish</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={handleClearLink}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Havolani o‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Image Preview Container */}
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80">
                    <img 
                      src={trade.chart_url} 
                      alt="Savdo grafiki" 
                      className="w-full h-auto max-h-72 object-contain bg-slate-950"
                      onError={(e) => {
                        // Fallback UI if it's a TradingView page link that blocks direct iframe embedding
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'p-6 text-center text-xs text-slate-400 space-y-2';
                          fallback.innerHTML = `
                            <p class="text-white font-medium">TradingView grafik havolasi biriktirilgan</p>
                            <p class="text-[11px] text-slate-500">Brauzerda to‘liq ko‘rish uchun yuqoridagi "Ochish ↗" tugmasini bosing.</p>
                          `;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4">
                <span className="text-xs text-slate-400 block mb-1">Sana va Vaqt</span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{trade.date}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">{trade.time} • {trade.duration || '0m'}</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4">
                <span className="text-xs text-slate-400 block mb-1">R:R Nisbati</span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>{rewardRatio} R:R</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Hajm: {trade.quantity} ta mikro kontrakt</div>
              </div>
            </div>

            {/* Price Execution Details */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Narxlar va Ijro
              </h4>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Kirish Narxi</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{trade.entry_price.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-rose-400 block">Stop Loss (SL)</span>
                  <span className="text-sm font-bold text-rose-300 mt-0.5 block">{trade.stop_loss.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 block">Chiqish (TP)</span>
                  <span className="text-sm font-bold text-emerald-300 mt-0.5 block">{trade.exit_price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Discipline & Pre-Trade Checklist Analysis */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Intizom va Tekshiruv</span>
                <span className="font-mono text-emerald-400">{trade.checklist_score}/{trade.checklist_total} ball</span>
              </h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-300 font-medium">Sessiya Sweep:</span>
                  {trade.session_sweep ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Bajarildi
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Bajarilmadi (Qoidabuzarlik)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-300 font-medium">Intizom darajasi:</span>
                  <span className="font-bold">
                    {trade.discipline === 'A_PLUS' && <span className="text-emerald-400">Qoida bo‘yicha (A+)</span>}
                    {trade.discipline === 'PARTIAL' && <span className="text-amber-400">Qisman bajarildi</span>}
                    {trade.discipline === 'RULE_VIOLATION' && <span className="text-rose-400">Qoidasiz / Sweep‘siz</span>}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-purple-400" /> Ruhiy holat:
                  </span>
                  <span className="text-purple-300 font-semibold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/80">
                    {trade.mental_state}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Reflection */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Izoh va Tahlil
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80 whitespace-pre-wrap">
                {trade.notes || 'Hech qanday izoh yozilmagan.'}
              </p>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (window.confirm('Haqiqatan ham bu sdelkani o‘chirmoqchimisiz?')) {
                  onDelete(trade.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-semibold text-rose-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>O‘chirish</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(trade);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Tahrirlash</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
