# Finance Dashboard Backend API

A production-quality REST API for a **finance dashboard system** where different users interact with financial records based on their role. Built with Node.js, Express.js, and MongoDB.

## Features

- **JWT Authentication** with access + refresh token rotation
- **Role-Based Access Control (RBAC)** — Viewer, Analyst, Admin
- **Financial Records** CRUD with filtering, pagination, and soft delete
- **Dashboard Analytics** — summary, category breakdown, monthly trends, recent activity
- **Swagger/OpenAPI** interactive documentation at `/api-docs`
- **Input Validation** with Zod schemas
- **Security Hardening** — Helmet, CORS, rate limiting
- **Comprehensive Integration Tests** — 43 tests with Jest + Supertest

## Tech Stack

| Concern | Technology |
|---------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js 5 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| Validation | Zod |
| Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Testing | Jest + Supertest |
| Security | helmet, cors, express-rate-limit |
| Logging | Winston |

## Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** 6.0+ (running locally on default port 27017)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory (or copy from the template):

```env
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/finance

# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_MAX=10000
AUTH_RATE_LIMIT_MAX=5000
```

### 3. Seed Sample Data

```bash
npm run seed
```

This creates 3 demo users (Admin, Analyst, Viewer) and 50 sample financial records.

### 4. Start Development Server

```bash
npm run dev
```

The server starts on `http://localhost:3000` with hot-reload via nodemon.

## API Documentation

Visit **http://localhost:3000/api-docs** for interactive Swagger documentation where you can test every endpoint directly in your browser.

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user (defaults to VIEWER role) |
| POST | `/login` | Public | Login, returns access + refresh tokens |
| POST | `/refresh` | Public | Refresh an expired access token |
| POST | `/logout` | Public | Invalidate a refresh token |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/me` | Authenticated | Get own profile |
| PATCH | `/me` | Authenticated | Update own name/email |
| GET | `/` | Admin only | List all users (with search & pagination) |
| GET | `/:id` | Admin only | Get a specific user by ID |
| PATCH | `/:id` | Admin only | Update user role or status |
| DELETE | `/:id` | Admin only | Soft-deactivate a user (sets status to INACTIVE) |

### Records (`/api/records`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Admin only | Create a financial record |
| GET | `/` | Viewer+ | List records with filters & pagination |
| GET | `/:id` | Viewer+ | Get a single record by ID |
| PATCH | `/:id` | Admin only | Update a record |
| DELETE | `/:id` | Admin only | Soft-delete a record (`isDeleted: true`) |

**Available Filters**: `?type=INCOME&category=Salary&startDate=2025-01-01&endDate=2025-12-31&page=1&limit=20&sortBy=date&order=desc&search=keyword`

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/summary` | Analyst+ | Total income, expenses, net balance, record count |
| GET | `/category-breakdown` | Analyst+ | Totals grouped by category and type |
| GET | `/monthly-trends` | Analyst+ | Monthly income vs expenses |
| GET | `/recent-activity` | Viewer+ | Latest 10 financial records |

## Access Control Matrix

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View records | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View analytics/summaries | ❌ | ✅ | ✅ |
| Create/Update/Delete records | ❌ | ❌ | ✅ |
| Manage users & roles | ❌ | ❌ | ✅ |

## Demo Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.com | password123 |
| Analyst | analyst@finance.com | password123 |
| Viewer | viewer@finance.com | password123 |

## Testing

Run the full integration test suite (43 tests):

```bash
npm test
```

Run with verbose output:

```bash
npm run test:verbose
```

Tests cover:
- **Auth** — Registration, login, token refresh, logout
- **RBAC** — Role-based endpoint access enforcement
- **Records** — CRUD operations, filtering, pagination, soft-delete
- **Dashboard** — Summary aggregation, category breakdown, trends

## Project Structure

```
src/
├── config/              # Database connection, env vars, Swagger config
├── features/            # Feature-based modules
│   ├── auth/            # Register, login, refresh, logout
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   └── auth.validator.js
│   ├── users/           # User CRUD & role management
│   │   ├── users.routes.js
│   │   ├── users.controller.js
│   │   ├── users.service.js
│   │   └── users.validator.js
│   ├── records/         # Financial records CRUD
│   │   ├── records.routes.js
│   │   ├── records.controller.js
│   │   ├── records.service.js
│   │   └── records.validator.js
│   └── dashboard/       # Analytics & aggregation
│       ├── dashboard.routes.js
│       ├── dashboard.controller.js
│       └── dashboard.service.js
├── middlewares/          # Express middleware
│   ├── auth.js          # JWT authentication
│   ├── rbac.js          # Role-based access control
│   ├── validate.js      # Zod schema validation
│   ├── errorHandler.js  # Global error handler
│   └── rateLimiter.js   # Rate limiting
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── FinancialRecord.js
│   └── RefreshToken.js
├── utils/               # Shared utilities
│   ├── ApiError.js      # Custom error class with HTTP status codes
│   ├── ApiResponse.js   # Standardized response formatter
│   └── logger.js        # Winston logger
├── app.js               # Express app configuration
└── server.js            # Entry point
scripts/
├── seed.js              # Database seeder with sample data
└── test_api.js          # Quick API smoke test
tests/
├── helpers.js           # Test utilities (user creation, cleanup)
├── auth.test.js         # Auth endpoint tests
├── users.test.js        # User management tests
├── records.test.js      # Records CRUD tests
└── dashboard.test.js    # Dashboard analytics tests
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload (nodemon) |
| `npm start` | Start production server |
| `npm run seed` | Seed demo users + 50 sample records |
| `npm test` | Run the full integration test suite |
| `npm run test:verbose` | Run tests with detailed output |

## Design Decisions & Assumptions

### Architecture
- **Feature-based structure**: Code is organized by feature (auth, users, records, dashboard) rather than by layer. Each feature contains its own routes, controller, service, and validator. This improves maintainability and makes each module self-contained.
- **Controller → Service → Model**: A clean separation of concerns where controllers handle HTTP, services contain business logic, and models manage data access.

### Authentication & Security
- **JWT with refresh token rotation**: Access tokens expire in 15 minutes. Refresh tokens are stored in MongoDB and rotated on each use, preventing replay attacks.
- **Password hashing**: bcryptjs with 12 salt rounds for secure password storage.
- **New users default to VIEWER role**: Prevents privilege escalation on public registration.

### Data Modeling
- **Soft deletes**: Financial records use an `isDeleted` flag rather than permanent deletion. This preserves data integrity and supports audit trails — critical for financial applications.
- **User deactivation**: Users are set to `INACTIVE` status rather than deleted, preserving referential integrity with their created records.

### Tradeoffs
- **MongoDB over SQL**: Chose MongoDB for flexible schema design and simpler aggregation pipelines for dashboard analytics. A relational database (PostgreSQL) would provide stronger referential integrity but adds complexity for this use case.
- **Zod over Joi**: Zod provides excellent TypeScript-like validation with smaller bundle size, though Joi has a larger ecosystem.
- **No email verification**: Registration does not require email verification for simplicity. In production, this would be added.
- **In-memory rate limiting**: Rate limits use the default memory store. In a multi-server deployment, Redis-backed rate limiting would be needed.

## License

ISC
