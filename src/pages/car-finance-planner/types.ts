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
  yearly: number;
  monthly: number;
  threeYear: number;
};
