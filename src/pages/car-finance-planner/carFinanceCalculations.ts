
import type { CarFinanceInputs, CarFinanceBreakdown, CarValueForecastPoint } from './types';
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
  const finance = parse(inputs.finance);
  const fuel = calculateYearlyFuelCost(inputs);
  const roadTax = parse(inputs.roadTax);
  const servicing = parse(inputs.servicing);
  const insurance = parse(inputs.insurance);
  const total = finance + fuel + roadTax + servicing + insurance;
  return {
    finance,
    fuel,
    roadTax,
    servicing,
    insurance,
    total,
  };
}

export function forecastCarValues(
  currentValue: number,
  currentAge: number,
  yearsAhead: number,
  currentMiles: number,
  annualMiles: number = 9000
): CarValueForecastPoint[] {
  // depreciation rates
  const r1 = 0.25; // years 0–3
  const r2 = 0.15; // years 4–7
  const r3 = 0.1; // years 8–20+
  const scrapValue = 0;
  const mileagePenaltyPerThousand = 75; // £ adjustment per 1k miles diff

  let value = currentValue;
  const forecast: CarValueForecastPoint[] = [];

  for (let i = 1; i <= yearsAhead; i++) {
    const age = currentAge + i;

    if (age < 3) {
      value *= 1 - r1;
    } else if (age < 7) {
      value *= 1 - r2;
    } else if (age < 20) {
      value *= 1 - r3;
    } else {
      value = scrapValue;
    }

    // Mileage adjustment
    const expectedMiles = age * annualMiles;
    const actualMiles = currentMiles + i * annualMiles;
    const diff = actualMiles - expectedMiles;
    const mileageAdjustment = (diff / 1000) * mileagePenaltyPerThousand;

    value -= mileageAdjustment;

    forecast.push({
      age,
      value: Math.max(value, scrapValue),
    });
  }

  return forecast;
}
