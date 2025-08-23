# FoodWise Backend

A small, lightweight backend server for the FoodWise nutrition assistant that accepts input in Gemini API format.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your configuration
# PORT=5000
# GOOGLE_API_KEY=your_api_key_here
```

### 3. Run the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Health Check
```bash
GET /api/health
```

### Generate Content (Enhanced with AI Concepts)
```bash
POST /api/generate
Content-Type: application/json

{
  "contents": [
    {
      "parts": [
        {
          "text": "Compare banana vs apple for diabetic diet"
        }
      ]
    }
  ],
  "temperature": 0.7,
  "top_p": 0.9,
  "max_tokens": 1000
}
```

### Function Calling
```bash
POST /api/function-call
Content-Type: application/json

{
  "function_name": "compareFoods",
  "parameters": {
    "food1": "banana",
    "food2": "apple",
    "goal": "diabetic diet"
  }
}
```

## 🧪 Test the API

### Using curl
```bash
# Health check
curl http://localhost:5000/api/health

# Generate endpoint with AI concepts
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Compare banana vs apple for diabetic diet"
          }
        ]
      }
    ],
    "temperature": 0.7,
    "top_p": 0.9,
    "max_tokens": 1000
  }'

# Function calling
curl -X POST http://localhost:5000/api/function-call \
  -H "Content-Type: application/json" \
  -d '{
    "function_name": "compareFoods",
    "parameters": {
      "food1": "banana",
      "food2": "apple",
      "goal": "diabetic diet"
    }
  }'
```

### Using Postman/Insomnia
- **URL**: `http://localhost:5000/api/generate`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**: Use the JSON format shown above

## 🔧 Features

- ✅ **Zero-shot prompting** - Automatically detects query types without examples
- ✅ **Function calling** - Structured function execution with parameters
- ✅ **System prompts** - Context-aware nutritionist persona
- ✅ **Structured output** - Consistent JSON response format
- ✅ **AI parameters** - Temperature, Top-P, and Max tokens control
- ✅ **Input validation** - Robust error handling and validation
- ✅ **CORS enabled** - Frontend integration ready
- ✅ **Environment config** - Easy customization
- ✅ **Health check** - System status monitoring

## 🚧 Future Enhancements

- **Multi-shot prompting** - Add example-based learning
- **Chain of thought** - Step-by-step reasoning
- **Embeddings** - Vector-based similarity search
- **Vector database** - Store and retrieve nutrition knowledge
- **Cosine similarity** - Advanced content matching
- **Evaluation framework** - Test and validate responses
- **Rate limiting** - API usage control
- **Authentication** - Secure access control

## 📁 File Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── env.example        # Environment variables template
└── README.md         # This file
```
