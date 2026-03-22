import { memo, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, AlertTriangle, Search, Pill } from 'lucide-react';
import type { ZenythProduct } from '@/data/zenythProducts';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';

const getStockStatus = (product: ZenythProduct) => {
  const totalDays = product.totalDays ?? 0;
  const daysRemaining = product.daysRemaining ?? totalDays;
  const pct = totalDays > 0 ? (daysRemaining / totalDays) * 100 : 0;
  if (daysRemaining === 0) return { label: 'Stoc epuizat', color: 'destructive' as const, pct: 0 };
  if (daysRemaining <= 5) return { label: `Se termină în ${daysRemaining} zile`, color: 'destructive' as const, pct };
  if (daysRemaining <= 10) return { label: `Mai ai pentru ${daysRemaining} zile`, color: 'warning' as const, pct };
  return { label: `Mai ai pentru ${daysRemaining} zile`, color: 'success' as const, pct };
};

const progressColor = (color: 'destructive' | 'warning' | 'success') => {
  if (color === 'destructive') return 'bg-destructive';
  if (color === 'warning') return 'bg-warning';
  return 'bg-primary';
};

const Refill = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ZenythProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setIsLoading(true);
    setError(null);
    api.getProducts(token)
      .then(data => {
        if (active) setProducts(data);
      })
      .catch(err => {
        if (!active) return;
        if (err instanceof ApiError) {
          const payload = err.payload as { error?: string } | null;
          setError(payload?.error || 'Nu am putut încărca produsele');
        } else {
          setError('Nu am putut încărca produsele');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const searchValue = search.trim().toLowerCase();

  const { urgentProducts, otherProducts } = useMemo(() => {
    const urgent: ZenythProduct[] = [];
    const other: ZenythProduct[] = [];

    products.forEach(product => {
      if (!product.name.toLowerCase().includes(searchValue)) return;
      const daysLeft = product.daysRemaining ?? Number.MAX_SAFE_INTEGER;
      if (daysLeft <= 10) {
        urgent.push(product);
      } else {
        other.push(product);
      }
    });

    return { urgentProducts: urgent, otherProducts: other };
  }, [products, searchValue]);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold mb-1">Produsele noastre</h1>
        <p className="text-sm text-muted-foreground mb-5">Alege produsul și comandă rapid</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Caută produs..."
          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-card text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
        />
      </div>

      {error && <p className="text-xs text-destructive mb-4">{error}</p>}
      {isLoading && !error && <p className="text-xs text-muted-foreground mb-4">Se încarcă produsele...</p>}

      {/* Urgent section */}
      {urgentProducts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Necesită atenție</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {urgentProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} onOrder={() => navigate(`/checkout/${product.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Other products */}
      {otherProducts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Toate produsele</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {otherProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i + urgentProducts.length} onOrder={() => navigate(`/checkout/${product.id}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

type ProductCardProps = {
  product: ZenythProduct;
  index: number;
  onOrder: () => void;
};

const ProductCard = memo(({ product, index, onOrder }: ProductCardProps) => {
  const status = getStockStatus(product);
  const isMedication = product.name.toLowerCase().includes('paracetamol') || product.category.toLowerCase().includes('medicament');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden flex flex-col"
    >
      <div className="p-3 flex flex-col gap-3">
        <div className="w-full rounded-2xl bg-white flex items-center justify-center overflow-hidden aspect-[4/3] p-3">
          {isMedication ? (
            <Pill className="w-12 h-12 text-primary" />
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{product.description}</p>
          <p className="text-[10px] text-muted-foreground">
            {product.unitsPerPackage} {product.unitLabel}
          </p>
        </div>

        {/* Refill progress */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground">{status.label}</span>
            <span className="text-[10px] font-semibold">{product.price} {product.currency}</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${progressColor(status.color)}`}
              initial={{ width: 0 }}
              animate={{ width: `${status.pct}%` }}
              transition={{ duration: 0.6, delay: index * 0.04 }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-3">
          <button
            onClick={onOrder}
            className="w-full rounded-2xl bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-sm px-4 py-3"
          >
            <ShoppingCart className="w-4 h-4" />
            Adaugă în coș
          </button>
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-2xl bg-secondary text-secondary-foreground text-[11px] font-medium flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform px-4 py-3"
            aria-label={`Vezi detalii pentru ${product.name}`}
          >
            <Eye className="w-4 h-4" />
            Vezi detalii
          </a>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default Refill;
