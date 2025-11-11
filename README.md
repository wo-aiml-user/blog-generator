# Blog Generator with LangGraph

An intelligent blog generation system that uses LangGraph workflows, LLM-based routing, and parallel web research to create high-quality, well-researched articles, powered by a FastAPI backend.


## Requirements

- Python 3.8+
- Google Gemini API key
- Perplexity API key
- Uvicorn (included in requirements.txt)
- FastAPI (included in requirements.txt)

## Quick Start

1. **Install dependencies**:
   ```bash
   cd blog-generator
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env` in the `blog-backend` directory
   - Add your API keys and configuration:
     ```env
     # API Keys
     GOOGLE_API_KEY=your_google_api_key
     PERPLEXITY_API_KEY=your_perplexity_api_key
     
     # Server Configuration
     HOST=0.0.0.0
     PORT=8000
     RELOAD=true
     LOG_LEVEL=info
     ```

3. **Start the development server**:
   ```bash
   cd blog-backend
   python uvicorn_config.py
   ```
   - The API will be available at: http://localhost:8000
   - Interactive API docs: http://localhost:8000/docs
   - Alternative API docs: http://localhost:8000/redoc

## API Endpoints

- `POST /generate` - Generate blog content based on a topic
- `POST /user_input` - Process user feedback and continue generation
- `POST /regenerate_image` - Regenerate images based on feedback




### Running in Production

For production, it's recommended to run with auto-reload disabled:

```bash
RELOAD=false python uvicorn_config.py
```

## Workflow Overview

```
POST /generate (topic, tone, length)
    ↓
Node 1: Generate 3 Keywords
    ↓
Node 2: Parallel Web Search (3 keywords)
    ↓
Node 3: Generate Outlines + Title
    ↓
← Returns outlines to user →
    ↓
POST /user_input (feedback)
    ↓
Node 4: Router (LLM decides APPROVE or EDIT)
    ├─ EDIT → Back to Node 3
    └─ APPROVE → Node 5: Write Full Article
         ↓
    ← Returns article to user →
         ↓
    POST /user_input (feedback)
         ↓
    Node 6: Router (LLM decides APPROVE or EDIT)
         ├─ EDIT → Back to Node 5
         └─ APPROVE → END (Complete)
```