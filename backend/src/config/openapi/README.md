# OpenAPI Documentation Structure

This directory contains the modular OpenAPI 3.1.0 specification for the Kotonote Nihongo API.

## Structure

```
openapi/
├── index.js              # Main OpenAPI spec aggregator
├── schemas.js            # Shared schemas (User, Error, etc.)
├── paths/                # API endpoint definitions
│   ├── auth.js          # Authentication endpoints
│   ├── users.js         # User management endpoints
│   ├── surveys.js       # Survey endpoints
│   ├── quotes.js        # Quote endpoints
│   ├── vocabulary.js    # Vocabulary endpoints
│   ├── kana.js          # Kana endpoints
│   ├── kanji.js         # Kanji endpoints
│   ├── ai.js            # AI generation endpoints
│   ├── streaks.js       # Streak tracking endpoints
│   └── system.js        # System/health endpoints
└── README.md            # This file
```

## How to Add New Endpoints

### 1. Create or Update Path File

Create a new file in `paths/` directory (e.g., `paths/newfeature.js`):

```javascript
export const newFeaturePaths = {
  '/api/newfeature': {
    get: {
      tags: ['New Feature'],
      summary: 'Get new feature',
      description: 'Detailed description',
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  },
};
```

### 2. Add Schema (if needed)

Update `schemas.js`:

```javascript
export const schemas = {
  // ... existing schemas
  NewFeature: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'Feature name' },
      // ... other properties
    },
  },
};
```

### 3. Import in index.js

Update `index.js`:

```javascript
import { newFeaturePaths } from './paths/newfeature.js';

export const openApiSpec = {
  // ... config
  paths: {
    ...authPaths,
    ...userPaths,
    ...newFeaturePaths, // Add here
    // ... other paths
  },
};
```

## Common Response References

Use these shared response references for consistency:

- `{ $ref: '#/components/responses/Unauthorized' }` - 401 Unauthorized
- `{ $ref: '#/components/responses/Forbidden' }` - 403 Forbidden (Admin only)
- `{ $ref: '#/components/responses/NotFound' }` - 404 Not Found

Example:

```javascript
responses: {
  '200': { /* success response */ },
  '401': { $ref: '#/components/responses/Unauthorized' },
  '403': { $ref: '#/components/responses/Forbidden' },
  '404': { $ref: '#/components/responses/NotFound' },
}
```

## Common Schema References

Use these shared schemas:

- `{ $ref: '#/components/schemas/Error' }` - Error response
- `{ $ref: '#/components/schemas/User' }` - User object
- `{ $ref: '#/components/schemas/Vocabulary' }` - Vocabulary object
- `{ $ref: '#/components/schemas/VocabularyDeck' }` - Vocabulary deck object
- `{ $ref: '#/components/schemas/Kanji' }` - Kanji object
- `{ $ref: '#/components/schemas/KanjiDeck' }` - Kanji deck object
- `{ $ref: '#/components/schemas/Quote' }` - Quote object
- `{ $ref: '#/components/schemas/Survey' }` - Survey object
- `{ $ref: '#/components/schemas/Streak' }` - Streak object
- `{ $ref: '#/components/schemas/Kana' }` - Kana object

## Security

For protected endpoints, add security requirement:

```javascript
{
  get: {
    tags: ['Protected'],
    summary: 'Protected endpoint',
    security: [{ bearerAuth: [] }], // Add this line
    // ... rest of config
  }
}
```

## Tags

Use consistent tags for grouping:

- `Authentication` - Auth endpoints
- `User` - User profile endpoints
- `Survey` - Survey endpoints
- `Vocabulary` - Public vocabulary endpoints
- `Kanji` - Public kanji endpoints
- `Kana` - Public kana endpoints
- `Quotes` - Public quote endpoints
- `Streaks` - Streak tracking endpoints
- `Admin - User Management` - Admin user management
- `Admin - Vocabulary Management` - Admin vocabulary CRUD
- `Admin - Kanji Management` - Admin kanji CRUD
- `Admin - AI Generation` - AI generation endpoints
- `Admin - Quote Management` - Admin quote CRUD
- `Admin - Survey Management` - Admin survey management
- `Admin - Streak Management` - Admin streak management
- `System` - Health check and system endpoints

## Viewing Documentation

The API documentation is available at:

- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-domain.com/api-docs

The documentation uses Scalar API Reference with a purple theme.

## Best Practices

1. **Keep paths modular** - One file per feature/resource
2. **Use schema references** - Don't duplicate schema definitions
3. **Consistent naming** - Follow existing patterns
4. **Add examples** - Include realistic example values
5. **Document query params** - Specify all filters and options
6. **Use enums** - Define allowed values for fields
7. **Add descriptions** - Explain what each endpoint does
8. **Security tags** - Mark protected endpoints with `security: [{ bearerAuth: [] }]`

## Validation

To validate the OpenAPI spec:

```bash
# Check if spec loads correctly
node -e "import('./backend/src/config/openapi/index.js').then(m => console.log('✓ OK')).catch(e => console.error('✗ Error:', e.message))"
```

## Notes

- The spec follows OpenAPI 3.1.0 standard
- All endpoints return consistent response format with `success`, `messageCode`, and `data` fields
- Message codes are defined in `backend/src/constants/messages.js`
- Authentication uses JWT Bearer tokens
