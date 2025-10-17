from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, SessionLocal
from models import Order, InventoryItem, TransactionRecord
import pandas as pd

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

class OrderCreate(BaseModel):
    customer_name: str
    product_code: str
    quantity: int

@app.post("/orders/place")
def place_order(order: OrderCreate, db: Session = Depends(get_db)):
    # بررسی وجود محصول در موجودی
    inventory_item = db.query(InventoryItem).filter(InventoryItem.product_code == order.product_code).first()
    
    # اگر محصول وجود نداشته باشد
    if not inventory_item:
        raise HTTPException(status_code=404, detail="Product not found in inventory")
    
    # اگر موجودی محصول کمتر از مقدار درخواستی باشد
    if inventory_item.quantity < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock for the product")
    
    # کاهش موجودی محصول
    inventory_item.quantity -= order.quantity
    
    # ایجاد سفارش
    db_order = Order(
        customer_name=order.customer_name,
        product_code=order.product_code,
        quantity=order.quantity,
        status="Pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # ثبت تراکنش برای کاهش موجودی
    transaction = TransactionRecord(
        product_code=order.product_code,
        change=-order.quantity,  # مقدار تغییر در موجودی (منفی به دلیل کاهش موجودی)
        transaction_type="ADD Order",  # نوع تراکنش (سفارش)
        timestamp=pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")  # زمان فعلی
    )
    db.add(transaction)
    db.commit()

    return {"message": "Order placed successfully", "order": db_order}

@app.get("/orders")
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders