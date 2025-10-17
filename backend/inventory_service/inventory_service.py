from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import pandas as pd
from database import Base, engine, SessionLocal
from models import InventoryItem, TransactionRecord

app = FastAPI()

# اضافه کردن CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # اجازه دسترسی به همه دامنه‌ها
    allow_credentials=True,
    allow_methods=["*"],  # اجازه استفاده از همه متدها (شامل OPTIONS)
    allow_headers=["*"],  # اجازه استفاده از همه هدرها
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class InventoryCreate(BaseModel):
    product_code: str
    name: str
    category: str
    quantity: int
    price: float

@app.post("/inventory/add")
def add_inventory(item: InventoryCreate, db: Session = Depends(get_db)):
    db_item = InventoryItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    # ثبت تراکنش برای اضافه شدن آیتم به موجودی
    transaction = TransactionRecord(
        product_code=item.product_code,
        change=item.quantity,  # مقدار تغییر در موجودی
        transaction_type="Add Inventory",  # نوع تراکنش (اضافه شدن به موجودی)
        timestamp=pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")  # زمان فعلی
    )
    db.add(transaction)
    db.commit()

    return {"message": "Item added successfully", "item": db_item}

@app.get("/inventory/analyze")
def analyze_inventory(db: Session = Depends(get_db)):
    try:
        # دریافت تمام آیتم‌های موجودی از دیتابیس
        items = db.query(InventoryItem).all()
        
        # اگر هیچ آیتمی وجود نداشته باشد
        if not items:
            raise HTTPException(status_code=404, detail="No inventory items found")
        
        # ساخت لیستی از آیتم‌ها با فیلدهای مورد نیاز
        inventory_items = []
        for item in items:
            inventory_items.append({
                "name": item.name,
                "category": item.category,
                "quantity": item.quantity if item.quantity is not None else 0,
                "price": float(item.price) if item.price is not None else 0.0
            })
        
        # برگرداندن پاسخ
        return {"inventory_items": inventory_items}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    items = db.query(InventoryItem).filter(InventoryItem.quantity < 2).all()
    if not items:
        return {"message": "No alerts"}
    return {"alerts": [f"Low stock warning for {item.name} (Code: {item.product_code})" for item in items]}

# اضافه کردن مسیر OPTIONS برای پشتیبانی از CORS Preflight
@app.options("/inventory/add")
async def options_inventory_add():
    return {"message": "OK"}