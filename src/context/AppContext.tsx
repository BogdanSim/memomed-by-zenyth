import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Treatment, IntakeLog } from '@/types/treatment';
import { api, type TreatmentPayload } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface AppState {
  treatments: Treatment[];
  intakeLogs: IntakeLog[];
  isSyncing: boolean;
  refresh: () => Promise<void>;
  addTreatment: (payload: TreatmentPayload) => Promise<void>;
  removeTreatment: (treatmentId: string) => Promise<void>;
  updateIntakeStatus: (logId: string, status: IntakeLog['status']) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, logout: authLogout } = useAuth();
  const queryClient = useQueryClient();

  const treatmentsQuery = useQuery({
    queryKey: ['treatments'],
    queryFn: () => api.getTreatments(token as string),
    enabled: Boolean(token),
  });

  const intakeLogsQuery = useQuery({
    queryKey: ['intakeLogs'],
    queryFn: () => api.getIntakeLogs(token as string),
    enabled: Boolean(token),
  });

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['treatments'] }),
      queryClient.invalidateQueries({ queryKey: ['intakeLogs'] }),
    ]);
  }, [queryClient]);

  const addTreatment = useCallback(async (payload: TreatmentPayload) => {
    if (!token) throw new Error('Neautentificat');
    await api.createTreatment(token, payload);
    await refresh();
  }, [token, refresh]);

  const removeTreatment = useCallback(async (treatmentId: string) => {
    if (!token) throw new Error('Neautentificat');
    await api.deleteTreatment(token, treatmentId);
    queryClient.setQueryData<Treatment[]>(['treatments'], (prev = []) => prev.filter(t => t.id !== treatmentId));
    queryClient.setQueryData<IntakeLog[]>(['intakeLogs'], (prev = []) => prev.filter(log => log.treatmentId !== treatmentId));
    await refresh();
  }, [token, queryClient, refresh]);

  const updateIntakeStatus = useCallback(async (logId: string, status: IntakeLog['status']) => {
    if (!token) throw new Error('Neautentificat');
    const confirmedAt = status === 'taken' ? new Date().toISOString() : undefined;
    const updated = await api.updateIntakeLog(token, logId, { status, confirmedAt });
    queryClient.setQueryData<IntakeLog[]>(['intakeLogs'], (prev = []) => prev.map(log => (log.id === updated.id ? updated : log)));
  }, [token, queryClient]);

  const value = useMemo<AppState>(() => ({
    treatments: treatmentsQuery.data ?? [],
    intakeLogs: intakeLogsQuery.data ?? [],
    isSyncing: treatmentsQuery.isFetching || intakeLogsQuery.isFetching,
    refresh,
    addTreatment,
    removeTreatment,
    updateIntakeStatus,
    logout: authLogout,
  }), [treatmentsQuery.data, treatmentsQuery.isFetching, intakeLogsQuery.data, intakeLogsQuery.isFetching, refresh, addTreatment, removeTreatment, updateIntakeStatus, authLogout]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
