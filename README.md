# AI Personal Fitness Coach — Full-Stack AI Agent Web Application

An end-to-end commercial-grade personal fitness web application powered by an autonomous **AI Agent** connected to user workout history in **MySQL** via the **Groq SDK**.

---

## 🌟 Key Features

1. **Autonomous Groq AI Agent**: Tool-calling AI Agent architecture (powered exclusively by Groq SDK) capable of reading user profile stats, previous session logs, volume progression, progressive overload trends, and muscle group frequency to generate customized workout and nutrition recommendations.
2. **Proactive Daily Coach Insights**: Data-driven coaching summaries rendered dynamically on the dashboard.
3. **Active Workout Experience**: Interactive workout tracker with live workout timer, client-side rest timer (30s, 60s, 90s, custom), set completion checkboxes, and dynamic progressive overload indicators ("Last time: 55kg x 8").
4. **40+ Exercise Library**: Pre-seeded exercise database filterable by muscle groups, equipment, difficulty, and step-by-step instructions.
5. **Body Measurement & Progress Analytics**: Recharts visualizations for bodyweight trends, volume progression, and training frequency.
6. **Macro Nutrition Fuel Tracker**: Daily calories, protein, carbs, fat, and fiber tracking against calculated target goals.
7. **Production JWT Auth**: Dual-token architecture (short-lived access tokens + bcrypt hashed refresh tokens).

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React, Axios, Context API, React Router DOM.
- **Backend**: Node.js, Express.js, TypeScript, REST API, Prisma ORM, MySQL, JWT, bcrypt, Helmet, CORS, Rate Limiting.
- **AI Agent**: Groq SDK (`groq-sdk`), Tool Orchestrator, MySQL Prisma Tools, Intent Classifier (`llama-3.3-70b-versatile`).
- **DevOps**: Docker, Docker Compose, Nginx.

---

## 🚀 Quick Start (Docker Compose)

The full environment (Frontend, Backend, MySQL) can be spun up with a single command:

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API Server**: `http://localhost:5000/api`
- **MySQL Database**: `localhost:3306` (Database: `ai_fitness_trainer`)

---

## 💻 Local Development Setup

### 1. Database Setup (MySQL)
Make sure MySQL is running locally on port `3306`.

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Architecture

```text
c:\Users\BIJESH\OneDrive\Desktop\workout/
├── backend/
│   ├── src/
│   │   ├── agent/         # Groq AI Agent Orchestrator, Prompts & GroqProvider
│   │   ├── tools/         # 18 Database Retrieval & Calculator Tools (agent.tools.ts)
│   │   ├── controllers/   # REST Route Handlers
│   │   ├── services/      # Business & Domain Logic
│   │   ├── middlewares/   # Auth & Central Error Middlewares
│   │   ├── routes/        # API Endpoints
│   │   ├── config/        # Environment & Database Singletons
│   │   └── server.ts      # Express Server Entrypoint
│   ├── prisma/
│   │   ├── schema.prisma  # 17 Relational Database Tables
│   │   └── seed.ts        # 40+ Exercise Library Seed
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI & AppShell Layout
│   │   ├── pages/         # Dashboard, AI Trainer, Workouts, Progress, Nutrition, Exercises
│   │   ├── context/       # Auth & Theme Context Providers
│   │   ├── services/      # Axios API Client with Refresh Interceptors
│   │   └── types/         # TypeScript Domain Interfaces
│   └── package.json
│
└── docker-compose.yml
```

---

## 🔒 Security & Best Practices

- Passwords securely hashed with `bcrypt` (10 salt rounds).
- Database operations strictly parameterized via **Prisma ORM** (SQL Injection protection).
- CORS policies, Helmet security headers, and IP Rate Limiting enabled.
- Groq API keys protected exclusively within backend environment variables.
