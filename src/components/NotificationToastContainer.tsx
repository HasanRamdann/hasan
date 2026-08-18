import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Bell,
  Clock,
  Trash2,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ToastItemProps {
  id: string;
  msgEn: string;
  msgAr: string;
  type: string;
  time: string;
  durationMs?: number;
  onDismiss: (id: string) => void;
  isAr: boolean;
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  msgEn,
  msgAr,
  type,
  time,
  durationMs = 5000,
  onDismiss,
  isAr,
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(durationMs);

  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const newPct = (newRemaining / durationMs) * 100;
      setProgress(newPct);

      if (newRemaining <= 0) {
        clearInterval(interval);
        onDismiss(id);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isPaused, durationMs, id, onDismiss]);

  const handleMouseEnter = () => {
    // Record remaining time before pausing
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const getStyleProps = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/50 hover:border-emerald-400',
          bg: 'bg-slate-950/95',
          text: 'text-emerald-300',
          progressBar: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
        };
      case 'warning':
      case 'error':
        return {
          border: 'border-amber-500/50 hover:border-amber-400',
          bg: 'bg-slate-950/95',
          text: 'text-amber-300',
          progressBar: 'bg-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
        };
      case 'info':
      default:
        return {
          border: 'border-cyan-500/50 hover:border-cyan-400',
          bg: 'bg-slate-950/95',
          text: 'text-cyan-300',
          progressBar: 'bg-cyan-500',
          icon: <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />,
        };
    }
  };

  const styles = getStyleProps();
  const message = isAr ? msgAr : msgEn;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${styles.bg} ${styles.border} transition-all duration-300 pointer-events-auto transform hover:-translate-y-0.5 group`}
    >
      <div className="p-3.5 flex items-start gap-3">
        {styles.icon}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-100 leading-snug break-words">
            {message}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
            <Clock className="w-2.5 h-2.5 text-slate-500" />
            <span>{time}</span>
            {isPaused && (
              <span className="text-amber-400 font-bold ml-1">
                {isAr ? '(موقوف مؤقتاً)' : '(Paused)'}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onDismiss(id);
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          title={isAr ? 'إغلاق الإشعار' : 'Dismiss'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Disappearing Timer Progress Bar */}
      <div className="h-1 w-full bg-slate-800/80 overflow-hidden">
        <div
          className={`h-full ${styles.progressBar} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const NotificationToastContainer: React.FC = () => {
  const { notifications, removeNotification, settings } = useGame();
  const isAr = settings.language === 'ar';

  if (!notifications || notifications.length === 0) {
    return null;
  }

  const activeNotifications = notifications.slice(0, 4);

  return (
    <div
      className={`fixed bottom-6 ${
        isAr ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
      } z-50 space-y-2.5 pointer-events-none max-w-sm w-full select-none`}
    >
      {/* Header controls if multiple notifications exist */}
      {activeNotifications.length > 1 && (
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400 pointer-events-auto">
          <div className="flex items-center gap-1 font-bold text-slate-300">
            <Bell className="w-3 h-3 text-amber-400" />
            <span>
              {activeNotifications.length} {isAr ? 'إشعارات جديدة' : 'Active alerts'}
            </span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              activeNotifications.forEach((n) => removeNotification(n.id));
            }}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-300 bg-slate-900/80 hover:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-800 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>{isAr ? 'مسح الكل' : 'Clear All'}</span>
          </button>
        </div>
      )}

      {/* Toast Items */}
      {activeNotifications.map((notif) => (
        <ToastItem
          key={notif.id}
          id={notif.id}
          msgEn={notif.msgEn}
          msgAr={notif.msgAr}
          type={notif.type}
          time={notif.time}
          durationMs={5000}
          onDismiss={removeNotification}
          isAr={isAr}
        />
      ))}
    </div>
  );
};
