import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trade, UserSettings } from '../types/journal';

export const exportTradesToPDF = (trades: Trade[], settings: UserSettings): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl < 0);
  const totalNetPnl = trades.reduce((acc, t) => acc + t.net_pnl, 0);
  const currentBalance = settings.initial_balance + totalNetPnl;
  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : '0';

  // Largest win & loss
  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.net_pnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.net_pnl)) : 0;

  // Title & Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, doc.internal.pageSize.width, 70, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SAVDO JURNALI VA INTIZOM QALQONI (NOTION & TRADOVATE)', 40, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Eksport qilingan sana: ${new Date().toLocaleString('uz-UZ')}  |  Jami sdelkalar: ${totalTrades} ta`, 40, 52);

  // Summary KPI Cards Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(40, 85, doc.internal.pageSize.width - 80, 50, 6, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 85, doc.internal.pageSize.width - 80, 50, 6, 6, 'D');

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Boshlang‘ich Balans', 55, 102);
  doc.text('Joriy Balans', 175, 102);
  doc.text('Sof Foyda / Zarar', 295, 102);
  doc.text('Yutuq Foizi (Win Rate)', 430, 102);
  doc.text('Eng Katta Yutuq', 565, 102);
  doc.text('Eng Katta Zarar', 690, 102);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`$${settings.initial_balance.toLocaleString()}`, 55, 122);
  doc.text(`$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 175, 122);

  // P&L color
  if (totalNetPnl >= 0) {
    doc.setTextColor(16, 185, 129); // green
  } else {
    doc.setTextColor(244, 63, 94); // red
  }
  doc.text(`${totalNetPnl >= 0 ? '+' : ''}$${totalNetPnl.toFixed(2)}`, 295, 122);

  doc.setTextColor(15, 23, 42);
  doc.text(`${winRate}% (${wins.length}W / ${losses.length}L)`, 430, 122);

  doc.setTextColor(16, 185, 129);
  doc.text(`+$${largestWin.toFixed(2)}`, 565, 122);

  doc.setTextColor(244, 63, 94);
  doc.text(`-$${Math.abs(largestLoss).toFixed(2)}`, 690, 122);

  // Table rows
  const tableData = trades.map((t, idx) => {
    const isWin = t.net_pnl > 0;
    const isLoss = t.net_pnl < 0;
    const resultText = isWin ? 'Yutuq (Win)' : isLoss ? 'Zarar (Loss)' : 'B/E';
    const rulesText = (t.followed_rules !== undefined ? t.followed_rules : t.session_sweep) ? 'DA' : 'NET';

    return [
      idx + 1,
      t.date,
      t.time,
      t.instrument,
      t.direction,
      t.quantity,
      t.entry_price,
      t.stop_loss,
      t.exit_price,
      `${t.net_pnl >= 0 ? '+' : ''}$${t.net_pnl.toFixed(2)}`,
      rulesText,
      resultText,
      t.duration || '-',
      t.chart_url || t.before_photo || '-',
    ];
  });

  autoTable(doc, {
    startY: 150,
    head: [[
      '№', 'Sana', 'Vaqt', 'Para', 'Pozitsiya', 'Qty', 'Kirish', 'SL', 'TP', 'Sof P&L', 'Qoida', 'Natija', 'Vaqt', 'Grafik Link'
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 55, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 50, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 45, halign: 'center' },
      5: { cellWidth: 30, halign: 'center' },
      6: { cellWidth: 50, halign: 'right' },
      7: { cellWidth: 50, halign: 'right' },
      8: { cellWidth: 50, halign: 'right' },
      9: { cellWidth: 55, halign: 'right', fontStyle: 'bold' },
      10: { cellWidth: 40, halign: 'center' },
      11: { cellWidth: 60, halign: 'center' },
      12: { cellWidth: 55, halign: 'center' },
      13: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      // Colorize Sof P&L column
      if (data.section === 'body' && data.column.index === 9) {
        const text = String(data.cell.raw);
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (text.startsWith('-') || text.startsWith('-$')) {
          data.cell.styles.textColor = [244, 63, 94];
        }
      }
      // Colorize Qoida
      if (data.section === 'body' && data.column.index === 10) {
        const val = String(data.cell.raw);
        if (val === 'DA') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [244, 63, 94];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Savdo_Jurnali_Notion_${todayStr}.pdf`);
};
