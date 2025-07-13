# 1) Build stage: instalo todo y compilo
FROM node:20-alpine AS builder
WORKDIR /app

# Copio package.json + lock
COPY package*.json ./

# Instalo TODAS las deps (dev y prod) para poder usar nest CLI
RUN npm ci

# Copio el resto y ejecuto build
COPY . .
RUN npm run build

# 2) Runtime stage: solo prod deps + dist
FROM node:20-alpine AS runner
WORKDIR /app

# Copio prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copio el resultado del build
COPY --from=builder /app/dist ./dist

# Establezco entorno de producción
ENV NODE_ENV=production

# Exponemos el puerto (no obligatorio, Cloud Run lo infiere)
EXPOSE 3000

# Arranco la app
CMD ["node", "dist/main"]
