# 🚀 STRATA-AI

<p align="center">
  <img src="frontend/public/logo.svg" alt="STRATA-AI Logo" width="120" height="120">
</p>

<p align="center">
  <strong>AI-powered startup survival and strategy assistant</strong><br>
  Predict financial runway, simulate future conditions, and generate actionable pivot strategies.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tests-62%20passed-brightgreen" alt="Tests">
  <img src="https://img.shields.io/badge/backend-FastAPI-009688" alt="Backend">
  <img src="https://img.shields.io/badge/frontend-React%2019-61DAFB" alt="Frontend">
</p>

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://strata-ai-frontend.netlify.app |
| **Backend API** | https://strata-ai-backend-zj91.onrender.com |

---

## 📋 Table of Contents

- [Features](#-features)
- [Authentication](#-authentication)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Test Results](#-test-results)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|--------|
| **🔐 User Authentication** | Email/password + Google OAuth with JWT tokens | ✅ |
| **🔑 Password Management** | Reset via email, change password in Settings | ✅ |
| **📊 Financial Data Management** | Manual entry + CSV import for revenue, expenses, cash balance | ✅ |
| **📥 Data Import** | Upload pitch decks, spreadsheets, bank statements, Stripe exports, Google Sheets | ✅ |
| **📈 AI Runway Predictor** | Real-time runway calculation with trend analysis & alerts | ✅ |
| **🔮 Future Condition Simulator** | Project financial health on any future date (1mo - 3yrs) | ✅ |
| **🎯 What-If Scenario Analyzer** | Test hiring, pricing, funding scenarios before execution | ✅ |
| **💡 AI Ideation Engine** | LLM-generated pivot strategies based on your context | ✅ |
| **🗺️ Smart Execution Roadmaps** | Convert strategies into milestone-based action plans | ✅ |
| **📊 Dashboard Tabs** | Overview, Analytics, and Reports views with different visualizations | ✅ |
| **📄 CSV Report Generation** | Export detailed financial reports (6 types) as CSV files | ✅ |
| **🔔 Notifications System** | Dynamic notifications based on financial data (runway alerts, etc.) | ✅ |
| **🔍 Global Search** | Search across scenarios, roadmaps, reports, and pages | ✅ |
| **📝 Scenario Details** | View detailed scenario information with impact metrics | ✅ |
| **🤖 LLM Management Dashboard** | Configure AI providers, models, and API keys from the UI | ✅ |
| **⚡ Groq Default Provider** | Pre-configured Groq with system API key (no setup needed) | ✅ |

---

## 🔐 Authentication

STRATA-AI supports multiple authentication methods:

### Sign Up / Sign In Options

| Method | Description | Status |
|--------|-------------|--------|
| **Email/Password** | Traditional registration with secure password hashing | ✅ |
| **Google OAuth** | One-click sign in with Google account | ✅ |

### Password Management

| Feature | Description |
|---------|-------------|
| **Forgot Password** | Request reset link via email |
| **Reset Password** | Set new password with secure token |
| **Change Password** | Update password when logged in |

### Security Features

- 🔒 JWT tokens with configurable expiration (default: 24 hours)
- 🔒 Bcrypt password hashing
- 🔒 OAuth token verification with Google
- 🔒 Account linking (email ↔ OAuth)
- 🔒 Protected routes with authentication middleware
- 🔒 Security headers (XSS, Clickjacking protection)

---

## 📊 Dashboard & Reports

### Dashboard Tabs

| Tab | Description |
|-----|-------------|
| **Overview** | Stats cards (Cash Balance, Burn Rate, Revenue, Runway), Cash Flow chart, Expense Breakdown, Revenue Comparison |
| **Analytics** | Trend Analysis (growth metrics), Key Metrics (CAC, LTV, MRR) with progress indicators |
| **Reports** | Generate and download 6 types of CSV reports |

### Available Reports (CSV Export)

| Report | Description |
|--------|-------------|
| **Monthly Summary** | Current month financial overview with revenue, expenses, cash flow |
| **Cash Flow Statement** | Monthly cash inflows/outflows with balances |
| **Expense Breakdown** | Categorized expenses (salaries, marketing, infrastructure, other) |
| **Runway Analysis** | Current runway status with projection scenarios |
| **Revenue Analysis** | Revenue breakdown (recurring vs one-time) with trends |
| **Investor Update** | Executive summary with key metrics for investors |

---

## 🔔 Notifications System

Dynamic notifications based on your financial data:

| Notification Type | Trigger | Action |
|-------------------|---------|--------|
| **Runway Warning** | Runway < 6 months | Links to Dashboard |
| **Critical Runway** | Runway < 3 months | Links to Scenarios |
| **High Burn Rate** | Burn > $50k/month | Links to Analytics |
| **Positive Cash Flow** | Net positive revenue | Celebration message |
| **Welcome** | New user with no data | Links to Settings/Import |

Features:
- 🔴 Red dot indicator for unread notifications
- ✅ Mark individual or all notifications as read
- 🔗 Click to navigate to relevant page
- ⏰ Human-readable timestamps ("2 hours ago")

---

## 🔍 Global Search

Search across your entire workspace:

| Searchable | Examples |
|------------|----------|
| **Scenarios** | By name or type (hire, pricing, cost-cutting) |
| **Roadmaps** | By title or description |
| **Reports** | Keywords like "export", "csv", "monthly" |
| **Pages** | Dashboard, Settings, Ideation, etc. |

Features:
- 🔎 Debounced search (300ms delay)
- 📋 Results grouped by type with icons
- ❌ Clear button to reset search
- 🖱️ Click outside to close dropdown

---

## 📝 Scenario Management

### Scenario Detail Page

View comprehensive scenario information:
- **Header**: Scenario name, type icon, runway impact badge
- **Metrics Grid**: New Runway, Runway Impact, New Burn Rate, Created Date
- **Modifications**: Monthly expense/revenue changes, one-time cash impact

### Creating Scenarios

Click "New Scenario" to open the creation modal:
- Scenario name and type selection
- Monthly expense/revenue change inputs
- Automatic runway impact calculation

---

## 📊 Analytics Tab (Empty States)

The Analytics tab shows helpful empty states when no data is connected:
- **Trend Analysis**: "No trend data available - Import financial data to see trends"
- **Key Metrics**: "No metrics available - Import financial data to see key metrics"

This ensures users are never confused by placeholder/mock data.

---

## 💡 Modal System

Context-aware modals for creating content:

| Page | Button | Modal |
|------|--------|-------|
| `/scenarios` | New Scenario | Create scenario with financial modifications |
| `/ideation` | Generate Ideas | AI ideation with context input |
| `/roadmaps` | New Roadmap | AI-generated or manual roadmap creation |

---

## ⚙️ Settings Page

| Tab | Features |
|-----|----------|
| **My Profile** | Update display name |
| **Startup Profile** | Edit startup name, industry, stage, team size |
| **Alert Thresholds** | Configure runway warning/critical thresholds, currency |
| **Security** | Change password with current password verification |
| **Import Data** | Upload files (Pitch Deck, Spreadsheet, Bank Statement, Stripe), Connect Google Sheets |
| **LLM Provider** | Full LLM management dashboard (see below) |
| **Data & Account** | Export all data, delete account |

---

## 🤖 LLM Management Dashboard

Manage your AI provider configuration directly from the Settings page - no code changes required.

### Default Configuration

STRATA-AI comes **pre-configured with Groq** using the system API key. Users can start using AI features immediately without any setup.

### Supported Providers

| Provider | Models | API Key Required | Description |
|----------|--------|------------------|-------------|
| **Groq** (Default) | llama-3.3-70b-versatile, llama-3.1-70b, mixtral-8x7b, gemma2-9b | ✅ (Pre-configured) | Ultra-fast inference, best for speed |
| **OpenAI** | GPT-4-turbo, GPT-4, GPT-3.5-turbo | ✅ (User provides) | Industry-leading quality |
| **Google Gemini** | gemini-pro, gemini-1.5-pro, gemini-1.5-flash | ✅ (User provides) | Strong reasoning capabilities |
| **Ollama** | llama3, mistral, mixtral, codellama, phi3 | ❌ | Local inference, privacy-focused |

### Dashboard Features

| Feature | Description |
|---------|-------------|
| **Connection Status** | Green/Yellow indicator showing if LLM is connected |
| **Provider Selection** | Click to switch between Groq, OpenAI, Gemini, or Ollama |
| **Model Selection** | Dropdown to choose from available models per provider |
| **API Key Management** | Securely add, update, or delete API keys |
| **Test Connection** | One-click test with response preview and latency |
| **Save/Reset** | Apply or revert configuration changes |

### LLM API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/llm/config` | GET | Get current LLM configuration |
| `/api/v1/llm/config` | PUT | Update provider, model, or API key |
| `/api/v1/llm/test` | POST | Test LLM connection |
| `/api/v1/llm/providers` | GET | Get all available providers |
| `/api/v1/llm/api-key/{provider}` | DELETE | Delete stored API key |

### How It Works

1. **New Users**: Groq is pre-configured and connected using system API key
2. **Test Connection**: Works immediately with Groq - no setup required
3. **Switch Providers**: Select a different provider and add your API key
4. **Custom Groq Key**: Optionally override system key with your own

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async Python web framework |
| **Python 3.11+** | Backend runtime |
| **MongoDB Atlas** | Cloud database (free tier compatible) |
| **Beanie ODM** | Async MongoDB object-document mapper |
| **Pydantic v2** | Data validation and serialization |
| **python-jose** | JWT token handling |
| **google-auth** | Google OAuth verification |
| **orjson** | Fast JSON serialization |
| **Groq API** | Default LLM provider (Llama 3.3 70B) |
| **scikit-learn** | ML-based forecasting |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool and dev server |
| **TailwindCSS** | Utility-first CSS framework |
| **Zustand** | Lightweight state management |
| **React Query** | Server state management |
| **Chart.js** | Financial visualizations |
| **React Hook Form** | Form handling with Zod validation |
| **Framer Motion** | Animations |

---

## 📁 Project Structure

```
strata-ai/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/endpoints/   # API route handlers
│   │   │   ├── auth.py         # Authentication (email, Google OAuth, password mgmt)
│   │   │   ├── financials.py   # Financial data CRUD
│   │   │   ├── forecast.py     # Future projections
│   │   │   ├── scenarios.py    # What-if analysis
│   │   │   ├── ai.py           # AI strategy suggestions
│   │   │   ├── roadmaps.py     # Execution roadmaps
│   │   │   ├── startup.py      # Startup profile & settings
│   │   │   └── onboarding.py   # Data import & extraction
│   │   ├── core/               # Config & security
│   │   ├── db/                 # Database connection
│   │   ├── models/             # MongoDB document models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   └── services/           # Business logic
│   ├── tests/
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                   # React Frontend
│   ├── public/
│   │   └── logo.svg            # App logo/favicon
│   ├── src/
│   │   ├── assets/             # Static assets (logo, images)
│   │   ├── components/
│   │   │   ├── auth/           # GoogleSignInButton
│   │   │   ├── charts/         # CashFlowChart, ExpenseBreakdown, RevenueComparison, RunwayGauge
│   │   │   ├── forms/          # ScenarioForm
│   │   │   ├── layout/         # Header, Sidebar, MainLayout, AuthLayout
│   │   │   ├── shared/         # StatCard, RoadmapCard, ScenarioCard, IdeaCard, ProtectedRoute
│   │   │   └── ui/             # Button, Modal
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/      # Main dashboard (Overview, Analytics, Reports tabs)
│   │   │   ├── scenarios/      # Scenario analyzer
│   │   │   ├── ideation/       # AI suggestions
│   │   │   ├── roadmaps/       # Execution plans
│   │   │   ├── settings/       # User settings (Profile, Security, Import Data, etc.)
│   │   │   └── onboarding/     # Smart onboarding wizard
│   │   ├── services/           # API client & services (dashboard, auth, reports)
│   │   ├── stores/             # Zustand state stores (auth, ui with tabs)
│   │   ├── hooks/              # Custom React hooks
│   │   └── types/              # TypeScript definitions
│   ├── package.json
│   └── README.md
│
├── docs/                       # Documentation
│   ├── architecture/           # Technical architecture docs
│   ├── prd/                    # Product Requirements Document
│   └── DEPLOYMENT.md           # Deployment guide
│
└── ml/                         # Machine Learning (placeholder)
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (or 3.14 as tested)
- **Node.js 18+** and npm
- **MongoDB Atlas** account (free tier works)
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))
- **Google Cloud Console** (optional, for Google OAuth)

### 1. Clone & Navigate

```bash
git clone https://github.com/x-LANsolo-x/Strata-AI.git
cd Strata-AI
git checkout strata-v1
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, Secret Key, Groq API Key, etc.

# Run the server
uvicorn app.main:app --reload
```

Backend available at: **http://127.0.0.1:8000**
- API Docs: http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000/health

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend available at: **http://localhost:5173**

---

## 📚 API Documentation

### Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/auth/register` | POST | ❌ | Register with email/password |
| `/api/v1/auth/login` | POST | ❌ | Login (returns JWT) |
| `/api/v1/auth/google` | POST | ❌ | Login/Register with Google |
| `/api/v1/auth/google/client-id` | GET | ❌ | Get Google Client ID |
| `/api/v1/auth/forgot-password` | POST | ❌ | Request password reset |
| `/api/v1/auth/reset-password` | POST | ❌ | Reset password with token |
| `/api/v1/auth/change-password` | POST | ✅ | Change password (logged in) |
| `/api/v1/auth/me` | GET | ✅ | Get current user info |

### Financial Data

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/financials/` | POST | ✅ | Create financial record |
| `/api/v1/financials/runway` | GET | ✅ | Get current runway |
| `/api/v1/financials/import` | POST | ✅ | Import CSV data |
| `/api/v1/financials/forecast` | GET | ✅ | ML revenue forecast |
| `/api/v1/financials/export` | GET | ✅ | Export all records |

### Forecasting

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/forecast/generate` | POST | ✅ | Generate multi-period forecast |
| `/api/v1/forecast/project-to-date` | POST | ✅ | Project to specific date |
| `/api/v1/forecast/methods` | GET | ❌ | Available forecast methods |

### Scenarios

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/scenarios/simulate` | POST | ✅ | Run single scenario |
| `/api/v1/scenarios/compare` | POST | ✅ | Compare multiple scenarios |
| `/api/v1/scenarios/templates` | GET | ❌ | Get scenario templates |
| `/api/v1/scenarios/baseline` | GET | ✅ | Current financial baseline |

### AI & Roadmaps

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/ai/suggest-strategy` | POST | ✅ | Get AI pivot suggestions |
| `/api/v1/roadmaps/` | GET/POST | ✅ | Manage execution roadmaps |

### Startup & Settings

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/startup/profile` | GET/PUT | ✅ | Get/update startup profile |
| `/api/v1/startup/settings` | GET/PUT | ✅ | User settings & preferences |

### Data Import (Onboarding)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/onboarding/extract-from-file-enhanced` | POST | ✅ | Extract data from uploaded files |
| `/api/v1/onboarding/connect-google-sheets` | POST | ✅ | Connect Google Sheets data |

---

## ✅ Test Results

**Total: 62 Tests | 100% Pass Rate**

| Test Suite | Tests | Status |
|------------|-------|--------|
| **Backend Core Services** | 10 | ✅ All Passed |
| **Backend Security** | 5 | ✅ All Passed |
| **Backend Schemas** | 5 | ✅ All Passed |
| **Backend API Endpoints** | 20 | ✅ All Passed |
| **Backend Configuration** | 6 | ✅ All Passed |
| **Frontend Unit Tests** | 16 | ✅ All Passed |

### Run Tests

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

---

## ⚙️ Configuration

### Environment Variables (`.env`)

```env
# Project
PROJECT_NAME=STRATA-AI
API_V1_STR=/api/v1
ENVIRONMENT=development
DEBUG=True

# Authentication
SECRET_KEY=your-super-secret-key-minimum-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true

# LLM Configuration
GROQ_API_KEY=gsk_your_groq_api_key
LLM_MODEL=llama-3.3-70b-versatile

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend URL (for CORS in production)
FRONTEND_URL=https://your-app.vercel.app
```

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add **Authorized JavaScript Origins**:
   - `http://localhost:5173` (development)
   - `https://your-domain.com` (production)
5. Copy Client ID and Secret to `.env`

---

## 🌐 Deployment

### Backend (Render.com - Free Tier)

1. Connect GitHub repo
2. Root Directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel - Free Tier)

1. Connect GitHub repo
2. Framework: Vite
3. Root Directory: `frontend`
4. Build: `npm run build`
5. Output: `dist`

### Database (MongoDB Atlas - Free Tier)

1. Create free M0 cluster
2. Add database user
3. Whitelist IPs
4. Get connection string

For detailed instructions, see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 🚀 Performance Optimizations

### Backend
- ✅ ORJSONResponse (2-3x faster JSON)
- ✅ GZip compression (50-70% bandwidth reduction)
- ✅ MongoDB connection pooling
- ✅ Database indexes
- ✅ Cache-Control headers
- ✅ Security headers

### Frontend
- ✅ Lazy loading (code splitting)
- ✅ 24 optimized chunks
- ✅ Vendor chunk separation
- ✅ React Query caching
- ✅ Request deduplication
- ✅ Font preloading

### Bundle Size (Gzipped)
| Chunk | Size |
|-------|------|
| Main | 65.6 KB |
| React | 33.3 KB |
| Charts | 64.3 KB |
| Forms | 26.1 KB |
| **Initial Load** | ~100 KB |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Groq** for free LLM API access
- **MongoDB Atlas** for free database hosting
- **Vercel** and **Render** for free deployment tiers
- **Google** for OAuth services

---

<p align="center">
  <img src="frontend/public/logo.svg" alt="STRATA-AI" width="60">
  <br>
  Built with ❤️ for startup founders who refuse to fail
</p>
