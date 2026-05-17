# MERN Stack Development Guide

This document provides comprehensive guidelines for developing the Sketchpad Nihongo application.

## Quick Start

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

## Backend Development

### File Organization

```
backend/src/
├── config/database.js          # MongoDB connection
├── models/User.js              # Mongoose schemas
├── controllers/userController.js    # Route handlers
├── routes/userRoutes.js        # API routes
├── middlewares/auth.js         # Authentication
├── validators/userValidator.js # Input validation
├── services/                   # Business logic
└── utils/                      # Helpers
```

### Creating a New Feature

1. **Define the Model** (`src/models/`)

   ```javascript
   const schema = new mongoose.Schema({
     // fields
   });
   ```

2. **Create the Controller** (`src/controllers/`)

   ```javascript
   export const getItems = asyncHandler(async (req, res) => {
     // controller logic
   });
   ```

3. **Add Routes** (`src/routes/`)

   ```javascript
   router.get("/", protect, getItems);
   ```

4. **Add Validation** (`src/validators/`)
   ```javascript
   export const validateItem = [body("field").isString()];
   ```

## Frontend Development

### File Organization

```
frontend/src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom hooks
├── services/      # API calls
├── context/       # Global state
└── styles/        # CSS files
```

### Creating a New Page

1. **Create Component** (`src/pages/NewPage.jsx`)
2. **Add Styles** (`src/pages/NewPage.css`)
3. **Add Route** in `App.jsx`
4. **Create Service** if API calls needed (`src/services/`)

### State Management

- Use React hooks (useState, useEffect, useContext)
- Create custom hooks for reusable logic
- Use React Context for global state

## API Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Common Tasks

### Add a New API Endpoint

1. Create controller method
2. Add validation rules
3. Create route
4. Test with curl or Postman

### Add a New React Component

1. Create component file with JSDoc
2. Add PropTypes
3. Add CSS file for styling
4. Export component

### Add Error Handling

**Backend:**

```javascript
if (!item) {
  return next(new AppError("Item not found", 404));
}
```

**Frontend:**

```javascript
catch (error) {
  setError(error.message);
}
```

## Database

### Connection String

```
mongodb://localhost:27017/sketchpad-nihongo
```

### Collections

- users
- (Add more as needed)

### Indexes

Created automatically for frequently queried fields (email, createdAt)

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sketchpad-nihongo
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sketchpad Nihongo
```

## Debugging

### Backend

- Enable logs: Check console output
- Use debugger: `node --inspect server.js`
- Check MongoDB: Use MongoDB Compass

### Frontend

- React DevTools browser extension
- Console logs and Network tab
- Vite debug mode

## Performance Tips

### Backend

- Use `.lean()` for read-only queries
- Implement pagination
- Create proper indexes
- Use select() to limit fields

### Frontend

- Lazy load routes with React.lazy()
- Memoize expensive computations
- Optimize images
- Use React DevTools Profiler

## Testing

### Backend Unit Tests

```bash
npm test
```

### Manual API Testing

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>"
```

## Code Quality

### Linting

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

### Best Practices

- Keep functions small and focused
- Use meaningful variable names
- Add comments for complex logic
- Avoid deeply nested code
- Use error boundaries in React

---

For more details, see `.cursorrules` for complete conventions.
