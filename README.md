# EliteCodeAI - Online Code Practice & Code Execution Platform

EliteCodeAI is an AI powered full-stack web application for practicing coding problems, writing and executing code in multiple languages, and tracking progress. It provides authentication, problem management, and a Docker-isolated execution environment powered by a Redis-backed worker.

## 🚀 Features

- **Authentication & Authorization**: User sign-up/sign-in with protected routes.
- **Problem Management**: Create, list, and solve coding problems with test cases.
- **Interactive Code Editor**: Ace editor for writing and running code in-browser.
- **Multi-Language Execution**: Python, C++, JavaScript, and Java via a worker service.
- **Real-Time Feedback**: WebSocket updates for execution status/results.
- **Docker-Isolated Workers**: Sandbox for untrusted code.
- **Redis Queue**: Job queue connecting backend and worker.
- **AI-Assisted Utilities**: Optional OpenAI-powered helpers.

## 🏗️ Architecture

Monorepo orchestrated by Docker Compose:

```
EliteCodeAI/
├── frontend/            # React + Vite SPA
├── server/
│   ├── backend/         # Express API + WebSocket server
│   └── worker/          # Code execution worker (Python, C++, JS, Java)
└── docker-compose.yml   # Redis, backend, worker services
```

- **Frontend**: React + Vite SPA communicating with backend via HTTP/WebSockets.
- **Backend**: Express + ws; auth, problems, WebSocket bridge; publishes jobs to Redis.
- **Worker**: Node-based runners consuming jobs from Redis; executes code per language runner.
- **Redis**: Central queue between backend and worker.

## 🛠️ Tech Stack

### Frontend (frontend/)
- React 19 + Vite
- react-router-dom
- Tailwind CSS (PostCSS)
- Ace via react-ace / ace-builds
- Axios

### Backend (server/backend/)
- Node.js + Express
- ws (WebSocket)
- MongoDB + Mongoose
- JWT auth + bcrypt
- Redis client
- openai SDK (optional)

### Worker (server/worker/)
- Node.js worker
- Redis consumer
- Language runners: python-shell and child processes for JS/C++/Java/Python

### Infrastructure
- Docker & Docker Compose
- Example prod: frontend on S3 + CloudFront; backend/worker on server/EC2 with TLS and CORS configured

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js (for local dev without Docker)
- MongoDB instance (local or Atlas)
- Redis (Docker or local)
- OpenAI API key (optional)

## 🚀 Quick Start with Docker

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/EliteCodeAI.git
cd EliteCodeAI
```

### 2. Backend & worker environment

Create `server/backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
REDIS_URL=redis://redis:6379
OPENAI_API_KEY=your_openai_api_key_here   # optional
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
WS_PORT=8080
```

Create `server/worker/.env` if needed:

```env
REDIS_URL=redis://redis:6379
OPENAI_API_KEY=your_openai_api_key_here   # optional
```

### 3. Start services with Docker

```bash
docker compose up --build
```

Starts Redis (6379), backend API (4000), WebSocket server (8080), and worker.

### 4. Run frontend locally (dev)

```bash
cd frontend
npm install
npm run dev
```

Vite serves at `http://localhost:5173`.

### 5. Access the app

Open `http://localhost:5173` and sign up/login to start practicing problems.

## 🔧 Development setup (without Docker)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd server/backend
npm install
node src/index.js   # or src/app.js if that is your entry
```

### Worker

```bash
cd server/worker
npm install
node src/index.js
```

### Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7.2-alpine

# Or local (macOS example)
brew install redis
redis-server
```

## 🐳 Docker commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild without cache
docker compose build --no-cache

# Logs per service
docker compose logs -f backend
docker compose logs -f worker
```

## 📁 Project structure

### Root

```
LiteAIcode/
├── docker-compose.yml
├── frontend/
└── server/
    ├── backend/
    └── worker/
