// src/salaryCalculations.ts

import {
  PERSONAL_ALLOWANCE,
  PERSONAL_ALLOWANCE_TAPER_THRESHOLD,
  BASIC_RATE_LIMIT,
  HIGHER_RATE_LIMIT,
  BASIC_RATE,
  HIGHER_RATE,
  ADDITIONAL_RATE,
  NI_BANDS,
  STUDENT_LOAN_THRESHOLD,
  STUDENT_LOAN_RATE,
  PENSION_RATE,
  MONTHS_PER_YEAR,
  WEEKS_PER_YEAR,
  WORKDAYS_PER_YEAR,
} from './constants';
import type { SalaryBreakdown, TaxBreakdown } from './types';

export function calculateBreakdown(gross: number): SalaryBreakdown {
  const pension = gross * PENSION_RATE;
  const extraSalarySacrifice = 0; // No extra salary sacrifice in current calculation
  const totalSalarySacrifice = pension + extraSalarySacrifice;
  let personalAllowance = PERSONAL_ALLOWANCE;
  if (gross > PERSONAL_ALLOWANCE_TAPER_THRESHOLD) {
    personalAllowance = Math.max(0, PERSONAL_ALLOWANCE - Math.floor((gross - PERSONAL_ALLOWANCE_TAPER_THRESHOLD) / 2));
  }
  const postSacrificeIncome = gross - totalSalarySacrifice;
  const taxableIncome = Math.max(0, postSacrificeIncome - personalAllowance);

  // Tax breakdown: apply bands to post-sacrifice income, but only tax the portion above personal allowance
  let remaining = postSacrificeIncome;
  let tax = 0;
  const taxBreakdown: TaxBreakdown = { personalAllowance: 0, basic: 0, higher: 0, additional: 0 };
  // Personal Allowance band (tax free)
  const paTaxed = Math.min(personalAllowance, remaining);
  taxBreakdown.personalAllowance = 0;
  remaining -= paTaxed;
  // Basic
  if (remaining > 0) {
    const basicBand = Math.min(BASIC_RATE_LIMIT - personalAllowance, remaining);
    taxBreakdown.basic = basicBand * BASIC_RATE;
    tax += taxBreakdown.basic;
    remaining -= basicBand;
  }
  // Higher
  if (remaining > 0) {
    const higherBand = Math.min(HIGHER_RATE_LIMIT - BASIC_RATE_LIMIT, remaining);
    taxBreakdown.higher = higherBand * HIGHER_RATE;
    tax += taxBreakdown.higher;
    remaining -= higherBand;
  }
  // Additional
  if (remaining > 0) {
    taxBreakdown.additional = remaining * ADDITIONAL_RATE;
    tax += taxBreakdown.additional;
  }

  // National Insurance
  let ni = 0;
  const niRemaining = gross - totalSalarySacrifice;
  for (const band of NI_BANDS) {
    if (niRemaining > band.threshold) {
      const upper = Math.min(band.limit, niRemaining);
      const bandAmount = Math.max(0, upper - band.threshold);
      ni += bandAmount * band.rate;
    }
  }

  // Student Loan Plan 2
  const studentLoanIncome = gross - totalSalarySacrifice;
  const studentLoan = studentLoanIncome > STUDENT_LOAN_THRESHOLD
    ? (studentLoanIncome - STUDENT_LOAN_THRESHOLD) * STUDENT_LOAN_RATE
    : 0;

  // Take-home
  const takeHome = gross - pension - extraSalarySacrifice - tax - ni - studentLoan;

  // Helper for breakdowns
  const perMonth = (n: number) => n / MONTHS_PER_YEAR;
  const perWeek = (n: number) => n / WEEKS_PER_YEAR;
  const perDay = (n: number) => n / WORKDAYS_PER_YEAR;

  return {
    gross,
    pension,
    extraSalarySacrifice,
    taxableIncome,
    tax,
    taxBreakdown,
    ni,
    studentLoan,
    takeHome,

    grossMonthly: perMonth(gross),
    grossWeekly: perWeek(gross),
    grossDaily: perDay(gross),
    pensionMonthly: perMonth(pension),
    pensionWeekly: perWeek(pension),
    pensionDaily: perDay(pension),
    extraSalarySacrificeMonthly: perMonth(extraSalarySacrifice),
    extraSalarySacrificeWeekly: perWeek(extraSalarySacrifice),
    extraSalarySacrificeDaily: perDay(extraSalarySacrifice),
    taxableIncomeMonthly: perMonth(taxableIncome),
    taxableIncomeWeekly: perWeek(taxableIncome),
    taxableIncomeDaily: perDay(taxableIncome),
    taxMonthly: perMonth(tax),
    taxWeekly: perWeek(tax),
    taxDaily: perDay(tax),
    niMonthly: perMonth(ni),
    niWeekly: perWeek(ni),
    niDaily: perDay(ni),
    studentLoanMonthly: perMonth(studentLoan),
    studentLoanWeekly: perWeek(studentLoan),
    studentLoanDaily: perDay(studentLoan),
    takeHomeMonthly: perMonth(takeHome),
    takeHomeWeekly: perWeek(takeHome),
    takeHomeDaily: perDay(takeHome),
  };
}
