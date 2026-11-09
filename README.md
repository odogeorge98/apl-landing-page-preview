# Portal

Frontend boilerplate. Administrator and authentication routes are in place. Screens are empty so the frontend team can build them.

The app does not ship with a default API. Point it at the backend before making requests.

## Requirements

- Node.js 18.18 or newer
- npm

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root. `lib/config.ts` reads these values and does not fall back to a hosted URL.

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://your-api-host.example.com
NEXT_PUBLIC_WEBSITE_BASE_URL=https://your-api-host.example.com/websites
```

| Variable | Used by |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Axios client in `lib/utils/http.ts` |
| `NEXT_PUBLIC_WEBSITE_BASE_URL` | Website API base in `lib/config.ts` |

Restart the dev server after changing `.env.local`. Next.js only loads public environment variables at startup.

Authenticated requests attach the bearer token stored in the Zustand auth store. `AuthProvider` does not guard routes yet. Add that check when the login flow is ready.

Firebase is optional. Set these only if you use `lib/services/firebase`:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

This project does not include `public/firebase-messaging-sw.js`. Background push notifications are not configured.

## Run

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm test` | Vitest in watch mode |
| `npm run test:file` | Vitest once |
| `npm run test:coverage` | Vitest with coverage |

## Workspaces

| Role | Routes |
| --- | --- |
| Administrator | `/dashboard`, `/dashboard/users/admins`, `/dashboard/users/students`, `/dashboard/users/tutors`, `/dashboard/support`, `/dashboard/profile` |
| Authentication | `/forgot-password`, `/reset-password`, `/onboard` |

## Project layout

```text
app/
  (admin)/       Administrator routes
  (auth)/        Authentication routes
components/
  layout/        Empty layout wrapper
  ui/            Shared interface pieces
  wrappers/      App-level wrappers
lib/
  api/           API entry point
  config.ts      API base URLs
  hooks/         Data hooks
  interfaces/    Shared types
  providers/     React Query and auth providers
  services/      Firebase client configuration
  store/         Zustand auth store
  utils/         Helpers and HTTP client
public/          Fonts and static assets
```

## Import alias

```typescript
import { cn } from "@/lib/utils";
import { http } from "@/lib/utils/http";
import { MainLayout } from "@/components/layout/dashboard";
```
