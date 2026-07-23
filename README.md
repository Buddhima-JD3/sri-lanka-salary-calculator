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

Install the package from npm after its first registry release, or directly
from this public repository now:

```bash
npm install github:Buddhima-JD3/sri-lanka-salary-calculator
```

```js
import { calculateSalary } from "sri-lanka-salary-calculator";

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

## Use with an AI assistant

This repository includes a local
[Model Context Protocol](https://modelcontextprotocol.io/) server built with
the official MCP SDK. It gives compatible AI assistants three read-only tools:

| Tool | Purpose |
| --- | --- |
| `calculate_sri_lanka_payslip` | Calculate APIT/PAYE, EPF, ETF, stamp duty, net pay, and employer cost |
| `get_sri_lanka_payroll_reference` | Retrieve maintained assumptions, scope limits, and official sources |
| `get_sri_lanka_payslip_checklist` | Prepare or review the required payslip fields and arithmetic checks |

Use the no-auth Streamable HTTP endpoint when the client supports remote MCP
servers:

```text
https://mypayslip.lk/api/mcp
```

The same tools can run locally over stdio. In that mode, salary inputs are not
sent to MyPayslip.lk or another external service.

Official MCP Registry:
[`io.github.Buddhima-JD3/sri-lanka-payslip`](https://registry.modelcontextprotocol.io/?q=io.github.Buddhima-JD3%2Fsri-lanka-payslip)

Agent-oriented installation instructions are available in
[`llms-install.md`](./llms-install.md).

The Registry package is a public AMD64/ARM64 container:

```bash
docker run -i --rm ghcr.io/buddhima-jd3/sri-lanka-payslip-mcp:2026.27.2
```

Add it to an MCP client configuration:

```json
{
  "mcpServers": {
    "sri-lanka-payslip": {
      "command": "npx",
      "args": [
        "-y",
        "github:Buddhima-JD3/sri-lanka-salary-calculator"
      ]
    }
  }
}
```

Or start it from this repository:

```bash
npm install
npm run mcp
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
