# Sona AI Web Application

A modern web application built with Next.js 15, React 19, and TypeScript, featuring component development with Storybook.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (optional):

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://sona-website-worker.shy-resonance-c01b.workers.dev/api
```

If no environment variable is set, the application will use the default API URL.

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Storybook

Run Storybook for component development and testing:

```bash
npm run storybook
```

Open [http://localhost:6006](http://localhost:6006) to view the component library.

Build Storybook for production:

```bash
npm run build-storybook
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **UI Components**: Radix UI, Lucide React
- **State Management**: Zustand, TanStack Query
- **Development**: Storybook 9.1.3 with Vite
- **Testing**: Vitest, Testing Library
- **Code Quality**: TypeScript strict mode

## 📁 Project Structure

```
webapp/
├── app/                 # Next.js app directory
├── lib/                 # Utility functions
├── stories/             # Storybook stories
├── __tests__/           # Test files (mirrors src structure)
├── .storybook/          # Storybook configuration
└── public/              # Static assets
```

## 🧩 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm test` - Run tests in watch mode
- `npm run test:watch` - Run tests in watch mode (explicit)
- `npm run test:file` - Run specific test file or pattern
- `npm run test:ui` - Run tests with Vitest UI interface
- `npm run test:coverage` - Run tests with coverage report
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

## 🧪 Testing

This project uses Vitest for unit and integration testing with React Testing Library for component testing.

### Test Structure

Tests are organized in the `__tests__/` directory, mirroring the source code structure:

```
__tests__/
├── lib/
│   └── utils.test.ts     # Tests for lib/utils.ts
├── app/
│   └── page.test.tsx     # Tests for app/page.tsx
└── components/
    └── button.test.tsx   # Tests for components/button.tsx
```

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (for CI)
npm run test:file

# Run specific test file or pattern
npm run test:file utils
npm run test:file __tests__/lib/utils.test.ts

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

Create test files with `.test.ts` or `.test.tsx` extensions:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## 🎨 Component Development

This project uses Storybook for isolated component development. Components are documented with stories that demonstrate different states and use cases.

### Writing Stories

Create `.stories.ts` files alongside your components:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

## 📂 Import Aliases

This project uses TypeScript path mapping to avoid relative imports:

```typescript
// ❌ Avoid relative imports
import { cn } from '../../lib/utils'
import { Button } from '../../../components/Button'

// ✅ Use @ alias instead
import { cn } from '@/lib/utils'
import { Button } from '@/components/Button'
```

**Available aliases:**
- `@/` - Points to project root
- `@/lib/` - Utility functions
- `@/app/` - Next.js app directory
- `@/components/` - Reusable components

## ⚙️ Configuration

The application uses a centralized configuration system located in `lib/config.ts`. This allows for easy management of API endpoints and other application settings.

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: The base URL for the API endpoints (defaults to the production API)

### Configuration Structure

```typescript
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'default-url',
  },
} as const;
```

## 📝 Notes

- Uses Next.js App Router
- Configured with Turbopack for faster builds
- PostCSS configured for Next.js and Vite compatibility
- Storybook uses Vite for improved performance
- TypeScript path mapping configured for clean imports
- Centralized configuration system for easy environment management
