# EliteCodeAI - Online Code Execution Platform

EliteCodeAI is a full-stack web application that allows users to write, execute, and test code in multiple programming languages. It features real-time code execution, problem management, and user authentication.

## 🚀 Features

- **Multi-Language Support**: Execute code in Python, JavaScript, C++, and Java
- **Real-Time Execution**: WebSocket-based real-time code execution
- **Problem Management**: Create, manage, and solve coding problems
- **User Authentication**: Secure authentication with NextAuth.js (supports Google OAuth)
- **Test Case Generation**: AI-powered test case generation using OpenAI
- **Docker-Based Execution**: Isolated code execution environment
- **Redis Queue**: Job queue management for scalable code execution

## 🏗️ Architecture

The project is structured as a monorepo with two main components:

```
QKCODE/
├── EliteCodeAI/           # Frontend (Next.js)
├── EliteCodeAI_Server/    # Backend & Worker Services
│   ├── backend/         # WebSocket server
│   └── Worker-1/        # Code execution worker
└── docker-compose.yml   # Docker orchestration
```

## 🛠️ Tech Stack

### Frontend (EliteCodeAI)
- **Framework**: Next.js 15.2.4
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB (Mongoose ODM)
- **Styling**: CSS Modules
- **HTTP Client**: Axios

### Backend (EliteCodeAI_Server)
- **Runtime**: Node.js 20
- **WebSocket**: ws library
- **Cache/Queue**: Redis
- **Language Runners**: Custom execution engines for Python, C++, Java, JavaScript

## 📋 Prerequisites

- Docker & Docker Compose
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials (optional, for social login)
- OpenAI API key (optional, for AI features)

## 🚀 Quick Start with Docker

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/EliteCodeAI-REPO.git
cd QKCODE
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the `EliteCodeAI/` directory:

```bash
cp env.example EliteCodeAI/.env.local
```

Edit `EliteCodeAI/.env.local` with your credentials:

```env
# API Keys
NEXT_PUBLIC_API_OPEN_API=your_openai_api_key_here

# Frontend URL
NEXT_PUBLIC_API_FRONTEND_PROBLEM=http://localhost:3000

# Backend WebSocket URL
NEXT_PUBLIC_API_WEBSOCKET_URL=ws://localhost:8080

# MongoDB Connection
MONGODB_URL=your_mongodb_connection_string_here

# JWT Secret (generate a random string)
NEXT_PUBLIC_API_JWT_SECRET=your_jwt_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Admin Key
NEXT_PUBLIC_API_ADMIN_KEY=your_admin_key_here

# Redis URL (for Docker)
REDIS_URL=redis://redis:6379
```

### 3. Create `.env` File at Root

Create a `.env` file at the root for Docker Compose build arguments:

```bash
# Copy the NEXT_PUBLIC_* variables from EliteCodeAI/.env.local
NEXT_PUBLIC_API_FRONTEND_PROBLEM=http://localhost:3000
NEXT_PUBLIC_API_OPEN_API=your_openai_api_key_here
NEXT_PUBLIC_API_WEBSOCKET_URL=ws://localhost:8080
NEXT_PUBLIC_API_JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_ADMIN_KEY=your_admin_key_here
```

### 4. Start the Application

```bash
docker compose up --build
```

This will start:
- **Frontend** on `http://localhost:3000`
- **Backend WebSocket Server** on `ws://localhost:8080`
- **Redis** on `localhost:6380`
- **Worker Services** for code execution

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 🔧 Development Setup (Without Docker)

### Frontend (EliteCodeAI)

```bash
cd EliteCodeAI
npm install --legacy-peer-deps
npm run dev
```

### Backend & Worker

```bash
cd EliteCodeAI_Server

# Terminal 1 - Backend
cd backend
npm install
node src/index.js

# Terminal 2 - Worker
cd Worker-1
npm install
node src/index.js
```

### Redis (Required)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7.2-alpine

