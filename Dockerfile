
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar sólo archivos de dependencias primero para aprovechar cache
COPY package*.json ./

# Instala dependencias (instala dev deps para build y luego se podará)
RUN npm install

# Copiar el resto del código
COPY . .

# Elimina dependencias de desarrollo para la etapa final
RUN npm prune --production

# Etapa final: imagen más ligera y segura
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copiar node_modules y código desde el builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Asegurar permisos y usar usuario no root (imagen official tiene usuario 'node')
RUN chown -R node:node /app

USER node

EXPOSE 3000

# Healthcheck usando node en la propia imagen
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000), () => process.exit(0)).on('error', () => process.exit(1))"

CMD ["node", "app.js"]
