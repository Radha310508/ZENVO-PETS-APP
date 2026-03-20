# 🐾 ZENVO PETS

> A behavior and health intelligence platform for urban dog parents in India

[![Railway Deploy](https://img.shields.io/badge/Deploy%20on-Railway-blueviolet)](https://railway.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

ZENVO PETS helps dog parents track behavior, triggers, and health in one place so they can understand patterns earlier and care more confidently.

### Target Users
- Urban Indian dog parents (age 23-40)
- First-time dog parents
- Owners of dogs with recurring behavior issues

## ✨ Features

### 🐕 Pet Profile Management
- Complete pet profiles with health records
- Vaccination schedules
- Food information tracking

### 📝 Daily Behavior Log
- **Fast logging** (< 1 minute)
- Track: appetite, energy, mood, sleep
- Note unusual behaviors and triggers
- Designed for mobile-first experience

### 🤖 AI Weekly Insights
- Powered by **Gemini 3 Flash**
- Pattern detection across weeks
- Personalized care recommendations
- Non-diagnostic, supportive language

### 📄 Shareable Care Summary
- Comprehensive health reports
- Print/export functionality
- Share with family or vet

### 🔔 Smart Reminders
- Vaccination reminders
- Checkup notifications
- Medication tracking

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **JWT** - Secure authentication
- **Gemini 3 Flash** - AI-powered insights via emergentintegrations

### Frontend
- **React 19** - UI library
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Shadcn/UI** - Component library

### Authentication
- Email/password with JWT tokens
- Google OAuth via Emergent integration

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- Yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/zenvo-pets.git
cd zenvo-pets

# Backend setup
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials

# Frontend setup
cd ../frontend
yarn install
cp .env.example .env
# Edit .env with backend URL

# Start backend
cd ../backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Start frontend (in new terminal)
cd frontend
yarn start
```

### Environment Variables

See `.env.example` files in `/backend` and `/frontend` directories.

Key variables:
- `MONGO_URL` - MongoDB connection string
- `EMERGENT_LLM_KEY` - Gemini API access
- `JWT_SECRET` - Authentication secret
- `REACT_APP_BACKEND_URL` - Backend API endpoint

## 🔧 Railway Deployment

**Complete step-by-step guide**: See [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md)

### Quick Deploy

1. **Database**: Create MongoDB Atlas cluster
2. **Backend**: Deploy on Railway with environment variables
3. **Frontend**: Deploy on Railway, connect to backend
4. **Test**: Verify all features work

**Estimated time**: 30-40 minutes  
**Cost**: Free tier available

## 📋 API Documentation

### Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Pets
```bash
# Create pet
POST /api/pets
Authorization: Bearer <token>
{
  "name": "Max",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 28.5
}

# Get all pets
GET /api/pets
Authorization: Bearer <token>
```

### Daily Logs
```bash
# Create log
POST /api/logs
Authorization: Bearer <token>
{
  "pet_id": "pet_123",
  "date": "2024-03-20",
  "appetite": "Good",
  "energy": "High",
  "mood": "Playful",
  "sleep": "Good"
}
```

### AI Insights
```bash
# Generate weekly summary
POST /api/summaries/generate?pet_id=pet_123
Authorization: Bearer <token>
```

Full API docs available at `/docs` endpoint (FastAPI Swagger UI)

## 🎨 Design System

- **Primary Color**: Zen Blue (#568EA3)
- **Typography**: Manrope (headings) + Inter (body)
- **Style**: Calm, premium, lightweight
- **Layout**: Mobile-first responsive
- **Animations**: Framer Motion micro-interactions

Design guidelines: See `/design_guidelines.json`

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest backend_test.py -v
```

### Frontend Tests
```bash
cd frontend
yarn test
```

### Manual Testing
1. Create test user and pet
2. Log daily behaviors for 3+ days
3. Generate AI insights
4. Test all CRUD operations

**Test Results**: 97% success rate (see test reports)

## 🛡️ Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- MongoDB injection prevention
- Environment variable management
- HTTPS enforcement in production

## 📊 Performance

- Daily log submission: < 1 minute target
- AI insights generation: ~5-10 seconds
- Mobile-optimized bundle size
- Async database operations
- Efficient MongoDB queries with projections

## 🕰️ Roadmap

### Current (MVP)
- [x] Pet profile management
- [x] Daily behavior logging
- [x] AI weekly insights
- [x] Care summaries
- [x] Reminders

### Next Phase
- [ ] Behavior streak gamification
- [ ] Advanced data visualization
- [ ] PDF export for care summaries
- [ ] Push notifications
- [ ] Multi-pet comparison views
- [ ] Vet collaboration features

## 👥 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 📧 Support

- **Issues**: GitHub Issues
- **Email**: support@zenvopets.com
- **Docs**: See `/docs` folder

## 🚀 Built With

- [Emergent AI Platform](https://emergent.sh) - Initial development
- [Railway](https://railway.app) - Deployment
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Database
- [Gemini API](https://ai.google.dev/) - AI insights

---

**Made with ❤️ for dog parents everywhere**

🐾 Track. Understand. Care Better.