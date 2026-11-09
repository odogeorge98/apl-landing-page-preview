# Portal

Frontend boilerplate. Screens are empty so the frontend team can build them.

## Setup

Requires Node.js 18.18 or newer and npm.

```bash
npm install
```

Create `.env.local` in the project root:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://your-api-host.example.com
```

Restart the dev server after changing this value.

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
| `npm test` | Run tests |

## Routes

| Area | Routes |
| --- | --- |
| Admin | `/dashboard`, `/dashboard/users/admins`, `/dashboard/users/students`, `/dashboard/users/tutors`, `/dashboard/support`, `/dashboard/profile` |
| Auth | `/forgot-password`, `/reset-password`, `/onboard` |
