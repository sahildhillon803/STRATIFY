# 🧪 STRATA-AI Complete Visual Testing Guide

## Overview
This guide covers every screen and feature in STRATA-AI with step-by-step testing instructions, expected visual output, and example inputs.

---

## Table of Contents
1. [Authentication Pages](#1--authentication-pages)
2. [Smart Onboarding](#2--smart-onboarding-ai-chat)
3. [Dashboard](#3--dashboard)
4. [Scenarios](#4--scenarios-what-if-analysis)
5. [AI Ideation Engine](#5--ai-ideation-engine)
6. [Roadmaps](#6--roadmaps)
7. [Settings](#7--settings)
8. [Notifications](#8--notifications-header)
9. [Global Search](#9--global-search-header)
10. [Sidebar Navigation](#10--sidebar-navigation)
11. [Quick Test Flow](#quick-test-flow-complete-walkthrough)

---

## 1. 🔐 Authentication Pages

### 1.1 Register Page
**URL:** http://127.0.0.1:5173/register

**What You'll See:**
- Strata-AI logo with gradient header card
- "Create your account" heading
- Form with 3 fields: Full name, Email, Password
- "Sign up with Google" button
- Link to login page at bottom

**Test Input:**
| Field | Example Value |
|-------|---------------|
| Full Name | `Jane Founder` |
| Email | `jane@startup.com` |
| Password | `MySecure123!` |

**Expected Behavior:**
1. Fill in all fields → Click "Create account"
2. Loading spinner appears on button
3. On success → Redirects to **Onboarding** page
4. On error → Red error box appears below header

**Validation Tests:**
- Empty name → "Name must be at least 2 characters"
- Invalid email → "Invalid email address"
- Short password (<8 chars) → "Password must be at least 8 characters"

---

### 1.2 Login Page
**URL:** http://127.0.0.1:5173/login

**What You'll See:**
- "Welcome back" header with logo
- Email and Password fields with icons
- "Forgot password?" link
- "Sign in with Google" button
- "No account yet? Create one" link

**Test Input:**
| Field | Example Value |
|-------|---------------|
| Email | `jane@startup.com` |
| Password | `MySecure123!` |

**Expected Behavior:**
1. Enter credentials → Click "Sign in"
2. If new user (no onboarding) → Redirects to `/onboarding`
3. If existing user → Redirects to `/dashboard`
4. Wrong credentials → Red error: "Login failed. Please check your credentials."

---

### 1.3 Forgot Password Page
**URL:** http://127.0.0.1:5173/forgot-password

**What You'll See:**
- "Reset your password" heading
- Single email input field
- "Send reset link" button

**Test Input:**
| Field | Example Value |
|-------|---------------|
| Email | `jane@startup.com` |

**Expected Behavior:**
- Success → Shows confirmation message
- Email not found → Error message displayed

---

## 2. 🚀 Smart Onboarding (AI Chat)

**URL:** http://127.0.0.1:5173/onboarding

**What You'll See:**
- Chat-style interface with AI assistant "Strata"
- Progress indicator at top
- Message bubbles (assistant = left, user = right)
- Text input at bottom with send button

### Step 1: Introduction Chat
**AI Question:** "Hi! 👋 I'm Strata, your AI startup advisor. Tell me about your startup in a few sentences - what are you building and for whom?"

**Example Response:**
```
We're building a SaaS platform called DataPulse that helps small businesses 
automate their inventory management. We focus on retail and e-commerce stores.
```

**Expected Visual:**
- Your message appears in blue bubble on right
- Typing indicator shows ("...")
- AI responds with next question

### Step 2: Stage & Team
**AI Question:** "That sounds exciting! What stage are you at right now? And how many people are on your team?"

**Example Response:**
```
We're at the MVP stage, just launched our beta. There are 4 of us on the team - 
2 founders and 2 engineers.
```

### Step 3: Challenges
**AI Question:** "What's your biggest challenge right now?"

**Example Response:**
```
Our biggest challenge is runway - we have about 8 months of cash left and need 
to figure out how to extend it while growing our user base.
```

**After Chat Completes:**
- Transition animation to "Connect Data" step
- Shows data import options

### Data Import Options (Visual Cards):
| Icon | Option | Description |
|------|--------|-------------|
| 📊 | Pitch Deck | Upload PDF/PPTX |
| 📄 | Spreadsheet | Upload Excel/CSV |
| 🏦 | Bank Statement | Upload PDF bank statement |
| 💳 | Stripe Export | Upload Stripe CSV |
| 📋 | Google Sheets | Paste Google Sheets URL |
| ➡️ | Skip | Start with manual entry |

**Test File Upload:**
1. Click "Upload Spreadsheet"
2. Select a CSV file with columns: `date, revenue, expenses, cash_balance`
3. Processing animation appears
4. Data extracted and shown for verification

**Example CSV Content:**
```csv
date,revenue,expenses,cash_balance
2024-01-01,15000,45000,200000
2024-02-01,18000,48000,170000
2024-03-01,22000,50000,142000
```

### Verify Step
**What You'll See:**
- Extracted data displayed in cards:
  - Company Name
  - Industry
  - Stage
  - Team Size
  - Initial Cash Balance
  - Monthly Expenses
  - Monthly Revenue
- Edit buttons to modify any field
- "Complete Setup" button

---

## 3. 📊 Dashboard

**URL:** http://127.0.0.1:5173/dashboard

### 3.1 Overview Tab (Default)
**What You'll See:**

**Top Row - 4 Stat Cards:**
| Card | Example Value | Icon | Color |
|------|---------------|------|-------|
| Cash Balance | `$142,000` | 💰 | Blue |
| Burn Rate | `$28,000/mo` | 🔥 | Red/Orange |
| Revenue | `$22,000/mo` | 📈 | Green |
| Runway | `5.1 months` | ⏱️ | Yellow/Warning |

**Charts Section:**
1. **Cash Flow Chart** (Large, 2/3 width)
   - Line graph showing balance over time
   - X-axis: Months (Jan, Feb, Mar...)
   - Y-axis: Dollar amounts
   - Hover shows tooltip with exact values

2. **Expense Breakdown** (Pie chart, 1/3 width)
   - Segments: Salaries, Marketing, Infrastructure, Other
   - Legend with percentages
   - Example: Salaries 60%, Marketing 15%, Infrastructure 15%, Other 10%

3. **Revenue Comparison** (Bar chart, full width)
   - Recurring vs One-time revenue
   - Monthly comparison bars

---

### 3.2 Analytics Tab
**Click "Analytics" tab in header**

**What You'll See:**
- Same 4 stat cards at top
- **Trend Analysis Card:**
  - Revenue Growth: `+15%`
  - Expense Reduction: `-5%`
  - Runway Extension: `+0.5 months`
  - Burn Rate Change: `-$2,000`

- **Key Metrics Card:**
  - Customer Acquisition Cost (CAC): `$150`
  - Lifetime Value (LTV): `$1,200`
  - Monthly Recurring Revenue (MRR): `$18,000`
  - Progress bars for each metric

---

### 3.3 Reports Tab
**Click "Reports" tab in header**

**What You'll See:**
- Grid of 6 report cards with download buttons:

| Report | Description | Button |
|--------|-------------|--------|
| 📄 Monthly Summary | Current month financial overview | Download CSV |
| 💰 Cash Flow Statement | Monthly cash inflows/outflows | Download CSV |
| 📊 Expense Breakdown | Categorized expenses | Download CSV |
| ⏱️ Runway Analysis | Runway projections | Download CSV |
| 📈 Revenue Analysis | Revenue breakdown | Download CSV |
| 👥 Investor Update | Executive summary | Download CSV |

**Test Download:**
1. Click "Download CSV" on any report
2. CSV file downloads automatically
3. Success toast: "Report downloaded successfully!"

---

## 4. 🎯 Scenarios (What-If Analysis)

**URL:** http://127.0.0.1:5173/scenarios

### Empty State
**What You'll See (if no scenarios):**
- Folder icon
- "No scenarios yet" heading
- "Create your first scenario →" link

### Create Scenario
**Click "+ New Scenario" button in header**

**Modal Form Fields:**
| Field | Type | Example Input |
|-------|------|---------------|
| Scenario Name | Text | `Hire 2 Engineers` |
| Scenario Type | Dropdown | `Hire` |
| Monthly Expense Change ($) | Number | `15000` |
| Monthly Revenue Change ($) | Number | `0` |

**Scenario Types:**
- `Hire` - Adding team members
- `Cut Expense` - Reducing costs
- `Pricing` - Changing pricing model
- `Investment` - Receiving funding
- `Custom` - Any other scenario

**Test Creating a Scenario:**

**Example 1: Hiring Scenario**
```
Name: Hire 2 Senior Engineers
Type: Hire
Expense Change: 25000
Revenue Change: 0
```

**Expected Result Card Shows:**
- Scenario name with "hire" badge
- **Impact:** "Runway: 5.1 → 3.8 months (-1.3 months)"
- Red indicator (runway decreased)

**Example 2: Investment Scenario**
```
Name: Seed Round $500K
Type: Investment
Expense Change: 0
Revenue Change: 0
One-time Cash: 500000
```

**Expected Result Card Shows:**
- **Impact:** "Runway: 5.1 → 22.9 months (+17.8 months)"
- Green indicator (runway increased)

### Scenario Detail Page
**Click on any scenario card**

**URL:** http://127.0.0.1:5173/scenarios/:id

**What You'll See:**
- Full scenario details
- Before/After comparison
- Visual runway gauge
- Impact metrics

---

## 5. 💡 AI Ideation Engine

**URL:** http://127.0.0.1:5173/ideation

### What You'll See:
- Hero section with brain icon
- "AI Ideation Engine" heading
- Large textarea for context input
- "Generate Ideas" button with sparkle icon

### Test Generating Ideas:

**Example Input:**
```
We are a B2B SaaS company providing inventory management for small retailers. 
We have 50 paying customers at $99/month. Our runway is 6 months. Growth has 
stalled at 2-3 new customers per month. We're considering pivoting to enterprise 
or adding new features.
```

**Click "Generate Ideas"**

**Loading State:**
- Spinner appears
- "AI is thinking... this can take a moment."

**Expected Output (3-5 Idea Cards):**

Each card contains:
| Element | Example |
|---------|---------|
| 💡 Icon | Yellow lightbulb |
| Title | "Enterprise Tier Launch" |
| Description | "Create a premium enterprise plan at $499/mo targeting mid-size retailers..." |
| Feasibility Bar | 7/10 (progress bar) |
| Market Opportunity | "High" (green badge) |
| Action Button | "Generate Roadmap →" |

**Example Ideas Generated:**
1. **Enterprise Tier Launch** - Feasibility: 8/10, Market: High
2. **Vertical Expansion to Restaurants** - Feasibility: 6/10, Market: Medium
3. **Integration Marketplace** - Feasibility: 7/10, Market: High
4. **Freemium Model** - Feasibility: 5/10, Market: Medium

---

## 6. 🗺️ Roadmaps

**URL:** http://127.0.0.1:5173/roadmaps

### Empty State:
- Map icon
- "No roadmaps yet"
- "Go to Ideation →" link

### Generate Roadmap from Idea:
1. Go to Ideation page
2. Generate ideas
3. Click "Generate Roadmap" on any idea card
4. Loading spinner: "Generating..."
5. Auto-redirects to new roadmap detail page

### Roadmap Detail Page
**URL:** http://127.0.0.1:5173/roadmaps/:id

**What You'll See:**
- Roadmap title (from idea)
- Timeline visualization
- Milestones with checkboxes:

**Example Milestones:**
| Week | Milestone | Status |
|------|-----------|--------|
| Week 1-2 | Market Research & Validation | ☐ Pending |
| Week 3-4 | MVP Feature Specification | ☐ Pending |
| Week 5-8 | Development Sprint 1 | ☐ Pending |
| Week 9-10 | Beta Testing | ☐ Pending |
| Week 11-12 | Launch & Marketing | ☐ Pending |

**Interaction:**
- Click checkbox to mark milestone complete
- Progress bar updates at top

---

## 7. ⚙️ Settings

**URL:** http://127.0.0.1:5173/settings

### Tab Navigation (Left Sidebar):
| Tab | Icon | Description |
|-----|------|-------------|
| My Profile | 👤 | User name, email |
| Startup Profile | 🏢 | Company details |
| Alert Thresholds | 🔔 | Runway warnings |
| Security | 🔒 | Change password |
| Import Data | 📤 | Upload files |
| LLM Provider | 🤖 | AI configuration |
| Data & Account | 💾 | Export/Delete |

---

### 7.1 My Profile Tab
**Fields:**
| Field | Example Value |
|-------|---------------|
| Full Name | `Jane Founder` |
| Email | `jane@startup.com` (read-only) |

**Test:** Change name → Click "Save Changes" → Success toast

---

### 7.2 Startup Profile Tab
**Fields:**
| Field | Example Value | Options |
|-------|---------------|---------|
| Startup Name | `DataPulse` | Text |
| Industry | `SaaS` | Dropdown |
| Stage | `MVP` | idea/mvp/growth/scale |
| Team Size | `4` | Number |

---

### 7.3 Alert Thresholds Tab
**Fields:**
| Field | Description | Default |
|-------|-------------|---------|
| Warning Threshold | Yellow alert when runway < X months | `6` |
| Critical Threshold | Red alert when runway < X months | `3` |
| Currency | Display currency | `USD` |

**Test:**
1. Set Warning to `8`, Critical to `4`
2. Save → Dashboard will show alerts based on new thresholds

---

### 7.4 Security Tab
**Change Password Form:**
| Field | Input |
|-------|-------|
| Current Password | `MySecure123!` |
| New Password | `NewSecure456!` |
| Confirm Password | `NewSecure456!` |

**Validation:**
- Passwords don't match → "New passwords do not match"
- Too short → "New password must be at least 8 characters"

---

### 7.5 Import Data Tab
**File Upload Options:**
| Type | File Format | Description |
|------|-------------|-------------|
| Pitch Deck | PDF, PPTX | Extract company info |
| Spreadsheet | CSV, XLSX | Financial data |
| Bank Statement | PDF | Transaction history |
| Stripe Export | CSV | Revenue data |
| Google Sheets | URL | Paste public sheet link |

**Example Google Sheets URL:**
```
https://docs.google.com/spreadsheets/d/1ABC123xyz/edit
```

---

### 7.6 LLM Provider Tab
**What You'll See:**
- Current provider: `Groq` (default)
- Model selector dropdown
- API Key input (optional - system key works)
- "Test Connection" button

**Available Models (Groq):**
- `llama-3.3-70b-versatile` (default)
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`

**Test Connection:**
1. Click "Test Connection"
2. Loading spinner
3. Success: "✅ Connection successful! Response time: 245ms"
4. Shows sample AI response

---

### 7.7 Data & Account Tab
**Actions:**
| Button | Description |
|--------|-------------|
| 📥 Export All Data | Downloads JSON with all your data |
| 🗑️ Delete Account | Permanently deletes account (with confirmation) |

**Export Test:**
1. Click "Export All Data"
2. Downloads `strata-ai-export-2024-01-15.json`

---

## 8. 🔔 Notifications (Header)

**Location:** Bell icon in top-right header

**Click bell icon to see dropdown**

**Dynamic Notifications Based on Data:**
| Notification | Trigger | Color |
|--------------|---------|-------|
| ⚠️ Runway Warning | Runway < 6 months | Yellow |
| 🚨 Critical Runway | Runway < 3 months | Red |
| 🔥 High Burn Rate | Burn > $50k/month | Orange |
| 🎉 Positive Cash Flow | Net positive | Green |
| 👋 Welcome | New user, no data | Blue |

**Interaction:**
- Red dot shows unread count
- Click notification → navigates to relevant page
- "Mark all as read" button

---

## 9. 🔍 Global Search (Header)

**Location:** Search box in header

**Test Searches:**
| Query | Expected Results |
|-------|------------------|
| `hire` | Scenarios with "hire" in name/type |
| `roadmap` | All roadmaps |
| `dashboard` | Dashboard page link |
| `export` | Reports page link |
| `settings` | Settings page link |

**Visual:**
- Results grouped by type with icons
- Click result → navigates to item
- "×" button clears search

---

## 10. 🧭 Sidebar Navigation

**Left sidebar shows:**
| Icon | Label | Route |
|------|-------|-------|
| 📊 | Dashboard | `/dashboard` |
| 🎯 | Scenarios | `/scenarios` |
| 💡 | Ideation | `/ideation` |
| 🗺️ | Roadmaps | `/roadmaps` |
| ⚙️ | Settings | `/settings` |

**Active state:** Blue highlight on current page

---

## Quick Test Flow (Complete Walkthrough)

Follow this sequence to test the entire application:

1. **Register** → `http://127.0.0.1:5173/register`
   - Create a new account with email/password

2. **Onboarding Chat** → Answer 3 questions
   - Describe your startup
   - Share stage and team size
   - Mention your challenges

3. **Import Data** → Upload CSV or skip
   - Use sample CSV or skip to start fresh

4. **Dashboard** → View financial overview
   - Check all 3 tabs: Overview, Analytics, Reports
   - Download a sample report

5. **Create Scenario** → Test "Hire 2 Engineers"
   - See runway impact calculation

6. **Generate Ideas** → Describe your situation
   - Get AI-powered pivot strategies

7. **Create Roadmap** → From best idea
   - View milestone timeline

8. **Settings** → Configure thresholds
   - Test LLM connection
   - Try changing password

9. **Export Data** → Download backup
   - Verify JSON export works

---

## Sample Test Data

### Sample Financial CSV
Save this as `test_financials.csv`:
```csv
date,revenue,expenses,cash_balance
2024-01-01,15000,45000,200000
2024-02-01,18000,48000,170000
2024-03-01,22000,50000,142000
2024-04-01,25000,52000,115000
2024-05-01,28000,55000,88000
2024-06-01,32000,58000,62000
```

### Sample Stripe Export CSV
Save this as `test_stripe.csv`:
```csv
created,amount,fee,net,type,description
2024-01-15,9900,317,9583,charge,Subscription - Pro Plan
2024-01-15,9900,317,9583,charge,Subscription - Pro Plan
2024-02-01,4900,172,4728,charge,Subscription - Basic Plan
2024-02-15,9900,317,9583,charge,Subscription - Pro Plan
2024-03-01,9900,317,9583,charge,Subscription - Pro Plan
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Login fails | Check backend is running on port 8000 |
| Charts not loading | Verify MongoDB connection in backend |
| AI features timeout | Check GROQ_API_KEY in backend .env |
| File upload fails | Ensure file is correct format (CSV/PDF) |
| Google login fails | Configure GOOGLE_CLIENT_ID in both .env files |

### Server URLs
- **Frontend:** http://127.0.0.1:5173
- **Backend API:** http://127.0.0.1:8000
- **API Docs (Swagger):** http://127.0.0.1:8000/docs
- **API Docs (ReDoc):** http://127.0.0.1:8000/redoc
- **Health Check:** http://127.0.0.1:8000/health

---

*Last updated: January 2026*
