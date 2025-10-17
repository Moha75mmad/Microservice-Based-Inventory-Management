from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import InventoryItem, TransactionRecord, Order

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

@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    inventory_count = db.query(InventoryItem).count()
    transaction_count = db.query(TransactionRecord).count()
    order_count = db.query(Order).count()
    return {
        "total_inventory_items": inventory_count,
        "total_transactions": transaction_count,
        "total_orders": order_count
    }