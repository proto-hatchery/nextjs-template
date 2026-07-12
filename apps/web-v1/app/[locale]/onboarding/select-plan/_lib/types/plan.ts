export interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  stripePriceId?: string;
  badge?: string;
  highlighted?: boolean;
}
