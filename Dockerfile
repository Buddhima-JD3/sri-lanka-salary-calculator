FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY calculator.mjs mcp-server.mjs ./

USER node

CMD ["node", "mcp-server.mjs"]
