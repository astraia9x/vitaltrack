# 🩺 VitalTrack

A personal health tracking app that helps you monitor medical records, daily routines, doctor appointments, symptoms, and weather correlations — all in one place. Built with React Router v7 (web) and Expo (mobile).

---

## ✨ Features

- **Dashboard** — At-a-glance summary: routine completion, symptom severity trend, records count, next appointment, and live weather
- **Health Records** — Store and browse medical history, lab results, prescriptions, and visit summaries
- **Routines** — Manage daily health habits and medications; toggle active/inactive
- **Appointments** — Track upcoming and past doctor visits with specialty and reason details
- **Symptom Log** — Log symptoms with severity (1–10); auto-captures local weather at time of logging
- **Live Weather Widget** — Real-time weather for any city (°C, km/h, UV, humidity, feels-like)
- **Forecast-Based Alerts** — Warns when today's weather matches patterns that previously triggered high-severity symptoms

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + [React Router v7](https://reactrouter.com) |
| Mobile | Expo / React Native (Expo Router) |
| Backend | React Router v7 API routes + [Hono](https://hono.dev) server |
| Database | PostgreSQL via [Neon](https://neon.tech) serverless |
| Data fetching | [TanStack React Query](https://tanstack.com/query) |
| Weather API | WeatherAPI (via integration proxy) |
| Styling | Tailwind CSS |
| Icons | Lucide React |

---

## 📁 Project Structure

```
apps/
├── web/
│   └── src/
│       ├── app/
│       │   ├── page.jsx                  # Dashboard
│       │   ├── appointments/page.jsx     # Appointments tracker
│       │   ├── records/page.jsx          # Health records
│       │   ├── routines/page.jsx         # Routine manager
│       │   ├── symptoms/page.jsx         # Symptom log
│       │   └── api/
│       │       ├── appointments/route.js
│       │       ├── records/route.js
│       │       ├── routines/route.js
│       │       ├── routines/[id]/route.js
│       │       ├── symptoms/route.js
│       │       ├── weather/route.js
│       │       └── utils/
│       │           ├── sql.js            # Neon DB helper
│       │           └── upload.js         # File upload helper
└── mobile/
    └── src/
        └── app/
            ├── _layout.jsx               # Root Expo layout
            └── index.jsx                 # Mobile entry point
```

---

## 🗄️ Database Schema

Four core PostgreSQL tables:

### `appointments`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `doctor_name` | text | Required |
| `specialty` | text | e.g. Cardiologist |
| `appointment_date` | timestamptz | Required |
| `reason` | text | Visit reason |
| `status` | text | Default: `Scheduled` |
| `created_at` | timestamptz | Auto |

### `health_records`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `title` | text | Required |
| `description` | text | |
| `record_date` | date | Default: today |
| `type` | text | e.g. Lab Result, Prescription |
| `created_at` | timestamptz | Auto |

### `routines`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `name` | text | Required |
| `frequency` | text | e.g. Daily, Weekly |
| `time_of_day` | text | e.g. Morning, Evening |
| `is_active` | boolean | Default: `true` |
| `created_at` | timestamptz | Auto |

### `symptoms`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `description` | text | Required |
| `severity` | integer | 1–10 |
| `logged_at` | timestamptz | Auto |
| `weather_temp` | numeric | °C at time of log |
| `weather_condition` | text | e.g. Partly Cloudy |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/appointments` | List all appointments |
| `POST` | `/api/appointments` | Create a new appointment |
| `GET` | `/api/records` | List all health records |
| `POST` | `/api/records` | Create a new health record |
| `GET` | `/api/routines` | List all routines |
| `POST` | `/api/routines` | Create a new routine |
| `PATCH` | `/api/routines/:id` | Update a routine (e.g. toggle active) |
| `DELETE` | `/api/routines/:id` | Delete a routine |
| `GET` | `/api/symptoms` | List all symptom logs |
| `POST` | `/api/symptoms` | Log a symptom (auto-fetches weather) |
| `GET` | `/api/weather?city=...` | Get current weather for a city |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

**`apps/web/.env.local`**
```env
DATABASE_URL=postgresql://user:password@host/dbname
NEXT_PUBLIC_CREATE_APP_URL=https://your-app-url.com
```

**`apps/mobile/.env.local`**
```env
EXPO_PUBLIC_APP_URL=https://your-app-url.com
EXPO_PUBLIC_BASE_URL=https://your-app-url.com
EXPO_PUBLIC_CREATE_ENV=PRODUCTION
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_PROJECT_GROUP_ID=your-project-group-id
EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY=your-uploadcare-public-key
```

> ⚠️ Never commit `.env` or `.env.local` files. They are already in `.gitignore`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) (or any PostgreSQL) database

### Web app

```bash
cd apps/web
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (or check your terminal output).

### Mobile app

```bash
cd apps/mobile
npm install
npx expo start
```

### Set up the database

Run the following SQL to create the required tables:

```sql
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  doctor_name TEXT NOT NULL,
  specialty TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_records (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  record_date DATE DEFAULT CURRENT_DATE NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  time_of_day TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE symptoms (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  weather_temp NUMERIC,
  weather_condition TEXT
);
```

---

## 📄 License

MIT — feel free to use and adapt this for your own health tracking needs.
