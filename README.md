# PocketSmart AI — AI Budget & Smart Recommendation Assistant

**PocketSmart AI** is a production-grade full-stack personal planning assistant that transforms user budgets and preferences into structured, actionable, and visually stunning plans across three core lifestyle modules:
1. **Home Interior Planner** (Room-by-room distribution, furniture, lighting, modular storage, decor)
2. **Party & Event Planner** (Headcount economics, catering, venue booking, ambience, entertainment, contingency reserve)
3. **Jewelry & Outfit Match Planner** (Metal harmony, gemstone accents, ensemble coordination, and AI Vision outfit analysis)

---

## 🌟 Key Features

- **Strict Budget Guarantee**: Total allocations are mathematically guaranteed never to exceed your target ceiling (`SUM(allocations) <= total_budget`).
- **Dynamic Tiered Engine**: Adjusts allocation percentages based on budget tier (Value, Balanced, Luxury), room types, and guest headcount.
- **Multimodal AI Vision**: Upload outfit photos (JPG, PNG, WEBP) to automatically detect color palettes, neckline cuts, and silhouette styles to receive tailored jewelry pairings.
- **Dual AI Operation Mode**:
  - **⚡ Google Gemini AI (2.5 & 1.5 Flash)**: Connects seamlessly to Gemini API for deep contextual synthesis and structured JSON generation.
  - **⚙️ Smart Fallback Engine (Algorithmic)**: If the Gemini key is absent or unavailable, the deterministic fallback engine immediately kicks in with full catalog pricing, suggestions, and tips without crashing.
- **Persistent Planning History**: Automatically archives all generated plans to SQLite, isolated strictly per authenticated user.
- **Interactive Visualizations**: Recharts Pie charts, horizontal Bar charts, category cards, and room breakdowns.
- **Export & Print**: Clean, printable PDF-optimized reports for contractors, caterers, or jewelers.
- **Modern Dark-First SaaS UI**: Glassmorphic panels, electric purple/indigo gradients, responsive desktop sidebar & mobile drawer.

---

## 🏗 Architecture & Tech Stack

### Backend
- **Framework**: Python 3.10+ / 3.13 FastAPI
- **Database**: SQLite with SQLAlchemy 2.0 ORM
- **Authentication**: JWT (JSON Web Tokens) with HS256 & secure Bcrypt password hashing
- **Data Validation**: Pydantic v2 schemas
- **AI & Vision**: `google-genai` / `google-generativeai` with Pillow image quantization fallback
- **Server**: Uvicorn ASGI

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Glassmorphism
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Routing**: React Router DOM v7

---

## 📁 Project Structure

```
PocketSmart-AI/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, routes & lifespan
│   ├── database.py              # SQLite engine & session factory
│   ├── models.py                # User, PlanningHistory, UserPreference models
│   ├── schemas.py               # Pydantic v2 validation schemas
│   ├── dependencies.py          # JWT authentication route guards
│   ├── requirements.txt         # Backend Python dependencies
│   ├── .env.example             # Backend environment template
│   ├── routes/
│   │   ├── auth.py              # Register, login, me, logout
│   │   ├── home.py              # Home interior planner endpoint
│   │   ├── party.py             # Event & party planner endpoint
│   │   ├── jewelry.py           # Jewelry planner & outfit image analysis
│   │   ├── history.py           # User isolated history CRUD
│   │   └── user.py              # Profile and personalization settings
│   ├── services/
│   │   ├── ai_service.py        # Gemini API integration & JSON validator
│   │   ├── budget_service.py    # Mathematical budget allocation engine
│   │   ├── recommendation_service.py # Deterministic fallback & catalog
│   │   └── outfit_service.py    # Image palette extraction & fallback styling
│   ├── utils/
│   │   ├── security.py          # Bcrypt hashing & PyJWT tokens
│   │   └── validators.py        # Image and input bounds validation
│   └── tests/
│       └── test_api.py          # Pytest suite covering all core flows
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoadingOverlay.tsx     # Animated AI generation overlay
│   │   │   ├── OutfitUploadArea.tsx   # Drag-and-drop outfit vision uploader
│   │   │   ├── PlanResultView.tsx     # Interactive charts, cards & printable report
│   │   │   └── ProtectedRoute.tsx     # Route authentication guard
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Authentication & AI health state
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx          # Responsive sidebar & top navigation
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx          # User sign-in
│   │   │   ├── RegisterPage.tsx       # User account creation
│   │   │   ├── DashboardPage.tsx      # Overview, metrics & quick actions
│   │   │   ├── HomePlannerPage.tsx    # Multi-room interior planner
│   │   │   ├── PartyPlannerPage.tsx   # Event & guest budget planner
│   │   │   ├── JewelryPlannerPage.tsx # Jewelry & outfit matching planner
│   │   │   ├── HistoryPage.tsx        # Saved plans archive
│   │   │   ├── HistoryDetailPage.tsx  # Full plan view & inputs snapshot
│   │   │   └── ProfilePage.tsx        # User settings & currency preferences
│   │   ├── services/
│   │   │   └── api.ts                 # Centralized API client
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript domain interfaces
│   │   ├── App.tsx                    # Route definitions
│   │   ├── main.tsx                   # Client entrypoint
│   │   └── index.css                  # Dark glassmorphism & Tailwind styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.app.json
├── pytest.ini
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Quickstart Guide (Local Development)

### 1. Prerequisites
- **Python**: 3.10, 3.11, 3.12, or 3.13
- **Node.js**: v18+ or v20+ (v22 verified)
- **NPM**: 9+ or 10+

---

### 2. Backend Setup

Open a terminal in the root directory `PocketSmart-AI`:

#### On Windows (PowerShell / Command Prompt):
```powershell
# 1. Create Python virtual environment
python -m venv .venv

