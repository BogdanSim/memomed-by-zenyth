import { motion } from 'framer-motion';
import { Check, X, Clock, Pill, Leaf } from 'lucide-react';
import { Treatment, IntakeLog } from '@/types/treatment';
import { useApp } from '@/context/AppContext';

interface DoseCardProps {
  treatment: Treatment;
  log: IntakeLog;
}

const mealLabel = { before: 'Înainte de masă', after: 'După masă', none: '' };

const DoseCard = ({ treatment, log }: DoseCardProps) => {
  const { updateIntakeStatus } = useApp();
  const time = log.scheduledAt.split('T')[1]?.substring(0, 5) || '';
  const isPending = log.status === 'pending';

  const statusLabel: Record<string, string> = {
    taken: 'Luată',
    skipped: 'Sărită',
    missed: 'Ratată',
    snoozed: 'Amânată',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-[20px] border border-border p-4 ${
        log.status === 'taken' ? 'border-l-4 border-l-primary' :
        log.status === 'missed' || log.status === 'skipped' ? 'border-l-4 border-l-destructive opacity-60' :
        ''
      }`}
    >
      <div className="flex items-center gap-3">
        {treatment.type === 'medication' ? (
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <Pill className="w-6 h-6 text-accent-foreground" />
          </div>
        ) : treatment.wooProductImage ? (
          <img src={treatment.wooProductImage} alt={treatment.name} className="w-12 h-12 rounded-xl object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <Leaf className="w-6 h-6 text-accent-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{treatment.name}</h3>
          <p className="text-xs text-muted-foreground">
            {time} · {treatment.unitsPerIntake} {treatment.unitLabel}
            {treatment.mealCondition !== 'none' && ` · ${mealLabel[treatment.mealCondition]}`}
          </p>
          {!isPending && log.status !== 'pending' && (
            <span className={`text-[10px] font-semibold mt-0.5 inline-block ${log.status === 'taken' ? 'text-primary' : 'text-destructive'}`}>
              {statusLabel[log.status] || log.status}
            </span>
          )}
        </div>
        {log.status === 'taken' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Check className="w-4 h-4 text-primary" /></div>}
        {(log.status === 'missed' || log.status === 'skipped') && <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"><X className="w-4 h-4 text-destructive" /></div>}
      </div>
      {isPending && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => updateIntakeStatus(log.id, 'taken')} className="flex-1 h-10 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
            <Check className="w-4 h-4" /> Luată
          </button>
          <button onClick={() => updateIntakeStatus(log.id, 'snoozed')} className="h-10 px-3 rounded-2xl bg-secondary text-secondary-foreground text-sm flex items-center gap-1.5 active:scale-95 transition-transform">
            <Clock className="w-3.5 h-3.5" /> Amână
          </button>
          <button onClick={() => updateIntakeStatus(log.id, 'skipped')} className="h-10 px-3 rounded-2xl bg-secondary text-secondary-foreground text-sm flex items-center gap-1.5 active:scale-95 transition-transform">
            <X className="w-3.5 h-3.5" /> Omit
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default DoseCard;
