# Tether Backend - Couples' Relationship App

## Overview
Backend API for Tether, a couples' relationship app that helps partners deepen their connection through personalized questions (tethers). Built with TypeScript, Express, and MongoDB, featuring the **Question Service Engine** for intelligent question delivery and engagement tracking.

---

## 🌟 Key Features

### Question Service Engine ⭐
Comprehensive question management system with:
- **1,800 Questions**: 180 per category across 10 categories
- **Personalization**: Smart question selection based on couple profiles
- **Engagement**: Streaks, milestones, and progress tracking
- **Automation**: Scheduled tether drops, expiry handling, reminders
- **Tiers**: Free (2 categories) and Premium (10 categories)

**📚 Full Documentation**: See [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

### Other Features
- OAuth authentication (Google, Apple, Email)
- Couple pairing and management
- User onboarding with profile-based personalization
- Subscription and purchase management
- Admin panel for question management
- Push notification system

---

## 📚 Documentation

| Document | Purpose | Read When |
|----------|---------|-----------|
| [**DOCUMENTATION_INDEX.md**](./DOCUMENTATION_INDEX.md) | Navigation hub | Start here 🚀 |
| [**IMPLEMENTATION_SUMMARY.md**](./IMPLEMENTATION_SUMMARY.md) | What was built | Understanding scope |
| [**SETUP_GUIDE.md**](./SETUP_GUIDE.md) | Installation steps | Setting up system |
| [**QUESTION_SERVICE_README.md**](./QUESTION_SERVICE_README.md) | Technical deep dive | Development work |
| [**QUICK_REFERENCE.md**](./QUICK_REFERENCE.md) | Cheat sheet | Active coding |

---

## Project Structure
```
backend/
├── src/
│   ├── controllers/       # API endpoint handlers
│   │   ├── tether.ts      # ⭐ Question Service endpoints
│   │   ├── auth.ts
│   │   ├── couple.ts
│   │   └── admin/
│   ├── models/            # MongoDB schemas
│   │   ├── Category.ts             # ⭐ New
│   │   ├── CoupleQuestionState.ts  # ⭐ New
│   │   ├── CoupleCategoryState.ts  # ⭐ New
│   │   ├── UserEntitlement.ts      # ⭐ New
│   │   ├── Couple.ts               # ✏️ Updated
│   │   ├── User.ts
│   │   ├── Question.ts
│   │   └── Purchase.ts
│   ├── routes/            # API routes
│   │   ├── tethers.ts     # ⭐ New
│   │   ├── auth.ts
│   │   ├── couple.ts
│   │   └── admin/
│   ├── services/          # Business logic
│   │   ├── questionService.ts  # ⭐ Main engine
│   │   ├── scheduledJobs.ts    # ⭐ Automated jobs
│   │   ├── auth.ts
│   │   └── user.ts
│   ├── utils/             # Helpers
│   │   ├── milestoneHelpers.ts  # ⭐ New
│   │   ├── migrations.ts        # ⭐ New
│   │   └── index.ts
│   ├── scripts/           # One-time scripts
│   │   └── seedCategories.ts    # ⭐ New
│   ├── types/             # TypeScript definitions
│   │   ├── enums.ts       # ✏️ Updated
│   │   └── interfaces.ts  # ✏️ Updated
│   ├── middleware/        # Express middleware
│   └── db/                # Database connection
├── config/
│   ├── env/               # Environment configs
│   └── aws/               # AWS configs
└── Documentation files... # ⭐ See DOCUMENTATION_INDEX.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0 or pnpm
- MongoDB instance

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd backend

# 2. Install dependencies
pnpm install

# 3. Install Question Service Engine dependencies
pnpm add node-cron @types/node-cron

# 4. Set up environment variables
cp config/env/development.env.example config/env/development.env
# Edit with your MongoDB URI and other configs

# 5. Seed categories (one-time)
pnpm exec ts-node src/scripts/seedCategories.ts

# 6. Migrate existing data (if applicable)
pnpm exec ts-node src/utils/migrations.ts

# 7. Start development server
pnpm dev
```

Server runs on `http://localhost:3000`

---

## 🎯 API Endpoints

### Question Service (New)
```
GET    /api/tethers/active               - Get active tethers
POST   /api/tethers/answer               - Submit answer
POST   /api/tethers/skip                 - Skip tether
GET    /api/tethers/categories/progress  - Category progress
POST   /api/tethers/categories/unlock    - Unlock category
POST   /api/tethers/drop                 - Trigger drop (test)
GET    /api/tethers/stats                - Couple stats
POST   /api/tethers/initialize           - Initialize categories
```

### Authentication
```
POST   /api/auth/google                  - Google OAuth
POST   /api/auth/apple                   - Apple Sign In
POST   /api/auth/email/register          - Email registration
POST   /api/auth/email/login             - Email login
POST   /api/auth/refresh                 - Refresh token
```

### Couples
```
GET    /api/couple                       - Get couple info
POST   /api/couple/invite                - Create invite
POST   /api/couple/join                  - Join couple
```

### Admin
```
POST   /api/admin/auth/login             - Admin login
GET    /api/admin/questions              - Get questions
POST   /api/admin/questions              - Create question
PUT    /api/admin/questions/:id          - Update question
DELETE /api/admin/questions/:id          - Delete question
```

**Full API Reference**: See [QUESTION_SERVICE_README.md](./QUESTION_SERVICE_README.md)

---

## ⚙️ Environment Setup

The application supports multiple environments:

### Development
- Config: `config/env/development.env`
- AWS: `config/aws/dev-aws-config.json`

### Staging
- Config: `config/env/stage.env`
- AWS: `config/aws/stage-aws-config.json`

### Production
- Config: `config/env/prod.env`
- AWS: `config/aws/prod-aws-config.json`

### Required Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/tether

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
APPLE_CLIENT_ID=your-apple-client-id

# AWS (for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
```

---

## 📦 Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm dev:stage        # Start with staging environment
pnpm dev:prod         # Start with production environment

# Build & Production
pnpm build            # Compile TypeScript to dist/
pnpm start            # Run compiled code

# Code Quality
pnpm lint             # Check code with ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run tests

# Database
pnpm seed:categories  # Seed 10 categories (one-time)
pnpm migrate          # Migrate existing data (one-time)
```

---

## 🏗️ Architecture

### Question Service Engine Flow

```
┌─────────────────────────────────────────────────────┐
│                  Scheduled Jobs                      │
│  (Every hour: drop tethers, handle expiry)          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          QuestionServiceEngine                       │
│  • selectNextQuestion() - Personalization           │
│  • dropTethersForCouple() - Automated drops         │
│  • submitAnswer() - State management                │
│  • skipQuestion() - Refresh mechanics               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Database Models                         │
│  • CoupleQuestionState (question states)            │
│  • CoupleCategoryState (progress tracking)          │
│  • UserEntitlement (subscription tiers)             │
│  • Category (10 categories)                         │
└─────────────────────────────────────────────────────┘
```

### Request Flow
```
Client Request
    ↓
Express Routes (/api/tethers/*)
    ↓
Auth Middleware (JWT validation)
    ↓
Controller (tether.ts)
    ↓
Service Layer (QuestionServiceEngine)
    ↓
Database (MongoDB)
    ↓
Response (JSON)
```

---

## 🧪 Testing

### Manual Testing
```bash
# Get auth token first
TOKEN=$(curl -X POST http://localhost:3000/api/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

# Test endpoints
curl http://localhost:3000/api/tethers/active \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/api/tethers/drop \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/tethers/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Testing Checklist
See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for full checklist.

---

## 🔧 Development Guidelines

### TypeScript
- Strict type checking enabled
- No `any` types without justification
- Interfaces defined in `src/types/`

### Code Quality
- **ESLint**: Enforce code standards
- **Prettier**: Consistent formatting
- **Husky**: Pre-commit hooks

### Exception Handling
When using `@ts-ignore`:
1. Add comment explaining why
2. Get senior developer review
3. Minimize usage

### Git Workflow
```bash
# Feature branch
git checkout -b feature/your-feature

# Commit with conventional commits
git commit -m "feat: add new endpoint"

# Pre-commit hooks run automatically
# - Linting
# - Type checking
# - Formatting
```

---

## 🚀 Deployment

### Serverless (AWS Lambda)
```bash
# Deploy to staging
pnpm deploy:stage

# Deploy to production
pnpm deploy:prod
```

**Note**: For serverless, scheduled jobs run via CloudWatch Events (not node-cron).

### Traditional Server
```bash
# Build
pnpm build

# Start production server
NODE_ENV=production pnpm start
```

---

## 📊 Database

### Collections
- `users` - User accounts
- `couples` - Couple relationships
- `questions` - Question pool (1,800 docs)
- `categories` - 10 category definitions
- `couplequestionstates` - Question states per couple
- `couplecategorystates` - Category progress per couple
- `userentitlements` - Subscription tiers
- `purchases` - Purchase records
- `coupleinvites` - Invitation codes

### Indexes
Auto-created for performance:
- Compound indexes on `coupleId + categoryId`
- Single indexes on `userId`, `questionId`, etc.
- Timestamp indexes for expiry handling

---

## 🔐 Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- OAuth 2.0 for Google/Apple
- Rate limiting (recommended to add)
- Input validation
- CORS configured

---

## 📈 Monitoring

### Recommended Tools
- **Datadog**: Application monitoring
- **Sentry**: Error tracking
- **MongoDB Atlas**: Database metrics
- **CloudWatch**: AWS Lambda logs

### Key Metrics to Track
- Tether drop success rate
- Answer submission rate
- Streak maintenance rate
- Milestone achievement rate
- API response times
- Database query performance

---

## 🐛 Troubleshooting

### Common Issues

**Q: Scheduled jobs not running**  
A: Ensure `node-cron` installed and server running continuously (not serverless).

**Q: Questions not dropping**  
A: Check `couple.lastTetherDrop` and verify rhythm interval passed.

**Q: Categories not initialized**  
A: Run `POST /api/tethers/initialize` for the couple.

**Full Troubleshooting**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 🤝 Contributing

1. Create feature branch
2. Make changes with tests
3. Run linting and formatting
4. Commit with conventional commits
5. Create pull request

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🙏 Credits

Built for **Tether** - Connecting Couples, One Question at a Time ❤️

**Architecture**: RESTful API with Question Service Engine  
**Framework**: Express.js + TypeScript  
**Database**: MongoDB  
**Deployment**: AWS Lambda (Serverless Framework)

---

## 📞 Support

- **Documentation**: Start with [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
- **Issues**: Check troubleshooting guides
- **Questions**: Review API documentation

---

**Happy Coding! 🎉**