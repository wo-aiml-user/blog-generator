# Blog Generator Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / CLIENT                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP POST /generate
                 │ {topic, tone, length}
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI SERVER                              │
│                       (main.py)                                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Invoke Graph
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LANGGRAPH WORKFLOW                            │
│                       (graph.py)                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ENTRY: route_workflow()                      │  │
│  │  (Decides where to start based on state)                 │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│                     ↓                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  NODE 1: generate_keywords_node                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Input:  topic                                       │  │  │
│  │  │ LLM:    keyword_prompt → Gemini                     │  │  │
│  │  │ Output: {"keywords": ["k1", "k2", "k3"]}           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│                     ↓                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  NODE 2: search_articles_citations_node                  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Input:  keywords (k1, k2, k3)                       │  │  │
│  │  │ API:    Tavily Search (parallel for each keyword)   │  │  │
│  │  │ Output: [{title, url, content, score}, ...]         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│                     ↓                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  NODE 3: generate_outlines_node                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Input:  keywords, articles                          │  │  │
│  │  │ LLM:    outlines_prompt → Gemini                    │  │  │
│  │  │ Output: {"title": "...", "outlines": [...]}         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│                     ↓                                            │
│              ┌──────────────┐                                   │
│              │  PAUSE & END │ ← Returns to API                  │
│              └──────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
                     │
                     │ Response: {outlines_json, keywords, articles}
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                         USER / CLIENT                            │
│                  (Reviews outlines)                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP POST /user_input
                 │ {user_feedback: "approve" or "edit..."}
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI SERVER                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Invoke Graph (continues from saved state)
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LANGGRAPH WORKFLOW                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ENTRY: route_workflow()                      │  │
│  │  (Detects feedback → routes to outline_router)           │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│                     ↓                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  NODE 4: outline_router_node                             │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Input:  user_feedback, context                      │  │  │
│  │  │ LLM:    router_prompt → Gemini                      │  │  │
│  │  │ Output: {"action": "APPROVE or EDIT"}               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│         ┌───────────┴───────────┐                               │
│         │                       │                               │
│    EDIT │                       │ APPROVE                       │
│         ↓                       ↓                               │
│  ┌─────────────┐      ┌──────────────────────────────────┐    │
│  │  Back to    │      │  NODE 5: write_sections_node      │    │
│  │  NODE 3     │      │  ┌────────────────────────────┐   │    │
│  │ (regenerate)│      │  │ Input:  tone, length,       │   │    │
│  └─────────────┘      │  │         outlines, articles  │   │    │
│                       │  │ LLM:    write_sections_     │   │    │
│                       │  │         prompt → Gemini     │   │    │
│                       │  │ Output: {"title": "...",    │   │    │
│                       │  │          "content": "..."}  │   │    │
│                       │  └────────────────────────────┘   │    │
│                       └──────────────┬───────────────────┘    │
│                                      │                         │
│                                      ↓                         │
│                               ┌──────────────┐                │
│                               │  PAUSE & END │ ← Returns       │
│                               └──────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                     │
                     │ Response: {draft_article}
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                         USER / CLIENT                            │
│                  (Reviews article)                               │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP POST /user_input
                 │ {user_feedback: "approve" or "edit..."}
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI SERVER                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Invoke Graph (continues from saved state)
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LANGGRAPH WORKFLOW                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ENTRY: route_workflow()                      │  │
│  │  (Detects feedback → routes to article_router)           │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│                     ↓                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  NODE 6: article_router_node                             │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Input:  user_feedback, context                      │  │  │
│  │  │ LLM:    router_prompt → Gemini                      │  │  │
│  │  │ Output: {"action": "APPROVE or EDIT"}               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                            │
│         ┌───────────┴───────────┐                               │
│         │                       │                               │
│    EDIT │                       │ APPROVE                       │
│         ↓                       ↓                               │
│  ┌─────────────┐         ┌──────────┐                          │
│  │  Back to    │         │   END    │                          │
│  │  NODE 5     │         │ (Complete)                          │
│  │ (regenerate)│         └──────────┘                          │
│  └─────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                     │
                     │ Response: {draft_article} (final)
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                         USER / CLIENT                            │
│                  (Receives final article)                        │
└─────────────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE (Pydantic Model)                    │
├─────────────────────────────────────────────────────────────┤
│  User Inputs:                                                │
│    • topic: str                                              │
│    • tone: str                                               │
│    • length: str                                             │
│    • user_feedback: str                                      │
│                                                              │
│  Generated Data:                                             │
│    • keywords: str                                           │
│    • articles: List[Dict]                                    │
│    • outlines_json: Dict                                     │
│    • draft_article: Dict                                     │
│                                                              │
│  Control Flow:                                               │
│    • routing_decision: str                                   │
│    • current_stage: str                                      │
└─────────────────────────────────────────────────────────────┘
         │
         │ Persisted by MemorySaver (per thread_id)
         ↓
┌─────────────────────────────────────────────────────────────┐
│                   CHECKPOINT STORAGE                         │
│  • Each thread_id has isolated state                         │
│  • State survives across API calls                           │
│  • Enables pause/resume workflow                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Keywords Generation (Node 1)
```
topic: "AI in Healthcare"
    ↓
keyword_prompt + LLM
    ↓
{"keywords": ["AI diagnostics", "ML healthcare", "patient care AI"]}
    ↓
State: keywords = "AI diagnostics, ML healthcare, patient care AI"
```

