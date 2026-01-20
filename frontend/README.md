# 🎨 STRATA-AI Frontend

<p align="center">
  <img src="public/logo.svg" alt="STRATA-AI Logo" width="80">
</p>

React TypeScript frontend for the STRATA-AI startup survival and strategy assistant.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup](#-setup)
- [Available Scripts](#-available-scripts)
- [Authentication](#-authentication)
- [Pages & Features](#-pages--features)
- [Component Library](#-component-library)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Testing](#-testing)
- [Styling](#-styling)

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI framework |
| **TypeScript** | 5.9+ | Type safety |
| **Vite** | 7.x | Build tool & dev server |
| **TailwindCSS** | 4.x | Utility-first CSS |
| **Zustand** | 5.x | State management |
| **React Query** | 5.x | Server state & caching |
| **React Router** | 7.x | Client-side routing |
| **React Hook Form** | 7.x | Form handling |
| **Zod** | 4.x | Schema validation |
| **Chart.js** | 4.x | Financial charts |
| **Framer Motion** | 12.x | Animations |
| **Lucide React** | 0.5+ | Icons |

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── vite.svg
│
├── src/
│   ├── assets/                 # Static assets
│   │
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   │   └── GoogleSignInButton.tsx  # Google OAuth button
│   │   │
│   │   ├── charts/             # Financial visualizations
│   │   │   ├── CashFlowChart.tsx
│   │   │   ├── ExpenseBreakdown.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── RunwayGauge.tsx
│   │   │   └── ScenarioComparisonChart.tsx
│   │   │
│   │   ├── forms/              # Input forms
│   │   │   ├── FinancialForm.tsx
│   │   │   └── OnboardingForm.tsx
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── shared/             # Shared components
│   │   │   ├── RoadmapCard.tsx
│   │   │   ├── ScenarioCard.tsx
│   │   │   └── StrategyCard.tsx
│   │   │
│   │   └── ui/                 # Base UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Loading.tsx
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   └── useScenarios.ts
│   │
│   ├── pages/                  # Route pages
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx           # Email + Google login
│   │   │   ├── RegisterPage.tsx        # Email + Google signup
│   │   │   ├── ForgotPasswordPage.tsx  # Password reset request
│   │   │   └── ResetPasswordPage.tsx   # Set new password
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── scenarios/
│   │   │   └── ScenariosPage.tsx
│   │   │
│   │   ├── ideation/
│   │   │   └── IdeationPage.tsx
│   │   │
│   │   ├── roadmaps/
│   │   │   ├── RoadmapsPage.tsx
│   │   │   └── RoadmapDetailPage.tsx
│   │   │
│   │   ├── onboarding/
│   │   │   ├── OnboardingWizard.tsx
│   │   │   └── SmartOnboarding.tsx
│   │   │
│   │   └── settings/
│   │       └── SettingsPage.tsx
│   │
│   ├── services/               # API layer
│   │   ├── api.client.ts       # Base HTTP client
│   │   ├── auth.service.ts     # Authentication
│   │   ├── dashboard.service.ts
│   │   ├── scenario.service.ts
│   │   ├── ai.service.ts
│   │   ├── roadmap.service.ts
│   │   └── startup.service.ts
│   │
│   ├── stores/                 # Zustand stores
│   │   ├── auth.store.ts       # Auth state
│   │   └── ui.store.ts         # UI state
│   │
│   ├── types/                  # TypeScript definitions
│   │   ├── dashboard.types.ts
│   │   ├── scenario.types.ts
│   │   ├── ideation.types.ts
│   │   ├── roadmap.types.ts
│   │   └── startup.types.ts
│   │
│   ├── App.tsx                 # Root component
│   ├── App.css                 # Global styles
│   ├── Router.tsx              # Route definitions
│   ├── main.tsx                # Entry point
│   ├── index.css               # Tailwind imports
│   └── setupTests.ts           # Test setup
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🚀 Setup

### Prerequisites

- **Node.js 18+**
- **npm** or **yarn**

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |

---

## 🔐 Authentication

### Supported Methods

| Method | Component | Route |
|--------|-----------|-------|
| **Email/Password** | LoginPage, RegisterPage | `/login`, `/register` |
| **Google OAuth** | GoogleSignInButton | Embedded in login/register |
| **Password Reset** | ForgotPasswordPage, ResetPasswordPage | `/forgot-password`, `/reset-password` |

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Login Page                    Register Page                │
│   ┌─────────────────┐          ┌─────────────────┐         │
│   │ Email           │          │ Full Name       │         │
│   │ Password        │          │ Email           │         │
│   │ [Sign In]       │          │ Password        │         │
│   │                 │          │ [Create Account]│         │
│   │ ── OR ──────    │          │                 │         │
│   │                 │          │ ── OR ──────    │         │
│   │ [Google Sign-In]│          │ [Google Sign-Up]│         │
│   │                 │          │                 │         │
│   │ Forgot password?│          │                 │         │
│   └────────┬────────┘          └────────┬────────┘         │
│            │                            │                   │
│            ▼                            ▼                   │
│   ┌─────────────────────────────────────────────┐          │
│   │              Auth Store (Zustand)            │          │
│   │  • user: { id, email, fullName }            │          │
│   │  • token: JWT access token                  │          │
│   │  • isAuthenticated: boolean                 │          │
│   └─────────────────────────────────────────────┘          │
│                          │                                  │
│                          ▼                                  │
│            ┌─────────────────────────┐                     │
│            │   New User → Onboarding │                     │
│            │   Existing → Dashboard  │                     │
│            └─────────────────────────┘                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### GoogleSignInButton Component

```tsx
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

<GoogleSignInButton
  text="signin_with"  // or "signup_with", "continue_with"
  onSuccess={(response) => {
    // response.access_token - JWT token
    // response.user - User object
    // response.is_new_user - Boolean
  }}
  onError={(error) => console.error(error)}
/>
```

**Features:**
- Dynamically loads Google Identity Services script
- Fetches Client ID from backend
- Gracefully hidden if Google OAuth not configured
- Handles new user vs existing user flows

---

## 📄 Pages & Features

### 🔐 Authentication Pages

| Page | Route | Features |
|------|-------|----------|
| **Login** | `/login` | Email/password, Google OAuth, forgot password link |
| **Register** | `/register` | Email/password, Google OAuth, terms acceptance |
| **Forgot Password** | `/forgot-password` | Email input, sends reset link |
| **Reset Password** | `/reset-password` | New password form with token validation |

### 📊 Dashboard

| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/` | Runway gauge, cash flow chart, expense breakdown, quick stats |

**Key Metrics Displayed:**
- Current runway (months)
- Monthly burn rate
- Cash balance
- Revenue trend
- Risk status indicator

### 🎯 Scenarios

| Page | Route | Features |
|------|-------|----------|
| **Scenarios** | `/scenarios` | What-if analyzer, scenario templates, comparison view |

**Scenario Types:**
- Hire employee
- Change marketing spend
- Adjust pricing
- Lose customer
- Receive investment
- Cut expenses
- Custom scenario

### 💡 AI Ideation

| Page | Route | Features |
|------|-------|----------|
| **Ideation** | `/ideation` | AI-powered pivot suggestions, strategy cards |

### 🗺️ Roadmaps

| Page | Route | Features |
|------|-------|----------|
| **Roadmaps** | `/roadmaps` | List all roadmaps, create new |
| **Detail** | `/roadmaps/:id` | View/edit roadmap, milestones, progress |

### ⚙️ Settings

| Page | Route | Features |
|------|-------|----------|
| **Settings** | `/settings` | Profile, LLM provider config, data export |

### 🎓 Onboarding

| Page | Route | Features |
|------|-------|----------|
| **Onboarding** | `/onboarding` | Multi-step wizard for new users |

---

## 🧩 Component Library

### Auth Components (`/components/auth/`)

| Component | Description |
|-----------|-------------|
| `GoogleSignInButton` | Google OAuth sign-in button with automatic setup |

### Charts (`/components/charts/`)

| Component | Description |
|-----------|-------------|
| `RunwayGauge` | Circular gauge showing runway months |
| `CashFlowChart` | Line chart of cash over time |
| `RevenueChart` | Revenue trend visualization |
| `ExpenseBreakdown` | Pie/bar chart of expenses |
| `ScenarioComparisonChart` | Compare multiple scenarios |

### Layout (`/components/layout/`)

| Component | Description |
|-----------|-------------|
| `Header` | Top navigation with notifications |
| `Sidebar` | Left navigation menu |
| `MainLayout` | Authenticated page wrapper |

### UI (`/components/ui/`)

| Component | Description |
|-----------|-------------|
| `Button` | Styled button with variants |
| `Card` | Content container |
| `Input` | Form input with validation |
| `Modal` | Dialog/modal component |
| `Loading` | Loading spinner/skeleton |

---

## 🗃️ State Management

### Auth Store (`auth.store.ts`)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}
```

**Persistence:** Token stored in localStorage (`auth-storage`)

### UI Store (`ui.store.ts`)

```typescript
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: string) => void;
}
```

---

## 🔌 API Integration

### API Client (`api.client.ts`)

Base HTTP client with:
- Automatic JWT token injection
- Request deduplication
- Timeout handling (30s)
- Error handling
- GZip support

```typescript
import { apiClient } from './services/api.client';

// GET request
const data = await apiClient.get<ResponseType>('/endpoint');

// POST request
const result = await apiClient.post<ResponseType>('/endpoint', payload);

// Form POST (for login)
const token = await apiClient.postForm<TokenResponse>('/auth/login', {
  username: email,
  password: password
});
```

### Services

| Service | Purpose |
|---------|---------|
| `auth.service.ts` | Login, register, logout |
| `dashboard.service.ts` | Runway, financials, metrics |
| `scenario.service.ts` | What-if simulations |
| `ai.service.ts` | Strategy suggestions |
| `roadmap.service.ts` | Roadmap CRUD |
| `startup.service.ts` | Startup profile |

---

## 🧪 Testing

### Test Setup

- **Framework:** Vitest
- **Library:** React Testing Library
- **DOM:** jsdom

### Run Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Test Files

| File | Coverage |
|------|----------|
| `App.test.tsx` | App routing & auth redirect |
| `Header.test.tsx` | Header rendering |
| `Sidebar.test.tsx` | Navigation links |
| `MainLayout.test.tsx` | Layout structure |
| `RunwayGauge.test.tsx` | Gauge component |
| `RoadmapCard.test.tsx` | Card rendering |
| `RoadmapDetailPage.test.tsx` | Detail page |
| `RegisterPage.test.tsx` | Registration form |

---

## 🎨 Styling

### TailwindCSS

Utility-first CSS framework with custom configuration.

**Configuration:** `tailwind.config.js`

### Theme Colors

```css
/* Primary colors (Green theme) */
--color-primary-500: #1B8A6B;

/* Status colors */
--color-success: #22c55e;
--color-danger: #ef4444;
--color-warning: #f97316;

/* Background */
--color-cream-100: #F5F5F0;
```

### Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

---

## 🚀 Performance Optimizations

- **Lazy Loading** - Pages load on-demand
- **Code Splitting** - 21 separate chunks
- **Vendor Chunks** - Better browser caching
- **React Query Cache** - 5min stale, 30min cache
- **Request Deduplication** - No duplicate API calls
- **Font Preloading** - Faster text rendering

---

## 🌐 Environment

### API URL Configuration

```typescript
// Default: http://127.0.0.1:8000/api/v1
// Can be overridden with VITE_API_URL environment variable
```

Create `.env.local` for local overrides:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.
