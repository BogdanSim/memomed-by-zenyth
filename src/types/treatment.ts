export type MealCondition = 'before' | 'after' | 'none';
export type TreatmentType = 'medication' | 'supplement';
export type TreatmentSource = 'manual' | 'woo';
export type IntakeStatus = 'taken' | 'skipped' | 'missed' | 'snoozed' | 'pending';

export interface Treatment {
  id: string;
  userId: string;
  name: string;
  type: TreatmentType;
  source: TreatmentSource;
  wooProductId?: string;
  wooProductImage?: string;
  frequencyPerDay: number;
  unitsPerIntake: number;
  unitLabel: string;
  mealCondition: MealCondition;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  packageSize?: number;
}

export interface Schedule {
  id: string;
  treatmentId: string;
  timeOfDay: string;
}

export interface IntakeLog {
  id: string;
  treatmentId: string;
  scheduledAt: string;
  status: IntakeStatus;
  confirmedAt?: string;
}

export interface WooProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  url: string;
}
