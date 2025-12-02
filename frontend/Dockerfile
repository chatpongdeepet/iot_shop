# ใช้ Node.js
FROM node:20-alpine

WORKDIR /app

# Copy ไฟล์ config package
COPY package.json .

# ติดตั้ง node_modules
RUN npm install

# Copy Code ทั้งหมด
COPY . .

# เปิด Port (Vite default)
EXPOSE 5173

# คำสั่งรันเริ่มต้น (จะถูก override ด้วย docker-compose)
CMD ["npm", "run", "dev", "--", "--host"]