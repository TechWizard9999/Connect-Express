# Connect Express 🚄

Connect Express is a high-performance railway routing engine designed to bridge the gap between destinations with algorithmic precision.

## Why Connect Express? (Design Philosophy)

In a world of complex, multi-operator railway networks, finding the most efficient path often requires checking multiple sources and manually piecing together connections. 

Connect Express was built to solve this by:
- **Simplifying Complexity**: Automating the search for connecting trains.
- **Engineered for Speed**: Using a custom C++ routing engine for near-instant trajectory synthesis.
- **Professional Experience**: Providing a clean, high-tech interface that focuses on information density and clarity.

## 🚀 Quick Start

### 1. Backend
```bash
cd backend && npm install && npm start
```
*Runs on port 5002.*

### 2. Frontend
```bash
cd frontend && npm install && npm run dev
```
*Runs on port 5173.*

---

## 🛠️ Technical Notes

### C++ Engine
To rebuild the core routing algorithm:
```bash
cd backend
npm run install  # Standard build
npm run rebuild  # Full clean build
```

### Environment Setup
Create a `.env` file in `backend/` and `frontend/` using the `.env.example` templates provided.
- **Backend**: Needs `MONGO_URI` (MongoDB connection).
- **Frontend**: Needs `VITE_API_URL` (points to the backend).

---
&copy; 2026 Connect Express. Engineered for speed.
