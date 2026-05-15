# Levay OS - Production Dockerfile
# Multi-stage build for optimized image size

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 levay

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/apps/workers/dist ./apps/workers/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Security headers
ENV ENABLE_AUTH=true
ENV ENABLE_RATE_LIMIT=true

USER levay
WORKDIR /app

EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]