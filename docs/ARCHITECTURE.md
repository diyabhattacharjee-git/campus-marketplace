# Architecture Overview

## High-level shape

```
┌────────────────┐        REST + WebSocket        ┌──────────────────┐
│  React Client   │ ─────────────────────────────▶ │  Express Server   │
│  (Vercel)       │ ◀───────────────────────────── │  (Render/Railway) │
└────────────────┘                                 └──────────────────┘
                                                              │
                                                              ▼
                                                     ┌──────────────────┐
                                                     │  MongoDB Atlas    │
                                                     └──────────────────┘
                                                              │
                                                     ┌──────────────────┐
                                                     │  Cloudinary (imgs)│
                                                     └──────────────────┘
```

## Key architectural decisions

1. **Two independent packages, one repo.** `client` and `server` each own
   their `package.json` and deploy independently. This avoids the complexity
   of a full monorepo tool (Turborepo/Nx) which isn't needed at this scale,
   while still keeping frontend and backend history/PRs together.

2. **MVC + Service layer on the backend.** Routes → Controllers → Services →
   Models. Controllers stay thin (HTTP-only concerns); Services hold business
   logic so it's reusable from Socket.IO handlers and cron jobs, and testable
   in isolation from Express.

3. **Domain-grouped components on the frontend**, not type-grouped. Instead of
   one giant `components/` folder, we group by feature domain
   (`product/`, `bid/`, `chat/`) with a `common/` bucket for truly generic
   pieces (Button, Modal, Spinner). This scales much better once the app has
   50+ components.

4. **Server state vs client state are handled separately.** TanStack Query
   owns anything that comes from the API (products, bids, orders) — including
   caching, refetching, and optimistic updates. React Context is reserved for
   genuinely global client state: the authenticated user and the live socket
   connection. This avoids the common anti-pattern of stuffing server data
   into Context/Redux and fighting cache invalidation by hand.

5. **Real-time via a dedicated `sockets/` layer**, not scattered `io.on(...)`
   calls inside route files. Each real-time concern (bidding, chat,
   notifications) gets its own handler module registered on connection, so
   socket logic doesn't leak into REST controllers.

6. **Uploads flow through a `tmp/` staging directory** before being pushed to
   Cloudinary and the local file deleted — the server never stores images
   long-term on disk, keeping it stateless and safe to deploy on ephemeral
   hosts like Render.

This document will grow as later steps introduce the database schema, API
contract, and auth flow in detail.
