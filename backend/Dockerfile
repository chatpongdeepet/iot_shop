# ใช้ Python
FROM python:3.10-slim

# ตั้ง Folder ทำงาน
WORKDIR /app

# ติดตั้ง Dependencies ของระบบ (จำเป็นสำหรับ psycopg2)
RUN apt-get update && apt-get install -y libpq-dev gcc

# Copy ไฟล์รายการ Library
COPY requirements.txt .

# ติดตั้ง Library Python
RUN pip install --no-cache-dir -r requirements.txt

# Copy Code ทั้งหมด (แต่ใน docker-compose เรา mount ทับอีกทีเพื่อความสะดวก)
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]