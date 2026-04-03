FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve the built files with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Simple nginx config to support React router + proxy to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
