import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { PreTradeChecklist } from './components/PreTradeChecklist';
import { DailyShieldWidget } from './components/DailyShieldWidget';
import { NotionJournalTable } from './components/NotionJournalTable';
import { TradifyDashboard } from './components/TradifyDashboard';
import { TradeDetailDrawer } from './components/TradeDetailDrawer';
import { NewTradeModal } from './components/NewTradeModal';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { SettingsModal } from './components/SettingsModal';
import { PropAccountModal } from './components/PropAccountModal';
import { Trade, UserSettings, ChecklistItem, PropAccount } from './types/journal';
import { 
  fetchAllTrades, 
  createTradeRecord, 
  updateTradeRecord, 
  deleteTradeRecord, 
  getLocalSettings, 
  setLocalSettings, 
  getLocalChecklistItems, 
  setLocalChecklistItems,
  getLocalPropAccounts,
  setLocalPropAccounts,
  getActiveAccountId,
  setActiveAccountId,
  setLocalTrades,
  resetAllToDemo
} from './services/storage';
import { exportTradesToExcel } from './utils/excelExport';
import { exportTradesToPDF } from './utils/pdfExport';
import { Download, FileText, Check } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'tradify' | 'notion' | 'checklist' | 'analytics'>('tradify');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getLocalSettings());
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(getLocalChecklistItems());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Prop Accounts state
  const [accounts, setAccounts] = useState<PropAccount[]>(getLocalPropAccounts());
  const [activeAccountId, setActiveAccountIdState] = useState<string>(getActiveAccountId());
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  
  // Modals & Drawers state
  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState(false);
  const [selectedTradeForDetail, setSelectedTradeForDetail] = useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Prefill state from checklist
  const [prefillChecklistScore, setPrefillChecklistScore] = useState(5);
  const [prefillChecklistTotal, setPrefillChecklistTotal] = useState(5);
  const [prefillSessionSweep, setPrefillSessionSweep] = useState(true);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      const res = await fetchAllTrades(settings);
      setTrades(res.trades);
      setIsSupabaseConnected(res.isSupabase);
    };
    loadData();
  }, []);

  // Active Prop Account
  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.id === activeAccountId) || accounts[0] || {
      id: 'acc-tradify',
      name: 'Tradify 50K',
      firm: 'Tradify',
      initial_balance: 50000,
      trailing_drawdown_amount: 2000,
      daily_loss_limit: 1000,
      max_contracts: 5,
      created_at: new Date().toISOString(),
    };
  }, [accounts, activeAccountId]);

  // Active Account Trades (Filter only trades of this account)
  const activeTrades = useMemo(() => {
    return trades.filter((t) => (t.account_id || 'acc-tradify') === activeAccount.id);
  }, [trades, activeAccount.id]);

  // Today's summary calculations for active account
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const todayTrades = useMemo(() => {
    return activeTrades.filter((t) => t.date === todayStr);
  }, [activeTrades, todayStr]);

  const todayTradeCount = todayTrades.length;
  const todayNetPnl = useMemo(() => todayTrades.reduce((acc, t) => acc + t.net_pnl, 0), [todayTrades]);
  const todayWins = useMemo(() => todayTrades.filter((t) => t.net_pnl > 0).length, [todayTrades]);
  const todayLosses = useMemo(() => todayTrades.filter((t) => t.net_pnl < 0).length, [todayTrades]);

  // Balances for active account
  const activeInitialBalance = activeAccount.initial_balance || 50000;
  const activeTotalNetPnl = useMemo(() => activeTrades.reduce((acc, t) => acc + t.net_pnl, 0), [activeTrades]);
  const activeCurrentBalance = activeInitialBalance + activeTotalNetPnl;

  // Peak Balance for Trailing Drawdown
  const activePeakBalance = useMemo(() => {
    let running = activeInitialBalance;
    let peak = activeInitialBalance;
    const sorted = [...activeTrades].sort(
      (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );
    sorted.forEach((t) => {
      running += t.net_pnl;
      if (running > peak) peak = running;
    });
    return peak;
  }, [activeTrades, activeInitialBalance]);

  // Handlers for Accounts
  const handleSelectAccount = (id: string) => {
    setActiveAccountIdState(id);
    setActiveAccountId(id);
    const target = accounts.find((a) => a.id === id);
    showToast(`"${target?.name || id}" hisobi faollashtirildi`);
  };

  const handleAddAccount = (acc: PropAccount) => {
    const updated = [...accounts, acc];
    setAccounts(updated);
    setLocalPropAccounts(updated);
    handleSelectAccount(acc.id);
    showToast(`"${acc.name}" prop hisobi muvaffaqiyatli qo‘shildi!`);
  };

  const handleDeleteAccount = (id: string) => {
    // Also remove trades belonging to this backtest
    setTrades((prev) => {
      const filtered = prev.filter((t) => (t.account_id || 'acc-tradify') !== id);
      setLocalTrades(filtered);
      return filtered;
    });
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    setLocalPropAccounts(updated);
    if (activeAccountId === id) {
      handleSelectAccount(updated[0]?.id || 'acc-tradify');
    }
    showToast('Backtest hisobi muvaffaqiyatli o‘chirildi');
  };

  // Handlers for Trades
  const handleOpenTradeWithChecklist = (score: number, total: number, sweepPassed: boolean) => {
    setPrefillChecklistScore(score);
    setPrefillChecklistTotal(total);
    setPrefillSessionSweep(sweepPassed);
    setEditingTrade(null);
    setIsNewTradeModalOpen(true);
  };

  const handleOpenNewTrade = () => {
    setEditingTrade(null);
    setPrefillChecklistScore(5);
    setPrefillChecklistTotal(5);
    setPrefillSessionSweep(true);
    setIsNewTradeModalOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsNewTradeModalOpen(true);
  };

  const handleSaveTrade = async (trade: Trade) => {
    if (editingTrade) {
      await updateTradeRecord(trade, settings);
      setTrades((prev) => prev.map((t) => (t.id === trade.id ? trade : t)));
      showToast('Sdelka muvaffaqiyatli tahrirlandi!');
    } else {
      await createTradeRecord(trade, settings);
      setTrades((prev) => [trade, ...prev]);
      showToast('Yangi sdelka jurnallandi!');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    await deleteTradeRecord(id, settings);
    setTrades((prev) => prev.filter((t) => t.id !== id));
    showToast('Sdelka o‘chirildi');
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    setLocalSettings(newSettings);
    showToast('Sozlamalar saqlandi!');
  };

  const handleUpdateLink = async (tradeId: string, newUrl: string) => {
    const trade = trades.find((t) => t.id === tradeId);
    if (!trade) return;
    const updated = { ...trade, chart_url: newUrl, before_photo: newUrl };
    await updateTradeRecord(updated, settings);
    setTrades((prev) => prev.map((t) => (t.id === tradeId ? updated : t)));
    if (selectedTradeForDetail && selectedTradeForDetail.id === tradeId) {
      setSelectedTradeForDetail(updated);
    }
    showToast(newUrl ? 'Grafik havolasi saqlandi!' : 'Grafik havolasi o‘chirildi');
  };

  const handleSaveChecklistItems = (newItems: ChecklistItem[]) => {
    setChecklistItems(newItems);
    setLocalChecklistItems(newItems);
    showToast('Checklist shartlari yangilandi!');
  };

  const handleExportExcel = () => {
    try {
      exportTradesToExcel(activeTrades, settings);
      showToast(`"${activeAccount.name}" bo‘yicha Excel (.xlsx) fayli yuklab olindi!`);
    } catch (e) {
      console.error(e);
      showToast('Eksportda xatolik yuz berdi');
    }
  };

  const handleExportPDF = () => {
    try {
      exportTradesToPDF(activeTrades, settings, activeAccount);
      showToast(`"${activeAccount.name}" bo‘yicha PDF (.pdf) hisoboti yuklab olindi!`);
    } catch (e) {
      console.error(e);
      showToast('PDF eksportida xatolik yuz berdi');
    }
  };

  const handleResetDemo = () => {
    resetAllToDemo();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-mono">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentBalance={activeCurrentBalance}
        totalNetPnl={activeTotalNetPnl}
        peakBalance={activePeakBalance}
        settings={settings}
        isSupabaseConnected={isSupabaseConnected}
        activeAccount={activeAccount}
        accounts={accounts}
        onSelectAccount={handleSelectAccount}
        onOpenPropModal={() => setIsPropModalOpen(true)}
        onOpenNewTrade={handleOpenNewTrade}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: TRADIFY & P&L KALENDAR (SCREENSHOT 6) */}
        {activeTab === 'tradify' && (
          <TradifyDashboard
            trades={activeTrades}
            settings={settings}
            onSelectTrade={(t) => setSelectedTradeForDetail(t)}
            accountName={activeAccount.name}
          />
        )}

        {/* TAB 2: NOTION USLUBIDAGI TO'LIQ JURNAL (SCREENSHOTS 1-4) */}
        {activeTab === 'notion' && (
          <NotionJournalTable
            trades={activeTrades}
            initialBalance={activeInitialBalance}
            onSelectTrade={(t) => setSelectedTradeForDetail(t)}
            onEditTrade={handleEditTrade}
            onDeleteTrade={handleDeleteTrade}
            onOpenNewTrade={handleOpenNewTrade}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
          />
        )}

        {/* TAB 3: NAZORAT & PRE-TRADE CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            {/* Daily Shield Monitor */}
            <DailyShieldWidget
              todayTradeCount={todayTradeCount}
              todayNetPnl={todayNetPnl}
              todayWins={todayWins}
              todayLosses={todayLosses}
              settings={settings}
            />

            {/* Pre-Trade Checklist & Status Banner */}
            <PreTradeChecklist
              items={checklistItems}
              settings={settings}
              todayTradeCount={todayTradeCount}
              todayNetPnl={todayNetPnl}
              onOpenTradeWithChecklist={handleOpenTradeWithChecklist}
            />

            {/* Quick Recent Trades List */}
            <div className="bg-[#0b101b] border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Oxirgi Qayd Etilgan Sdelkalar ({activeAccount.name})
                  </h3>
                  <p className="text-xs text-slate-400">Jurnalga kiritilgan eng so‘nggi savdo amallari</p>
                </div>
                <button
                  onClick={() => setActiveTab('notion')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>Notion jadvalida ko‘rish</span>
                  <span>→</span>
                </button>
              </div>

              <div className="divide-y divide-slate-800/60 mt-2">
                {activeTrades.slice(0, 5).map((tr) => (
                  <div
                    key={tr.id}
                    onClick={() => setSelectedTradeForDetail(tr)}
                    className="py-3 flex items-center justify-between hover:bg-slate-900/60 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-white text-xs px-2 py-1 bg-slate-800 rounded-lg">
                        {tr.instrument}
                      </span>
                      <span className={`text-xs font-semibold ${tr.direction === 'Long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tr.direction}
                      </span>
                      <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                        {tr.date} • {tr.time}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                        Ball: {tr.checklist_score}/{tr.checklist_total}
                      </span>
                      <span className={`text-sm font-mono font-bold ${tr.net_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tr.net_pnl >= 0 ? '+' : ''}${tr.net_pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STATISTIKA & TRAILING DRAWDOWN GRAFIGI */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts
            trades={activeTrades}
            settings={settings}
            initialBalance={activeInitialBalance}
            trailingDrawdown={activeAccount.trailing_drawdown_amount}
            accountName={activeAccount.name}
            drawdownType={activeAccount.drawdown_type}
          />
        )}

      </main>

      {/* Slide-over Trade Detail Drawer */}
      <TradeDetailDrawer
        trade={selectedTradeForDetail}
        isOpen={Boolean(selectedTradeForDetail)}
        onClose={() => setSelectedTradeForDetail(null)}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
        onUpdateLink={handleUpdateLink}
      />

      {/* New / Edit Trade Modal with all Notion fields & checkboxes */}
      <NewTradeModal
        isOpen={isNewTradeModalOpen}
        onClose={() => setIsNewTradeModalOpen(false)}
        onSave={handleSaveTrade}
        editTrade={editingTrade}
        accounts={accounts}
        activeAccountId={activeAccountId}
        prefillChecklistScore={prefillChecklistScore}
        prefillChecklistTotal={prefillChecklistTotal}
        prefillSessionSweep={prefillSessionSweep}
      />

      {/* Prop Account Manager Modal */}
      <PropAccountModal
        isOpen={isPropModalOpen}
        onClose={() => setIsPropModalOpen(false)}
        accounts={accounts}
        activeAccountId={activeAccountId}
        onSelectAccount={handleSelectAccount}
        onAddAccount={handleAddAccount}
        onDeleteAccount={handleDeleteAccount}
        allTrades={trades}
      />

      {/* Settings & Supabase Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        checklistItems={checklistItems}
        onSaveSettings={handleSaveSettings}
        onSaveChecklistItems={handleSaveChecklistItems}
        onResetDemo={handleResetDemo}
      />

      {/* Footer in Uzbek */}
      <footer className="border-t border-slate-900 bg-[#070b14] py-6 mt-12 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Tradify & Notion Trading Journal. {activeAccount.name} bo‘yicha {activeTrades.length} ta sdelka va Trailing Drawdown himoyasi.</p>
          <div className="flex items-center gap-4">
            <button onClick={handleExportExcel} className="hover:text-emerald-400 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Excel (.xlsx)
            </button>
            <button onClick={handleExportPDF} className="hover:text-rose-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> PDF (.pdf)
            </button>
            <button onClick={() => setIsPropModalOpen(true)} className="hover:text-cyan-400">
              Prop Hisoblar
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="hover:text-slate-300">
              Supabase Sozlamalari
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
