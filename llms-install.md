# Install the Sri Lanka Payslip MCP server

Use the hosted Streamable HTTP endpoint by default. It requires no API key,
account, or environment variables:

```text
https://mypayslip.lk/api/mcp
```

## Remote configuration

For Cline CLI, run:

```bash
cline mcp add sri-lanka-payslip https://mypayslip.lk/api/mcp \
  --transport streamable-http \
  --yes
```

For Cline IDE or another client that accepts an MCP server configuration,
create a server named `sri-lanka-payslip` using:

```json
{
  "mcpServers": {
    "sri-lanka-payslip": {
      "type": "streamableHttp",
      "url": "https://mypayslip.lk/api/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

After connecting, verify that these read-only tools are available:

- `calculate_sri_lanka_payslip`
- `get_sri_lanka_payroll_reference`
- `get_sri_lanka_payslip_checklist`

Call `calculate_sri_lanka_payslip` with `grossSalary: 200000`. The expected
regular primary-employment estimate is net pay of LKR 180,975.

## Local fallback

If the client only supports local stdio servers, use:

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

Node.js 18 or newer and Git are required for the local fallback. No API key or
environment variable is needed.

The server is read-only. Results are estimates for regular profits from
primary employment in Sri Lanka and are not payroll, tax, or legal advice.
