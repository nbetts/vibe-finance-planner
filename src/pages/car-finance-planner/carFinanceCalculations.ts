
import type { CarFinanceInputs, CarFinanceBreakdown } from './types';
import { MONTHS_PER_YEAR } from '../../constants';
import { LITRES_PER_GALLON } from '../../constants';

function parse(v: string) {
  const n = Number(v);
  return isNaN(n) || v.trim() === '' ? 0 : n;
}


export function calculateYearlyFuelCost(inputs: CarFinanceInputs): number {
  let mileage = parse(inputs.mileage);
  if (inputs.mileageUnit === 'month') {
    mileage = mileage * MONTHS_PER_YEAR;
  }
  const cost = parse(inputs.fuelCost);
  const efficiency = parse(inputs.fuelEfficiency);
  if (inputs.fuelType === 'unleaded') {
    // Unleaded: cost is pence/litre, efficiency is MPG
    // Formula: (mileage / MPG) * LITRES_PER_GALLON * (cost / 100) (£/litre)
    if (efficiency > 0) {
      return (mileage / efficiency) * LITRES_PER_GALLON * (cost / 100);
    }
  } else if (inputs.fuelType === 'electric') {
    // Electric: cost is pence/kWh, efficiency is miles/kWh
    // Formula: (mileage / milesPerKWh) * (cost / 100) (£/kWh)
    if (efficiency > 0) {
      return (mileage / efficiency) * (cost / 100);
    }
  }
  return 0;
}

export function calculateCarFinanceBreakdown(inputs: CarFinanceInputs): CarFinanceBreakdown {
  const yearlyFuel = calculateYearlyFuelCost(inputs);
  const totalYearly =
    parse(inputs.finance) +
    yearlyFuel +
    parse(inputs.roadTax) +
    parse(inputs.servicing) +
    parse(inputs.insurance);
  return {
    yearly: totalYearly,
    monthly: totalYearly / MONTHS_PER_YEAR,
    threeYear: totalYearly * 3,
  };
}
