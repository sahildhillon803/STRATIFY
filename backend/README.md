# 🔧 STRATA-AI Backend

<p align="center">
  <img src="../frontend/public/logo.svg" alt="STRATA-AI Logo" width="80">
</p>

FastAPI backend for the STRATA-AI startup survival and strategy assistant.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup](#-setup)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Services](#-services)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.109+ | Async web framework |
| **Python** | 3.11+ | Runtime |
| **MongoDB** | Atlas | Database |
| **Beanie** | 1.25+ | Async ODM for MongoDB |
| **Pydantic** | 2.x | Data validation |
| **python-jose** | 3.3+ | JWT authentication |
| **bcrypt** | 4.1+ | Password hashing |
| **google-auth** | 2.27+ | Google OAuth verification |
| **Groq** | 0.4+ | LLM API client |
| **scikit-learn** | 1.4+ | ML forecasting |
| **pandas** | 2.2+ | Data manipulation |
| **orjson** | 3.9+ | Fast JSON serialization |

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── deps.py         # Dependency injection (auth)
│   │       └── endpoints/
│   │           ├── auth.py     # Register, Login, OAuth, Password Reset
│   │           ├── financials.py # Financial CRUD + runway
│   │           ├── forecast.py # Future projections
│   │           ├── scenarios.py # What-if analysis
│   │           ├── ai.py       # AI strategy suggestions
│   │           └── roadmaps.py # Execution roadmaps
│   │
│   ├── core/
│   │   ├── config.py           # Settings from .env
│   │   └── security.py         # JWT, password utils, OAuth helpers
│   │
│   ├── db/
│   │   └── engine.py           # MongoDB connection with pooling
│   │
│   ├── models/
│   │   ├── user.py             # User document (with OAuth fields)
│   │   └── financial.py        # Financial record model
│   │
│   ├── schemas/
│   │   ├── user.py             # User, OAuth, Password reset schemas
│   │   ├── token.py            # JWT token schema
│   │   ├── financial.py        # Financial data schemas
│   │   ├── forecast.py         # Forecast schemas
│   │   ├── scenario.py         # Scenario schemas
│   │   └── roadmap.py          # Roadmap schemas
│   │
│   └── services/
│       ├── runway_engine.py    # Burn rate & runway calc
│       ├── forecast_engine.py  # Multi-method forecasting
│       ├── scenario_engine.py  # What-if simulations
│       ├── ai_service.py       # LLM integration
│       ├── ml_forecast.py      # ML revenue prediction
│       ├── csv_service.py      # CSV import handling
│       └── roadmap_service.py  # Roadmap generation
│
├── tests/                      # Test files
├── .env.example                # Environment template
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

---

## 🚀 Setup

### 1. Create Virtual Environment

```bash
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `MONGODB_URI` - MongoDB Atlas connection string
- `SECRET_KEY` - Random string for JWT signing (32+ chars)
- `GROQ_API_KEY` - Groq API key from [console.groq.com](https://console.groq.com)
- `GOOGLE_CLIENT_ID` - (Optional) Google OAuth client ID

### 4. Run the Server

```bash
# Development (with auto-reload)
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 5. Access

| URL | Description |
|-----|-------------|
| http://127.0.0.1:8000 | API root |
| http://127.0.0.1:8000/docs | Swagger UI (interactive) |
| http://127.0.0.1:8000/redoc | ReDoc documentation |
| http://127.0.0.1:8000/health | Health check |

---

## 📚 API Endpoints

### 🔐 Authentication (`/api/v1/auth`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/register` | POST | ❌ | Register new user with email/password |
| `/login` | POST | ❌ | Login (returns JWT token) |
| `/google` | POST | ❌ | Login/Register with Google OAuth |
| `/google/client-id` | GET | ❌ | Get Google Client ID for frontend |
| `/forgot-password` | POST | ❌ | Request password reset email |
| `/reset-password` | POST | ❌ | Reset password with token |
| `/change-password` | POST | ✅ | Change password (logged in user) |
| `/me` | GET | ✅ | Get current user info |

#### Register Request
```json
{
  "email": "founder@startup.com",
  "password": "SecurePass123!",
  "full_name": "Jane Founder"
}
```

#### Login Request (form-urlencoded)
```
username=founder@startup.com&password=SecurePass123!
```

#### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Google OAuth Request
```json
{
  "credential": "google-id-token-from-frontend"
}
```

#### Google OAuth Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "is_new_user": false,
  "user": {
    "id": "user123",
    "email": "user@gmail.com",
    "full_name": "John Doe",
    "profile_picture": "https://...",
    "oauth_provider": "google"
  }
}
```

#### Forgot Password Request
```json
{
  "email": "founder@startup.com"
}
```

#### Reset Password Request
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePass123!"
}
```

