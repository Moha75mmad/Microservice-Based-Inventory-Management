from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from pathlib import Path
import threading

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # اجازه دسترسی به همه دامنه‌ها
    allow_credentials=True,
    allow_methods=["*"],  # اجازه استفاده از همه متدها
    allow_headers=["*"],  # اجازه استفاده از همه هدرها
)

# تنظیمات استریم
stream_lock = threading.Lock()
STREAM_POSITION_FILE = "stream_position.txt"
DATASET_URL = "https://drive.usercontent.google.com/u/0/uc?id=1IHM2en4-A4-1QDgYovzPuWFL1QiSPI1M&export=download"
DATASET_PATH = "customer_reviews.csv"
df_stream = None

def load_stream_dataset():
    global df_stream
    if df_stream is None:
        # دانلود دیتاست با curl
        if not Path(DATASET_PATH).exists():
            os.system(f"curl -L '{DATASET_URL}' -o {DATASET_PATH}")
        
        # خواندن فایل CSV با کدگذاری مناسب
        try:
            df_stream = pd.read_csv(DATASET_PATH, encoding='latin1')
        except UnicodeDecodeError:
            df_stream = pd.read_csv(DATASET_PATH, encoding='utf-8')
        
        # تغییر نام ستون‌ها (متناسب با دیتاست واقعی)
        df_stream = df_stream.rename(columns={
            'Customer name': 'customer_name',  
            'Rating': 'rating',                
            'Category': 'category',            
            'Comments': 'comments'             
        })

def get_stream_position():
    try:
        with open(STREAM_POSITION_FILE, "r") as f:
            return int(f.read().strip())
    except:
        return 0

def update_stream_position(pos):
    with open(STREAM_POSITION_FILE, "w") as f:
        f.write(str(pos))

@app.get("/stream_data")
def stream_data():
    with stream_lock:
        load_stream_dataset()
        
        # بررسی محتویات df_stream
        #print("DataFrame Columns:", df_stream.columns)
        #print("First few rows of DataFrame:", df_stream.head())
        
        current_pos = get_stream_position()
        total_records = len(df_stream)
        
        # Reset position اگر به انتها رسید
        if current_pos >= total_records:
            current_pos = 0
            update_stream_position(0)
        
        # محاسبه محدوده داده‌ها (همواره 20 آیتم)
        start_idx = max(0, current_pos - 19)
        end_idx = current_pos + 1
        
        chunk = df_stream.iloc[start_idx:end_idx]
        result = [
            {
                "customer_name": row["customer_name"],
                "rating": int(float(row["rating"].split()[0])) if row["rating"] else 0,  # تبدیل بخش عددی به int
                "category": row["category"],
                "comments": row["comments"]
            } for _, row in chunk.iterrows()
        ]
        
        update_stream_position(current_pos + 1)
        return result