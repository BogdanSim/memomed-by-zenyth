import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Pill, Leaf, ShoppingCart, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { zenythProducts } from '@/data/zenythProducts';
import { toast } from 'sonner';

const TreatmentsList = () => {
  const { treatments, removeTreatment } = useApp();
  const navigate = useNavigate();

  const getRefillInfo = (wooProductId?: string) => {
    if (!wooProductId) return null;
    // Map woo IDs to zenyth products for demo
    const mapping: Record<string, string> = { 'woo-1': 'zp-1', 'woo-2': 'zp-2' };
    const zpId = mapping[wooProductId];
    return zpId ? zenythProducts.find(p => p.id === zpId) : null;
  };

  const handleCancelTreatment = (treatmentId: string, treatmentName: string) => {
    const confirmed = window.confirm(`Sigur vrei să renunți la tratamentul "${treatmentName}"?`);
    if (!confirmed) return;
    removeTreatment(treatmentId);
    toast.success('Tratamentul a fost renunțat.');
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">Tratamente</h1>
      <p className="text-sm text-muted-foreground mb-6">{treatments.length} tratamente active</p>

      <div className="space-y-3">
        {treatments.map((t, i) => {
          const refill = getRefillInfo(t.wooProductId);
          return (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-[20px] border border-border p-4">
              <div className="flex items-center gap-3">
                {t.type === 'medication' ? (
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
                    <Pill className="w-7 h-7 text-accent-foreground" />
                  </div>
                ) : t.wooProductImage ? (
                  <img src={t.wooProductImage} alt={t.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
                    <Leaf className="w-7 h-7 text-accent-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t.frequencyPerDay}x/zi · {t.unitsPerIntake} {t.unitLabel}
                    {t.mealCondition !== 'none' && ` · ${t.mealCondition === 'before' ? 'înainte' : 'după'} masă`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.startDate}{t.endDate ? ` → ${t.endDate}` : ' → continuu'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Refill integration */}
              {refill && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {refill.daysRemaining <= 5 && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                      <span className={`text-xs font-medium ${refill.daysRemaining <= 5 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {refill.daysRemaining === 0 ? 'Stoc epuizat' : `Mai ai pentru ~${refill.daysRemaining} zile`}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${refill.daysRemaining <= 3 ? 'bg-destructive' : refill.daysRemaining <= 10 ? 'bg-warning' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, (refill.daysRemaining / refill.totalDays) * 100)}%` }}
                    />
                  </div>
                  <button onClick={() => navigate(`/checkout/${refill.id}`)}
                    className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                    <ShoppingCart className="w-3.5 h-3.5" /> Comandă din nou
                  </button>
                </div>
              )}

              {t.source === 'woo' && !refill && (
                <button className="mt-3 w-full h-9 rounded-xl bg-accent text-accent-foreground text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                  <ShoppingCart className="w-3.5 h-3.5" /> Comandă din nou
                </button>
              )}

              <button
                onClick={() => handleCancelTreatment(t.id, t.name)}
                className="mt-3 w-full h-9 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-transform border border-border"
              >
                <X className="w-3.5 h-3.5" />
                Renunță la acest tratament
              </button>
            </motion.div>
          );
        })}
      </div>

      <button onClick={() => navigate('/add')}
        className="w-full mt-6 h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
        + Adaugă tratament nou
      </button>
    </div>
  );
};

export default TreatmentsList;
