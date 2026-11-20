import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calculator, 
  Calendar, 
  Clock, 
  DollarSign, 
  Link as LinkIcon, 
  ShieldCheck, 
  AlertTriangle,
  Brain
} from 'lucide-react';
import { Trade, TradeDirection, DisciplineLevel, MentalState } from '../types/journal';

interface NewTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  editTrade?: Trade | null;
  prefillChecklistScore?: number;
  prefillChecklistTotal?: number;
  prefillSessionSweep?: boolean;
}

export const NewTradeModal: React.FC<NewTradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTrade,
  prefillChecklistScore = 5,
  prefillChecklistTotal = 5,
  prefillSessionSweep = true,
}) => {
  const [instrument, setInstrument] = useState('MNQZ6');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [direction, setDirection] = useState<TradeDirection>('Long');
  const [quantity, setQuantity] = useState(1);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [grossPnl, setGrossPnl] = useState<string>('');
  const [commission, setCommission] = useState<string>('1.24');
  const [netPnl, setNetPnl] = useState<string>('');
  const [duration, setDuration] = useState('15m 00s');
  const [checklistScore, setChecklistScore] = useState(5);
  const [checklistTotal, setChecklistTotal] = useState(5);
  const [sessionSweep, setSessionSweep] = useState(true);
  const [discipline, setDiscipline] = useState<DisciplineLevel>('A_PLUS');
  const [mentalState, setMentalState] = useState<MentalState>('Xotirjam');
  const [notes, setNotes] = useState('');
  const [chartUrl, setChartUrl] = useState('');

  // Populate form if editing or when opened with prefill
  useEffect(() => {
    if (editTrade) {
      setInstrument(editTrade.instrument);
      setDate(editTrade.date);
      setTime(editTrade.time);
      setDirection(editTrade.direction);
      setQuantity(editTrade.quantity);
      setEntryPrice(String(editTrade.entry_price));
      setStopLoss(String(editTrade.stop_loss));
      setExitPrice(String(editTrade.exit_price));
      setGrossPnl(String(editTrade.gross_pnl));
      setCommission(String(editTrade.commission));
      setNetPnl(String(editTrade.net_pnl));
      setDuration(editTrade.duration);
      setChecklistScore(editTrade.checklist_score);
      setChecklistTotal(editTrade.checklist_total);
      setSessionSweep(editTrade.session_sweep);
      setDiscipline(editTrade.discipline);
      setMentalState(editTrade.mental_state);
      setNotes(editTrade.notes);
      setChartUrl(editTrade.chart_url);
    } else {
      // Reset for new trade
      setInstrument('MNQZ6');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDirection('Long');
      setQuantity(1);
      setEntryPrice('');
      setStopLoss('');
      setExitPrice('');
      setGrossPnl('');
      setCommission('1.24');
      setNetPnl('');
      setDuration('12m 30s');
      setChecklistScore(prefillChecklistScore);
      setChecklistTotal(prefillChecklistTotal);
      setSessionSweep(prefillSessionSweep);
      setDiscipline(prefillChecklistScore >= 4 && prefillSessionSweep ? 'A_PLUS' : 'PARTIAL');
      setMentalState('Xotirjam');
      setNotes('');
      setChartUrl('');
    }
  }, [editTrade, isOpen, prefillChecklistScore, prefillChecklistTotal, prefillSessionSweep]);

  // Auto-calculate P&L from Entry & Exit prices if user wishes
  const handleAutoCalculatePnl = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const comm = parseFloat(commission) || 0;
    const qty = quantity || 1;

    if (!isNaN(entry) && !isNaN(exit)) {
      const pointDifference = direction === 'Long' ? exit - entry : entry - exit;
      
      // Calculate dollar multiplier based on instrument
      let pointValue = 2; // Default MNQ: $2 per point
      if (instrument.startsWith('MNQ')) pointValue = 2;
      else if (instrument.startsWith('MES')) pointValue = 5;
      else if (instrument.startsWith('MGC')) pointValue = 10;
      else if (instrument.startsWith('NQ')) pointValue = 20;
      else if (instrument.startsWith('ES')) pointValue = 50;
      else if (instrument.startsWith('GC')) pointValue = 100;

      const calcGross = pointDifference * pointValue * qty;
      const calcNet = calcGross - comm;

      setGrossPnl(calcGross.toFixed(2));
      setNetPnl(calcNet.toFixed(2));
    }
  };

  // Recalculate Net P&L if Gross P&L or Commission changes
  const handleGrossChange = (val: string) => {
    setGrossPnl(val);
    const g = parseFloat(val);
    const c = parseFloat(commission) || 0;
    if (!isNaN(g)) {
      setNetPnl((g - c).toFixed(2));
    }
  };

  const handleCommissionChange = (val: string) => {
    setCommission(val);
    const g = parseFloat(grossPnl);
    const c = parseFloat(val) || 0;
    if (!isNaN(g)) {
      setNetPnl((g - c).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalGross = parseFloat(grossPnl) || 0;
    const finalComm = parseFloat(commission) || 0;
    const finalNet = parseFloat(netPnl) || (finalGross - finalComm);

    const newTrade: Trade = {
      id: editTrade ? editTrade.id : `tr-${Date.now()}`,
      date,
      time,
      instrument: instrument.trim().toUpperCase(),
      direction,
      quantity: Number(quantity) || 1,
      entry_price: parseFloat(entryPrice) || 0,
      stop_loss: parseFloat(stopLoss) || 0,
      exit_price: parseFloat(exitPrice) || 0,
      gross_pnl: finalGross,
      commission: finalComm,
      net_pnl: finalNet,
      duration: duration.trim() || '0m',
      checklist_score: Number(checklistScore) || 0,
      checklist_total: Number(checklistTotal) || 5,
      discipline,
      session_sweep: sessionSweep,
      mental_state: mentalState,
      notes: notes.trim(),
      chart_url: chartUrl.trim(),
      created_at: editTrade ? editTrade.created_at : new Date().toISOString(),
    };

    onSave(newTrade);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 z-10">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{editTrade ? 'Sdelkani Tahrirlash' : 'Yangi Sdelkani Qayd Etish'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notion uslubidagi to‘liq savdo jurnali yozuvi
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Quick Instrument Selection & Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Instrument
              </label>
              <div className="flex gap-1.5 mb-2">
                {['MNQZ6', 'MGCZ6', 'MESZ6', 'XAU/USD'].map((inst) => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => setInstrument(inst)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      instrument === inst
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                placeholder="masalan: MNQZ6, MGCZ6, MESZ6"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Yo‘nalish (Direction)
              </label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setDirection('Long')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    direction === 'Long'
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Long (Buy)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('Short')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    direction === 'Short'
                      ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500 shadow-lg shadow-rose-950/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Short (Sell)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Date, Time, Qty & Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Sana</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Vaqt</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Kontrakt (Qty)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Davomiyligi</label>
              <input
                type="text"
                placeholder="masalan: 14m 20s"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 3. Execution Prices (Entry, SL, TP) + Auto calculate button */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Kirish, SL va Chiqish Narxlari
              </span>
              <button
                type="button"
                onClick={handleAutoCalculatePnl}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                title="Narxlardan P&L ni hisoblash"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>P&L Hisoblash</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Kirish Narxi</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="21150.25"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-rose-400 block mb-1">Stop Loss (SL)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="21172.50"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-emerald-400 block mb-1">Chiqish Narxi (TP)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="21085.00"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 4. Financials (Gross, Commission, Net P&L) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Yalpi P&L ($)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="130.50 yoki -45.00"
                value={grossPnl}
                onChange={(e) => handleGrossChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Komissiya ($)</label>
              <input
                type="number"
                step="any"
                value={commission}
                onChange={(e) => handleCommissionChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Sof P&L ($)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="129.26"
                value={netPnl}
                onChange={(e) => setNetPnl(e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:outline-none ${
                  parseFloat(netPnl) > 0 
                    ? 'border-emerald-500/60 text-emerald-400' 
                    : parseFloat(netPnl) < 0 
                    ? 'border-rose-500/60 text-rose-400' 
                    : 'border-slate-800 text-white'
                }`}
              />
            </div>
          </div>

          {/* 5. Discipline & Session Sweep Controls */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Intizom va Qoidalarga Amal Qilish
            </span>

            {/* Session sweep toggle */}
            <div 
              onClick={() => setSessionSweep(!sessionSweep)}
              className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                sessionSweep 
                  ? 'bg-emerald-950/40 border-emerald-500/50' 
                  : 'bg-rose-950/30 border-rose-500/50'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-white block">Sessiya High / Low Sweep Bajarildimi?</span>
                <span className="text-[11px] text-slate-400">Osiyo, London yoki avvalgi sessiya likvidligi olingan bo‘lishi shart</span>
              </div>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                sessionSweep ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
              }`}>
                {sessionSweep ? 'HA' : 'YO‘Q'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tekshiruv Bali</label>
                <select
                  value={checklistScore}
                  onChange={(e) => setChecklistScore(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value={5}>5 / 5 (To‘liq)</option>
                  <option value={4}>4 / 5 (Yaxshi)</option>
                  <option value={3}>3 / 5 (O‘rtacha)</option>
                  <option value={2}>2 / 5 (Kamchilikli)</option>
                  <option value={1}>1 / 5 (Juda past)</option>
                  <option value={0}>0 / 5 (Checklist yo‘q)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Qoidaga Amal</label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value as DisciplineLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="A_PLUS">Qoida bo‘yicha (A+)</option>
                  <option value="PARTIAL">Qisman bajarildi</option>
                  <option value="RULE_VIOLATION">Qoidasiz / Sweep‘siz</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Ruhiy Holat</label>
                <select
                  value={mentalState}
                  onChange={(e) => setMentalState(e.target.value as MentalState)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Xotirjam">Xotirjam</option>
                  <option value="Yurak siqildi">Yurak siqildi</option>
                  <option value="Bozor ochilishiga shoshilish">Bozor ochilishiga shoshilish</option>
                  <option value="Asab / Alam olish">Asab / Alam olish</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6. Notes & Chart URL */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Izoh va Xulosalar</label>
            <textarea
              rows={3}
              placeholder="Sdelkaga kirish sababi, FVG/OB holati, hissiyotlar va xatolar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Grafik Havolasi (TradingView yoki Rasm URL)</label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://www.tradingview.com/x/... yoki rasm havolasi"
                value={chartUrl}
                onChange={(e) => setChartUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
            >
              Bekor Qilish
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition-all hover:scale-102"
            >
              <Check className="w-4 h-4" />
              <span>{editTrade ? 'O‘zgarishlarni Saqlash' : 'Sdelkani Saqlash'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
