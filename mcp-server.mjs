#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { calculateSalary } from "./calculator.mjs";

const VERSION = "2026.7.24";
const METHODOLOGY_URL = "https://mypayslip.lk/methodology/";
const GENERATOR_URL = "https://mypayslip.lk/payslip-generator/";

const SOURCES = [
  {
    authority: "Inland Revenue Department",
    topic: "APIT tax tables",
    url: "https://www.ird.gov.lk/en/publications/sitepages/apit_tax_tables.aspx?menuid=1502",
  },
  {
    authority: "Inland Revenue Department",
    topic: "Income tax",
    url: "https://www.ird.gov.lk/en/type%20of%20taxes/sitepages/income%20tax.aspx?menuid=1201",
  },
  {
    authority: "Central Bank of Sri Lanka",
    topic: "Employees' Provident Fund",
    url: "https://www.cbsl.gov.lk/en/employees-provident-fund",
  },
  {
    authority: "Employees' Trust Fund Board",
    topic: "Employer ETF guidance",
    url: "https://etfb.lk/employer-details/",
  },
  {
    authority: "Inland Revenue Department",
    topic: "Stamp duty",
    url: "https://www.ird.gov.lk/en/type%20of%20taxes/sitepages/stampduty.aspx",
  },
];

const sourceSchema = z.object({
  authority: z.string(),
  topic: z.string(),
  url: z.string().url(),
});

const calculationOutputSchema = {
  yearOfAssessment: z.literal("2026/27"),
  sourceTableYear: z.literal("2025/26"),
  currency: z.literal("LKR"),
  grossSalary: z.number(),
  epfEtfEarningsBase: z.number(),
  apit: z.number(),
  employeeEpf: z.number(),
  employerEpf: z.number(),
  employerEtf: z.number(),
  stampDuty: z.number(),
  otherEmployeeDeductions: z.number(),
  totalEmployeeDeductions: z.number(),
  netPay: z.number(),
  employerCost: z.number(),
  methodologyUrl: z.string().url(),
  payslipGeneratorUrl: z.string().url(),
  caution: z.string(),
  sources: z.array(sourceSchema),
};

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toolResult(structuredContent) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(structuredContent, null, 2),
      },
    ],
    structuredContent,
  };
}

