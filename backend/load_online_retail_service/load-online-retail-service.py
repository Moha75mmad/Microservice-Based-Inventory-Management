from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
import os
from pathlib import Path
from database import Base, engine, SessionLocal
from models import InventoryItem, Order, TransactionRecord

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # اجازه دسترسی به همه دامنه‌ها
    allow_credentials=True,
    allow_methods=["*"],  # اجازه استفاده از همه متدها
    allow_headers=["*"],  # اجازه استفاده از همه هدرها
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/inventory/load-online-retail")
def load_online_retail_data(db: Session = Depends(get_db)):
    data_url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx"
    local_file_path = "Online_Retail.xlsx"  # مسیر ذخیره فایل دانلود شده

    try:
        # دانلود فایل Excel با استفاده از wget
        os.system(f"wget {data_url} -O {local_file_path}")

        # خواندن فایل Excel به DataFrame
        df = pd.read_excel(local_file_path)

        # بررسی وجود داده‌های نامعتبر
        if df.empty:
            raise HTTPException(status_code=400, detail="Dataset is empty")

        inventory_items = []
        orders = []
        customer_orders = {}  # برای جلوگیری از ایجاد سفارش‌های تکراری برای هر مشتری
        transactions = []  # لیست تراکنش‌ها

        for _, row in df.iterrows():
            product_code = str(row["StockCode"])
            name = str(row["Description"])
            category = "Unknown"
            quantity = int(row["Quantity"]) if not pd.isna(row["Quantity"]) else 0
            price = float(row["UnitPrice"]) if not pd.isna(row["UnitPrice"]) else 0.0
            customer_id = row["CustomerID"]

            # بررسی مقادیر نامعتبر
            if not product_code or not name:
                continue  # از افزودن آیتم‌های نامعتبر صرف‌نظر کنید

            # بررسی تکراری بودن product_code
            existing_item = db.query(InventoryItem).filter(InventoryItem.product_code == product_code).first()
            if existing_item:
                continue  # اگر product_code تکراری بود، از افزودن آیتم صرف‌نظر کنید

            # ایجاد آیتم موجودی
            inventory_item = InventoryItem(
                product_code=product_code,
                name=name,
                category=category,
                quantity=quantity,
                price=price
            )
            inventory_items.append(inventory_item)

            # ثبت تراکنش برای اضافه شدن آیتم به موجودی
            transaction = TransactionRecord(
                product_code=product_code,
                change=quantity,
                transaction_type="Add Inventory",
                timestamp=pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
            )
            transactions.append(transaction)

            # ایجاد سفارش برای هر مشتری و به‌روزرسانی موجودی به صفر
            if not pd.isna(customer_id) and customer_id not in customer_orders:
                order = Order(
                    customer_name=f"Customer {int(customer_id)}",  # نام مشتری
                    product_code=product_code,
                    quantity=quantity,
                    status="Pending"
                )
                orders.append(order)
                customer_orders[customer_id] = True  # علامت‌گذاری مشتری به عنوان پردازش شده

                # به‌روزرسانی موجودی کالا و تبدیل آن به صفر
                inventory_item.quantity = 0

                # ثبت تراکنش برای ایجاد سفارش و کاهش موجودی
                order_transaction = TransactionRecord(
                    product_code=product_code,
                    change=-quantity,
                    transaction_type="Add Order",
                    timestamp=pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
                )
                transactions.append(order_transaction)

        # افزودن آیتم‌ها، سفارش‌ها و تراکنش‌ها به پایگاه داده
        db.add_all(inventory_items)
        db.add_all(orders)
        db.add_all(transactions)
        db.commit()

        # حذف فایل دانلود شده پس از پردازش (اختیاری)
        os.remove(local_file_path)

        return {
            "message": f"{len(inventory_items)} items added to inventory, {len(orders)} orders created, and {len(transactions)} transactions recorded from Online Retail dataset. Inventory quantities updated to zero for ordered items."
        }

    except Exception as e:
        db.rollback()
        # حذف فایل دانلود شده در صورت خطا (اختیاری)
        if os.path.exists(local_file_path):
            os.remove(local_file_path)
        raise HTTPException(status_code=500, detail=f"Failed to load Online Retail data: {str(e)}")