import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import RequireAuth from '@/components/RequireAuth';
import BottomNav from '@/components/BottomNav';
import Dashboard from '@/pages/Dashboard';
import AddTreatment from '@/pages/AddTreatment';
import TreatmentsList from '@/pages/TreatmentsList';
import CalendarView from '@/pages/CalendarView';
import Report from '@/pages/Report';
import Refill from '@/pages/Refill';
import Checkout from '@/pages/Checkout';
import Account from '@/pages/Account';
import AccountSection from '@/pages/AccountSection';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';

const queryClient = new QueryClient();

const ProtectedShell = () => (
  <div className="min-h-screen bg-background">
    <Outlet />
    <BottomNav />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<RequireAuth />}>
                <Route element={<ProtectedShell />}>
                  <Route index element={<Dashboard />} />
                  <Route path="add" element={<AddTreatment />} />
                  <Route path="treatments" element={<TreatmentsList />} />
                  <Route path="calendar" element={<CalendarView />} />
                  <Route path="report" element={<Report />} />
                  <Route path="refill" element={<Refill />} />
                  <Route path="checkout/:productId" element={<Checkout />} />
                  <Route path="account" element={<Account />} />
                  <Route path="account/:section" element={<AccountSection />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
