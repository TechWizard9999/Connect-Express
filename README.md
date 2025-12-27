# Connect Express - Phase 1 Documentation

> 🚂 A smart railway routing app to find connecting trains when direct routes aren't available.

---

## 📖 What We Built (Simple English)

**Problem:** You want to travel from Station A to Station B, but there's no direct train. How do you find a route where you can:
1. Take Train 1 from A to some Station X
2. Wait at Station X
3. Take Train 2 from X to B

**Solution:** Connect Express searches through all trains to find these "connecting routes" automatically.

### What the App Does:
1. **Direct Search:** First, find all trains that go directly from A → B
2. **Connecting Search:** If needed, find routes like A → X → B where:
   - Train 1 stops at both A and X
   - Train 2 stops at both X and B  
   - You have 1-12 hours to change trains at X

---

## 🔬 Algorithm Explained

### Intersection-Based Search Algorithm

We use an **intersection-based search** that finds common connection points:

```
STEP 1: Get all trains that pass through Station A
STEP 2: Get all trains that pass through Station B
STEP 3: For each train from A, list all stations it stops at AFTER A
STEP 4: For each train to B, list all stations it stops at BEFORE B
STEP 5: Find COMMON stations (these are potential connection points X)
STEP 6: For each common station X:
        - Check: Does Train 1 arrive before Train 2 departs?
        - Check: Is layover between 1-12 hours?
        - If YES to both → Valid connecting route!
```

---

## ⏱️ Time Complexity Analysis

### Variables:
- `T` = Total number of trains (~200)
- `S` = Average stops per train (~5)
- `C` = Common intermediate stations found (~10-20)

### Direct Train Search

| Case | Complexity | Explanation |
|------|------------|-------------|
| **Best Case** | O(1) | First train matches (early exit) |
| **Average Case** | O(T × S) | Check all trains, find some matches |
| **Worst Case** | O(T × S) | Check all trains, no match found |

```
For each train (T):
    Check if both stations exist in stops (S)
```
**With 200 trains, 5 stops each = 1,000 operations max**

### Connecting Train Search

| Case | Complexity | Explanation |
|------|------------|-------------|
| **Best Case** | O(T × S) | Few common stations, minimal matching |
| **Average Case** | O(T × S + C × k²) | k = avg trains per connection point |
| **Worst Case** | O(T² × S) | All trains share common stops |

```
Phase 1: Build map from A      → O(T × S)
Phase 2: Build map to B        → O(T × S)  
Phase 3: Match combinations    → O(C × trains_at_X₁ × trains_at_X₂)
```

### Summary Table

| Operation | Best Case | Average Case | Worst Case |
|-----------|-----------|--------------|------------|
| Direct Search | O(1) | O(T × S) | O(T × S) |
| Connecting Search | O(T × S) | O(T × S + C × k²) | O(T² × S) |
| **Total** | **O(T × S)** | **O(T × S + C × k²)** | **O(T² × S)** |

With T=200, S=5:
- **Best Case:** ~1,000 operations
- **Worst Case:** ~200,000 operations

---

## 🕐 Actual Timing (Measured)

### Single Request Performance

| Operation | Measured Time |
|-----------|---------------|
| Direct search | 5-10 ms |
| Connecting search | 20-50 ms |
| Database queries | 10-20 ms |
| **Total response** | **30-60 ms** |

### Test Results (Chennai → Bangalore)

```
Request:  GET /api/search?from=MAS&to=SBC
Response: 
  - Direct trains found: 11
  - Connecting routes found: 20
  - Total time: ~50 ms
```

---

## 👥 Concurrent Users - Performance Analysis

### Retrieval Timing by Load

| Concurrent Users | Response Time | Throughput |

| 1 | 50 ms | 20 req/s | 
| 5 | 50-80 ms | 80 req/s | 
| 15 | 100-200 ms | 100 req/s |


## 📊 Baseline vs Achievement

### After (Phase 1 Complete):

| Metric | Value |
|--------|-------|
| **Stations** | 58 (AP, Karnataka, Tamil Nadu) |
| **Trains** | 200+ auto-generated |
| **Direct Routes Found** | 11 (Chennai → Bangalore) |
| **Connecting Routes Found** | 20 (Chennai → Bangalore) |
| **Average Response Time** | ~50 ms |
| **Worst Case Response** | ~100 ms |
| **15 Users Response** | ~150 ms |
| **Database** | In-memory MongoDB |
| **UI** | Modern dark theme |

---

## 📁 Project Structure

```
Connect Express/
├── backend/
│   ├── server.js              # Entry point
│   ├── config/index.js        # Settings
│   ├── models/index.js        # MongoDB Schemas
│   ├── data/index.js          # Station + Route data
│   ├── utils/index.js         # Time helpers
│   ├── services/
│   │   ├── seeder.service.js  # Generates trains
│   │   └── search.service.js  # Search algorithm
│   ├── controllers/index.js   # Handlers
│   └── routes/index.js        # API endpoints
└── frontend/
    └── src/
        ├── App.jsx, App.css
        └── components/
```

---

## 🚀 Quick Start

```bash
# Terminal 1 - Backend
cd backend && npm install && npm start

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

Open: **http://localhost:5173**

---

## 📝 Summary

| Aspect | Details |
|--------|---------|
| **Algorithm** | Intersection-based search |
| **Best Case** | O(T × S) → ~10 ms |
| **Worst Case** | O(T² × S) → ~100 ms |
| **Average Response** | ~50 ms |
| **15 Concurrent Users** | ~150 ms per request |
| **Current Limit** | ~50 users comfortable |

---
