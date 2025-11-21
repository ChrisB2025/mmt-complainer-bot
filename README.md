# MMT Media Accountability Platform

A web application that enables MMT (Modern Monetary Theory) advocates to log instances of economic misinformation in media, generate unique complaint letters using AI, and send them directly to media outlets.

## Features

- **Log Incidents**: Record economic misinformation in media (TV, radio, print, online)
- **AI-Generated Letters**: Claude AI generates unique, professional complaint letters
- **Letter Variation**: Each user gets a unique letter even for the same incident
- **Direct Sending**: Send complaints directly to media outlets via email
- **Track Complaints**: Monitor your sent complaints and responses

## Types of Misinformation Tracked

- **Household Budget Analogies**: Comparing government finances to household budgets
- **Debt Scare Mongering**: Creating unfounded concern about government debt
- **Government Insolvency Myth**: Suggesting currency-issuing governments can go bankrupt
- **Other Economic Misinformation**: General economic inaccuracies

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- Anthropic Claude API for letter generation
- Nodemailer for email sending
- JWT authentication

### Frontend
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS
- React Query for data fetching
- React Hook Form
- Zustand for state management

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Anthropic API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and API credentials

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Seed initial data (UK media outlets)
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies API requests to the backend on port 3001.

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mmt_accountability"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
CLAUDE_API_KEY="sk-ant-api..."
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="app-password"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Incidents
- `GET /api/incidents` - List incidents (with filters)
- `GET /api/incidents/:id` - Get incident details
- `POST /api/incidents` - Create incident (auth required)

### Outlets
- `GET /api/outlets` - List media outlets
- `POST /api/outlets` - Add new outlet (auth required)

### Complaints
- `GET /api/complaints` - User's complaints (auth required)
- `PUT /api/complaints/:id` - Update draft letter
- `POST /api/complaints/:id/send` - Send complaint

### Letter Generation
- `POST /api/generate-letter` - Generate complaint letter for incident
- `POST /api/generate-letter/regenerate/:id` - Regenerate letter

## Project Structure

```
mmt-complainer-bot/
├── backend/
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic (Claude, email)
│   │   ├── middleware/       # Auth, error handling
│   │   └── server.ts         # Express app entry
│   └── prisma/
│       ├── schema.prisma     # Database schema
│       └── seed.ts           # Initial data
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Zustand state
│   │   └── types/            # TypeScript types
│   └── index.html
└── README.md
```

## How Letter Variation Works

The system ensures each complaint letter is unique by:

1. Tracking how many complaints exist for each incident
2. Using different variation strategies (leading with error, standards, impact, etc.)
3. Varying emphasis (requesting corrections, training, policy review, etc.)
4. Adapting to user's preferred tone (professional, academic, passionate)

## Seeded Media Outlets

The database seed includes UK media outlets:
- BBC Television & Radio
- ITV
- Channel 4
- Sky News
- The Guardian
- The Telegraph
- The Times
- Financial Times
- LBC Radio

## Deployment

### Railway Deployment

For detailed Railway deployment instructions, see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md).

**Quick Start:**
1. Deploy backend first (with PostgreSQL addon)
2. Deploy frontend (set root directory to `frontend`)
3. Set `VITE_API_URL` in frontend to point to backend
4. Set `FRONTEND_URL` in backend to point to frontend
5. Run database migrations and seed data

## License

MIT
