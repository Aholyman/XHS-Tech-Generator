# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/services ./src/services

# Install only production dependencies and tsx for running server.ts
RUN npm install --omit=dev && npm install -g tsx

EXPOSE 3000

CMD ["tsx", "server.ts"]
