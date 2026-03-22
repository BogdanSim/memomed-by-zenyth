import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const AccountSection = () => {
  const navigate = useNavigate();
  const { section } = useParams();

  const titleBySection: Record<string, string> = {
    profile: 'Profil',
    addresses: 'Adrese salvate',
    payment: 'Metode de plată',
    orders: 'Comenzile mele',
    'refill-history': 'Istoric reaprovizionări',
    notifications: 'Setări notificări',
    'app-settings': 'Setări aplicație',
  };

  const title = section ? titleBySection[section] ?? 'Secțiune cont' : 'Secțiune cont';

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/account')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Înapoi la Cont
        </button>

        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-3">
          În demo, această pagină este placeholder. Poți implementa aici datele reale (adrese, plăți, comenzi etc.).
        </p>
      </motion.div>
    </div>
  );
};

export default AccountSection;

