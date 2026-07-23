import assert from "node:assert/strict";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createPayslipMcpServer } from "./mcp-server.mjs";

async function withClient(test) {
  const server = createPayslipMcpServer();
  const client = new Client({
    name: "sri-lanka-payslip-test-client",
    version: "1.0.0",
  });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  try {
    await test(client);
  } finally {
    await client.close();
    await server.close();
  }
}

describe("Sri Lanka payslip MCP server", () => {
  it("advertises the three read-only payroll tools", async () => {
    await withClient(async (client) => {
      const result = await client.listTools();

      assert.deepEqual(
        result.tools.map((tool) => tool.name).sort(),
        [
          "calculate_sri_lanka_payslip",
          "get_sri_lanka_payroll_reference",
          "get_sri_lanka_payslip_checklist",
        ]
      );
      assert.ok(result.tools.every((tool) => tool.annotations?.readOnlyHint));
    });
  });

  it("returns a cited structured LKR 200,000 calculation", async () => {
    await withClient(async (client) => {
      const result = await client.callTool({
        name: "calculate_sri_lanka_payslip",
        arguments: {
          grossSalary: 200000,
          epfEtfEarningsBase: 200000,
          otherEmployeeDeductions: 1000,
        },
      });

      assert.equal(result.isError, undefined);
      assert.equal(result.structuredContent.apit, 3000);
      assert.equal(result.structuredContent.employeeEpf, 16000);
      assert.equal(result.structuredContent.totalEmployeeDeductions, 20025);
      assert.equal(result.structuredContent.netPay, 179975);
      assert.equal(result.structuredContent.sources.length, 5);
      assert.equal(
        result.structuredContent.methodologyUrl,
        "https://mypayslip.lk/methodology/"
      );
    });
  });

  it("returns reference provenance and a verification checklist", async () => {
    await withClient(async (client) => {
      const reference = await client.callTool({
        name: "get_sri_lanka_payroll_reference",
        arguments: {},
      });
      const checklist = await client.callTool({
        name: "get_sri_lanka_payslip_checklist",
        arguments: {},
      });

      assert.equal(reference.structuredContent.yearOfAssessment, "2026/27");
      assert.equal(reference.structuredContent.employeeEpfRate, 0.08);
      assert.match(reference.structuredContent.citation, /MyPayslip\.lk/);
      assert.ok(
        checklist.structuredContent.verificationChecks.includes(
          "net pay equals gross pay minus total employee deductions"
        )
      );
      assert.match(checklist.structuredContent.evidenceNote, /not.*proof/i);
    });
  });

  it("reports invalid tool input through the MCP protocol", async () => {
    await withClient(async (client) => {
      const result = await client.callTool({
        name: "calculate_sri_lanka_payslip",
        arguments: {
          grossSalary: 100000,
          epfEtfEarningsBase: 110000,
        },
      });

      assert.equal(result.isError, true);
      assert.match(result.content[0].text, /cannot exceed grossSalary/);
    });
  });

  it("starts as a symlinked package executable over stdio", async () => {
    const client = new Client({
      name: "sri-lanka-payslip-stdio-test-client",
      version: "1.0.0",
    });
    const fixtureDirectory = await mkdtemp(
      join(tmpdir(), "sri-lanka-payslip-mcp-")
    );
    const executablePath = join(fixtureDirectory, "sri-lanka-payslip-mcp");
    await symlink(
      fileURLToPath(new URL("./mcp-server.mjs", import.meta.url)),
      executablePath
    );
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [executablePath],
      stderr: "pipe",
    });

    try {
      await client.connect(transport);
      const result = await client.callTool({
        name: "calculate_sri_lanka_payslip",
        arguments: { grossSalary: 200000 },
      });

      assert.equal(result.structuredContent.netPay, 180975);
    } finally {
      await client.close();
      await rm(fixtureDirectory, { recursive: true, force: true });
    }
  });
});
