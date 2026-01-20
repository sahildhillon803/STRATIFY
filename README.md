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
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

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
- [License](#-license)

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|--------|
| **🔐 User Authentication** | Email/password + Google OAuth with JWT tokens | ✅ |
| **🔑 Password Management** | Reset via email, change password when logged in | ✅ |
| **📊 Financial Data Management** | Manual entry + CSV import for revenue, expenses, cash balance | ✅ |
| **📈 AI Runway Predictor** | Real-time runway calculation with trend analysis & alerts | ✅ |
| **🔮 Future Condition Simulator** | Project financial health on any future date (1mo - 3yrs) | ✅ |
| **🎯 What-If Scenario Analyzer** | Test hiring, pricing, funding scenarios before execution | ✅ |
| **💡 AI Ideation Engine** | LLM-generated pivot strategies based on your context | ✅ |
| **🗺️ Smart Execution Roadmaps** | Convert strategies into milestone-based action plans | ✅ |
| **🤖 Hybrid LLM Provider** | Groq (default), OpenAI, Gemini, Ollama support | ✅ |

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
│   │   │   ├── auth.py         # Authentication (email, Google OAuth)
│   │   │   ├── financials.py   # Financial data CRUD
│   │   │   ├── forecast.py     # Future projections
│   │   │   ├── scenarios.py    # What-if analysis
│   │   │   ├── ai.py           # AI strategy suggestions
│   │   │   └── roadmaps.py     # Execution roadmaps
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
│   │   │   ├── charts/         # Financial visualizations
│   │   │   ├── forms/          # Input forms
│   │   │   ├── layout/         # Header, Sidebar, MainLayout
│   │   │   ├── shared/         # Common components
│   │   │   └── ui/             # Base UI elements
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── scenarios/      # Scenario analyzer
│   │   │   ├── ideation/       # AI suggestions
│   │   │   ├── roadmaps/       # Execution plans
│   │   │   └── onboarding/     # Setup wizard
│   │   ├── services/           # API client & services
│   │   ├── stores/             # Zustand state stores
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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
