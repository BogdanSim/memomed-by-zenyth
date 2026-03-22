import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectAfterLogin = () => {
    const state = location.state as { from?: Location } | undefined;
    const next = state?.from?.pathname ?? '/';
    navigate(next, { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated) {
      redirectAfterLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      redirectAfterLogin();
    } catch (err) {
      if (err instanceof ApiError) {
        const payload = err.payload as { error?: string } | string | null;
        const message = typeof payload === 'string' ? payload : payload?.error;
        setError(message || 'Date de autentificare invalide');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('A apărut o eroare');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-lg">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Leaf className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Memomed</h1>
          <p className="text-sm text-muted-foreground">Conectează-te pentru a-ți vedea programul</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              placeholder="tu@exemplu.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Parolă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-xs text-destructive text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? 'Autentificare...' : 'Intră în cont'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
