# Stage 1: Build aplikasi
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package management files dulu agar bisa memanfaatkan cache Docker
COPY package*.json ./
RUN npm ci

# Copy seluruh source code dan lakukan build
COPY . .
RUN npm run build

# Stage 2: Sajikan hasil build menggunakan Nginx (Production Ready)
FROM nginx:1.25-alpine

# Copy hasil build Vite (biasanya di folder 'dist') ke direktori Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy konfigurasi custom Nginx untuk handle client-side routing (React Router)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]