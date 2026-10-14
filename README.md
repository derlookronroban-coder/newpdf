# 📱 iPad PDF Studio — Full-Stack (Frontend + Backend)

ระบบแก้ไขไฟล์ PDF แนบรูปภาพ (PNG/JPG) เซ็นลายเซ็นด้วย Apple Pencil และจัดการหน้ากระดาษ รองรับการทำงานทั้งแบบ **Client-Side บน iPad (React + pdf-lib)** และ **Server-Side API (Node.js + Express + pdf-lib + Multer)**

## 🗂️ โครงสร้างโปรเจกต์ (Project Structure)
```text
ipad-pdf-studio/
├── backend/                  # Node.js + Express + TypeScript + pdf-lib API
│   ├── src/
│   │   ├── server.ts         # Express Server Entry (Port 4000)
│   │   ├── routes/pdfRoutes.ts
│   │   └── services/pdfService.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React + Vite + Tailwind CSS (iPadOS Web App)
│   ├── src/
│   │   ├── App.jsx           # หน้าจอ iPad PDF Studio Editor
│   │   ├── main.jsx
│   │   ├── api/pdfApiClient.ts
│   │   └── utils/pdfEditor.ts
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml        # รันทั้ง Frontend + Backend ด้วยคำสั่งเดียว
└── README.md
```

## 🚀 วิธีรันระบบ (Frontend + Backend)

### 1. รัน Backend (Node.js + Express + pdf-lib)
```bash
cd backend
npm install
npm run dev
# Server จะทำงานที่ http://localhost:4000
```

### 2. รัน Frontend (React + Vite สำหรับ iPad)
```bash
cd frontend
npm install
npm run dev -- --host
# เปิดบน iPad ผ่าน Wi-Fi หรือ http://localhost:5173
```