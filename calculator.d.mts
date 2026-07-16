export interface SalaryCalculationInput {
  /** Gross monthly employment income in Sri Lankan rupees. */
  grossSalary: number;
  /** EPF/ETF-eligible monthly earnings. Defaults to grossSalary. */
  epfEtfEarningsBase?: number;
}

export interface SalaryCalculation {
  yearOfAssessment: "2026/27";
  sourceTableYear: "2025/26";
  currency: "LKR";
  grossSalary: number;
  epfEtfEarningsBase: number;
  apit: number;
  employeeEpf: number;
  employerEpf: number;
  employerEtf: number;
  stampDuty: number;
  netPay: number;
  employerCost: number;
}

/** Calculate regular monthly primary-employment APIT. */
export function calculateApit(grossSalary: number): number;

/** Calculate a regular monthly Sri Lankan salary and payslip breakdown. */
export function calculateSalary(
  input: SalaryCalculationInput
): SalaryCalculation;
