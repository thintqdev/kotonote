# Sketchpad Nihongo - MERN Stack Project

A full-stack web application built with **MongoDB**, **Express.js**, **React**, and **Node.js** for learning and managing Japanese vocabulary and kanji.

## 📋 Project Structure

```
sketchpad-nihongo/
├── backend/
│   ├── src/
│   │   ├── config/           # Database and environment configs
│   │   ├── controllers/      # Route handlers and business logic
│   │   ├── models/          # Mongoose schemas and models
│   │   ├── routes/          # API route definitions
│   │   ├── middlewares/     # Custom express middlewares
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Helper utilities
│   │   └── validators/      # Input validation schemas
│   ├── server.js            # Express app entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page-level components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client services
│   │   ├── utils/          # Helper functions
│   │   ├── context/        # React context providers
│   │   ├── constants/      # Application constants
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   ├── index.html
│   ├── main.jsx            # React entry point
│   ├── vite.config.js      # Vite configuration
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**

   ```bash
   cd sketchpad-nihongo
   ```

2. **Install dependencies for both frontend and backend**

   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   **Backend** - Copy `.env.example` to `.env` and update values:

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

   **Frontend** - Copy `.env.example` to `.env`:

   ```bash
   cd frontend
   cp .env.example .env
   ```

### Running the Application

**Development Mode** (runs both backend and frontend)

```bash
npm run dev
```

This will start:

- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:5173`

**Backend Only**

```bash
cd backend
npm run dev
```

**Frontend Only**

```bash
cd frontend
npm run dev
```

**Production Build**

```bash
npm run build
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

### User Endpoints

| Method | Endpoint     | Description               | Auth     |
| ------ | ------------ | ------------------------- | -------- |
| GET    | `/users`     | Get all users (paginated) | Admin    |
| GET    | `/users/:id` | Get single user           | Required |
| POST   | `/users`     | Create new user           | Public   |
| PUT    | `/users/:id` | Update user               | Required |
| DELETE | `/users/:id` | Delete user               | Admin    |

#### Example: Get All Users

```bash
curl -X GET http://localhost:5000/api/users?page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

#### Example: Create User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🛠️ Tech Stack

### Backend

- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin handling
- **Compression** - Response compression

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **Axios** - HTTP client
- **React Router** - Navigation (optional)
- **CSS** - Styling

## 📖 Code Conventions

### Backend

- Use ES6+ syntax (arrow functions, async/await, destructuring)
- Follow single responsibility principle
- Use `asyncHandler` wrapper for all route handlers
- Consistent error handling with `AppError`
- JSDoc comments for complex functions
- Use `.lean()` for read-only queries
- Implement pagination for list endpoints

### Frontend

- Functional components with hooks
- PropTypes for type checking
- Reusable, composable components
- Custom hooks for logic reuse
- Consistent folder structure
- CSS modules or scoped styles
- Handle loading and error states

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT authentication
- ✅ Role-based access control (Admin/User)
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Environment variable protection
- ✅ Rate limiting ready

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📝 Git Workflow

### Commit Message Convention

```
feat: add user authentication
fix: resolve memory leak in user list
docs: update API documentation
style: format code with prettier
refactor: simplify user validation logic
test: add tests for user controller
chore: update dependencies
```

### Branch Naming

```
feature/user-authentication
bugfix/fix-login-error
hotfix/security-patch
refactor/improve-performance
```

## 🚢 Deployment

### Backend (Node.js)

1. Set `NODE_ENV=production`
2. Use process manager (PM2)
3. Enable HTTPS
4. Configure database connection pooling
5. Set up monitoring and logging

### Frontend (React)

1. Build: `npm run build`
2. Serve static files from `dist/` folder
3. Configure proper caching headers
4. Enable GZIP compression
5. Set up error tracking

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 📄 License

ISC

## 👤 Author

Created as a MERN stack learning project

---

**Happy coding!** 🎉

For more details, see the [DESIGN_RULE.md](.cursorrules) file for coding standards and best practices.
