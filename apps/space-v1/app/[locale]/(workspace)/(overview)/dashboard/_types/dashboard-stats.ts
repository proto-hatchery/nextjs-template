export interface DashboardStats {
  monthly_revenue: number;
  sessions_completed: number;
  active_patients: number;
  attendance_rate: number;
  revenue_growth_percent: number;
  sessions_growth_percent: number;
}

export type ValueType = "currency" | "counter";

export interface CurrencyValue {
  type: "currency";
  value: string;
}

export interface CounterValue {
  type: "counter";
  current: string;
  total: string;
}

export type StatValue = CurrencyValue | CounterValue;

export interface StatCardData {
  id: string;
  label: string;
  tooltip: string;
  mainValue: StatValue;
  progressValue?: number;
  hasGoal?: boolean;
  meta?: number;
}
