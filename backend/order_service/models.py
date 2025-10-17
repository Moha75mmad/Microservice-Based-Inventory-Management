from sqlalchemy import Column, Integer, String, Float
from database import Base

class InventoryItem(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String, index=True)
    name = Column(String)
    category = Column(String)
    quantity = Column(Integer)
    price = Column(Float)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    product_code = Column(String)
    quantity = Column(Integer)
    status = Column(String, default="Pending")

class TransactionRecord(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String, index=True)
    change = Column(Integer)
    transaction_type = Column(String)
    timestamp = Column(String)