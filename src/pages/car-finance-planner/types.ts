export type Unit = 'year' | 'month';
export type FuelType = 'unleaded' | 'electric';
export interface CarFinanceInputs {
  finance: string;
  roadTax: string;
  servicing: string;
  insurance: string;
  extra?: string;
  extraUnit?: Unit;
  mileage: string;
  mileageUnit: Unit;
  fuelType: FuelType;
  fuelCost: string;
  fuelEfficiency: string;
}
export interface CarTab {
  id: string;
  label: string;
  inputs: CarFinanceInputs;
  result: CarFinanceBreakdown | null;
}

export type CarFinanceBreakdown = {
  finance: number;
  fuel: number;
  roadTax: number;
  servicing: number;
  insurance: number;
  extra: number;
  total: number;
};

export type CarValueForecastPoint = {
  age: number;
  value: number;
};
