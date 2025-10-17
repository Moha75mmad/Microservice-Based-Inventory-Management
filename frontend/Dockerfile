# مرحله Build
FROM node:16 AS build

WORKDIR /app

# کپی کردن فایل package.json و نصب وابستگی‌ها
COPY package.json ./
RUN npm install

# کپی کل پروژه و اجرای Build
COPY . .
RUN npm run build

# مرحله اجرا
FROM nginx:alpine

# کپی خروجی build به مسیر public در nginx
COPY --from=build /app/build /usr/share/nginx/html

# پورت Nginx
EXPOSE 5007

# اجرای Nginx
CMD ["nginx", "-g", "daemon off;"]