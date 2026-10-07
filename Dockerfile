# Estágio de compilação
FROM node:22-alpine AS builder
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia código-fonte e gera build de produção
COPY . .
RUN npm run build

# Estágio de execução com Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

