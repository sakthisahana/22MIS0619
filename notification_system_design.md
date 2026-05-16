# Stage 1 - Notification System Design

## Overview

The Priority Inbox always displays the **top N most important unread notifications** first, where N is configurable per user preference (default: 10, can be 15, 20, etc.).

---

## Priority Score Formula

```
Score = (TypeWeight × 1000) + (RecencyScore × 999)
```

The multipliers ensure **type always dominates**, but recency cleanly breaks ties within the same type.

---

## Type Weights

| Type       | Weight | Reason                                      |
|------------|--------|---------------------------------------------|
| Placement  | 3      | Highest priority — career-critical info     |
| Result     | 2      | Academic outcomes — time-sensitive          |
| Event      | 1      | Informational — lowest urgency              |

---

## Recency Score

- Normalized between **0.0** (oldest) and **1.0** (most recent)
- Computed relative to the most recent notification in the batch
- Uses a **7-day normalization window** (604,800 seconds)

```java
recencyScore = 1.0 - min(secondsSinceMostRecent / 604800, 1.0)
```

---

## Maintaining Top N Efficiently (New Notifications)

When new notifications keep arriving, re-sorting the full list is expensive. Instead, a **Min-Heap (PriorityQueue) of fixed size N** is used:

```
For each incoming notification:
  1. Push into min-heap
  2. If heap.size() > N → pop the lowest-scored item
  3. Heap always contains exactly the top N highest-scored notifications
```

### Complexity
| Operation        | Cost      |
|-----------------|-----------|
| Insert           | O(log N)  |
| Evict lowest    | O(log N)  |
| Extract top N   | O(N log N)|

This is far more efficient than sorting the full list each time (O(M log M) where M = total notifications).

---

## API Integration

- **Endpoint:** `GET http://4.224.186.213/evaluation-service/notifications`
- **Auth:** Bearer Token (protected route)
- **No DB storage required** — purely in-memory processing
- **No frontend** required for Stage 1

---

## How to Run

```bash
# Build
mvn clean package

# Run
java -jar target/notification-priority-1.0-SNAPSHOT.jar \
     -cp target/libs/* 
```

---

## Example Output

```
<img width="824" height="427" alt="image" src="https://github.com/user-attachments/assets/7dfec9b9-534b-4fbb-9da3-74d8dd336739" />


---

## Design Decisions

1. **No hardcoded notifications** — always fetched live from API
2. **No DB** — stateless, in-memory priority computation
3. **Configurable N** — `TOP_N` constant can be adjusted without refactoring
4. **Type-first ordering** — ensures Placement always appears before Result/Event regardless of timestamp
5. **Recency as tiebreaker** — among same-type notifications, newer ones surface first