```

### Frontend (React + Vite)

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.cjs
└── src/
    ├── App.jsx
    ├── index.jsx
    ├── index.css
    ├── components/
    │   └── Navbar.jsx
    ├── pages/
    │   ├── auth/
    │   │   ├── login/        # LoginPage.jsx
    │   │   └── signup/       # SignupPage.jsx
    │   ├── home/             # HomePage.jsx
    │   ├── create/           # createPage.jsx (create problem)
    │   └── practice/         # practicePage.jsx, problemDetail.jsx
    └── utils/
        └── protectRoute.jsx  # Route protection helper
```

### Backend & worker

```
server/
├── Dockerfile
├── Dockerfile.backend
├── Dockerfile.worker
├── backend/
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── index.js
│       ├── redisManager.js
│       ├── ws.js
│       ├── controllers/
│       │   ├── auth.controllers.js
│       │   └── problem.controllers.js
│       ├── db/
│       │   └── index.js
│       ├── lib/utils/
│       │   └── generateToken.js
│       ├── middlewares/
│       │   └── protectRoute.js
│       ├── models/
│       │   ├── problemModel.js
│       │   ├── userModel.js
│       │   └── userProblemModel.js
│       └── routes/
│           ├── auth.routes.js
│           ├── login.routes.js
│           └── problem.routes.js
└── worker/
    ├── package.json
    └── src/
        ├── index.js
        ├── cpp_runner.js
        ├── java_runner.js
        ├── js_runner.js
        └── python_runner.js
```

## 🔐 Environment variables

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_BASE_URL | Backend API base URL (e.g. http://localhost:4000) | Yes |
| VITE_WS_URL | WebSocket URL (e.g. ws://localhost:8080) | Yes |

Example `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:8080
```

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| REDIS_URL | Redis connection URL | Yes |
| OPENAI_API_KEY | OpenAI API key for AI features | Optional |
| PORT | HTTP port (default 4000) | Optional |
| WS_PORT | WebSocket port (default 8080) | Optional |

### Worker

| Variable | Description | Required |
|----------|-------------|----------|
| REDIS_URL | Redis connection URL | Yes |
| OPENAI_API_KEY | OpenAI API key (if used) | Optional |

## 🚨 Security notes

- Do not commit any `.env` files or secrets.
- Keep API keys, JWT secrets, and database credentials out of version control.

## 🧪 Testing the application

1. Start Redis, backend, worker, and frontend (Docker or local).
2. Sign up or log in from the frontend.
3. Navigate to practice/problems.
4. Create or open a problem.
5. Write code and click Run.
6. Review results returned from the worker through the backend.

Supported languages: Python, JavaScript, C++, Java.

## 🔍 Troubleshooting

- MongoDB: verify `MONGODB_URI`; for Atlas, whitelist IP and check roles.
- Redis/queue: ensure Redis reachable at `REDIS_URL`; check worker logs.
- Ports: `lsof -i :4000`, `lsof -i :8080`, `lsof -i :5173`; kill blocking PID.
- Docker build/runtime: `docker system prune -a`, `docker compose build --no-cache`, `docker compose up -d`.
- Frontend cannot reach backend: verify `VITE_API_BASE_URL` and `VITE_WS_URL`; if frontend is on S3/CloudFront, ensure backend is reachable publicly and CORS allows it.

## 📝 API routes (overview)

Check `server/backend/src/routes` for details. Typical patterns:
- Auth: POST /api/auth/signup, POST /api/auth/login
- Problems: GET /api/problems, GET /api/problems/:id, POST /api/problems, POST /api/problems/:id/submit
- Code execution: WebSocket on ws://<host>:8080 (default); send code/jobs, receive real-time results.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License.

## 🙏 Acknowledgments

- React & Vite teams
- MongoDB
- Docker
- Redis
- OpenAI (optional AI utilities)

## 📞 Support

If you have questions or issues:
1. See Troubleshooting above
2. Check existing GitHub issues
3. Open a new issue with details

---
