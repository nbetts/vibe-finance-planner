
import type { CarFinanceInputs, CarFinanceBreakdown } from './types';
import { MONTHS_PER_YEAR } from '../../constants';

function parse(v: string) {
  const n = Number(v);
  return isNaN(n) || v.trim() === '' ? 0 : n;
}

export function calculateCarFinanceBreakdown(inputs: CarFinanceInputs): CarFinanceBreakdown {
  const totalYearly =
    parse(inputs.finance) +
    parse(inputs.fuel) +
    parse(inputs.roadTax) +
    parse(inputs.servicing) +
    parse(inputs.insurance);
  return {
    yearly: totalYearly,
    monthly: totalYearly / MONTHS_PER_YEAR,
    threeYear: totalYearly * 3,
  };
}