#### Change Password Request (requires auth)
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!"
}
```

---

### 💰 Financials (`/api/v1/financials`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | ✅ | Create monthly financial record |
| `/runway` | GET | ✅ | Get current runway status |
| `/import` | POST | ✅ | Import CSV file |
| `/forecast` | GET | ✅ | ML-based revenue forecast |
| `/export` | GET | ✅ | Export all records |

#### Create Financial Record
```json
{
  "month": "2025-03",
  "revenue_recurring": 5000,
  "revenue_one_time": 500,
  "expenses_salaries": 6000,
  "expenses_marketing": 1000,
  "expenses_infrastructure": 500,
  "expenses_other": 200,
  "cash_balance": 50000
}
```

#### Runway Response
```json
{
  "current_month": "2025-03",
  "cash_balance": 50000,
  "monthly_burn_rate": 2200,
  "runway_months": 22.7,
  "status": "Healthy"
}
```

---

### 🔮 Forecast (`/api/v1/forecast`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/generate` | POST | ✅ | Generate multi-period forecast |
| `/project-to-date` | POST | ✅ | Project to specific date |
| `/methods` | GET | ❌ | List available methods |

**Forecast Methods:**
- `linear` - Linear regression trend
- `moving_average` - Smoothed historical average
- `exponential_smoothing` - Weighted recent data
- `ensemble` - Combined methods (recommended)

---

### 🎯 Scenarios (`/api/v1/scenarios`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/simulate` | POST | ✅ | Run single what-if scenario |
| `/compare` | POST | ✅ | Compare multiple scenarios |
| `/templates` | GET | ❌ | Get pre-built templates |
| `/baseline` | GET | ✅ | Get current baseline |

**Scenario Types:**
- `hire_employee` - Test hiring impact
- `change_marketing` - Adjust marketing spend
- `change_pricing` - Revenue change from pricing
- `lose_customer` - Customer churn impact
- `receive_investment` - Funding round impact
- `cut_expenses` - Cost reduction
- `custom` - Custom scenario

---

### 💡 AI (`/api/v1/ai`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/suggest-strategy` | POST | ✅ | Get AI-generated pivot strategies |

---

### 🗺️ Roadmaps (`/api/v1/roadmaps`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | ✅ | List all roadmaps |
| `/` | POST | ✅ | Create roadmap |
| `/{id}` | GET | ✅ | Get roadmap details |
| `/{id}` | PUT | ✅ | Update roadmap |
| `/{id}` | DELETE | ✅ | Delete roadmap |

---

## 🔐 Authentication

### JWT Token Flow

1. User logs in (email/password or Google OAuth)
2. Server returns JWT access token
3. Client includes token in `Authorization: Bearer <token>` header
4. Server validates token on protected endpoints

### Google OAuth Flow

1. Frontend loads Google Sign-In button
2. User clicks and authenticates with Google
3. Frontend receives Google ID token
4. Frontend sends token to `/auth/google`
5. Backend verifies token with Google
6. Backend creates/updates user and returns JWT

### Password Reset Flow

1. User requests reset at `/auth/forgot-password`
2. Server generates reset token (1 hour expiry)
3. In dev mode: token returned directly for testing
4. In production: token sent via email
5. User submits new password with token to `/auth/reset-password`

---

## ⚙️ Services

### Runway Engine (`runway_engine.py`)
Core financial calculations:
- `calculate_burn_rate(record)` → Net monthly burn
- `calculate_runway_months(cash, burn)` → Months until zero cash

### Forecast Engine (`forecast_engine.py`)
Multi-method financial forecasting:
- Linear regression
- Moving average
- Exponential smoothing
- Ensemble (weighted combination)

### Scenario Engine (`scenario_engine.py`)
What-if simulation engine:
- Baseline calculation
- Scenario impact analysis
- Multi-scenario comparison
- Risk level assessment

### AI Service (`ai_service.py`)
LLM integration for strategy suggestions:
- Groq API (Llama 3.3 70B)
- Context-aware prompting
- JSON-formatted responses

---

## 🧪 Testing

```bash
# Run all tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html
```

**Test Coverage:**
- ✅ Runway calculations
- ✅ Forecast methods
- ✅ Scenario simulations
- ✅ Authentication/JWT
- ✅ Schema validation
- ✅ API endpoint structure

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PROJECT_NAME` | ❌ | STRATA-AI | App name |
| `API_V1_STR` | ❌ | /api/v1 | API prefix |
| `ENVIRONMENT` | ❌ | development | Environment name |
| `DEBUG` | ❌ | False | Debug mode (enables Swagger) |
| `SECRET_KEY` | ✅ | - | JWT signing key (32+ chars) |
| `MONGODB_URI` | ✅ | - | MongoDB connection |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | 1440 | Token lifetime (24h) |
| `GROQ_API_KEY` | ✅ | - | Groq API key |
| `LLM_MODEL` | ❌ | llama-3.3-70b-versatile | LLM model |
| `GOOGLE_CLIENT_ID` | ❌ | - | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | - | Google OAuth Secret |
| `FRONTEND_URL` | ❌ | - | Frontend URL for CORS |

---

## 🚀 Performance Optimizations

- **ORJSONResponse** - 2-3x faster JSON serialization
- **GZip Compression** - 50-70% bandwidth reduction
- **Connection Pooling** - 5-50 MongoDB connections
- **Database Indexes** - Optimized query performance
- **Cached Settings** - No repeated .env reads
- **Security Headers** - XSS, clickjacking protection

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.