# Or install Redis locally
brew install redis  # macOS
redis-server
```

## 🐳 Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild a specific service
docker compose up --build EliteCodeAI-frontend

# View logs for a specific service
docker compose logs -f EliteCodeAI-frontend
```

## 📁 Project Structure

### EliteCodeAI/ (Frontend)
```
EliteCodeAI/
├── src/
│   ├── components/       # React components
│   ├── pages/            # Next.js pages & API routes
│   │   ├── api/          # API endpoints
│   │   ├── auth/         # Authentication pages
│   │   └── problems/     # Problem pages
│   ├── lib/              # MongoDB connection
│   ├── models/           # Mongoose models
│   ├── middleware/       # Auth & rate limiting
│   ├── styles/           # CSS styles
│   └── utils/            # Utility functions
├── public/               # Static assets
└── dockerfile            # Frontend Dockerfile
```

### EliteCodeAI_Server/ (Backend)
```
EliteCodeAI_Server/
├── backend/
│   └── src/
│       ├── index.js          # WebSocket server
│       └── RedisManager.js   # Redis pub/sub
├── Worker-1/
│   └── src/
│       ├── index.js          # Worker entry point
│       ├── python_runner.js  # Python executor
│       ├── cpp_runner.js     # C++ executor
│       ├── java_runner.js    # Java executor
│       └── js_runner.js      # JavaScript executor
└── dockerfile                # Backend Dockerfile
```

## 🔐 Environment Variables

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_FRONTEND_PROBLEM` | Frontend URL | ✅ Yes |
| `NEXT_PUBLIC_API_WEBSOCKET_URL` | WebSocket server URL | ✅ Yes |
| `MONGODB_URL` | MongoDB connection string | ✅ Yes |
| `NEXT_PUBLIC_API_JWT_SECRET` | JWT signing secret | ✅ Yes |
| `NEXTAUTH_SECRET` | NextAuth session secret | ✅ Yes |
| `NEXTAUTH_URL` | NextAuth callback URL | ✅ Yes |
| `NEXT_PUBLIC_API_OPEN_API` | OpenAI API key | ⚠️ Optional |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ⚠️ Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ⚠️ Optional |
| `NEXT_PUBLIC_API_ADMIN_KEY` | Admin access key | ⚠️ Optional |

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |

## 🚨 Important Security Notes

⚠️ **Never commit these files:**
- `.env`
- `.env.local`
- `.env.local.backup`
- Any file containing API keys or secrets

✅ These are already in `.gitignore`

## 🧪 Testing the Application

### Test Code Execution

1. Sign up or log in at `http://localhost:3000/auth`
2. Navigate to "Problems" section
3. Select a problem or create a new one
4. Write your code in the editor
5. Click "Run" to execute

### Supported Languages

- **Python** (.py)
- **JavaScript** (.js)
- **C++** (.cpp)
- **Java** (.java)

## 🔍 Troubleshooting

### MongoDB Connection Issues

- Ensure your MongoDB connection string is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Verify the database user has proper permissions

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :8080
lsof -i :6380

# Kill the process
kill -9 <PID>
```

### Docker Build Failures

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache
```

### Environment Variables Not Loading

- Make sure `.env.local` is in the `EliteCodeAI/` directory
- Restart the Docker containers after changing env vars
- For `NEXT_PUBLIC_*` variables, rebuild the frontend image

## 📝 API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/[...nextauth]` - NextAuth endpoints

### Problems
- `GET /api/problem` - Get all problems
- `GET /api/problem/[id]` - Get specific problem
- `POST /api/problem/add` - Create new problem
- `POST /api/problem/run` - Execute code

### Code Execution
- WebSocket connection to `ws://localhost:8080`
- Send code execution requests via WebSocket
- Receive real-time execution results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- OpenAI for AI-powered features
- MongoDB for database services
- Docker for containerization

## 📞 Support

If you have any questions or run into issues, please:
1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information

---


