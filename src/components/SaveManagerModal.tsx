import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { SaveSlotInfo } from '../types/game';
import {
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Clock,
  HardDrive,
  FileCode,
  Check,
  Building2,
  Ship,
  DollarSign,
  Award,
  Cloud,
  CloudUpload,
  User,
  LogIn,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SaveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveManagerModal: React.FC<SaveManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    saveGameToSlot,
    loadGameFromSlot,
    getSlotsSummary,
    exportSaveData,
    importSaveData,
    saveGameCloud,
    loadGameCloud,
    lastSavedTimeText,
    isAutoSaving,
    currentSaveSlot,
    startNewGame,
    addNotification,
  } = useGame();

  const {
    currentUser,
    userProfile,
    setIsAuthModalOpen,
    isSyncingCloud,
  } = useAuth();

  const isAr = settings.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmNewGame, setConfirmNewGame] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const slots = getSlotsSummary();

  const handleSaveSlot = (slotId: number) => {
    soundFx.playCash();
    saveGameToSlot(slotId);
  };

  const handleLoadSlot = (slotId: number) => {
    soundFx.playFanfare();
    loadGameFromSlot(slotId);
    onClose();
  };

  const handleExportDownload = () => {
    soundFx.playClick();
    const dataStr = exportSaveData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TradeEmpire_Save_Slot${currentSaveSlot}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addNotification('Save file exported successfully!', 'تم تنزيل وتصدير ملف الحفظ بنجاح!', 'success');
  };

  const handleExportCopy = () => {
    soundFx.playClick();
    const dataStr = exportSaveData();
    navigator.clipboard.writeText(dataStr);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
    addNotification('Save JSON copied to clipboard!', 'تم نسخ بيانات الحفظ إلى الحافظة!', 'success');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importSaveData(content);
        if (ok) {
          onClose();
        }
      }
    };
    reader.readAsText(file);
  };

  const handleTextImport = () => {
    if (!importText.trim()) return;
    const ok = importSaveData(importText.trim());
    if (ok) {
      setShowImportBox(false);
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-6 my-auto text-slate-100"
        dir={isAr ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {isAr ? '💾 نظام الحفظ التلقائي وفتحات التخزين' : '💾 Auto-Save & Save Slots Manager'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'يتم الحفظ تلقائياً في الخلفية، يمكنك أيضاً الحفظ اليدوي وإدارة النسخ الاحتياطية'
                  : 'Game progress is auto-saved continuously. Manage slots, backup exports & imports.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-Save Live Status Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-slate-950/60 to-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute inset-0" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'الحفظ التلقائي نشط ومستمر' : 'Auto-Save is Active & Continuous'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isAr
                  ? `آخر حفظ تم تلقائياً: ${lastSavedTimeText || 'الآن'}`
                  : `Last Auto-saved: ${lastSavedTimeText || 'Just now'}`}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSaveSlot(currentSaveSlot)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isAr ? 'حفظ يدوي فوري الآن' : 'Save Now'}</span>
          </button>
        </div>

        {/* Online MMO Cloud Account & Sync Section */}
        <div className="p-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-950/60 border border-blue-500/30 rounded-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <span>{isAr ? '☁️ الحفظ السحابي والأونلاين (Online Cloud Save)' : '☁️ Online Cloud Save & Account'}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentUser && userProfile ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      {isAr ? `مسجل باسم: @${userProfile.username}` : `Logged in as: @${userProfile.username}`}
                    </span>
                  ) : (
                    <span>{isAr ? 'العب كزائر - سجل دخولك لحفظ بياناتك في السحابة ومزامنتها على أي جهاز' : 'Playing as Guest. Login to sync progress across any device.'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {currentUser && userProfile ? (
                <>
                  <button
                    onClick={async () => {
                      await saveGameCloud();
                    }}
                    disabled={isSyncingCloud}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مزامنة وحفظ سحابي' : 'Sync to Cloud'}</span>
                  </button>
                  <button
                    onClick={async () => {
                      const ok = await loadGameCloud();
                      if (ok) onClose();
                    }}
                    disabled={isSyncingCloud}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تحميل من السحابة' : 'Restore Cloud Save'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-extrabold shadow-md hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Register'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3 Save Slots List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>{isAr ? '🗂️ فتحات الحفظ (Save Slots):' : '🗂️ Available Save Slots:'}</span>
            <span className="text-[11px] text-slate-400">
              {isAr ? `الفتحة النشطة حالياً: فتحة ${currentSaveSlot}` : `Active Slot: Slot ${currentSaveSlot}`}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {slots.map((slot) => {
              const isCurrent = currentSaveSlot === slot.slotId;
              return (
                <div
                  key={slot.slotId}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-slate-950/80 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {slot.slotId}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {slot.isEmpty
                            ? isAr
                              ? `فتحة فارغة ${slot.slotId}`
                              : `Empty Slot ${slot.slotId}`
                            : slot.companyName}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {isAr ? 'الفتحة الحالية' : 'Current'}
                          </span>
                        )}
                      </div>

                      {!slot.isEmpty ? (
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                          <span>👤 {slot.ceoName}</span>
                          <span>💰 ${(slot.cash || 0).toLocaleString()}</span>
                          <span>⭐ Lvl {slot.level}</span>
                          <span>🚢 {slot.shipsCount || 0} سفن</span>
                          <span>
                            🕒{' '}
                            {slot.lastSavedTimestamp
                              ? new Date(slot.lastSavedTimestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {isAr ? 'لا توجد بيانات محفوظة في هذه الفتحة' : 'No saved game data in this slot'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleSaveSlot(slot.slotId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isAr ? 'حفظ هنا' : 'Save Here'}</span>
                    </button>

                    {!slot.isEmpty && (
                      <button
                        onClick={() => handleLoadSlot(slot.slotId)}
                        className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-500/40 flex items-center gap-1.5"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تحميل' : 'Load'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backup, Export & Import Options */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? '📦 النسخ الاحتياطي والتصدير / الاستيراد:' : '📦 Backup Export & Import:'}</span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleExportDownload}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنزيل ملف الحفظ (.json)' : 'Download Save File'}</span>
            </button>

            <button
              onClick={handleExportCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              <span>{copySuccess ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ الكود' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isAr ? 'استيراد من ملف' : 'Import from File'}</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => setShowImportBox(!showImportBox)}
              className="text-xs text-slate-400 hover:text-white underline ml-auto"
            >
              {isAr ? 'لصق كود الحفظ يدوياً' : 'Paste text code'}
            </button>
          </div>

          {showImportBox && (
            <div className="pt-2 space-y-2">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={isAr ? 'الصق كود JSON لبيانات الحفظ هنا...' : 'Paste save JSON string here...'}
                className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleTextImport}
                disabled={!importText.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isAr ? 'استعادة وتطبيق بيانات الحفظ' : 'Restore & Load Save Data'}
              </button>
            </div>
          )}
        </div>

        {/* Start New Game / Reset */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          {!confirmNewGame ? (
            <button
              onClick={() => setConfirmNewGame(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? '🔄 بدء لعبة جديدة / إعادة التعيين' : '🔄 Start New Game / Reset'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-rose-950/70 border border-rose-700 rounded-xl text-xs">
              <span className="text-rose-200 font-bold">
                {isAr ? 'هل أنت متأكد من رغبتك في بدء لعبة جديدة؟' : 'Start new game and reset?'}
              </span>
              <button
                onClick={() => {
                  setConfirmNewGame(false);
                  onClose();
                  startNewGame();
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
              >
                {isAr ? 'نعم، ابدأ من جديد' : 'Yes, New Game'}
              </button>
              <button
                onClick={() => setConfirmNewGame(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all ml-auto"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
