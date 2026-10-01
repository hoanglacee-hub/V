# Dockerfile for Next.js + SQLite Deployment (Render, Railway, Fly.io)

FROM node:20-alpine AS base

# 1. Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Tạo Database rỗng trước khi build để Prisma tự sinh Types
RUN npx prisma generate
RUN npm run build

# 3. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Cần thư mục này để lưu trữ SQLite bền vững khi mount Volume
RUN mkdir -p /app/data
ENV DATABASE_URL="file:/app/data/prod.db"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Script tự động chạy migrations khi start container
RUN echo '#!/bin/sh' > /app/start.sh
RUN echo 'npx prisma db push --accept-data-loss' >> /app/start.sh
RUN echo 'node server.js' >> /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
