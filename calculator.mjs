const MONTHLY_RELIEF = 150000;
const STAMP_DUTY_THRESHOLD = 25000;
const STAMP_DUTY = 25;

const MONTHLY_APIT_BANDS = [
  { width: 1000000 / 12, rate: 0.06 },
  { width: 500000 / 12, rate: 0.18 },
  { width: 500000 / 12, rate: 0.24 },
  { width: 500000 / 12, rate: 0.3 },
  { width: Number.POSITIVE_INFINITY, rate: 0.36 },
];

function requireNonNegativeNumber(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a finite, non-negative number`);
  }
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateApit(grossSalary) {
  requireNonNegativeNumber(grossSalary, "grossSalary");

  let taxable = Math.max(0, grossSalary - MONTHLY_RELIEF);
  let tax = 0;

  for (const band of MONTHLY_APIT_BANDS) {
    if (taxable <= 0) break;
    const amountInBand = Math.min(taxable, band.width);
    tax += amountInBand * band.rate;
    taxable -= amountInBand;
  }

  return roundCurrency(tax);
}

export function calculateSalary({
  grossSalary,
  epfEtfEarningsBase = grossSalary,
}) {
  requireNonNegativeNumber(grossSalary, "grossSalary");
  requireNonNegativeNumber(epfEtfEarningsBase, "epfEtfEarningsBase");

  if (epfEtfEarningsBase > grossSalary) {
    throw new RangeError("epfEtfEarningsBase cannot exceed grossSalary");
  }

  const apit = calculateApit(grossSalary);
  const employeeEpf = roundCurrency(epfEtfEarningsBase * 0.08);
  const employerEpf = roundCurrency(epfEtfEarningsBase * 0.12);
  const employerEtf = roundCurrency(epfEtfEarningsBase * 0.03);
  const stampDuty = grossSalary > STAMP_DUTY_THRESHOLD ? STAMP_DUTY : 0;
  const netPay = roundCurrency(
    grossSalary - apit - employeeEpf - stampDuty
  );
  const employerCost = roundCurrency(
    grossSalary + employerEpf + employerEtf
  );

  return {
    yearOfAssessment: "2026/27",
    sourceTableYear: "2025/26",
    currency: "LKR",
    grossSalary: roundCurrency(grossSalary),
    epfEtfEarningsBase: roundCurrency(epfEtfEarningsBase),
    apit,
    employeeEpf,
    employerEpf,
    employerEtf,
    stampDuty,
    netPay,
    employerCost,
  };
}
