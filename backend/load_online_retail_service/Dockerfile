FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
COPY load-online-retail-service.py .
COPY database.py .
COPY models.py .
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y wget
CMD ["uvicorn", "load-online-retail-service:app", "--host", "0.0.0.0", "--port", "5006"]