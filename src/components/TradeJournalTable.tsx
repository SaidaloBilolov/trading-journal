import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { Trade } from '../types/journal';

interface TradeJournalTableProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onOpenNewTrade: () => void;
  onQuickAddLink?: (trade: Trade) => void;
}

export const TradeJournalTable: React.FC<TradeJournalTableProps> = ({
  trades,
  onSelectTrade,
  onEditTrade,
  onDeleteTrade,
  onOpenNewTrade,
  onQuickAddLink,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'WIN' | 'LOSS' | 'A_PLUS' | 'VIOLATION' | 'WITH_LINK'>('ALL');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'pnl_desc' | 'pnl_asc'>('date_desc');

  // Available instruments list
  const availableInstruments = useMemo(() => {
    const list = Array.from(new Set(trades.map((t) => t.instrument))).filter(Boolean);
    return list;
  }, [trades]);

  // Filtered & Sorted trades
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // Search
      const matchesSearch = 
        trade.instrument.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.mental_state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trade.chart_url && trade.chart_url.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Instrument filter
      if (selectedInstrument !== 'ALL' && trade.instrument !== selectedInstrument) {
        return false;
      }

      // Filter pills
      if (filterType === 'WIN') return trade.net_pnl > 0;
      if (filterType === 'LOSS') return trade.net_pnl < 0;
      if (filterType === 'A_PLUS') return trade.discipline === 'A_PLUS';
      if (filterType === 'VIOLATION') return trade.discipline === 'RULE_VIOLATION' || !trade.session_sweep;
      if (filterType === 'WITH_LINK') return Boolean(trade.chart_url);

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
      }
      if (sortBy === 'pnl_desc') {
        return b.net_pnl - a.net_pnl;
      }
      if (sortBy === 'pnl_asc') {
        return a.net_pnl - b.net_pnl;
      }
      return 0;
    });
  }, [trades, searchQuery, filterType, selectedInstrument, sortBy]);

  // Discipline badge renderer
  const renderDisciplineBadge = (discipline: Trade['discipline'], sweep: boolean) => {
    if (discipline === 'A_PLUS' && sweep) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          Qoida bo‘yicha (A+)
        </span>
      );
    }
    if (discipline === 'PARTIAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          Qisman
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap">
        <XCircle className="w-3 h-3 text-rose-400" />
        Qoidasiz / Sweep‘siz
      </span>
    );
  };

  // Mental state badge renderer
  const renderMentalStateBadge = (state: Trade['mental_state']) => {
    switch (state) {
      case 'Xotirjam':
        return <span className="text-xs px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-300 border border-teal-800">Xotirjam</span>;
      case 'Yurak siqildi':
        return <span className="text-xs px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800">Yurak siqildi</span>;
      case 'Bozor ochilishiga shoshilish':
        return <span className="text-xs px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800">Shoshilish</span>;
      case 'Asab / Alam olish':
        return <span className="text-xs px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800 font-bold">Alam olish</span>;
      default:
        return <span className="text-xs text-slate-400">{state}</span>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Search Bar Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Instrument, izoh yoki grafik linki bo‘yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors shadow-inner"
          />
        </div>

        {/* Right controls: Instrument filter + Sort + New Trade button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Instrument select */}
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/60"
          >
            <option value="ALL">Barcha instrumentlar ({availableInstruments.length})</option>
            {availableInstruments.map((inst) => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/60"
          >
            <option value="date_desc">Sana: Eng yangi</option>
            <option value="date_asc">Sana: Eng eski</option>
            <option value="pnl_desc">P&L: Eng yuqori foyda</option>
            <option value="pnl_asc">P&L: Eng yuqori zarar</option>
          </select>

          <button
            onClick={onOpenNewTrade}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Sdelka</span>
          </button>
        </div>
      </div>

      {/* Notion-style Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterType === 'ALL'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Barchasi ({trades.length})
        </button>

        <button
          onClick={() => setFilterType('WIN')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            filterType === 'WIN'
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Faqat Yutuqli (Win)</span>
        </button>

        <button
          onClick={() => setFilterType('LOSS')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterType === 'LOSS'
              ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
          }`}
        >
          Faqat Zararli (Loss)
        </button>

        <button
          onClick={() => setFilterType('WITH_LINK')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            filterType === 'WITH_LINK'
              ? 'bg-sky-950/60 text-sky-300 border border-sky-400/50 shadow-sm'
              : 'text-slate-400 hover:text-sky-300 hover:bg-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Grafikli Sdelkalar ({trades.filter((t) => Boolean(t.chart_url)).length})</span>
        </button>

        <button
          onClick={() => setFilterType('A_PLUS')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            filterType === 'A_PLUS'
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-400/50 shadow-sm'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Qoida bo‘yicha (A+)</span>
        </button>

        <button
          onClick={() => setFilterType('VIOLATION')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
            filterType === 'VIOLATION'
              ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Qoidasiz / Sweep‘siz</span>
        </button>
      </div>

      {/* Notion-Style Trade Database Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold select-none">
                <th className="py-3.5 px-4 font-mono">Sana & Vaqt</th>
                <th className="py-3.5 px-4 font-mono">Instrument</th>
                <th className="py-3.5 px-3">Yo‘nalish</th>
                <th className="py-3.5 px-3">Qty</th>
                <th className="py-3.5 px-3">Kirish</th>
                <th className="py-3.5 px-3">Stop Loss</th>
                <th className="py-3.5 px-3">TP / Chiqish</th>
                <th className="py-3.5 px-4 font-mono text-right">Sof P&L ($)</th>
                <th className="py-3.5 px-3 text-center">Grafik / Link</th>
                <th className="py-3.5 px-4">Qoidaga Amal</th>
                <th className="py-3.5 px-3">Ruhiy Holat</th>
                <th className="py-3.5 px-4 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-300">Birorta ham sdelka topilmadi</p>
                    <p className="text-xs text-slate-500 mt-1">Filtrlarni o‘zgartiring yoki yangi sdelkani qayd eting</p>
                    <button
                      onClick={onOpenNewTrade}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Birinchi Sdelkani Qo‘shish</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const isProfit = trade.net_pnl > 0;
                  const isLoss = trade.net_pnl < 0;

                  return (
                    <tr
                      key={trade.id}
                      onClick={() => onSelectTrade(trade)}
                      className="hover:bg-slate-850/60 transition-colors cursor-pointer group"
                    >
                      {/* Sana & Vaqt */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{trade.date}</div>
                        <div className="text-[11px] text-slate-500">{trade.time} • {trade.duration || '-'}</div>
                      </td>

                      {/* Instrument */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        <span className="font-extrabold text-white px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60">
                          {trade.instrument}
                        </span>
                      </td>

                      {/* Yo'nalish */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {trade.direction === 'Long' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <ArrowUpRight className="w-3 h-3" /> Long
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <ArrowDownRight className="w-3 h-3" /> Short
                          </span>
                        )}
                      </td>

                      {/* Kontrakt / Qty */}
                      <td className="py-3.5 px-3 font-mono font-medium text-slate-300 whitespace-nowrap">
                        {trade.quantity} ta
                      </td>

                      {/* Kirish narxi */}
                      <td className="py-3.5 px-3 font-mono text-slate-200 whitespace-nowrap">
                        {trade.entry_price.toLocaleString()}
                      </td>

                      {/* Stop Loss */}
                      <td className="py-3.5 px-3 font-mono text-rose-300/80 whitespace-nowrap">
                        {trade.stop_loss.toLocaleString()}
                      </td>

                      {/* Chiqish narxi */}
                      <td className="py-3.5 px-3 font-mono text-emerald-300/80 whitespace-nowrap">
                        {trade.exit_price.toLocaleString()}
                      </td>

                      {/* Sof P&L */}
                      <td className="py-3.5 px-4 font-mono font-bold text-right whitespace-nowrap">
                        <div className={`text-sm ${
                          isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {isProfit ? '+' : ''}${trade.net_pnl.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          komissiya: -${trade.commission.toFixed(2)}
                        </div>
                      </td>

                      {/* ⭐ GRAFIK / LINK USTUNI (CLICK TO VIEW OR ADD) ⭐ */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {trade.chart_url ? (
                          <a
                            href={trade.chart_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/60 hover:scale-105 transition-all shadow-sm"
                            title="TradingView grafigini yangi oynada ochish"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Grafik ↗</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => onSelectTrade(trade)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium text-slate-400 bg-slate-800/80 hover:bg-slate-700 hover:text-emerald-300 border border-slate-700/60 transition-colors"
                            title="Grafik havolasini qo‘yish"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>+ Link</span>
                          </button>
                        )}
                      </td>

                      {/* Qoidaga amal qilish */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderDisciplineBadge(trade.discipline, trade.session_sweep)}
                      </td>

                      {/* Ruhiy holat */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {renderMentalStateBadge(trade.mental_state)}
                      </td>

                      {/* Amallar */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectTrade(trade)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Tafsilotlar va Grafik"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTrade(trade)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Haqiqatan ham bu sdelkani o‘chirmoqchimisiz?')) {
                                onDeleteTrade(trade.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
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

        {/* Footer summary bar */}
        <div className="py-3 px-6 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Jami ko‘rsatilgan sdelkalar: <strong className="text-white font-mono">{filteredTrades.length}</strong> ta</span>
          <div className="flex items-center gap-4 font-mono">
            <span>Yutuq: <strong className="text-emerald-400">{filteredTrades.filter((t) => t.net_pnl > 0).length}</strong></span>
            <span>Zarar: <strong className="text-rose-400">{filteredTrades.filter((t) => t.net_pnl < 0).length}</strong></span>
            <span>Filtr bo‘yicha Sof P&L: <strong className={`font-bold ${filteredTrades.reduce((acc, t) => acc + t.net_pnl, 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${filteredTrades.reduce((acc, t) => acc + t.net_pnl, 0).toFixed(2)}</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
};
