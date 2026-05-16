# Campus Notifications - Stage 2 Frontend

A responsive Next.js + Material UI application for the campus notification platform.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Material UI v5** (styling only — no ShadCN, no Tailwind)

## Pages

| Route      | Description                                              |
|------------|----------------------------------------------------------|
| `/`        | All Notifications — filter by type, paginate, new badge |
| `/priority`| Priority Inbox — top N ranked by type weight + recency  |

## Features
- ✅ Displays all notifications from the API
- ✅ Priority Inbox (top N, configurable via slider: 5–30)
- ✅ Filter by notification type (Placement / Result / Event)
- ✅ Pagination (configurable per-page: 5, 10, 15, 20)
- ✅ Distinguishes new vs already-viewed notifications (localStorage)
- ✅ Responsive — works on mobile and desktop
- ✅ Material UI only (no ShadCN, no other CSS libraries)

## Setup

```bash
cd notification_app_fe

# Install dependencies
npm install

# Add your auth token to .env.local
echo "NEXT_PUBLIC_AUTH_TOKEN=your_bearer_token_here" > .env.local

# Run dev server (must run on port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm start
```

## API
`GET http://4.224.186.213/evaluation-service/notifications`

Query parameters: `limit`, `page`, `notification_type`
