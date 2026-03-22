import { Treatment, IntakeLog, WooProduct } from '@/types/treatment';

export const mockTreatments: Treatment[] = [
  {
    id: '1',
    userId: 'u1',
    name: 'Vitamina C 1000mg',
    type: 'supplement',
    source: 'woo',
    wooProductId: 'woo-1',
    wooProductImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop',
    frequencyPerDay: 1,
    unitsPerIntake: 1,
    unitLabel: 'capsulă',
    mealCondition: 'after',
    times: ['08:00'],
    startDate: '2026-03-01',
    endDate: '2026-04-01',
    packageSize: 30,
  },
  {
    id: '2',
    userId: 'u1',
    name: 'Omega 3',
    type: 'supplement',
    source: 'woo',
    wooProductId: 'woo-2',
    wooProductImage: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=100&h=100&fit=crop',
    frequencyPerDay: 2,
    unitsPerIntake: 1,
    unitLabel: 'capsulă',
    mealCondition: 'before',
    times: ['08:00', '20:00'],
    startDate: '2026-03-10',
    packageSize: 60,
  },
  {
    id: '3',
    userId: 'u1',
    name: 'Magneziu B6',
    type: 'supplement',
    source: 'manual',
    frequencyPerDay: 1,
    unitsPerIntake: 2,
    unitLabel: 'comprimate',
    mealCondition: 'none',
    times: ['21:00'],
    startDate: '2026-03-15',
    endDate: '2026-04-15',
  },
  {
    id: '4',
    userId: 'u1',
    name: 'Paracetamol',
    type: 'medication',
    source: 'manual',
    frequencyPerDay: 2,
    unitsPerIntake: 1,
    unitLabel: 'comprimat',
    mealCondition: 'after',
    times: ['09:00', '21:00'],
    startDate: '2026-03-18',
    endDate: '2026-03-25',
  },
];

const today = '2026-03-19';

export const mockIntakeLogs: IntakeLog[] = [
  { id: 'l1', treatmentId: '1', scheduledAt: `${today}T08:00:00`, status: 'taken', confirmedAt: `${today}T08:05:00` },
  { id: 'l2', treatmentId: '2', scheduledAt: `${today}T08:00:00`, status: 'taken', confirmedAt: `${today}T08:03:00` },
  { id: 'l3', treatmentId: '2', scheduledAt: `${today}T20:00:00`, status: 'pending' },
  { id: 'l4', treatmentId: '3', scheduledAt: `${today}T21:00:00`, status: 'pending' },
  { id: 'l5', treatmentId: '4', scheduledAt: `${today}T09:00:00`, status: 'skipped' },
  { id: 'l6', treatmentId: '4', scheduledAt: `${today}T21:00:00`, status: 'pending' },
  // Yesterday
  { id: 'l7', treatmentId: '1', scheduledAt: '2026-03-18T08:00:00', status: 'taken', confirmedAt: '2026-03-18T08:10:00' },
  { id: 'l8', treatmentId: '2', scheduledAt: '2026-03-18T08:00:00', status: 'taken', confirmedAt: '2026-03-18T08:02:00' },
  { id: 'l9', treatmentId: '2', scheduledAt: '2026-03-18T20:00:00', status: 'missed' },
  { id: 'l10', treatmentId: '3', scheduledAt: '2026-03-18T21:00:00', status: 'taken', confirmedAt: '2026-03-18T21:05:00' },
  // Day before
  { id: 'l11', treatmentId: '1', scheduledAt: '2026-03-17T08:00:00', status: 'taken', confirmedAt: '2026-03-17T08:00:00' },
  { id: 'l12', treatmentId: '2', scheduledAt: '2026-03-17T08:00:00', status: 'missed' },
  { id: 'l13', treatmentId: '2', scheduledAt: '2026-03-17T20:00:00', status: 'taken', confirmedAt: '2026-03-17T20:15:00' },
];

export const mockWooProducts: WooProduct[] = [
  { id: 'woo-1', name: 'Vitamina C 1000mg Zenyth', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop', price: '45.00 RON', url: '#' },
  { id: 'woo-2', name: 'Omega 3 Premium Zenyth', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=100&h=100&fit=crop', price: '69.00 RON', url: '#' },
  { id: 'woo-3', name: 'Colagen Marin Zenyth', image: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=100&h=100&fit=crop', price: '89.00 RON', url: '#' },
  { id: 'woo-4', name: 'Probiotice Zenyth', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&h=100&fit=crop', price: '55.00 RON', url: '#' },
  { id: 'woo-5', name: 'Vitamina D3 Zenyth', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&h=100&fit=crop', price: '35.00 RON', url: '#' },
];
