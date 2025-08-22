# FoodWise API

Base URL: /api

Endpoints:
- POST /compare: { food1, food2, goal }
- POST /plan: { preferences[], allergies[], calories, goal }
- POST /analyze: multipart/form-data with file, or JSON { data }
- POST /chat: { message }
- GET /health: service status

Env:
- PORT: server port (default 5000)
- GOOGLE_API_KEY: Gemini API key
- MONGO_URI: optional for MongoDB connection

Example curl:
```bash
curl -X POST http://localhost:5000/api/compare -H "Content-Type: application/json" -d '{"food1":"banana","food2":"apple","goal":"diabetic diet"}'
```


