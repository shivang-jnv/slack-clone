# Workspace Chat (Slack Clone) Architecture & Implementation

A production-grade, real-time messaging application built with Next.js, and Convex. 
This project demonstrates real-time messaging, channels, direct messages, reactions, file uploads, and workspace management, providing a collaborative chat experience similar to Slack.
## System Architecture

The application adopts a **Two-Tier Serverless Architecture** relying on a modern Edge/Serverless platform (Vercel) communicating with a reactive database (Convex). 

### High-Level Flow
1. **Client**: Next.js App Router (React Server Components + Client Components) built cleanly using a feature-based structure.
2. **State**: Local component state paired with globally synchronized server state via Convex Hooks.
3. **Reactive Data Layer**: The Convex database natively supports WebSocket-based reactive queries, removing the need for a separate, manually managed Pub/Sub server (like Redis/Socket.io).

## Key Architectural Decisions & Trade-offs

### 1. Synchronized Server State: Convex vs. Traditional WebSockets
**Decision**: Adopted Convex as the realtime database backend over rolling a custom Node.js WebSocket server + Redis.
*   **Why**: Convex abstracts connection persistence and data reactivity. Any mutation to the underlying data layer automatically triggers a re-render on subscribed Next.js client components. 
*   **Trade-offs**: 
    *   *Pros:* Radically reduces backend boilerplate; native TypeScript end-to-end type safety; automated scaling of active connections.
    *   *Cons:* Vendor lock-in to the Convex ecosystem; less granular control over the raw socket transport layer; specific schema syntax.

### 2. Data Denormalization: Combating the N+1 Query Problem
**Decision**: Thread metadata (`threadCount`, `threadTimestamp`, `threadImage`) is denormalized and stored directly on the *parent* message record.
*   **Why**: Rendering a channel with 50 messages, and checking each message for a reply count, natively yields 1 + 50 queries (N+1). By denormalizing these aggregates onto the parent message when a reply is created, channel rendering only requires 1 query.
*   **Trade-offs**:
    *   *Pros:* `O(1)` query complexity for reading a channel list. Massive reduction in read latency and database load.
    *   *Cons:* Write amplification. Every thread reply requires a write to the child message and a subsequent `patch` update to the parent message, increasing write latency and complexity slightly.

### 3. Perceived Performance: Optimistic UI via Jotai
**Decision**: Implemented Optimistic Updates using Jotai for intermediate client states (`pendingMessagesAtom`).
*   **Why**: Network transmission times (even fast ones) feel inherently slow in chat apps. Appending messages instantly to the UI before server confirmation maintains a rapid, fluid UX.
*   **Trade-offs**:
    *   *Pros:* Zero-latency perceived chat experience comparable to native mobile apps.
    *   *Cons:* Increases client-side state complexity. The app must manually manage resolving transient states ("sending") and handle potential rollback logic/UI error states if the server-side write rejects the mutation (e.g., due to lost connection or auth failure).

### 4. Client-Side Asset Processing: Image Compression
**Decision**: Implemented client-side HTML5 Canvas API image compression before payload upload.
*   **Why**: Large (>2MB) image uploads consume excessive bandwidth, cause UI stalls, and balloon storage costs.
*   **Trade-offs**:
    *   *Pros:* Decreased storage costs, faster upload speeds, and immediate ObjectURL generation for instant UI previews.
    *   *Cons:* Utilizes client main-thread CPU resources to encode the JPEG; can't rely completely on client compression for security (must still validate size/type on the server). Requires strict memory management (`URL.revokeObjectURL()`) to prevent immediate browser memory leaks.

---

## 🛠 Tech Stack

- **Frontend Framework:** Next.js 14 (App Router)
- **UI & Styling:** Tailwind CSS, `shadcn/ui`, Radix Primitives
- **Data Layer & Backend:** Convex
- **State Management:** Jotai
- **Authentication:** Custom implementation using `@convex-dev/auth`

## 📁 Repository Structure (Feature-Driven)

```
slack-clone/
├── convex/             # Database schema, queries, and mutations
│   ├── auth.ts         # Custom authentication configuration
│   └── schema.ts       # Convex table schemas
├── src/
│   ├── app/            # Next.js file-based routing
│   ├── components/     # Agnostic, reusable UI primitives (shadcn)
│   ├── features/       # Core domain logic (Feature-Sliced Design)
│   │   ├── auth/       # Auth API hooks, screens, and types
│   │   ├── channels/   # Channel management
│   │   └── messages/   # Message components, state, and threading
│   ├── hooks/          # Global application hooks
│   └── lib/            # Utilities (compression, formatting)
└── ...
```

## 🚀 Local Development Guide

### Prerequisites
- Node.js `18.x` or later
- Optional: Bun (for optimized dependency installation)

### Installation
1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd slack-clone
   npm install  # or bun install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env.local` and populate the keys required for Convex and your OAuth providers.

3. **Start Development Servers**
   *Note: In a separate terminal run `npx convex dev` if required for database syncing.*
   ```bash
   npm run dev
   ```

4. Verify via [http://localhost:3000](http://localhost:3000)

## 🤝 Contributing Guidelines
When pushing new architectural changes, please submit an RFC issue detailing the **why** and **trade-offs** before opening a PR.

1. Create a feature branch:`git checkout -b chore/feature-name`
2. Commit with strict semantic prefixes.
3. Submit a PR targeting the `main` branch.

## License
MIT (See [LICENSE](LICENSE))
