FROM node:20-alpine AS build
WORKDIR /app

# Instala deps de producción
COPY package*.json ./
RUN npm ci --only=production

# Copia y compila
COPY . .
RUN npm run build

# ===== etapa de runtime =====
FROM node:20-alpine AS runtime
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Variables de entorno en Cloud Run inyectan aquí
ENV NODE_ENV=production

# Arranca la app
CMD ["node", "dist/main"]
