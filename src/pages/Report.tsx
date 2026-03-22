import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

const Report = () => {
  const { treatments, intakeLogs } = useApp();

  const stats = useMemo(() => {
    const totalDoses = intakeLogs.length;
    const taken = intakeLogs.filter(l => l.status === 'taken').length;
    const missed = intakeLogs.filter(l => l.status === 'missed').length;
    const skipped = intakeLogs.filter(l => l.status === 'skipped').length;
    const adherence = totalDoses > 0 ? Math.round((taken / totalDoses) * 100) : 0;

    return { totalDoses, taken, missed, skipped, adherence };
  }, [intakeLogs]);

  const treatmentStats = useMemo(() => {
    return treatments.map(t => {
      const logs = intakeLogs.filter(l => l.treatmentId === t.id);
      const taken = logs.filter(l => l.status === 'taken').length;
      const total = logs.length;
      return { treatment: t, taken, total, adherence: total > 0 ? Math.round((taken / total) * 100) : 0 };
    });
  }, [treatments, intakeLogs]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Raport Medical</h1>
          <p className="text-sm text-muted-foreground">Perioada: 17 - 19 Martie 2026</p>
        </div>
        <button onClick={() => toast.success('Raportul a fost generat!')}
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 active:scale-95 transition-transform">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Overview card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Sumar General</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-xl bg-secondary">
            <p className="text-2xl font-bold text-primary">{stats.adherence}%</p>
            <p className="text-xs text-muted-foreground">Aderență</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary">
            <p className="text-2xl font-bold">{stats.totalDoses}</p>
            <p className="text-xs text-muted-foreground">Total doze</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary">
            <p className="text-2xl font-bold text-primary">{stats.taken}</p>
            <p className="text-xs text-muted-foreground">Luate</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary">
            <p className="text-2xl font-bold text-destructive">{stats.missed + stats.skipped}</p>
            <p className="text-xs text-muted-foreground">Omise</p>
          </div>
        </div>
      </motion.div>

      {/* Per treatment */}
      <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Per tratament</h2>
      <div className="space-y-3">
        {treatmentStats.map((ts, i) => (
          <motion.div key={ts.treatment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{ts.treatment.name}</h3>
              <span className={`text-sm font-bold ${ts.adherence >= 80 ? 'text-primary' : ts.adherence >= 50 ? 'text-warning' : 'text-destructive'}`}>
                {ts.adherence}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${ts.adherence}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{ts.taken} luate din {ts.total}</span>
              <span>{ts.treatment.frequencyPerDay}x/zi · {ts.treatment.unitsPerIntake} {ts.treatment.unitLabel}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-2xl bg-secondary">
        <p className="text-xs text-muted-foreground text-center">
          ⚕️ Acest raport este generat automat și are scop informativ. Nu înlocuiește consultul medical profesional.
        </p>
      </div>
    </div>
  );
};

export default Report;
