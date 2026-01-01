# Connect Express - Project Overview & Algorithm Logic

## 1. Project Overview
**Connect Express** is a railway routing application designed to find train connections between stations. It calculates both **direct routes** (A to B) and **connecting routes** (A to X to B) with realistic layover times.

### Architecture
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas (Cloud)
- **Data Model**:
  - `Stations`: Stores station code, name, and state.
  - `Trains`: Stores train details and an array of `stops` (station code, arrival/departure times).

### Key Features
- **Smart Routing**: Finds routes even if no direct train exists.
- **Realistic Time Calculations**: Handles day changes (e.g., train departing at 11 PM and arriving at 2 AM next day).
- **Layover Constraints**: Ensures connections are feasible (e.g., minimum 1 hour, maximum 12 hours waiting time).

---

## 2. Algorithm Explanation: How it Works

### Direct Trains (Simple Search)
This is a straightforward database query.
1. Find all trains where the route contains **both** the Source and Destination stations.
2. Check if Source index < Destination index (train must go *from* A *to* B, not the reverse).
3. Calculate duration.

### Connecting Trains (The "Brute Force" Logic)
This is where the heavy lifting happens. We use a **Meet-in-the-Middle** strategy with a brute-force verification step.

**The "Brute Force" Steps:**
1. **Fetch Candidate Trains**: 
   - Get ALL trains passing through Source (Station A).
   - Get ALL trains passing through Destination (Station B).
   
2. **Map Potential Connections**:
   - For every train from A, list all stations it visits *after* A.
   - For every train to B, list all stations it comes from *before* B.

3. **Find Intersection (Common Stations)**:
   - Identify stations that exist in both lists. These are potential connecting points (Station X).

4. **Brute Force Verification**: 
   - For every Common Station (X):
     - Loop through EVERY train arriving at X from A.
     - Loop through EVERY train departing X to B.
     - **Check**: Is `Arrival Time at X` + `Layover` <= `Departure Time from X`?
     - If yes, valid connection found.

**Why is it called Brute Force?**
Because the computer checks **thousands of combinations** instantly. If there are 5 trains from A->X and 5 trains from X->B, the system checks 25 pairs for *just that one station*. It does this for every possible shared station.

---

## 3. Caching Strategy (Redis)

We implement a **Cache-Aside** strategy to improve performance for frequent searches.

- **Cache Key**: `search:{FROM_STATION}:{TO_STATION}` (e.g., `search:MAS:SBC`)
- **Cache Value**: The complete JSON response containing both direct and connecting routes.
- **TTL (Time-To-Live)**: 1 hour (3600 seconds).
- **Behavior**: 
  1. Check Redis cache first.
  2. If found, return cached JSON immediately.
  3. If missing (or Redis down), compute routes using MongoDB/C++.
  4. Store result in Redis for future requests.
- **Degradation**: If Redis is unreachable, the system gracefully falls back to the database without crashing.

---

## 4. Practical Example: Multi-User Scenario

### Scenario: 3 Users Searching Simultaneously
**Current State**: Server running on port 5002, connected to MongoDB Atlas (212 trains).

#### User 1: "Business Traveler"
- **Search**: `MAS` (Chennai) → `SBC` (Bangalore)
- **Action**: 
  - System finds 12 direct trains.
  - **Result**: Immediate response. Shows "Shatabdi Express" (Duration: 5h).

#### User 2: "Budget Student"
- **Search**: `MAS` (Chennai) → `CBE` (Coimbatore)
- **Action**:
  - Direct trains found: 9.
  - **Connecting Logic Triggered**:
    - Finds common stations: `KPD`, `SA`, `ED`.
    - **Brute Force**: Checks connection `MAS -> KPD` (Train 1) + `KPD -> CBE` (Train 2).
    - Checks 263 possibilities, filters for valid layovers (1-12 hrs).
  - **Result**: Shows 20 best options sorted by total duration.

#### User 3: "Explorer"
- **Search**: `NDL` (Nandyal) → `MAQ` (Mangalore)
- **Action**:
  - Direct trains: 0.
  - Connecting search begins. Finds common stations `GTL` (Guntakal) and `SBC` (Bangalore).
  - System calculates: Train A reaches `GTL` at 2:00 AM. Train B leaves `GTL` for `MAQ` at 4:30 AM.
  - **Result**: Valid connection found via Guntakal with 2.5hr layover.

### System Reaction
Since Node.js is **asynchronous**, it handles these requests **concurrently**:
1. It accepts User 1's request -> Starts database query.
2. While database looks for User 1, it accepts User 2's request.
3. User 1's data returns -> Response sent.
4. User 2's complex calculation runs (CPU intensive part).
5. User 3's request enters queue.

Even with the "brute force" logic, the calculation happens in milliseconds because checking logic conditions (Time A < Time B) is extremely fast for modern processors, handling thousands of checks in a fraction of a second.
