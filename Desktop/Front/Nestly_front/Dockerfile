# Builder: Node para compilar Angular
FROM node:22.13.1 AS builder
WORKDIR /app

# Instala dependencias primero para cache eficiente
COPY package*.json ./
RUN npm ci

# Copia el resto del código y construye
COPY . .
# Fuerza salida a /dist para no depender del nombre del proyecto
RUN npx ng build

# Runtime: Nginx para servir la SPA
FROM nginx:alpine
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/