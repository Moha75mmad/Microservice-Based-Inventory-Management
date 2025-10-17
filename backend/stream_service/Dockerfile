# استفاده از یک تصویر پایه پایتون
FROM python:3.9-slim

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی فایل‌های مورد نیاز
COPY requirements.txt .
COPY stream-service.py .
COPY database.py .
COPY models.py .

# نصب وابستگی‌ها
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# دستور اجرای میکروسرویس
CMD ["uvicorn", "stream-service:app", "--host", "0.0.0.0", "--port", "5005"]