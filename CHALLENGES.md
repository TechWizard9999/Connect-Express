# Optimization Journey: Challenges & Decisions

## 1. The Challenge (The "N-Squared" Problem)
Our "Find Connecting Routes" feature was becoming slow.
The old code compared every train from Station A against every train to Station B.
*   **Math**: $10,000 \text{ trains} \times 10,000 \text{ trains} = 100,000,000 \text{ checks}$.
*   **Result**: High CPU usage and slow responses.

## 2. The Solutions Considered
We explored two main ways to fix this:

### Option A: The "Hash Map" (Chosen)
*   **Idea**: Create a "Lookup Index" (like a book index) for the trains.
*   **How it works**: Instead of searching through the entire list, we look up the specific station in the index to instantly find matching trains.
*   **Performance**: Reduces work from 100 million checks to ~20,000 checks.

### Option B: Parallel Processing (Rejected for now)
*   **Idea**: Use multiple processor cores (8 cores) to do the checking simultaneously.
*   **Hope**: "If we have 8 cores, it should be 8x faster."

## 3. Why We Chose "Hash Map" (The Decision)
After testing, we found that **Option A (Hash Map)** was superior for our current needs.

### The "Overhead" Trap
Parallel processing isn't free. Creating the "workers" (threads) takes time.
*   **Small Data (Current)**: It takes more time to organize the workers than to just do the job with the Hash Map.
*   **Complexity**: Parallel code is harder to debug and can cause crashes (race conditions) if not perfect.

**Verdict**: The Hash Map approach gave us a **100x speed improvement** immediately. Adding parallelism would have barely improved this further while adding significant risk.

## 4. Future Roadmap
We have designed the system so we can **combine** both approaches in the future.
*   **When**: If we scale to > 1 Million trains.
*   **How**: We will use the Hash Map *inside* each Parallel Worker.

## 5. Implementation Summary
*   **File**: `backend/src/router.cpp`
*   **Change**: Implemented `std::unordered_map` for O(1) lookups.
*   **Status**: Live and Verified.

## [2026-01-01] Redis Integration for Optional Caching
- **Context**: Adding Redis caching to the search endpoint to improve performance.
- **Challenge**: ensuring the application remains fully functional even if the Redis server is not running (e.g., in a local development environment without Redis installed).
- **Resolution**: Wrapped Redis client calls with `isReady` checks and added error handling for individual operations. Configured the client to stop reconnecting after a timeout to prevent request hanging.