export function createPayslipMcpServer() {
  const server = new McpServer({
    name: "sri-lanka-payslip",
    version: VERSION,
  });

  server.registerTool(
    "calculate_sri_lanka_payslip",
    {
      title: "Calculate a Sri Lanka payslip",
      description:
        "Estimate monthly APIT/PAYE, employee and employer EPF, ETF, stamp duty, net pay, and employer cost for regular primary employment in Sri Lanka.",
      inputSchema: {
        grossSalary: z
          .number()
          .finite()
          .nonnegative()
          .describe("Gross monthly employment income in Sri Lankan rupees"),
        epfEtfEarningsBase: z
          .number()
          .finite()
          .nonnegative()
          .optional()
          .describe(
            "EPF/ETF-eligible monthly earnings; defaults to gross salary"
          ),
        otherEmployeeDeductions: z
          .number()
          .finite()
          .nonnegative()
          .default(0)
          .describe(
            "Optional non-statutory employee deductions, such as a loan repayment"
          ),
      },
      outputSchema: calculationOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({
      grossSalary,
      epfEtfEarningsBase,
      otherEmployeeDeductions,
    }) => {
      if (otherEmployeeDeductions > grossSalary) {
        throw new RangeError(
          "otherEmployeeDeductions cannot exceed grossSalary"
        );
      }

      const calculation = calculateSalary({
        grossSalary,
        ...(epfEtfEarningsBase === undefined
          ? {}
          : { epfEtfEarningsBase }),
      });
      const totalEmployeeDeductions = roundCurrency(
        calculation.apit +
          calculation.employeeEpf +
          calculation.stampDuty +
          otherEmployeeDeductions
      );

      return toolResult({
        ...calculation,
        otherEmployeeDeductions: roundCurrency(otherEmployeeDeductions),
        totalEmployeeDeductions,
        netPay: roundCurrency(grossSalary - totalEmployeeDeductions),
        methodologyUrl: METHODOLOGY_URL,
        payslipGeneratorUrl: GENERATOR_URL,
        caution:
          "Estimate for regular primary employment. Confirm the contribution base and unusual, bonus, terminal-benefit, secondary-employment, or non-resident cases with payroll records or a qualified adviser.",
        sources: SOURCES,
      });
    }
  );

  server.registerTool(
    "get_sri_lanka_payroll_reference",
    {
      title: "Get the Sri Lanka payroll reference",
      description:
        "Return the maintained APIT, EPF, ETF, and stamp-duty assumptions with official Sri Lankan sources and scope limits.",
      outputSchema: {
        yearOfAssessment: z.literal("2026/27"),
        sourceTableYear: z.literal("2025/26"),
        effectiveFrom: z.literal("2025-04-01"),
        currency: z.literal("LKR"),
        period: z.literal("monthly"),
        scope: z.string(),
        monthlyApitRelief: z.number(),
        employeeEpfRate: z.number(),
        employerEpfRate: z.number(),
        employerEtfRate: z.number(),
        stampDutyThreshold: z.number(),
        stampDutyAboveThreshold: z.number(),
        provenanceNote: z.string(),
        excludedCases: z.array(z.string()),
        methodologyUrl: z.string().url(),
        machineReadableMethodologyUrl: z.string().url(),
        openApiUrl: z.string().url(),
        citation: z.string(),
        sources: z.array(sourceSchema),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () =>
      toolResult({
        yearOfAssessment: "2026/27",
        sourceTableYear: "2025/26",
        effectiveFrom: "2025-04-01",
        currency: "LKR",
        period: "monthly",
        scope: "Regular profits from primary employment in Sri Lanka",
        monthlyApitRelief: 150000,
        employeeEpfRate: 0.08,
        employerEpfRate: 0.12,
        employerEtfRate: 0.03,
        stampDutyThreshold: 25000,
        stampDutyAboveThreshold: 25,
        provenanceNote:
          "The latest regular-employment APIT table published by the IRD is labelled 2025/26. Its relief and rates effective from 1 April 2025 remain the maintained basis for 2026/27.",
        excludedCases: [
          "bonus or lump-sum payments requiring another APIT table",
          "terminal benefits",
          "secondary employment",
          "non-resident employment",
          "unusual or disputed contributory earnings",
        ],
        methodologyUrl: METHODOLOGY_URL,
        machineReadableMethodologyUrl:
          "https://mypayslip.lk/calculation-methodology.json",
        openApiUrl: "https://mypayslip.lk/openapi.json",
        citation:
          "MyPayslip.lk, Sri Lanka 2026/27 payslip calculation methodology, verified 17 July 2026.",
        sources: SOURCES,
      })
  );

  server.registerTool(
    "get_sri_lanka_payslip_checklist",
    {
      title: "Get a Sri Lanka payslip checklist",
      description:
        "Return the fields and checks needed to prepare or review a Sri Lankan employee payslip.",
      outputSchema: {
        identityAndPeriod: z.array(z.string()),
        earnings: z.array(z.string()),
        employeeDeductions: z.array(z.string()),
        employerContributions: z.array(z.string()),
        verificationChecks: z.array(z.string()),
        evidenceNote: z.string(),
        guideUrl: z.string().url(),
        generatorUrl: z.string().url(),
        sources: z.array(sourceSchema),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () =>
      toolResult({
        identityAndPeriod: [
          "employer name and contact details",
          "employee name and identifier",
          "pay period and payment date",
        ],
        earnings: [
          "basic salary",
          "allowances",
          "overtime",
          "bonus or other earnings",
          "gross pay",
        ],
        employeeDeductions: [
          "APIT/PAYE",
          "employee EPF",
          "stamp duty where applicable",
          "other deductions shown separately",
          "total deductions",
          "net pay",
        ],
        employerContributions: ["employer EPF", "employer ETF"],
        verificationChecks: [
          "gross pay equals the sum of earnings",
          "the EPF/ETF contribution base matches eligible payroll earnings",
          "total deductions equal each displayed deduction",
          "net pay equals gross pay minus total employee deductions",
          "the payment received matches net pay",
        ],
        evidenceNote:
          "A payslip records the calculation but is not, by itself, proof that APIT, EPF, or ETF was remitted. Confirm remittances through the relevant official records.",
        guideUrl: "https://mypayslip.lk/how-to-read-payslip/",
        generatorUrl: GENERATOR_URL,
        sources: SOURCES,
      })
  );

  return server;
}

export async function startStdioServer() {
  const server = createPayslipMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sri Lanka payslip MCP server running on stdio");
}

const isDirectExecution =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  startStdioServer().catch((error) => {
    console.error("Sri Lanka payslip MCP server failed:", error);
    process.exitCode = 1;
  });
}
