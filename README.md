# Blog Generator with LangGraph

An intelligent blog generation system that uses LangGraph workflows, LLM-based routing, and parallel web research to create high-quality, well-researched articles.

## 🌟 Features

- **6-Node Workflow**: Keywords → Search → Outlines → Router → Article → Router → Complete
- **LLM-Based Routing**: Intelligent approval/edit decisions using natural language
- **Parallel Web Search**: Simultaneous Tavily searches for multiple keywords
- **JSON-Only Responses**: Structured, parseable outputs from all LLM calls
- **Comprehensive Logging**: Full input/output logging for debugging and monitoring
- **Stateful Workflows**: Thread-based state management with checkpointing
- **Citation Support**: Automatic source citations in generated articles

## 📋 Requirements

- Python 3.8+
- Google Gemini API key
- Tavily API key

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set environment variables** in `.env`:
   ```
   GOOGLE_API_KEY=your_google_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

3. **Start the server**:
   ```bash
   python src/main.py
   ```

4. **Run tests**:
   ```bash
   python test_workflow.py
   ```

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[WORKFLOW.md](WORKFLOW.md)** - Complete workflow documentation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🔄 Workflow Overview

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

## 🎯 API Endpoints

### POST /generate
Generate article outlines from a topic.

**Request**:
```json
{
  "thread_id": "unique-session-id",
  "topic": "AI in Healthcare",
  "tone": "professional",
  "length": "medium"
}
```

**Response**:
```json
{
  "status": "ok",
  "current_stage": "outlines",
  "keywords": "AI diagnostics, machine learning healthcare, patient care AI",
  "outlines_json": {
    "title": "The Future of AI in Healthcare",
    "outlines": [
      {"section": "Introduction", "description": "Overview of AI in healthcare"},
      {"section": "AI in Diagnostics", "description": "How AI improves diagnosis"}
    ]
  }
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
  "status": "ok",
  "current_stage": "draft",
  "draft_article": {
    "title": "The Future of AI in Healthcare",
    "content": "# The Future of AI in Healthcare\n\n## Introduction\n..."
  }
}
```

## 🔍 Logging

All execution details are logged to `logs/app.log`:

- Node inputs and outputs
- Full LLM prompts
- Raw LLM responses
- Routing decisions
- API request/response details
- Error traces

## 🧪 Testing

Run the automated test suite:

```bash
python test_workflow.py
```

Tests include:
1. Complete happy path (approve all)
2. Edit outlines scenario
3. Edit article scenario

## 📁 Project Structure

```
bolg_generator/
├── src/
│   ├── main.py          # FastAPI server
│   ├── graph.py         # LangGraph workflow definition
│   └── nodes.py         # Node implementations
├── utils/
│   ├── prompts.py       # LLM prompts (all JSON-enforced)
│   ├── tools.py         # Tavily search utilities
│   └── model_config.py  # LLM configuration
├── logs/
│   └── app.log          # Execution logs
├── test_workflow.py     # Automated tests
├── WORKFLOW.md          # Detailed workflow docs
├── QUICK_START.md       # Quick start guide
└── README.md            # This file
```

## 🛠️ Technology Stack

- **FastAPI**: REST API server
- **LangGraph**: Workflow orchestration
- **LangChain**: LLM integration
- **Google Gemini**: LLM provider
- **Tavily**: Web search API
- **Pydantic**: Data validation

## 💡 Key Features Explained

### JSON-Only LLM Responses
All prompts enforce strict JSON output with no markdown code blocks, ensuring reliable parsing.

### LLM-Based Routing
Router nodes use the LLM to understand natural language feedback and decide whether to approve or request edits.

### Parallel Web Search
Multiple keywords are searched simultaneously using ThreadPoolExecutor for faster research.

### Context Management
Tone, length, and web content are preserved throughout the workflow for consistent article generation.

### Comprehensive Logging
Every node logs:
- All inputs
- Full LLM prompts
- Raw LLM responses
- Parsed outputs
- Execution time

## 🤝 Contributing

This is a production-ready blog generator. To extend:

1. Add new nodes in `src/nodes.py`
2. Update workflow in `src/graph.py`
3. Add prompts in `utils/prompts.py`
4. Test with `test_workflow.py`

## 📝 License

MIT License

## 🙋 Support

Check the logs at `logs/app.log` for detailed debugging information.

---

**Status**: ✅ Production Ready

**Last Updated**: 2025-10-01
