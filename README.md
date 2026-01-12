# 🚀 DocsVibe Backend API (Heroku Deployment Branch)

> **This branch contains ONLY the backend for Heroku deployment**  
> For the full project with frontend, see the [main branch](https://github.com/Kushal-Raj-G-S/DocsVibe-AI-Powered-Document-Chat)

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com)
[![Heroku](https://img.shields.io/badge/Heroku-Deployed-purple.svg)](https://heroku.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Backend Features

- 🤖 **AI-Powered Chat** - Multiple AI models (Gemini, GPT, DeepSeek)
- 📄 **Multi-Format Support** - PDF, DOCX, PPTX document processing
- ☁️ **Cloud Storage** - Cloudflare R2 (10GB free)
- 💾 **Dual Database** - Neon (3GB) + Supabase (512MB)
- ⚡ **Fast & Cached** - 1-hour response caching
- 📊 **Smart Routing** - Intelligent model selection

## 🏗️ Heroku Deployment

**Live API:** https://api.docsvibe.app  
**Heroku URL:** https://docsvibe-api-266bfa25d2e8.herokuapp.com

### Configuration

- ✅ **Procfile** - Uvicorn with 2 workers
- ✅ **Production requirements** - No ChromaDB/heavy ML libs
- ✅ **.slugignore** - Excludes chroma_db, uploads, logs
- ✅ **DATABASE_URL fallback** - SQLite if no PostgreSQL

## 🔧 Environment Variables

Set these in Heroku Config Vars:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE=your-service-role-key
SUPABASE_DATABASE_URL=postgresql://user:pass@host:5432/db

# Neon Database
NEON_DATABASE_URL=postgresql://user:pass@neon-host/db
DATABASE_URL=postgresql://user:pass@neon-host/db

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ENDPOINT_URL=https://account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket
R2_PUBLIC_URL=https://your-bucket.r2.dev

# AI APIs  
A4F_API_KEY=your-a4f-key
A4F_BASE_URL=https://api.a4f.co/v1
```

## 📦 Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Add environment variables
heroku config:set DATABASE_URL="your-db-url" --app docsvibe-api
heroku config:set SUPABASE_URL="your-supabase-url" --app docsvibe-api
# ... add all other variables

# Deploy this branch
git push heroku heroku-backend:main

# Check logs
heroku logs --tail --app docsvibe-api
```

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI application
├── Procfile               # Heroku startup command
├── runtime.txt            # Python 3.11.9
├── requirements.txt       # Production dependencies
├── requirements-dev.txt   # Dev dependencies (with ChromaDB)
├── .slugignore           # Exclude from Heroku slug
├── routes/               # API endpoints
│   ├── chat_routes.py    # Chat & PDF upload
│   ├── conversation_routes.py
│   └── user_routes.py
├── database/             # Database configs
│   ├── db_config.py      # SQLAlchemy setup
│   └── dual_db_config.py # Neon + Supabase
├── models/               # Pydantic models
└── utils/                # Helper functions
    ├── a4f_client.py     # AI API client
    ├── pdf_extractor.py  # Document processing
    └── r2_storage.py     # Cloudflare R2
```
git clone https://github.com/Kushal-Raj-G-S/DocsVibe-AI-Powered-Document-Chat.git
cd DocsVibe-AI-Powered-Document-Chat/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your credentials (see DEPLOYMENT.md)

# Verify system
python verify_system.py

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with API URL

# Run development server
npm run dev
```

Visit http://localhost:3000

## 📖 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
  - Cloudflare R2 setup
  - Database configuration
  - Production deployment
  
- **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Frontend API integration
  - API changes
  - Component updates
  - TypeScript types
  
- **[PRODUCTION_READY.md](PRODUCTION_READY.md)** - System status & checklist
  - Architecture overview
  - Testing checklist
  - Monitoring guide

## 🔧 Environment Variables

### Backend (.env)
```bash
# Databases
NEON_DATABASE_URL=postgresql://user:pass@host/db
SUPABASE_DATABASE_URL=postgresql://user:pass@host/db
DATABASE_URL=${NEON_DATABASE_URL}

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=docsvibe
R2_ENDPOINT_URL=https://xxx.r2.cloudflarestorage.com

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# AI API
A4F_API_KEY=your_api_key
A4F_BASE_URL=https://api.ai4free.com/v1
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📂 Project Structure

```
docsvibe/
├── backend/
│   ├── config/              # Model configs
│   ├── database/            # Database connections
│   │   ├── db_config.py          # Neon (conversations/messages)
│   │   └── dual_db_config.py     # Supabase (users/files)
│   ├── models/              # SQLAlchemy models
│   │   └── chat_models.py        # Conversation, Message, UploadedFile, User
│   ├── routes/              # API endpoints
│   │   ├── chat_routes.py        # Upload, send, get files, delete
│   │   ├── conversation_routes.py
│   │   ├── user_routes.py
│   │   └── monitoring_routes.py
│   ├── utils/               # Utilities
│   │   ├── r2_storage.py         # Cloudflare R2 operations
│   │   ├── supabase_client.py    # User management
│   │   ├── pdf_extractor.py      # Text extraction
│   │   ├── model_router.py       # AI model selection
│   │   └── cache_manager.py      # Response caching
│   ├── main.py              # FastAPI app
│   └── verify_system.py     # Health check
│
├── frontend/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── page.tsx              # Landing page
│   │   ├── chat/page.tsx         # Chat interface
│   │   └── dashboard/page.tsx    # User dashboard
│   ├── components/          # React components
│   │   ├── chat/
│   │   │   ├── ChatArea.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── MultiPDFUploader.tsx
│   │   │   └── ModelSelector.tsx
│   │   └── ui/                   # Shadcn UI components
│   ├── utils/               # API clients
│   │   └── api.ts                # Backend API calls
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useChatHistory.ts
│   └── types/               # TypeScript types
│       └── chat.ts
│
├── DEPLOYMENT.md            # Deployment guide
├── FRONTEND_INTEGRATION.md  # Frontend API changes
├── PRODUCTION_READY.md      # System status
└── README.md               # This file
```

## 🔌 API Endpoints

### Upload File
```http
POST /api/chat/upload
Content-Type: multipart/form-data

file: File
conversation_id: number
user_email: string
```

### Send Message
```http
POST /api/chat/send
Content-Type: application/json

{
  "conversation_id": 1,
  "message": "Explain this document",
  "model": "gemini-flash",
  "user_email": "student@university.edu"
}
```

### Get Files
```http
GET /api/chat/pdfs/{conversation_id}
```

### Delete File
```http
DELETE /api/chat/pdf/{file_id}
```

See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for detailed API documentation.

## 🧪 Testing

```bash
# Backend health check
cd backend
python verify_system.py

# Run full system test
python test_architecture.py

# Start development server
uvicorn main:app --reload

# Test upload
curl -X POST "http://localhost:8000/api/chat/upload" \
  -F "file=@test.pdf" \
  -F "conversation_id=1" \
  -F "user_email=test@example.com"
```

## 📊 Free Tier Limits

| Service | Storage | Notes |
|---------|---------|-------|
| Cloudflare R2 | 10GB | Document storage |
| Neon | 3GB | Chat data |
| Supabase | 512MB | User data |
| Render | 750 hours/month | Backend hosting |
| Vercel | Unlimited | Frontend hosting |

**Supports ~1000 students with 10MB usage each**

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for PostgreSQL
- **boto3** - AWS S3 SDK (R2 compatible)
- **Supabase Python** - User management
- **ChromaDB** - Vector database (optional)

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Supabase Auth** - Authentication

### Infrastructure
- **Cloudflare R2** - File storage
- **Neon** - PostgreSQL (conversations)
- **Supabase** - PostgreSQL (users) + Auth
- **Render/Railway** - Backend hosting
- **Vercel** - Frontend hosting

## 🚧 Development Roadmap

- [x] ✅ Multi-format file support (PDF, DOCX, PPTX)
- [x] ✅ Cloudflare R2 integration
- [x] ✅ Dual database architecture
- [x] ✅ User authentication (Supabase)
- [x] ✅ Response caching
- [x] ✅ Smart model routing
- [ ] ⏳ Real-time collaboration
- [ ] ⏳ Voice input/output
- [ ] ⏳ Mobile app (React Native)
- [ ] ⏳ Analytics dashboard
- [ ] ⏳ Custom model training

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 👨‍💻 Author

**Kushal Raj G S**
- GitHub: [@Kushal-Raj-G-S](https://github.com/Kushal-Raj-G-S)
- Project: [DocsVibe](https://github.com/Kushal-Raj-G-S/DocsVibe-AI-Powered-Document-Chat)
- College: BMS Institute of Technology, Bangalore

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [Cloudflare](https://www.cloudflare.com/) - R2 storage
- [Neon](https://neon.tech/) - PostgreSQL hosting
- [Supabase](https://supabase.com/) - Auth & database
- [Shadcn UI](https://ui.shadcn.com/) - UI components

## 📞 Support

- 📖 **Documentation**: See `DEPLOYMENT.md` and `FRONTEND_INTEGRATION.md`
- 🐛 **Bug Reports**: Open an issue on GitHub
- 💬 **Questions**: Discussions tab on GitHub

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ for students by students**
