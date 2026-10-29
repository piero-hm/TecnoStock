# Etapa 1: compilar Angular (Angular 22 requiere Node >= 22.12)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servir los estaticos con nginx y reenviar /api al backend
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# El builder de Angular deja la salida en dist/<nombre-proyecto>/browser
COPY --from=build /app/dist/*/browser /usr/share/nginx/html
EXPOSE 80
