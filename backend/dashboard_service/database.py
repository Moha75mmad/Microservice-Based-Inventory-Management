from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# تنظیمات پایگاه داده PostgreSQL
DATABASE_URL = "postgresql://user:password@postgres-service:5432/mydatabase"

# ایجاد موتور پایگاه داده
engine = create_engine(DATABASE_URL)

# ایجاد SessionLocal برای دسترسی به پایگاه داده
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base برای مدل‌های داده
Base = declarative_base()