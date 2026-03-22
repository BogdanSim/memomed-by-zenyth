import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import DoseCard from '@/components/DoseCard';
import { Leaf, TrendingUp, AlertTriangle, ShoppingCart, Clock, Plus, Pill } from 'lucide-react';
import { zenythProducts } from '@/data/zenythProducts';
import { Treatment } from '@/types/treatment';
import { Button } from '@/components/ui/button';
import type { IntakeLog } from '@/types/treatment';

const Dashboard = () => {
  const { treatments, intakeLogs, updateIntakeStatus, refresh } = useApp();
  const navigate = useNavigate();
  const today = '2026-03-19';

  const todayLogs = useMemo(() =>
    intakeLogs.filter(l => l.scheduledAt.startsWith(today))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [intakeLogs, today]
  );

  const taken = todayLogs.filter(l => l.status === 'taken').length;
  const total = todayLogs.length;
  const progress = total > 0 ? Math.round((taken / total) * 100) : 0;

  const pendingLogs = todayLogs.filter(l => l.status === 'pending');
  const completedLogs = todayLogs.filter(l => l.status !== 'pending');

  const nextDose = useMemo(() => {
    if (pendingLogs.length === 0) return null;
    const log = pendingLogs[0];
    const treatment = treatments.find(t => t.id === log.treatmentId);
    const time = log.scheduledAt.split('T')[1]?.substring(0, 5);
    return treatment ? { treatment, time, log } : null;
  }, [pendingLogs, treatments]);

  const lowStockProducts = useMemo(() =>
    zenythProducts.filter(p => p.daysRemaining <= 10),
    []
  );

  const activeTreatments = treatments.filter(t => {
    const now = new Date().toISOString();
    return (!t.startDate || t.startDate <= now) && (!t.endDate || t.endDate >= now);
  });

  const handleUpdateStatus = async (logId: string, status: IntakeLog['status']) => {
    try {
      await updateIntakeStatus(logId, status);
      await refresh();
    } catch (error) {
      console.error('Error updating intake status:', error);
    }
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Memomed</h1>
              <span className="text-[10px] text-muted-foreground font-medium">by Zenyth</span>
            </div>
          </div>
          <button onClick={() => navigate('/add')} className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center active:scale-95 transition-transform">
            <Plus className="w-5 h-5 text-primary" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-3">Bună ziua! Iată programul de azi.</p>
      </motion.div>

      {/* Progress */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-[20px] border border-border p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Progres zilnic</span>
          </div>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{taken} din {total} doze luate</p>
      </motion.div>

      {/* Next dose highlight */}
      {nextDose && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-primary/5 border border-primary/20 rounded-[20px] p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Următoarea administrare</span>
          </div>
          <div className="flex items-center gap-3">
            {nextDose.treatment.type === 'medication' ? (
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Pill className="w-6 h-6 text-primary" />
              </div>
            ) : nextDose.treatment.wooProductImage ? (
              <img src={nextDose.treatment.wooProductImage} alt={nextDose.treatment.name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">{nextDose.treatment.name}</p>
              <p className="text-xs text-muted-foreground">{nextDose.time} · {nextDose.treatment.unitsPerIntake} {nextDose.treatment.unitLabel}</p>
            </div>
            <span className="text-lg font-bold text-primary">{nextDose.time}</span>
          </div>
        </motion.div>
      )}

      {/* Low stock alerts */}
      {lowStockProducts.length > 0 && (
        <div className="mb-5 space-y-2">
          {lowStockProducts.slice(0, 2).map(p => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3 border-l-4 border-l-warning">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.daysRemaining === 0 ? 'Stoc epuizat' : `Mai ai pentru ~${p.daysRemaining} zile`}
                </p>
              </div>
              <button onClick={() => navigate(`/checkout/${p.id}`)}
                className="h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1 active:scale-95 transition-transform">
                <ShoppingCart className="w-3.5 h-3.5" /> Comandă
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pending Doses */}
      {pendingLogs.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">De luat</h2>
          <div className="space-y-3">
            {pendingLogs.map(log => {
              const treatment = treatments.find(t => t.id === log.treatmentId);
              return treatment ? <DoseCard key={log.id} treatment={treatment} log={log} /> : null;
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedLogs.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Finalizate</h2>
          <div className="space-y-3">
            {completedLogs.map(log => {
              const treatment = treatments.find(t => t.id === log.treatmentId);
              return treatment ? <DoseCard key={log.id} treatment={treatment} log={log} /> : null;
            })}
          </div>
        </div>
      )}

      {/* Active Treatments */}
      {activeTreatments.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Tratamente active</h2>
          <div className="space-y-3">
            {activeTreatments.map(treatment => {
              const log = pendingLogs.find(l => l.treatmentId === treatment.id) || completedLogs.find(l => l.treatmentId === treatment.id);
              return log ? (
                <div key={treatment.id} className="space-y-3">
                  <DoseCard treatment={treatment} log={log} />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => handleUpdateStatus(log.id, 'taken')} variant="default">Marchează ca luat</Button>
                    <Button onClick={() => handleUpdateStatus(log.id, 'skipped')} variant="destructive">Omite</Button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center mt-8 px-4">
        Această aplicație este un instrument de tracking și nu înlocuiește sfatul medical.
      </p>
    </div>
  );
};

export default Dashboard;
