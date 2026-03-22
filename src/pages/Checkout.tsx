import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, Check } from 'lucide-react';
import { zenythProducts } from '@/data/zenythProducts';
import { toast } from 'sonner';

const Checkout = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const product = zenythProducts.find(p => p.id === productId);

  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!product) {
    return (
      <div className="pb-24 px-4 pt-4 max-w-lg mx-auto text-center py-20">
        <p className="text-muted-foreground">Produs negăsit.</p>
        <button onClick={() => navigate('/refill')} className="mt-4 text-primary text-sm font-medium">← Înapoi la produse</button>
      </div>
    );
  }

  const subtotal = product.price * quantity;
  const shipping = 15.00;
  const total = subtotal + shipping;

  const handleOrder = () => {
    setOrderPlaced(true);
    toast.success('Comanda a fost plasată cu succes!');
  };

  if (orderPlaced) {
    return (
      <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">Comandă plasată!</h1>
          <p className="text-sm text-muted-foreground mb-1">Comanda ta pentru <strong>{product.name}</strong></p>
          <p className="text-sm text-muted-foreground mb-8">a fost înregistrată cu succes.</p>
          <p className="text-2xl font-bold text-primary mb-8">{total.toFixed(2)} RON</p>
          <button onClick={() => navigate('/')} className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform">
            Înapoi la acasă
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Înapoi
        </button>
        <h1 className="text-xl font-bold mb-6">Finalizare comandă</h1>

        {/* Product summary */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex gap-4">
            <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{product.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{product.unitsPerPackage} {product.unitLabel}</p>
              <p className="text-sm font-bold text-primary mt-2">{product.price} RON</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Cantitate:</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-xl bg-secondary text-sm font-bold flex items-center justify-center active:scale-95 transition-transform">−</button>
              <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-xl bg-secondary text-sm font-bold flex items-center justify-center active:scale-95 transition-transform">+</button>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <h3 className="font-semibold text-sm mb-3">Sumar comandă</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{subtotal.toFixed(2)} RON</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Livrare</span><span>{shipping.toFixed(2)} RON</span></div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between font-bold"><span>Total</span><span className="text-primary">{total.toFixed(2)} RON</span></div>
          </div>
        </div>

        {/* Shipping info */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Date livrare</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nume complet</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ion Popescu"
                className="w-full h-11 px-4 rounded-xl bg-secondary text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="ion@email.com"
                className="w-full h-11 px-4 rounded-xl bg-secondary text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefon</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="07XX XXX XXX"
                className="w-full h-11 px-4 rounded-xl bg-secondary text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Adresă livrare</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Strada, Nr., Oraș, Cod poștal"
                className="w-full px-4 py-3 rounded-xl bg-secondary text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Metodă de plată</h3>
          </div>

          {/* Saved card */}
          <button onClick={() => setUseSavedCard(true)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all ${useSavedCard ? 'bg-primary/5 border-2 border-primary' : 'bg-secondary border-2 border-transparent'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useSavedCard ? 'border-primary' : 'border-muted-foreground'}`}>
              {useSavedCard && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Visa •••• 4242</p>
              <p className="text-xs text-muted-foreground">Expiră 12/28</p>
            </div>
          </button>

          {/* New card */}
          <button onClick={() => setUseSavedCard(false)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${!useSavedCard ? 'bg-primary/5 border-2 border-primary' : 'bg-secondary border-2 border-transparent'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useSavedCard ? 'border-primary' : 'border-muted-foreground'}`}>
              {!useSavedCard && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
            <p className="text-sm font-medium">Card nou</p>
          </button>

          {!useSavedCard && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-3">
              <input placeholder="Număr card" className="w-full h-11 px-4 rounded-xl bg-secondary text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
              <div className="flex gap-3">
                <input placeholder="MM/YY" className="flex-1 h-11 px-4 rounded-xl bg-secondary text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
                <input placeholder="CVV" className="w-24 h-11 px-4 rounded-xl bg-secondary text-sm border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground">Plată securizată. Datele tale sunt protejate.</p>
        </div>

        <button onClick={handleOrder}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base active:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
          Plasează comanda · {total.toFixed(2)} RON
        </button>
      </motion.div>
    </div>
  );
};

export default Checkout;
