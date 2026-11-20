import * as XLSX from 'xlsx';
import { Trade, UserSettings } from '../types/journal';

export const exportTradesToExcel = (trades: Trade[], settings: UserSettings): void => {
  // 1. Prepare Notion-style Trades Data Sheet
  const tradesData = trades.map((t, idx) => {
    const isWin = t.net_pnl > 0;
    const isLoss = t.net_pnl < 0;
    const resultText = isWin ? 'Прибыльная (Win)' : isLoss ? 'Убыточная (Loss)' : 'БУ (BE)';
    const rulesText = (t.followed_rules !== undefined ? t.followed_rules : t.session_sweep) ? 'ДА' : 'НЕТ';
    const emotionText = t.mental_state || 'NO';

    return {
      '№': idx + 1,
      'Сделка': t.id,
      'Дата': t.date,
      'Время': t.time,
      'Пара': t.instrument,
      'Позиция': t.direction,
      'Эмоция какая была?': emotionText,
      'Риск': t.risk_percent !== undefined ? t.risk_percent : 0.2,
      'SL': t.sl_pips !== undefined ? t.sl_pips : (isLoss ? -1 : 0),
      'R:R': t.rr_ratio !== undefined ? t.rr_ratio : (isWin ? 2.5 : isLoss ? -1 : 0),
      'Соблюдал ли ты правила?': rulesText,
      'Прибыль %': `${((t.net_pnl / settings.initial_balance) * 100).toFixed(2)}%`,
      'Итог ($)': Number(t.net_pnl.toFixed(2)),
      'Результат': resultText,
      'Before Trade / Photo': t.before_photo || t.chart_url || '-',
      'Причины сделки': t.entry_reason || t.notes || '-',
      'In Trade Photo': t.in_trade_photo || '-',
      'After Trade / Photo': t.after_photo || '-',
      'Причины Stop Loss': t.sl_reason || (isLoss ? 'Bozor kutilgan yo‘nalishda yurmadi' : '-'),
      'Торговая сессия': t.trading_session || '17:00 – 21:00 (NY Ochiq sessiyasi)',
      'Категория ошибки': t.mistake_category || (isWin ? '🟢 Нет ошибки (TP)' : 'Savdo xatosi / Sabrsizlik'),
      'HTF Trend': t.htf_trend || '🟢 Bullish',
      'SMT Divergence about': t.smt_divergence || '-',
    };
  });

  // 2. Prepare Summary Metrics Sheet (Tradify Analytics)
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl < 0);
  const totalNetPnl = trades.reduce((acc, t) => acc + t.net_pnl, 0);
  const totalGrossPnl = trades.reduce((acc, t) => acc + t.gross_pnl, 0);
  const totalCommission = trades.reduce((acc, t) => acc + t.commission, 0);
  const currentBalance = settings.initial_balance + totalNetPnl;
  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : '0';

  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.net_pnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.net_pnl)) : 0;

  const sumGrossProfit = wins.reduce((acc, t) => acc + t.gross_pnl, 0);
  const sumGrossLoss = Math.abs(losses.reduce((acc, t) => acc + t.gross_pnl, 0));
  const profitFactor = sumGrossLoss > 0 ? (sumGrossProfit / sumGrossLoss).toFixed(2) : 'MAX';
  const avgWin = wins.length > 0 ? sumGrossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? sumGrossLoss / losses.length : 0;

  const summaryData = [
    { 'Parametr / Ko‘rsatkich': 'Boshlang‘ich Balans ($)', 'Qiymat': `$${settings.initial_balance.toLocaleString()}` },
    { 'Parametr / Ko‘rsatkich': 'Joriy Balans ($)', 'Qiymat': `$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { 'Parametr / Ko‘rsatkich': 'Sof Foyda / Zarar ($)', 'Qiymat': `$${totalNetPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { 'Parametr / Ko‘rsatkich': 'Yalpi P&L ($)', 'Qiymat': `$${totalGrossPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { 'Parametr / Ko‘rsatkich': 'Jami Komissiya ($)', 'Qiymat': `$${totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { 'Parametr / Ko‘rsatkich': 'Jami Sdelkalar Soni', 'Qiymat': totalTrades },
    { 'Parametr / Ko‘rsatkich': 'Yutuqli Sdelkalar (Wins)', 'Qiymat': `${wins.length} ta (${winRate}%)` },
    { 'Parametr / Ko‘rsatkich': 'Zararli Sdelkalar (Losses)', 'Qiymat': `${losses.length} ta` },
    { 'Parametr / Ko‘rsatkich': 'Profit Factor', 'Qiymat': profitFactor },
    { 'Parametr / Ko‘rsatkich': 'Eng Katta Yutuq (Largest Win)', 'Qiymat': `+$${largestWin.toFixed(2)}` },
    { 'Parametr / Ko‘rsatkich': 'Eng Katta Zarar (Largest Loss)', 'Qiymat': `-$${Math.abs(largestLoss).toFixed(2)}` },
    { 'Parametr / Ko‘rsatkich': 'O‘rtacha Yutuq (Avg Win)', 'Qiymat': `$${avgWin.toFixed(2)}` },
    { 'Parametr / Ko‘rsatkich': 'O‘rtacha Zarar (Avg Loss)', 'Qiymat': `-$${avgLoss.toFixed(2)}` },
    { 'Parametr / Ko‘rsatkich': 'Eksport qilingan sana', 'Qiymat': new Date().toLocaleString('uz-UZ') },
  ];

  const workbook = XLSX.utils.book_new();
  const tradesSheet = XLSX.utils.json_to_sheet(tradesData);
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);

  tradesSheet['!cols'] = [
    { wch: 4 },  // №
    { wch: 10 }, // Сделка
    { wch: 12 }, // Дата
    { wch: 8 },  // Время
    { wch: 12 }, // Пара
    { wch: 10 }, // Позиция
    { wch: 18 }, // Эмоция
    { wch: 8 },  // Риск
    { wch: 8 },  // SL
    { wch: 8 },  // R:R
    { wch: 22 }, // Соблюдал правила
    { wch: 12 }, // Прибыль %
    { wch: 14 }, // Итог
    { wch: 18 }, // Результат
    { wch: 35 }, // Before Trade
    { wch: 40 }, // Причины сделки
    { wch: 35 }, // In Trade Photo
    { wch: 35 }, // After Trade Photo
    { wch: 40 }, // Причины Stop Loss
    { wch: 30 }, // Торговая сессия
    { wch: 25 }, // Категория ошибки
    { wch: 14 }, // HTF Trend
    { wch: 35 }, // SMT Divergence
  ];

  summarySheet['!cols'] = [
    { wch: 38 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(workbook, tradesSheet, 'Notion Jurnali');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tradify Statistika');

  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Savdo_Jurnali_Notion_${todayStr}.xlsx`);
};
