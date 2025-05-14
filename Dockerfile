# Imagen base
FROM node:18

# Directorio de trabajo
WORKDIR /app

# Copiar todos los archivos
COPY . .

# Exponer puerto de desarrollo de Vite
EXPOSE 5173

# Comando de inicio (modo desarrollo con host 0.0.0.0)
CMD ["yarn", "dev", "--host"]
