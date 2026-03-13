# 阶段 1: 构建
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 阶段 2: 部署
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
# 复制自定义 Nginx 配置（处理 try_files $uri /index.html）
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]