# 2. Activate virtual environment
.\.venv\Scripts\activate

# 3. Install backend dependencies
pip install -r backend\requirements.txt

# 4. (Optional) Configure environment variables
# Copy .env.example to .env and set GEMINI_API_KEY if available:
copy .env.example .env

# 5. Start the FastAPI backend server
uvicorn backend.main:app --reload --port 8000
```

The backend API will start at:
- **API Base**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

---

### 3. Frontend Setup

In a new terminal window:

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🔑 Environment Configuration

Create a `.env` file in the project root:

```env
# Google Gemini API Key (Optional: App automatically uses Smart Fallback Mode if omitted)
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL
DATABASE_URL=sqlite:///./pocketsmart.db

# JWT Secret Key
SECRET_KEY=pocketsmart-super-secret-production-jwt-key-2026-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

> **Security Note**: Never commit your `.env` file with live API keys. PocketSmart AI keeps credentials strictly in backend environment variables and never exposes them to frontend client code.

---

## 🧪 Running Automated Tests

Run the full pytest suite for the backend:

```powershell
.\.venv\Scripts\python -m pytest backend\tests\test_api.py -v
```

Tests verify:
- System Health check
- User registration, duplicate email handling, login, and JWT validation
- Home interior planner generation & automatic history archiving
- Party & event planner guest calculations
- Jewelry planner generation and outfit image analysis
- Data isolation (verifying users cannot access or delete other users' plans)

To test the frontend production build:
```powershell
cd frontend
npm run build
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/health` | Service status & Gemini configuration | No |
| `POST` | `/api/auth/register` | Register new account & obtain JWT | No |
| `POST` | `/api/auth/login` | Log in with email & password | No |
| `GET` | `/api/auth/me` | Current authenticated user profile | Yes |
| `POST` | `/api/auth/logout` | End user session | Yes |
| `POST` | `/api/generate-home` | Generate Home Interior budget plan | Yes |
| `POST` | `/api/generate-party` | Generate Party / Event budget plan | Yes |
| `POST` | `/api/generate-jewelry`| Generate Jewelry styling plan | Yes |
| `POST` | `/api/analyze-outfit` | Upload & analyze outfit image | Yes |
| `GET` | `/api/history` | List user's saved plans | Yes |
| `GET` | `/api/history/{id}` | Retrieve complete saved plan by ID | Yes |
| `DELETE`| `/api/history/{id}` | Delete plan from history | Yes |
| `GET` | `/api/user/profile` | Retrieve preferences & profile | Yes |
| `PUT` | `/api/user/profile` | Update name, currency, or style | Yes |

---

## 🛡️ Production & Security Best Practices

1. **Password Security**: Passwords are hashed using salted Bcrypt before storage; plain text passwords are never retained.
2. **Authorization Enforcement**: Database queries always filter by `user_id == current_user.id` to guarantee tenant isolation.
3. **Upload Validation**: File upload endpoints enforce MIME-type whitelisting (`image/jpeg`, `image/png`, `image/webp`) and a 10MB size limit.
4. **CORS Isolation**: Allowed origins are constrained to trusted client hosts.
