# Nugi Innovations Learning Portal

The Nugi Innovations Learning Portal supports technology education, practical training, and career development. It provides role-based workspaces for administrators, tutors, and students.

## Product areas

- **Administration** — platform overview, user management, programme operations, and support inbox.
- **Tutor workspace** — tutor dashboard and profile.
- **Student workspace** — learning dashboard, profile, and help resources.
- **Authentication** — account onboarding, password reset, and shared Nugi Innovations branding.

Navigation items and role-specific dashboard details are configured in `lib/config/dashboard/ui-config.ts`.

## Technology

- Next.js 15 App Router with Turbopack
- React 19 and TypeScript
- Tailwind CSS 4
- TanStack Query and Axios for server data
- Zustand for client-side state
- Yup for form validation
- Lucide React icons
- Vitest and Testing Library for tests
- Firebase Cloud Messaging integration for supported notifications

## Requirements

- Node.js 18.18 or newer
- npm

## Local development

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root if you need to override the API defaults:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://nugi-innovation-backend.onrender.com
NEXT_PUBLIC_WEBSITE_BASE_URL=https://nugi-innovation-backend.onrender.com/websites
```

The API base URL defaults to `https://nugi-innovation-backend.onrender.com`. The website API defaults to the same host under `/websites`.

The runtime also accepts the older `NEXT_PUBLIC_PEPPCRUISE_API_BASE_URL` and `NEXT_PUBLIC_PEPPCRUISE_WEBSITE_BASE_URL` variable names for compatibility. If those legacy variables are set, they take precedence over the current names.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

In development, dashboard authentication bypass is enabled by default to support local UI work. Production deployments should leave `NEXT_PUBLIC_BYPASS_AUTH` unset or set it to `false` so authentication uses the backend.

Firebase messaging requires the Firebase project values used by `lib/services/firebase/config/config.ts` and the web push VAPID key used by `lib/services/firebase/messaging.ts`:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

## Role workspaces

| Role | Main routes |
| --- | --- |
| Administrator | `/dashboard`, `/dashboard/users/admins`, `/dashboard/users/students`, `/dashboard/users/tutors`, `/dashboard/support` |
| Tutor | `/tutor/dashboard`, `/tutor/profile` |
| Student | `/student/dashboard`, `/student/profile`, `/support` |

The student navigation, including Help & Support at `/support`, is defined in the shared dashboard UI configuration.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js in development mode on port 3001 |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm test` | Run Vitest in watch mode |
| `npm run test:file` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:ui` | Open the Vitest UI |
| `npm run test:coverage` | Run Vitest with coverage |

## Project layout

```text
app/
  (admin)/       Administrator routes
  (auth)/        Authentication and account recovery routes
  (student)/     Student dashboard, profile, and support routes
  (tutor)/       Tutor dashboard and profile routes
components/      Shared UI and product components
lib/
  api/           API integrations
  config/        Dashboard and application configuration
  hooks/         React Query and application hooks
  interfaces/    Shared TypeScript data contracts
  store/         Zustand stores
  utils/         Shared helpers and HTTP utilities
public/          Logos, fonts, and static assets
__tests__/       Vitest tests
```

## API and authentication

API integrations are organized under `lib/api/`; related query and mutation hooks live under `lib/hooks/`. The shared HTTP client is in `lib/utils/http.ts`. Authenticated requests use the current bearer token, while TanStack Query manages server state and caching.

## Import aliases

Use the `@/` alias for imports from the project root:

```typescript
import { cn } from "@/lib/utils";
import MainLayout from "@/components/layout/dashboard/MainLayout";
```
