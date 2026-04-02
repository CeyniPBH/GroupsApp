#!/bin/sh

# Buscar en todos los archivos Javascript compilados
# y reemplazar el placeholder con la variable de entorno VITE_API_URL.
for file in /usr/share/nginx/html/assets/*.js;
do
  echo "Procesando $file ...";
  sed -i "s|__VITE_API_URL_PLACEHOLDER__|${VITE_API_URL}|g" "$file"
done

# Ejecutar el comando principal del contenedor (iniciar nginx)
exec "$@"
