import {
  MONTHS_PER_YEAR,
  WEEKS_PER_YEAR,
  WORKDAYS_PER_YEAR,
} from '../../constants';
import type { TaxYearConfig } from './types';
import type { SalaryBreakdown, TaxBreakdown } from './types';

export function calculateBreakdown(
  gross: number,
  config: TaxYearConfig,
  opts?: { includeStudentLoan?: boolean; pensionRate?: number; extraSalarySacrifice?: number }
): SalaryBreakdown {
  const pensionRate = typeof opts?.pensionRate === 'number' ? opts.pensionRate : 0;
  const extraSalarySacrifice = typeof opts?.extraSalarySacrifice === 'number' ? opts.extraSalarySacrifice : 0;
  const pension = pensionRate > 0 ? gross * pensionRate : 0;
  const totalSalarySacrifice = pension + extraSalarySacrifice;
  let personalAllowance = config.PERSONAL_ALLOWANCE;
  if (gross > config.PERSONAL_ALLOWANCE_TAPER_THRESHOLD) {
    personalAllowance = Math.max(0, config.PERSONAL_ALLOWANCE - Math.floor((gross - config.PERSONAL_ALLOWANCE_TAPER_THRESHOLD) / 2));
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
    const basicBand = Math.min(config.BASIC_RATE_LIMIT - personalAllowance, remaining);
    taxBreakdown.basic = basicBand * config.BASIC_RATE;
    tax += taxBreakdown.basic;
    remaining -= basicBand;
  }
  // Higher
  if (remaining > 0) {
    const higherBand = Math.min(config.HIGHER_RATE_LIMIT - config.BASIC_RATE_LIMIT, remaining);
    taxBreakdown.higher = higherBand * config.HIGHER_RATE;
    tax += taxBreakdown.higher;
    remaining -= higherBand;
  }
  // Additional
  if (remaining > 0) {
    taxBreakdown.additional = remaining * config.ADDITIONAL_RATE;
    tax += taxBreakdown.additional;
  }

  // National Insurance
  let ni = 0;
  const niRemaining = gross - totalSalarySacrifice;
  for (const band of config.NI_BANDS) {
    if (niRemaining > band.threshold) {
      const upper = Math.min(band.limit, niRemaining);
      const bandAmount = Math.max(0, upper - band.threshold);
      ni += bandAmount * band.rate;
    }
  }

  // Student Loan Plan 2
  let studentLoan = 0;
  if (opts?.includeStudentLoan !== false) {
    const studentLoanIncome = gross - totalSalarySacrifice;
    studentLoan = studentLoanIncome > config.STUDENT_LOAN_THRESHOLD
      ? (studentLoanIncome - config.STUDENT_LOAN_THRESHOLD) * config.STUDENT_LOAN_RATE
      : 0;
  }

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

export function calculateHICBC(
  netIncome: number,
  config: TaxYearConfig,
  children: number = 1
): number {
  // Use config constants for thresholds and benefit rates
  const start = config.HICBC_START;
  const full = config.HICBC_FULL;
  const cbEldest = config.CHILD_BENEFIT_ELDEST_WEEKLY * 52;
  const cbOthers = (children - 1) * config.CHILD_BENEFIT_OTHERS_WEEKLY * 52;
  const totalBenefit = cbEldest + cbOthers;
  if (netIncome <= start) return 0;
  if (netIncome >= full) return totalBenefit;
  // Partial clawback: 1% for each £100 over start
  const percent = Math.floor((netIncome - start) / 100);
  return (percent / 100) * totalBenefit;
}
