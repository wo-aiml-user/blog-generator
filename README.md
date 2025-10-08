# Blog Generator with LangGraph

An intelligent blog generation system that uses LangGraph workflows, LLM-based routing, and parallel web research to create high-quality, well-researched articles.


## Requirements

- Python 3.8+
- Google Gemini API key
- Perplexity API key

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set environment variables** in `.env`:
   ```
   GOOGLE_API_KEY=your_google_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   ```

3. **Start the server**:
   ```bash
   python src/main.py
   ```

4. **Run tests**:
   ```bash
   python test_workflow.py
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

## API Endpoints

### POST /generate
Generate article outlines from a topic.

**Request**:
```json
{
  "thread_id": "unique-session-id",
  "topic": "AI in Healthcare",
  "tone": "professional",
  "length": "medium",
  "target_audience": "student",
  "num_outlines": "5"
}
```

**Response**:
```json
{
    "status": "success",
    "session_id": "th-1",
    "current_stage": "outlines",
    "keywords": "AI transformation strategies tech industry 2025, ...",
    "articles": [
        { "title": "2025 AI Business Predictions - PwC", ... }
    ],
    "citations": [],
    "outlines_json": {
        "title": "AI 2025: A Tech Industry Blueprint for...",
        "outlines": [
            { "section": "The Strategic Imperative...", "description": "..." },
            ...
        ]
    },
    "draft_article": null,
    "follow_up_question": "Do these outlines effectively cover the strategic, workforce, and growth sector aspects...?"
}
```

### POST /user_input
Provide feedback to continue the workflow.

**Request**:
```json
{
  "thread_id": "unique-session-id",
  "user_feedback": "looks good, proceed"
}
```

**Response** (after article generation):
```json
{
    "status": "success",
    "session_id": "th-1",
    "current_stage": "draft",
    "keywords": "AI-powered early disease detection systems, ...",
    "articles": [
        { "title": "Leveraging AI for early detection...", ... }
    ],
    "citations": [],
    "outlines_json": {
        "title": "The AI Revolution in Healthcare...",
        "outlines": [
            { "section": "Introduction", "description": "..." },
            ...
        ]
    },
    "draft_article": {
        "title": "The AI Revolution in Healthcare...",
        "content": "# The AI Revolution in Healthcare...",
        "citations": [
            { "title": "Leveraging AI for early detection...", "url": "...", "relevance": "..." }
        ]
    },
    "follow_up_question": "You asked to remove the 'Conclusion' section; I have done that. Is there anything else you would like to modify?"
}
```

## Testing

Run the automated test suite:

```bash
python test_workflow.py
```

## Project Structure

```
bolg_generator/
├── src/
│   ├── main.py          # FastAPI server
│   ├── graph.py         # LangGraph workflow definition
│   └── nodes.py         # Node implementations
├── utils/
│   ├── prompts.py       # LLM prompts (all JSON-enforced)
│   ├── tools.py         # Perplexity search utilities
│   └── model_config.py  # LLM configuration
├── logs/
│   └── app.log          # Execution logs
├── test_workflow.py     # Automated tests
├── WORKFLOW.md          # Detailed workflow docs
├── QUICK_START.md       # Quick start guide
└── README.md            # This file
```

## Technology Stack

- **FastAPI**: REST API server
- **LangGraph**: Workflow orchestration
- **LangChain**: LLM integration
- **Google Gemini**: LLM provider
- **Perplexity**: Web search API
- **Pydantic**: Data validation

