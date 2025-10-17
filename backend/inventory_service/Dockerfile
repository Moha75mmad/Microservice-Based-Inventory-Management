# استفاده از یک تصویر پایه پایتون
FROM python:3.9-slim

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی فایل‌های مورد نیاز
COPY requirements.txt .
COPY inventory_service.py .
COPY database.py .
COPY models.py .

# نصب وابستگی‌ها
RUN pip install -r requirements.txt

# دستور اجرای میکروسرویس
CMD ["uvicorn", "inventory_service:app", "--host", "0.0.0.0", "--port", "5001"]