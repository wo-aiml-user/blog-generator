# Quick Start Guide

## Prerequisites

1. **Python Environment**: Ensure virtual environment is activated
   ```bash
   cd c:\Users\DESK0046\Documents\bolg_generator
   .\env\Scripts\activate
   ```

2. **Environment Variables**: Check `.env` file has:
   ```
   GOOGLE_API_KEY=your_google_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

## Start the Server

```bash
python src/main.py
```

Server will start on `http://localhost:5000`

## Quick Test

### Option 1: Use the Test Script
```bash
python test_workflow.py
```

### Option 2: Manual API Testing

#### Step 1: Generate Outlines
```bash
curl -X POST http://localhost:5000/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"thread_id\": \"test-123\", \"topic\": \"AI in Healthcare\", \"tone\": \"professional\", \"length\": \"medium\"}"
```

#### Step 2: Approve Outlines (Generate Article)
```bash
curl -X POST http://localhost:5000/user_input ^
  -H "Content-Type: application/json" ^
  -d "{\"thread_id\": \"test-123\", \"user_feedback\": \"approve\"}"
```

#### Step 3: Approve Article (Complete)
```bash
curl -X POST http://localhost:5000/user_input ^
  -H "Content-Type: application/json" ^
  -d "{\"thread_id\": \"test-123\", \"user_feedback\": \"looks perfect\"}"
```

## View Logs

```bash
type logs\app.log
```

Or open in your text editor:
```
c:\Users\DESK0046\Documents\bolg_generator\logs\app.log
```

## Common User Feedback Examples

### Approval Phrases (Router detects as APPROVE)
- "approve"
- "yes"
- "looks good"
- "proceed"
- "continue"
- "ok"
- "perfect"

### Edit Phrases (Router detects as EDIT)
- "add a section about X"
- "make it shorter"
- "change the tone to casual"
- "include more examples"
- "remove the conclusion"
- "make it more technical"

## Workflow Stages

| Stage | Description | Next Action |
|-------|-------------|-------------|
| `keywords` | Keywords generated | Automatic → search |
| `search` | Web articles found | Automatic → outlines |
| `outlines` | Outlines ready | User feedback needed |
| `draft` | Article written | User feedback needed |

## Response Structure

### After /generate
```json
{
  "status": "ok",
  "thread_id": "test-123",
  "current_stage": "outlines",
  "keywords": "keyword1, keyword2, keyword3",
  "articles": [...],
  "outlines_json": {
    "title": "Article Title",
    "outlines": [
      {"section": "Introduction", "description": "..."},
      {"section": "Main Point", "description": "..."}
    ]
  }
}
```

### After /user_input (article generated)
```json
{
  "status": "ok",
  "thread_id": "test-123",
  "current_stage": "draft",
  "draft_article": {
    "title": "Article Title",
    "content": "# Article Title\n\n## Introduction\n..."
  }
}
```

## Troubleshooting

### Server won't start
- Check if port 5000 is available
- Verify environment variables are set
- Check Python dependencies: `pip install -r requirements.txt`

### LLM errors
- Verify GOOGLE_API_KEY is valid
- Check internet connection
- Review logs/app.log for detailed error

### Search errors
- Verify TAVILY_API_KEY is valid
- Check Tavily API quota
- Review logs/app.log for detailed error

### JSON parsing errors
- Check logs/app.log for raw LLM output
- LLM should return pure JSON (no markdown blocks)
- Fallback parser handles most cases

## Architecture Overview

```
User Request
    ↓
FastAPI Endpoint (/generate or /user_input)
    ↓
LangGraph Workflow (with MemorySaver for state)
    ↓
Nodes (1→2→3→4→5→6) with LLM calls
    ↓
Response with JSON data
```

## Files to Monitor

- `logs/app.log` - All execution logs
- `src/nodes.py` - Node implementations
- `utils/prompts.py` - LLM prompts
- `src/graph.py` - Workflow definition

## Next Steps

1. ✅ Start server: `python src/main.py`
2. ✅ Run tests: `python test_workflow.py`
3. ✅ Check logs: `type logs\app.log`
4. ✅ Read full docs: `WORKFLOW.md`
5. ✅ Review implementation: `IMPLEMENTATION_SUMMARY.md`
