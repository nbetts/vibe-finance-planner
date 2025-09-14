export type CarFinanceInputs = {
  finance: string;
  roadTax: string;
  servicing: string;
  insurance: string;
  mileage: string;
  mileageUnit: 'year' | 'month';
  fuelType: 'unleaded' | 'electric';
  fuelCost: string;
  fuelEfficiency: string;
};

export type CarFinanceBreakdown = {
  finance: number;
  fuel: number;
  roadTax: number;
  servicing: number;
  insurance: number;
  total: number;
};