### Parallel Search (Node 2)
```
keywords: "AI diagnostics, ML healthcare, patient care AI"
    ↓
Split into 3 queries
    ↓
┌─────────────┬─────────────┬─────────────┐
│ Query 1     │ Query 2     │ Query 3     │
│ "AI         │ "ML         │ "patient    │
│ diagnostics"│ healthcare" │ care AI"    │
└──────┬──────┴──────┬──────┴──────┬──────┘
       │             │             │
    Tavily       Tavily       Tavily
    (3 results)  (3 results)  (3 results)
       │             │             │
       └─────────────┴─────────────┘
                     │
                     ↓
        Deduplicate by URL
                     ↓
State: articles = [{title, url, content, score}, ...]
```

### Outline Generation (Node 3)
```
keywords + articles
    ↓
outlines_prompt + LLM
    ↓
{
  "title": "The Future of AI in Healthcare",
  "outlines": [
    {"section": "Introduction", "description": "..."},
    {"section": "AI in Diagnostics", "description": "..."},
    {"section": "Conclusion", "description": "..."}
  ]
}
    ↓
State: outlines_json = {...}
```

### Router Decision (Node 4 & 6)
```
user_feedback: "add section about ethics"
    ↓
router_prompt + LLM
    ↓
{
  "action": "EDIT",
  "feedback": "add section about ethics"
}
    ↓
State: routing_decision = "generate_outlines"
       user_feedback = "add section about ethics"
```

### Article Generation (Node 5)
```
tone + length + outlines + articles
    ↓
write_sections_prompt + LLM
    ↓
{
  "title": "The Future of AI in Healthcare",
  "content": "# The Future of AI in Healthcare\n\n## Introduction\n..."
}
    ↓
State: draft_article = {...}
```

## Logging Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Python Logger                           │
│                   (logging.getLogger)                        │
└────────────────┬───────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ↓               ↓
┌─────────────┐   ┌─────────────┐
│  Console    │   │  File       │
│  Handler    │   │  Handler    │
│  (stdout)   │   │ (app.log)   │
└─────────────┘   └─────────────┘
                         │
                         ↓
                  ┌──────────────┐
                  │ Rotating     │
                  │ File Handler │
                  │ (2MB, 5 bkp) │
                  └──────────────┘
```

### Log Entry Format
```
2025-10-01 10:30:45 | INFO | src.nodes | ================================================================================
2025-10-01 10:30:45 | INFO | src.nodes | [NODE 1 - GENERATE_KEYWORDS] START
2025-10-01 10:30:45 | INFO | src.nodes | [NODE 1] Input - topic='AI in Healthcare'
2025-10-01 10:30:45 | INFO | src.nodes | [NODE 1] LLM Call - Full Prompt:
2025-10-01 10:30:45 | INFO | src.nodes | You are an SEO strategist...
2025-10-01 10:30:46 | INFO | src.nodes | [NODE 1] LLM Response - Raw output:
2025-10-01 10:30:46 | INFO | src.nodes | {"keywords": ["AI diagnostics", "ML healthcare", "patient care AI"]}
2025-10-01 10:30:46 | INFO | src.nodes | [NODE 1] Output - keywords=AI diagnostics, ML healthcare, patient care AI
2025-10-01 10:30:46 | INFO | src.nodes | [NODE 1 - GENERATE_KEYWORDS] END
2025-10-01 10:30:46 | INFO | src.nodes | ================================================================================
```

## Technology Stack Details

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  • FastAPI (REST API)                                        │
│  • Uvicorn (ASGI Server)                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                   Orchestration Layer                        │
│  • LangGraph (Workflow Engine)                               │
│  • LangChain (LLM Integration)                               │
│  • MemorySaver (State Persistence)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                     Service Layer                            │
│  • Google Gemini 2.5 Flash (LLM)                             │
│  • Tavily API (Web Search)                                   │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
Any Node Execution
    ↓
Try:
    Execute Node Logic
    ↓
    Success → Return State Update
    
Except Exception:
    ↓
    Log Full Stack Trace
    ↓
    Propagate to FastAPI
    ↓
    Return 500 Error
    ↓
    Client receives error details
```

## Performance Considerations

1. **Parallel Search**: Node 2 uses ThreadPoolExecutor for concurrent API calls
2. **State Caching**: MemorySaver prevents re-execution of completed nodes
3. **Logging**: Asynchronous file writes with rotation
4. **LLM Calls**: Single LLM call per node (no retries in current impl)
5. **Memory**: State stored in-memory (consider Redis for production scale)

## Security Considerations

1. **API Keys**: Stored in .env file (not committed to git)
2. **Input Validation**: Pydantic models validate all inputs
3. **Thread Isolation**: Each thread_id has isolated state
4. **Error Messages**: Detailed errors logged but sanitized in API responses
5. **Rate Limiting**: Not implemented (add for production)

---

**This architecture supports**:
- ✅ Stateful workflows with pause/resume
- ✅ LLM-based intelligent routing
- ✅ Parallel processing for performance
- ✅ Comprehensive observability
- ✅ Clean separation of concerns
