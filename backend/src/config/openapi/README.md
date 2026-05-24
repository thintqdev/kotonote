# OpenAPI Documentation Structure

Modular OpenAPI 3.1.0 spec for the Kotonote Nihongo API. **One domain per file** under `paths/`.

## Structure

```
openapi/
├── index.js                      # Aggregator
├── schemas.js                    # Shared components/schemas
├── paths/
│   ├── auth.js
│   ├── users.js
│   ├── surveys.js
│   ├── quotes.js
│   ├── vocabulary.js
│   ├── vocabularyProgress.js
│   ├── adminVocabularyImport.js
│   ├── adminVocabularyGenerate.js
│   ├── kanji.js
│   ├── kanjiProgress.js
│   ├── ai.js
│   ├── streaks.js
│   ├── grammar.js
│   ├── adminGrammar.js
│   ├── reading.js
│   ├── adminReading.js
│   ├── listening.js
│   ├── adminListening.js
│   ├── membership.js
│   ├── notebook.js
│   ├── notifications.js
│   ├── adminNotifications.js
│   ├── adminBadges.js
│   ├── adminPrompts.js
│   └── system.js
└── README.md
```

## Add a new endpoint

1. Add or extend the matching file in `paths/` (create a new file if it is a new domain).
2. Add schemas in `schemas.js` when reusable.
3. Import and spread in `index.js`.

## View docs

- **Development**: http://localhost:8000/api/docs (Scalar; port from `PORT` in `.env`)

## Validate

```bash
node -e "import('./src/config/openapi/index.js').then(() => console.log('✓ OK')).catch(e => console.error('✗', e.message))"
```

Run from `backend/`.

## Notes

- Responses use `success`, `messageCode`, and `data`.
- JWT: `security: [{ bearerAuth: [] }]`.
- `/api/profile/*` mirrors `/api/users/*` (same handlers); only `/api/users` is documented.
