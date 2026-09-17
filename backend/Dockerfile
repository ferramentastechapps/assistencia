FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY dist ./dist
COPY prisma ./prisma
RUN npx prisma generate

USER fastify

EXPOSE 3001

CMD ["node", "dist/server.js"]
