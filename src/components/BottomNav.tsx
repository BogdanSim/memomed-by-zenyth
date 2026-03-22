import { NavLink } from 'react-router-dom';
import { Home, List, CalendarDays, ShoppingCart, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Acasă' },
  { to: '/treatments', icon: List, label: 'Tratamente' },
  { to: '/calendar', icon: CalendarDays, label: 'Istoric' },
  { to: '/refill', icon: ShoppingCart, label: 'Produse' },
  { to: '/account', icon: User, label: 'Cont' },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 pb-safe">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors min-w-0 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
