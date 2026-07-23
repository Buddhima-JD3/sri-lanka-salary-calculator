FROM node:20-alpine

LABEL io.modelcontextprotocol.server.name="io.github.Buddhima-JD3/sri-lanka-payslip"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY calculator.mjs mcp-server.mjs ./

USER node

CMD ["node", "mcp-server.mjs"]
