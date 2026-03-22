import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { ChevronLeft, ChevronRight, Check, X, Minus } from 'lucide-react';

const CalendarView = () => {
  const { treatments, intakeLogs } = useApp();
  const [selectedDate, setSelectedDate] = useState('2026-03-19');

  const currentMonth = selectedDate.substring(0, 7);
  const year = parseInt(currentMonth.split('-')[0]);
  const month = parseInt(currentMonth.split('-')[1]);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const monthNames = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

  const dayStatuses = useMemo(() => {
    const statuses: Record<number, 'perfect' | 'partial' | 'missed' | 'none'> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonth}-${String(d).padStart(2, '0')}`;
      const dayLogs = intakeLogs.filter(l => l.scheduledAt.startsWith(dateStr));
      if (dayLogs.length === 0) { statuses[d] = 'none'; continue; }
      const taken = dayLogs.filter(l => l.status === 'taken').length;
      if (taken === dayLogs.length) statuses[d] = 'perfect';
      else if (taken > 0) statuses[d] = 'partial';
      else statuses[d] = 'missed';
    }
    return statuses;
  }, [intakeLogs, currentMonth, daysInMonth]);

  const selectedLogs = useMemo(() =>
    intakeLogs.filter(l => l.scheduledAt.startsWith(selectedDate)),
    [intakeLogs, selectedDate]
  );

  const navigateMonth = (dir: number) => {
    const d = new Date(year, month - 1 + dir, 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(Math.min(parseInt(selectedDate.split('-')[2]), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())).padStart(2, '0')}`);
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">Istoric</h1>

      {/* Calendar */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-1"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <span className="font-semibold text-sm">{monthNames[month - 1]} {year}</span>
          <button onClick={() => navigateMonth(1)} className="p-1"><ChevronRight className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`;
            const status = dayStatuses[day];
            const isSelected = dateStr === selectedDate;
            return (
              <button key={day} onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                  isSelected ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                  status === 'perfect' ? 'bg-primary/15 text-primary' :
                  status === 'partial' ? 'bg-warning/15 text-warning' :
                  status === 'missed' ? 'bg-destructive/15 text-destructive' :
                  'text-foreground hover:bg-secondary'
                }`}>
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border justify-center">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-[10px] text-muted-foreground">Complet</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-warning" /><span className="text-[10px] text-muted-foreground">Parțial</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-destructive" /><span className="text-[10px] text-muted-foreground">Omis</span></div>
        </div>
      </div>

      {/* Selected day details */}
      <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
        {selectedDate === '2026-03-19' ? 'Azi' : selectedDate}
      </h2>
      {selectedLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nicio doză programată.</p>
      ) : (
        <div className="space-y-2">
          {selectedLogs.map(log => {
            const t = treatments.find(tr => tr.id === log.treatmentId);
            if (!t) return null;
            const time = log.scheduledAt.split('T')[1]?.substring(0, 5);
            return (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  log.status === 'taken' ? 'bg-primary/15' : log.status === 'missed' || log.status === 'skipped' ? 'bg-destructive/15' : 'bg-secondary'
                }`}>
                  {log.status === 'taken' ? <Check className="w-4 h-4 text-primary" /> :
                   log.status === 'missed' || log.status === 'skipped' ? <X className="w-4 h-4 text-destructive" /> :
                   <Minus className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{time} · {log.status}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
