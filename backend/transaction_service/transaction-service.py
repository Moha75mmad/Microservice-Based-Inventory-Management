from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, SessionLocal
from models import TransactionRecord, InventoryItem, Order  # وارد کردن مدل‌های لازم

app = FastAPI()

# اضافه کردن CORS middleware
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

class TransactionCreate(BaseModel):
    product_code: str
    change: int
    transaction_type: str
    timestamp: str

@app.post("/transactions/add")
def add_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = TransactionRecord(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return {"message": "Transaction recorded successfully", "transaction": db_transaction}

@app.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(TransactionRecord).all()
    return transactions

@app.post("/clear-all-data")
def clear_all_data(db: Session = Depends(get_db)):
    try:
        # پاک کردن تمامی داده‌های inventory
        db.query(InventoryItem).delete()
        
        # پاک کردن تمامی داده‌های orders
        db.query(Order).delete()
        
        # پاک کردن تمامی داده‌های transactions
        db.query(TransactionRecord).delete()
        
        # اعمال تغییرات در دیتابیس
        db.commit()
        
        return {"message": "All data (inventory, orders, transactions) cleared successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to clear data: {str(e)}")