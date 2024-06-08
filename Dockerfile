FROM node:21-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml prisma ./
RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm prisma generate

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000
CMD [ "node", "dist/index.js" ]
