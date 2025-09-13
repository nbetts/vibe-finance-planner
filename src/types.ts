export type TaxYearConfig = {
  yearLabel: string;
  PERSONAL_ALLOWANCE: number;
  PERSONAL_ALLOWANCE_TAPER_THRESHOLD: number;
  BASIC_RATE_LIMIT: number;
  HIGHER_RATE_LIMIT: number;
  ADDITIONAL_RATE_LIMIT: number;
  BASIC_RATE: number;
  HIGHER_RATE: number;
  ADDITIONAL_RATE: number;
  NI_BANDS: Array<{ threshold: number; rate: number; limit: number }>;
  STUDENT_LOAN_THRESHOLD: number;
  STUDENT_LOAN_RATE: number;
  PENSION_RATE: number;
};
// src/types.ts

export type TaxBreakdown = {
  personalAllowance: number;
  basic: number;
  higher: number;
  additional: number;
};

export type SalaryBreakdown = {
  gross: number;
  pension: number;
  extraSalarySacrifice: number;
  taxableIncome: number;
  tax: number;
  taxBreakdown: TaxBreakdown;
  ni: number;
  studentLoan: number;
  takeHome: number;

  grossMonthly: number;
  grossWeekly: number;
  grossDaily: number;
  pensionMonthly: number;
  pensionWeekly: number;
  pensionDaily: number;
  extraSalarySacrificeMonthly: number;
  extraSalarySacrificeWeekly: number;
  extraSalarySacrificeDaily: number;
  taxableIncomeMonthly: number;
  taxableIncomeWeekly: number;
  taxableIncomeDaily: number;
  taxMonthly: number;
  taxWeekly: number;
  taxDaily: number;
  niMonthly: number;
  niWeekly: number;
  niDaily: number;
  studentLoanMonthly: number;
  studentLoanWeekly: number;
  studentLoanDaily: number;
  takeHomeMonthly: number;
  takeHomeWeekly: number;
  takeHomeDaily: number;
};
