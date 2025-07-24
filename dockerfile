# Build stage: se crea un contenedor para compilar la aplicación
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
RUN npm run build

# Runtime stage: se crea un contenedor para ejecutar la aplicación
FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
