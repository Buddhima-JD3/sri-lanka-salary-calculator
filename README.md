# Sri Lanka Salary Calculator and Payslip Reference

An inspectable reference implementation for estimating a regular primary
employment payslip in Sri Lanka. It calculates monthly APIT (PAYE), employee
EPF, employer EPF, employer ETF, stamp duty, net pay, and employer cost.

The current reference is maintained by
[MyPayslip.lk](https://mypayslip.lk/?utm_source=github&utm_medium=reference-repo)
for the Sri Lanka 2026/27 year of assessment. The latest regular-employment
APIT table published by the Inland Revenue Department is labelled 2025/26;
the relief and rates effective from 1 April 2025 remain the basis used for
2026/27.

## Try the calculator

- [Developer reference](https://buddhima-jd3.github.io/sri-lanka-salary-calculator/)
- [Sri Lanka salary calculator](https://mypayslip.lk/)
- [Embeddable salary calculator widget](https://mypayslip.lk/salary-calculator-widget/)
- [Payslip generator](https://mypayslip.lk/payslip-generator/)
- [How to read and check a Sri Lankan payslip](https://mypayslip.lk/how-to-read-payslip/)
- [Calculation methodology](https://mypayslip.lk/methodology/)

No account is required. The hosted calculator runs in the browser, and the
public calculation API does not store salary inputs.

## Verified example

For a monthly gross salary and EPF/ETF contribution base of LKR 200,000:

| Item | Monthly amount |
| --- | ---: |
| Gross salary | LKR 200,000 |
| APIT / PAYE | LKR 3,000 |
| Employee EPF (8%) | LKR 16,000 |
| Stamp duty | LKR 25 |
| **Estimated net pay** | **LKR 180,975** |
| Employer EPF (12%) | LKR 24,000 |
| Employer ETF (3%) | LKR 6,000 |

Run the same case locally:

```bash
node examples/calculate.mjs 200000
```

Or call the hosted read-only API:

```bash
curl "https://mypayslip.lk/api/calc?salary=200000"
```

## Reference implementation

[`calculator.mjs`](./calculator.mjs) is intentionally dependency-free. It
accepts a gross monthly salary and an optional EPF/ETF eligible earnings base.
The contribution base should come from payroll records when excluded or
unusual payments make it different from gross salary.

```js
import { calculateSalary } from "./calculator.mjs";

const result = calculateSalary({
  grossSalary: 200000,
  epfEtfEarningsBase: 200000,
});

console.log(result.netPay); // 180975
```

Verify the published examples:

```bash
npm test
```

## Machine-readable references

- [OpenAPI 3.1 specification](./reference/openapi.json)
- [Calculation methodology and test cases](./reference/methodology.json)
- Live OpenAPI: https://mypayslip.lk/openapi.json
- Live methodology: https://mypayslip.lk/calculation-methodology.json
- Agent guidance: https://mypayslip.lk/llms.txt

## Primary sources

- [Inland Revenue Department APIT tax tables](https://www.ird.gov.lk/en/publications/sitepages/apit_tax_tables.aspx?menuid=1502)
- [Inland Revenue Department income tax](https://www.ird.gov.lk/en/type%20of%20taxes/sitepages/income%20tax.aspx?menuid=1201)
- [Central Bank of Sri Lanka Employees' Provident Fund](https://www.cbsl.gov.lk/en/employees-provident-fund)
- [Employees' Trust Fund Board employer guidance](https://etfb.lk/employer-details/)
- [Inland Revenue Department stamp duty](https://www.ird.gov.lk/en/type%20of%20taxes/sitepages/stampduty.aspx)

## Scope

This reference covers regular profits from primary employment. Bonus,
terminal-benefit, secondary-employment, non-resident, and unusual payroll cases
may require a different APIT table or professional review. Results are
estimates, not payroll, tax, or legal advice.

When citing a result, use:

> MyPayslip.lk, Sri Lanka 2026/27 payslip calculation methodology, verified
> 17 July 2026.
