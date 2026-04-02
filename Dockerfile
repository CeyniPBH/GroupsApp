# Stage 1: Build the React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Usamos un placeholder que podemos encontrar y reemplazar fácilmente.
# Vite reemplazará import.meta.env.VITE_API_URL con este valor.
ARG VITE_API_URL=__VITE_API_URL_PLACEHOLDER__
RUN VITE_API_URL=$VITE_API_URL npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine
# Copiar los archivos compilados desde la etapa de construcción
COPY --from=build /app/dist /usr/share/nginx/html
# Eliminar la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf
# Copiar nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d
# Este script sustituirá la variable de entorno al iniciar el contenedor
COPY entrypoint.sh /entrypoint.sh
# Arreglar los finales de línea de Windows (CRLF -> LF) para que el script sea compatible con Linux
RUN sed -i 's/\r$//' /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
