import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  FileText, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { Trade } from '../types/journal';

interface NotionJournalTableProps {
  trades: Trade[];
  initialBalance?: number;
  onSelectTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onOpenNewTrade: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const NotionJournalTable: React.FC<NotionJournalTableProps> = ({
  trades,
  initialBalance = 50000,
  onSelectTrade,
  onEditTrade,
  onDeleteTrade,
  onOpenNewTrade,
  onExportExcel,
  onExportPDF,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROFIT' | 'LOSS' | 'BE' | 'CHART'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPair, setSelectedPair] = useState<string>('ALL');

  const pairsList = useMemo(() => {
    return Array.from(new Set(trades.map((t) => t.instrument))).filter(Boolean);
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // Tab filter
      if (activeTab === 'PROFIT' && trade.net_pnl <= 0) return false;
      if (activeTab === 'LOSS' && trade.net_pnl >= 0) return false;
      if (activeTab === 'BE' && trade.net_pnl !== 0) return false;
      if (activeTab === 'CHART' && !trade.chart_url && !trade.before_photo && !trade.in_trade_photo) return false;

      // Pair filter
      if (selectedPair !== 'ALL' && trade.instrument !== selectedPair) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          trade.instrument.toLowerCase().includes(q) ||
          trade.notes.toLowerCase().includes(q) ||
          (trade.entry_reason && trade.entry_reason.toLowerCase().includes(q)) ||
          (trade.sl_reason && trade.sl_reason.toLowerCase().includes(q)) ||
          (trade.chart_url && trade.chart_url.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [trades, activeTab, selectedPair, searchQuery]);

  // Color helper for pair
  const renderPairBadge = (sym: string) => {
    if (sym.includes('NAS') || sym.includes('MNQ') || sym.includes('NQ')) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#3b2d54] text-[#d8b4fe] border border-[#581c87]/60">
          {sym}
        </span>
      );
    }
    if (sym.includes('MGC') || sym.includes('GC') || sym.includes('XAU')) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#423223] text-[#fed7aa] border border-[#78350f]/60">
          {sym}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#1e293b] text-[#cbd5e1] border border-slate-700">
        {sym}
      </span>
    );
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Notion Bar: Views/Tabs (Screenshot 4) + Controls */}
      <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Notion Tabs (Screenshot 4) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Итог (Barchasi)</span>
            <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded font-mono">
              {trades.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PROFIT')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'PROFIT'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Профит ({trades.filter((t) => t.net_pnl > 0).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LOSS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'LOSS'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Убыток ({trades.filter((t) => t.net_pnl < 0).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'BE'
                ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Б/У ({trades.filter((t) => t.net_pnl === 0).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CHART')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'CHART'
                ? 'bg-sky-950/60 text-sky-300 border border-sky-400/50 shadow-sm'
                : 'text-slate-400 hover:text-sky-300 hover:bg-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>График ({trades.filter((t) => Boolean(t.chart_url || t.before_photo)).length})</span>
          </button>
        </div>

        {/* Download Buttons: Excel & PDF (User requested both!) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-emerald-300 transition-all shadow-sm"
            title="Notion formatida Excel (.xlsx) yuklab olish"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-rose-400 transition-all shadow-sm"
            title="Chop etish yoki PDF (.pdf) formatida yuklab olish"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>PDF (.pdf)</span>
          </button>

          <button
            onClick={onOpenNewTrade}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Sdelka</span>
          </button>
        </div>
      </div>

      {/* Search and Pair Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Sdelka, sabablar, link yoki emotsiya bo‘yicha izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b101b] border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="bg-[#0b101b] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">Barcha paralar ({pairsList.length})</option>
            {pairsList.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notion Full Database Table (Screenshots 1-4) */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070b14] text-[11px] font-semibold text-slate-400 select-none whitespace-nowrap">
                <th className="py-3 px-3.5 font-mono">Сделка</th>
                <th className="py-3 px-3">Пара</th>
                <th className="py-3 px-3">Позиция</th>
                <th className="py-3 px-3">Эмоция</th>
                <th className="py-3 px-3 font-mono">Дата</th>
                <th className="py-3 px-2.5 text-center">Риск</th>
                <th className="py-3 px-2.5 text-center">SL</th>
                <th className="py-3 px-2.5 text-center">R:R</th>
                <th className="py-3 px-3 text-center">Соблюдал правила?</th>
                <th className="py-3 px-3 text-right">Прибыль %</th>
                <th className="py-3 px-4 font-mono text-right">Итог ($)</th>
                <th className="py-3 px-3 text-center">Результат</th>
                <th className="py-3 px-4">Before Trade / Photo</th>
                <th className="py-3 px-4 min-w-[200px]">Причины сделки</th>
                <th className="py-3 px-4">In Trade Photo</th>
                <th className="py-3 px-4">After Trade Photo</th>
                <th className="py-3 px-4 min-w-[200px]">Причины Stop Loss</th>
                <th className="py-3 px-3">Торговая сессия</th>
                <th className="py-3 px-3">Категория ошибки</th>
                <th className="py-3 px-3">HTF Trend</th>
                <th className="py-3 px-3 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={21} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-300">Birorta ham sdelka topilmadi</p>
                    <p className="text-xs text-slate-500 mt-1">Filtrlarni o‘zgartiring yoki yangi sdelkani qayd eting</p>
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => {
                  const isWin = t.net_pnl > 0;
                  const isLoss = t.net_pnl < 0;
                  const followedRules = t.followed_rules !== undefined ? t.followed_rules : t.session_sweep;
                  const photoLink = t.before_photo || t.chart_url;

                  return (
                    <tr
                      key={t.id}
                      onClick={() => onSelectTrade(t)}
                      className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                    >
                      {/* Сделка (ID / Icon) */}
                      <td className="py-3 px-3.5 font-mono whitespace-nowrap text-slate-300 flex items-center gap-1.5 font-medium">
                        <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                        <span>Order ({t.id})</span>
                      </td>

                      {/* Пара */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderPairBadge(t.instrument)}
                      </td>

                      {/* Позиция */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {t.direction === 'Long' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#14382c] text-[#6ee7b7] border border-[#065f46]/60">
                            Long
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#1e2f4d] text-[#93c5fd] border border-[#1e40af]/60">
                            Short
                          </span>
                        )}
                      </td>

                      {/* Эмоция какая была? */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#1c2c44] text-[#93c5fd]">
                          {t.mental_state || 'NO'}
                        </span>
                      </td>

                      {/* Дата */}
                      <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {t.date}
                      </td>

                      {/* Риск */}
                      <td className="py-3 px-2.5 text-center font-mono text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                          {t.risk_percent !== undefined ? t.risk_percent : '0.2'}
                        </span>
                      </td>

                      {/* SL */}
                      <td className="py-3 px-2.5 text-center font-mono whitespace-nowrap">
                        {isLoss ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#43232c] text-[#fca5a5]">
                            -1
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#17382d] text-[#86efac]">
                            0
                          </span>
                        )}
                      </td>

                      {/* R:R */}
                      <td className="py-3 px-2.5 text-center font-mono text-slate-300 whitespace-nowrap">
                        {t.rr_ratio !== undefined ? t.rr_ratio : isWin ? '2.1' : isLoss ? '-1.0' : '0'}
                      </td>

                      {/* Соблюдал ли ты правила? */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {followedRules ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#17382d] text-[#86efac] border border-[#15803d]/40">
                            ДА
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#43232c] text-[#fca5a5] border border-[#991b1b]/40">
                            НЕТ
                          </span>
                        )}
                      </td>

                      {/* Прибыль % */}
                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap text-slate-300">
                        {((t.net_pnl / 50000) * 100).toFixed(2)}%
                      </td>

                      {/* Итог ($) */}
                      <td className="py-3 px-4 font-mono font-bold text-right whitespace-nowrap">
                        <span className={`text-sm ${
                          isWin ? 'text-[#34d399]' : isLoss ? 'text-[#f87171]' : 'text-slate-400'
                        }`}>
                          {isWin ? '+' : ''}${t.net_pnl.toFixed(2)}
                        </span>
                      </td>

                      {/* Результат */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isWin ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#17382d] text-[#86efac] border border-emerald-500/30">
                            Прибыльная
                          </span>
                        ) : isLoss ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#43232c] text-[#fca5a5] border border-rose-500/30">
                            Убыточная
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
                            БУ
                          </span>
                        )}
                      </td>

                      {/* Before Trade / Photo */}
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {photoLink ? (
                          <a
                            href={photoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline max-w-[150px] truncate"
                          >
                            <LinkIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{photoLink.replace('https://', '')}</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => onSelectTrade(t)}
                            className="text-[11px] text-slate-500 hover:text-emerald-400"
                          >
                            + Havola qo‘yish
                          </button>
                        )}
                      </td>

                      {/* Причины сделки */}
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {t.entry_reason || t.notes || 'Trend bo‘yicha setup'}
                      </td>

                      {/* In Trade Photo */}
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {t.in_trade_photo ? (
                          <a href={t.in_trade_photo} target="_blank" rel="noreferrer" className="text-sky-400 text-xs hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            <span>In Trade</span>
                          </a>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* After Trade Photo */}
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {t.after_photo ? (
                          <a href={t.after_photo} target="_blank" rel="noreferrer" className="text-sky-400 text-xs hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            <span>After Trade</span>
                          </a>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Причины Stop Loss */}
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {t.sl_reason || (isLoss ? 'Bozor kutilgan yo‘nalishda yurmadi' : '-')}
                      </td>

                      {/* Торговая сессия */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#271d3d] text-[#c084fc] border border-[#6b21a8]/40">
                          {t.trading_session || '17:00 – 21:00 EST'}
                        </span>
                      </td>

                      {/* Категория ошибки */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isWin ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#143327] text-[#86efac] border border-[#15803d]/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Нет ошибки (TP)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#43232c] text-[#fca5a5] border border-rose-800/40">
                            {t.mistake_category || 'Savdo xatosi'}
                          </span>
                        )}
                      </td>

                      {/* HTF Trend */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#143327] text-[#86efac] border border-[#15803d]/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Bullish</span>
                        </span>
                      </td>

                      {/* Amallar */}
                      <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectTrade(t)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Tafsilotlar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTrade(t)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400"
                            title="Tahrirlash"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bu sdelkani o‘chirmoqchimisiz?')) {
                                onDeleteTrade(t.id);
                              }
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Profit % and Metrics */}
        <div className="py-3.5 px-6 bg-[#070b14] border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>Jami ko‘rsatilgan sdelkalar: <strong className="text-white font-mono text-sm">{filteredTrades.length}</strong> ta</span>
            <span className="text-slate-600">|</span>
            <span>Win Rate: <strong className="text-cyan-400 font-mono text-sm">{filteredTrades.length > 0 ? ((filteredTrades.filter((t) => t.net_pnl > 0).length / filteredTrades.length) * 100).toFixed(1) : '0'}%</strong> ({filteredTrades.filter((t) => t.net_pnl > 0).length}W / {filteredTrades.filter((t) => t.net_pnl < 0).length}L)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono">
            {/* Profit Factor */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px]">Profit Factor:</span>
              <span className="text-white font-bold">
                {(() => {
                  const wins = filteredTrades.filter((t) => t.net_pnl > 0).reduce((sum, t) => sum + t.net_pnl, 0);
                  const losses = Math.abs(filteredTrades.filter((t) => t.net_pnl < 0).reduce((sum, t) => sum + t.net_pnl, 0));
                  return losses > 0 ? (wins / losses).toFixed(2) : wins > 0 ? 'MAX' : '0.00';
                })()}
              </span>
            </div>

            {/* Foyda Foizi (%) */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold ${
              filteredTrades.reduce((acc, t) => acc + t.net_pnl, 0) >= 0 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' 
                : 'bg-rose-950/30 border-rose-500/40 text-rose-400'
            }`}>
              <span className="text-slate-400 font-normal text-[11px]">Foyda (%):</span>
              <span className="text-sm">
                {(() => {
                  const total = filteredTrades.reduce((acc, t) => acc + t.net_pnl, 0);
                  const pct = ((total / (initialBalance || 50000)) * 100).toFixed(2);
                  return `${Number(pct) >= 0 ? '+' : ''}${pct}%`;
                })()}
              </span>
            </div>

            {/* Sof P&L ($) */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold ${
              filteredTrades.reduce((acc, t) => acc + t.net_pnl, 0) >= 0 
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
            }`}>
              <span className="text-slate-400 font-normal text-[11px]">Sof P&L:</span>
              <span className="text-sm">
                {filteredTrades.reduce((acc, t) => acc + t.net_pnl, 0) >= 0 ? '+' : ''}$
                {filteredTrades.reduce((acc, t) => acc + t.net_pnl, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
