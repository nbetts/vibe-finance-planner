export const MONTHS_PER_YEAR = 12;
export const WEEKS_PER_YEAR = 52;
export const WORKDAYS_PER_YEAR = 260; // 5 days/week * 52 weeks
export const PERSONAL_ALLOWANCE_TAPER_THRESHOLD = 100000;
// src/constants.ts

export const PERSONAL_ALLOWANCE = 12570;
export const BASIC_RATE_LIMIT = 50270;
export const HIGHER_RATE_LIMIT = 125140;
export const ADDITIONAL_RATE_LIMIT = Infinity;

export const BASIC_RATE = 0.2;
export const HIGHER_RATE = 0.4;
export const ADDITIONAL_RATE = 0.45;

export const NI_BANDS = [
  { threshold: 0, rate: 0, limit: PERSONAL_ALLOWANCE }, // No NI below PA
  { threshold: PERSONAL_ALLOWANCE, rate: 0.08, limit: BASIC_RATE_LIMIT }, // Main rate
  { threshold: BASIC_RATE_LIMIT, rate: 0.02, limit: ADDITIONAL_RATE_LIMIT }, // Upper rate
];

export const STUDENT_LOAN_THRESHOLD = 27295;
export const STUDENT_LOAN_RATE = 0.09;
export const PENSION_RATE = 0.15;
