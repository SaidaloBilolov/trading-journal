import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trade, UserSettings, PropAccount } from '../types/journal';

export const exportTradesToPDF = (
  trades: Trade[], 
  settings: UserSettings, 
  activeAccount?: PropAccount
): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.width; // 841.89 pt
  const pageHeight = doc.internal.pageSize.height; // 595.28 pt

  const initialBalance = activeAccount?.initial_balance || settings.initial_balance || 50000;
  const trailingDrawdownAmount = activeAccount?.trailing_drawdown_amount || 2000;
  const accountName = activeAccount?.name || 'Tradify 50K';

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl < 0);
  const totalNetPnl = trades.reduce((acc, t) => acc + t.net_pnl, 0);
  const currentBalance = initialBalance + totalNetPnl;
  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : '0';
  const profitPercentage = ((totalNetPnl / initialBalance) * 100).toFixed(2);

  // Profit Factor & Expectancy
  const grossProfit = wins.reduce((acc, t) => acc + t.net_pnl, 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.net_pnl, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? 'MAX' : '0.00';
  const expectancy = totalTrades > 0 ? (totalNetPnl / totalTrades).toFixed(2) : '0.00';
  const avgWin = wins.length > 0 ? (grossProfit / wins.length).toFixed(2) : '0.00';
  const avgLoss = losses.length > 0 ? (grossLoss / losses.length).toFixed(2) : '0.00';
  const totalCommission = trades.reduce((acc, t) => acc + (t.commission || 0), 0);

  // Largest win & loss
  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.net_pnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.net_pnl)) : 0;

  // Peak balance & Trailing Drawdown calculation
  let running = initialBalance;
  let peakBalance = initialBalance;
  const chronologicalTrades = [...trades].sort(
    (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  );

  const balancePoints: { xIdx: number; balance: number; trailingDd: number; pnl: number }[] = [
    { xIdx: 0, balance: initialBalance, trailingDd: initialBalance - trailingDrawdownAmount, pnl: 0 }
  ];

  chronologicalTrades.forEach((t, i) => {
    running += t.net_pnl;
    if (running > peakBalance) {
      peakBalance = running;
    }
    const currentTrailingDd = peakBalance - trailingDrawdownAmount;
    balancePoints.push({
      xIdx: i + 1,
      balance: running,
      trailingDd: currentTrailingDd,
      pnl: t.net_pnl
    });
  });

  const trailingLimit = peakBalance - trailingDrawdownAmount;
  const bufferRemaining = currentBalance - trailingLimit;

  // ==========================================
  // PAGE 1: EXECUTIVE DASHBOARD & EQUITY CHART
  // ==========================================

  // 1. Top Header Banner
  doc.setFillColor(11, 15, 25); // Slate 950
  doc.rect(0, 0, pageWidth, 68, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SAVDO JURNALI VA INTIZOM HISOBOTI (TRADIFY & NOTION)', 36, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(
    `Prop Hisob: ${accountName}   |   Sana: ${new Date().toLocaleString('uz-UZ')}   |   Jami sdelkalar: ${totalTrades} ta   |   Tradovate MNQ/MGC`, 
    36, 48
  );

  // Status Pill
  doc.setFillColor(16, 185, 129); // Emerald
  doc.roundedRect(pageWidth - 140, 20, 104, 26, 4, 4, 'F');
  doc.setTextColor(11, 15, 25);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('JONLI HISOBOT', pageWidth - 128, 36);

  // 2. Summary KPI Cards Grid (2 rows)
  const kpiTop = 80;
  const cardWidth = (pageWidth - 72 - 30) / 4; // 4 columns
  const cardHeight = 44;

  const drawKpiCard = (x: number, y: number, label: string, val: string, sub: string, valColor: number[]) => {
    doc.setFillColor(248, 250, 252); // light slate
    doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'D');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 8, y + 13);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(valColor[0], valColor[1], valColor[2]);
    doc.text(val, x + 8, y + 28);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(sub, x + 8, y + 38);
  };

  // Row 1
  drawKpiCard(36, kpiTop, 'Boshlang‘ich Balans', `$${initialBalance.toLocaleString()}`, `${accountName}`, [15, 23, 42]);
  drawKpiCard(36 + cardWidth + 10, kpiTop, 'Joriy Balans', `$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `Pik: $${peakBalance.toFixed(2)}`, [15, 23, 42]);
  drawKpiCard(
    36 + (cardWidth + 10) * 2, 
    kpiTop, 
    'Sof Foyda / Zarar', 
    `${totalNetPnl >= 0 ? '+' : ''}$${totalNetPnl.toFixed(2)}`, 
    `Daromad: ${Number(profitPercentage) >= 0 ? '+' : ''}${profitPercentage}%`, 
    totalNetPnl >= 0 ? [16, 185, 129] : [244, 63, 94]
  );
  drawKpiCard(
    36 + (cardWidth + 10) * 3, 
    kpiTop, 
    'Yutuq Foizi (Win Rate)', 
    `${winRate}%`, 
    `${wins.length}W / ${losses.length}L`, 
    [15, 23, 42]
  );

  // Row 2
  const kpiRow2 = kpiTop + cardHeight + 8;
  drawKpiCard(36, kpiRow2, 'Profit Factor', `${profitFactor}`, `Kutilma: +$${expectancy}`, [16, 185, 129]);
  drawKpiCard(36 + cardWidth + 10, kpiRow2, 'Eng Katta Yutuq', `+$${largestWin.toFixed(2)}`, `O‘rtacha: +$${avgWin}`, [16, 185, 129]);
  drawKpiCard(36 + (cardWidth + 10) * 2, kpiRow2, 'Eng Katta Zarar', `-$${Math.abs(largestLoss).toFixed(2)}`, `O‘rtacha: -$${avgLoss}`, [244, 63, 94]);
  drawKpiCard(
    36 + (cardWidth + 10) * 3, 
    kpiRow2, 
    'Trailing Drawdown Buferi', 
    `$${bufferRemaining.toFixed(2)}`, 
    `Sliv chegarasi: $${trailingLimit.toFixed(2)}`, 
    bufferRemaining > 1000 ? [16, 185, 129] : [244, 63, 94]
  );

  // 3. ⭐ VECTOR-DRAWN EQUITY GROWTH & DRAWDOWN CHART ⭐
  const chartX = 36;
  const chartY = kpiRow2 + cardHeight + 14;
  const chartW = pageWidth - 72; // ~770 pt
  const chartH = 210;

  // Chart Frame Background
  doc.setFillColor(15, 23, 42); // slate-900 dark background
  doc.roundedRect(chartX, chartY, chartW, chartH, 6, 6, 'F');
  doc.setDrawColor(30, 41, 59);
  doc.roundedRect(chartX, chartY, chartW, chartH, 6, 6, 'D');

  // Chart Header & Legend
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('BALANS O‘SISHI VA TUSHISHI GRAFIGI (EQUITY CURVE & TRAILING DRAWDOWN)', chartX + 16, chartY + 20);

  // Legend
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  // Green line legend
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(2.5);
  doc.setLineDashPattern([], 0);
  doc.line(chartX + chartW - 270, chartY + 16, chartX + chartW - 250, chartY + 16);
  doc.setTextColor(203, 213, 225);
  doc.text('Balans (Equity)', chartX + chartW - 245, chartY + 19);

  // Red dashed line legend
  doc.setDrawColor(244, 63, 94);
  doc.setLineWidth(1.5);
  doc.setLineDashPattern([3, 2], 0);
  doc.line(chartX + chartW - 165, chartY + 16, chartX + chartW - 145, chartY + 16);
  doc.setTextColor(203, 213, 225);
  doc.text('Trailing Drawdown (-2K)', chartX + chartW - 140, chartY + 19);

  // Chart Plot Area
  const plotLeft = chartX + 54;
  const plotRight = chartX + chartW - 20;
  const plotTop = chartY + 36;
  const plotBottom = chartY + chartH - 24;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  // Determine Min and Max for Y axis
  const allBalances = balancePoints.map((p) => p.balance);
  const allTrailing = balancePoints.map((p) => p.trailingDd);
  const minVal = Math.floor(Math.min(...allBalances, ...allTrailing, initialBalance - trailingDrawdownAmount) / 200) * 200;
  const maxVal = Math.ceil(Math.max(...allBalances, peakBalance + 100) / 200) * 200;
  const valRange = Math.max(maxVal - minVal, 1000);

  const getYCoord = (val: number) => {
    const norm = (val - minVal) / valRange;
    return plotBottom - norm * plotH;
  };

  const getXCoord = (idx: number) => {
    if (balancePoints.length <= 1) return plotLeft;
    return plotLeft + (idx / (balancePoints.length - 1)) * plotW;
  };

  // Draw Horizontal Grid Lines and Y-Axis Labels
  const gridSteps = 4;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);

  for (let g = 0; g <= gridSteps; g++) {
    const val = minVal + (valRange / gridSteps) * g;
    const y = getYCoord(val);
    doc.line(plotLeft, y, plotRight, y);
    doc.text(`$${Math.round(val).toLocaleString()}`, chartX + 12, y + 2.5);
  }

  // Draw Initial Balance Reference Line ($50,000)
  const initialY = getYCoord(initialBalance);
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.8);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(plotLeft, initialY, plotRight, initialY);

  // Draw Trailing Drawdown Dashed Line (Red)
  doc.setDrawColor(244, 63, 94); // rose-500
  doc.setLineWidth(1.4);
  doc.setLineDashPattern([3, 2], 0);

  for (let i = 0; i < balancePoints.length - 1; i++) {
    const x1 = getXCoord(i);
    const y1 = getYCoord(balancePoints[i].trailingDd);
    const x2 = getXCoord(i + 1);
    const y2 = getYCoord(balancePoints[i + 1].trailingDd);
    doc.line(x1, y1, x2, y2);
  }

  // Draw Equity Curve Polyline (Emerald Green)
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(2.0);
  doc.setLineDashPattern([], 0);

  for (let i = 0; i < balancePoints.length - 1; i++) {
    const x1 = getXCoord(i);
    const y1 = getYCoord(balancePoints[i].balance);
    const x2 = getXCoord(i + 1);
    const y2 = getYCoord(balancePoints[i + 1].balance);
    doc.line(x1, y1, x2, y2);
  }

  // Start & End Milestone Dots
  const startX = getXCoord(0);
  const startY = getYCoord(initialBalance);
  doc.setFillColor(59, 130, 246); // blue
  doc.circle(startX, startY, 3, 'F');

  const endX = getXCoord(balancePoints.length - 1);
  const endY = getYCoord(currentBalance);
  doc.setFillColor(16, 185, 129); // green
  doc.circle(endX, endY, 3.5, 'F');

  // Peak Milestone Dot
  let maxIdx = 0;
  let maxB = initialBalance;
  balancePoints.forEach((p, idx) => {
    if (p.balance > maxB) {
      maxB = p.balance;
      maxIdx = idx;
    }
  });
  if (maxIdx > 0 && maxIdx < balancePoints.length - 1) {
    const peakX = getXCoord(maxIdx);
    const peakY = getYCoord(maxB);
    doc.setFillColor(251, 191, 36); // amber
    doc.circle(peakX, peakY, 3.5, 'F');
  }

  // Bottom Timeline Labels
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  if (chronologicalTrades.length > 0) {
    doc.text(`Boshlanish: ${chronologicalTrades[0].date}`, plotLeft, plotBottom + 14);
    const midTrade = chronologicalTrades[Math.floor(chronologicalTrades.length / 2)];
    if (midTrade) {
      doc.text(`O‘rta muddat: ${midTrade.date}`, plotLeft + plotW / 2 - 30, plotBottom + 14);
    }
    doc.text(`Oxirgi sana: ${chronologicalTrades[chronologicalTrades.length - 1].date}`, plotRight - 90, plotBottom + 14);
  }

  // 4. Discipline & Summary Footer Notes on Page 1
  const noteY = chartY + chartH + 12;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36, noteY, chartW, 46, 4, 4, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(36, noteY, chartW, 46, 4, 4, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('INTIZOM VA STRATEGIYA TAHLILI XULOSASI:', 48, noteY + 16);

  const aPlusTrades = trades.filter((t) => t.discipline === 'A_PLUS' || t.followed_rules === true).length;
  const sweepTrades = trades.filter((t) => t.session_sweep).length;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `• Jami sdelkalarning ${sweepTrades} tasi (${totalTrades > 0 ? ((sweepTrades / totalTrades) * 100).toFixed(1) : 0}%) Sessiya Sweep qoidasi asosida ochilgan.`,
    48, noteY + 28
  );
  doc.text(
    `• Qoida bo‘yicha to‘liq A+ sdelkalar: ${aPlusTrades} ta. Jami komissiya xarajati: -$${totalCommission.toFixed(2)}. Trailing Drawdown xavfsiz buferi: $${bufferRemaining.toFixed(2)}.`,
    48, noteY + 39
  );

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('1-sahifa / 2+ (Barcha sdelkalar ro‘yxati keyingi sahifalarda)', pageWidth - 260, pageHeight - 16);

  // ==========================================
  // PAGE 2+: DETAILED NOTION TRADE LOG TABLE
  // ==========================================
  doc.addPage('a4', 'landscape');

  // Page 2 Header Banner
  doc.setFillColor(11, 15, 25);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`SAVDO JURNALI — SDELKALAR RO‘YXATI (${accountName})`, 36, 26);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Jami: ${totalTrades} ta sdelka  |  Yutuq: ${wins.length}  |  Zarar: ${losses.length}  |  Sof P&L: ${totalNetPnl >= 0 ? '+' : ''}$${totalNetPnl.toFixed(2)}`, pageWidth - 320, 26);

  // Table Data Mapping
  const tableData = trades.map((t, idx) => {
    const isWin = t.net_pnl > 0;
    const isLoss = t.net_pnl < 0;
    const resultText = isWin ? 'Yutuq' : isLoss ? 'Zarar' : 'B/E';
    const rulesText = (t.followed_rules !== undefined ? t.followed_rules : t.session_sweep) ? 'DA' : 'NET';

    return [
      idx + 1,
      t.date,
      t.time,
      t.instrument,
      t.direction,
      t.quantity,
      t.entry_price || '-',
      t.stop_loss || '-',
      t.exit_price || '-',
      `${t.net_pnl >= 0 ? '+' : ''}$${t.net_pnl.toFixed(2)}`,
      rulesText,
      resultText,
      t.rr_ratio !== undefined ? `${t.rr_ratio}` : '-',
      t.duration || '-',
      t.chart_url || t.before_photo || '-',
    ];
  });

  autoTable(doc, {
    startY: 50,
    head: [[
      '#',
      'Sana',
      'Vaqt',
      'Para',
      'Pozitsiya',
      'Qty',
      'Kirish',
      'SL',
      'TP',
      'Sof P&L',
      'Qoida',
      'Natija',
      'R:R',
      'Vaqt',
      'Grafik Link',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'center', cellWidth: 50 },
      2: { halign: 'center', cellWidth: 36 },
      3: { halign: 'center', fontStyle: 'bold', cellWidth: 46 },
      4: { halign: 'center', cellWidth: 44 },
      5: { halign: 'center', cellWidth: 24 },
      6: { halign: 'right', cellWidth: 52 },
      7: { halign: 'right', cellWidth: 52 },
      8: { halign: 'right', cellWidth: 52 },
      9: { halign: 'right', fontStyle: 'bold', cellWidth: 56 },
      10: { halign: 'center', fontStyle: 'bold', cellWidth: 36 },
      11: { halign: 'center', cellWidth: 44 },
      12: { halign: 'center', cellWidth: 32 },
      13: { halign: 'center', cellWidth: 50 },
      14: { halign: 'left', cellWidth: 200 },
    },
    didParseCell: (data) => {
      // Color Sof P&L column
      if (data.section === 'body' && data.column.index === 9) {
        const raw = String(data.cell.raw);
        if (raw.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129]; // green
        } else if (raw.startsWith('-')) {
          data.cell.styles.textColor = [244, 63, 94]; // red
        }
      }
      // Color Qoida column (DA / NET)
      if (data.section === 'body' && data.column.index === 10) {
        const raw = String(data.cell.raw);
        if (raw === 'DA') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [244, 63, 94];
        }
      }
    },
    margin: { left: 36, right: 36, bottom: 20 },
  });

  // Save the PDF file
  const fileName = `Savdo_Jurnali_${accountName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
