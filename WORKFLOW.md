# Blog Generator Workflow Documentation

## Overview
This blog generator uses a LangGraph-based workflow with 6 nodes to create high-quality, research-backed articles.

## Workflow Nodes

### Node 1: Generate Keywords
- **Input**: `topic` (from user)
- **Process**: Uses LLM with `keyword_prompt` to generate 3 SEO keywords
- **Output**: JSON `{"keywords": ["keyword1", "keyword2", "keyword3"]}`
- **State Updates**: `keywords`, `current_stage="keywords"`

### Node 2: Search Articles (Parallel)
- **Input**: `keywords` (from Node 1)
- **Process**: Performs parallel Tavily web searches for each keyword (3 articles per keyword)
- **Output**: List of articles with `{title, url, content, score, published_date}`
- **State Updates**: `articles`, `current_stage="search"`

### Node 3: Generate Outlines
- **Input**: `keywords`, `articles` (web content from Node 2)
- **Process**: Uses LLM with `outlines_prompt` to create article outline and title
- **Output**: JSON `{"title": "...", "outlines": [{"section": "...", "description": "..."}]}`
- **State Updates**: `outlines_json`, `current_stage="outlines"`
- **Note**: Can be regenerated if user provides feedback via Node 4

### Node 4: Outline Router (LLM-based)
- **Input**: `user_feedback`, `current_stage`, `outlines_json` (context)
- **Process**: Uses LLM with `router_prompt` to analyze user feedback
- **Output**: JSON `{"action": "APPROVE or EDIT", "feedback": "..."}`
- **Routing**:
  - `APPROVE` → Go to Node 5 (write_sections)
  - `EDIT` → Go back to Node 3 (regenerate outlines with feedback)

### Node 5: Write Sections
- **Input**: `tone`, `length`, `keywords`, `outlines_json` (approved), `articles` (for citations)
- **Process**: Uses LLM with `write_sections_prompt` to write full article
- **Output**: JSON `{"title": "...", "content": "markdown content with citations"}`
- **State Updates**: `draft_article`, `current_stage="draft"`
- **Note**: Can be regenerated if user provides feedback via Node 6

### Node 6: Article Router (LLM-based)
- **Input**: `user_feedback`, `current_stage`, `draft_article` (context)
- **Process**: Uses LLM with `router_prompt` to analyze user feedback
- **Output**: JSON `{"action": "APPROVE or EDIT", "feedback": "..."}`
- **Routing**:
  - `APPROVE` → END (workflow complete)
  - `EDIT` → Go back to Node 5 (regenerate article with feedback)

## API Endpoints

### POST /generate
**Purpose**: Start a new blog generation workflow

**Request**:
```json
{
  "thread_id": "unique-session-id",
  "topic": "AI in Healthcare",
  "tone": "professional",
  "length": "medium"
}
```

**Process Flow**:
1. Node 1: Generate Keywords
2. Node 2: Search Articles (parallel)
3. Node 3: Generate Outlines
4. PAUSE (returns to user)

**Response**:
```json
{
  "status": "ok",
  "thread_id": "unique-session-id",
  "current_stage": "outlines",
  "keywords": "AI healthcare diagnostics, machine learning medical imaging, AI patient care",
  "articles": [...],
  "outlines_json": {
    "title": "The Future of AI in Healthcare",
    "outlines": [
      {"section": "Introduction", "description": "..."},
      {"section": "AI in Diagnostics", "description": "..."},
      {"section": "Conclusion", "description": "..."}
    ]
  }
}
```

### POST /user_input
**Purpose**: Provide user feedback to continue the workflow

**Request**:
```json
{
  "thread_id": "unique-session-id",
  "user_feedback": "approve"
}
```

**Process Flow (Scenario 1 - Approve Outlines)**:
1. Node 4: Outline Router (analyzes feedback)
2. Node 5: Write Sections (generates full article)
3. PAUSE (returns to user)

**Response**:
```json
{
  "status": "ok",
  "thread_id": "unique-session-id",
  "current_stage": "draft",
  "draft_article": {
    "title": "The Future of AI in Healthcare",
    "content": "# The Future of AI in Healthcare\n\n## Introduction\n..."
  }
}
```

**Process Flow (Scenario 2 - Edit Outlines)**:
```json
{
  "thread_id": "unique-session-id",
  "user_feedback": "add a section about AI ethics"
}
```
1. Node 4: Outline Router (detects EDIT action)
2. Node 3: Generate Outlines (regenerates with feedback)
3. PAUSE (returns to user)

**Process Flow (Scenario 3 - Approve Article)**:
```json
{
  "thread_id": "unique-session-id",
  "user_feedback": "looks perfect"
}
```
1. Node 6: Article Router (detects APPROVE action)
2. END (workflow complete)

**Process Flow (Scenario 4 - Edit Article)**:
```json
{
  "thread_id": "unique-session-id",
  "user_feedback": "make it more casual and add more examples"
}
```
1. Node 6: Article Router (detects EDIT action)
2. Node 5: Write Sections (regenerates with feedback)
3. PAUSE (returns to user)

## Data Flow & Context Management

### State Variables
- **User Inputs**: `topic`, `tone`, `length`, `user_feedback`
- **Generated Data**: `keywords`, `articles`, `outlines_json`, `draft_article`
- **Control Flow**: `routing_decision`, `current_stage`

### Context Preservation
- All data persists in the graph state using `MemorySaver` checkpointer
- Each thread_id maintains its own isolated state
- User feedback is cleared after being processed by router nodes

## Logging

All logs are written to `logs/app.log` with the following format:

### Node Logs
Each node logs:
- **Start marker**: `========== [NODE X - NAME] START ==========`
- **Inputs**: All input parameters with values
- **LLM Prompt**: Full prompt sent to LLM
- **LLM Response**: Raw output from LLM
- **Parsed Output**: Structured JSON output
- **End marker**: `========== [NODE X - NAME] END ==========`

### API Logs
Each endpoint logs:
- **Request**: Thread ID, input parameters
- **Response**: Stage, output data summary
- **Duration**: Execution time in milliseconds
- **Errors**: Full exception traces

### Example Log Flow
```
================================================================================
[API /generate] START | thread_id=session-123
[API /generate] Request - topic='AI in Healthcare', tone='professional', length='medium'
================================================================================
[NODE 1 - GENERATE_KEYWORDS] START
[NODE 1] Input - topic='AI in Healthcare'
[NODE 1] LLM Call - Full Prompt:
You are an SEO strategist...
[NODE 1] LLM Response - Raw output:
{"keywords": ["AI healthcare diagnostics", "machine learning medical imaging", "AI patient care"]}
[NODE 1] Output - keywords=AI healthcare diagnostics, machine learning medical imaging, AI patient care
[NODE 1 - GENERATE_KEYWORDS] END
================================================================================
[NODE 2 - SEARCH_ARTICLES] START
...
```

## JSON Output Formats

All LLM responses are enforced to return JSON-only (no markdown code blocks, no commentary).

### Keywords Response
```json
{"keywords": ["keyword1", "keyword2", "keyword3"]}
```

### Outlines Response
```json
{
  "title": "Article Title",
  "outlines": [
    {"section": "Section Name", "description": "Brief description"}
  ]
}
```

### Article Response
```json
{
  "title": "Article Title",
  "content": "Full markdown content with [citations](url)"
}
```

### Router Response
```json
{
  "action": "APPROVE",
  "feedback": ""
}
```
or
```json
{
  "action": "EDIT",
  "feedback": "user's original feedback text"
}
```

## Error Handling

- All LLM responses are parsed with `_coerce_json()` which handles:
  - Markdown code blocks (```json ... ```)
  - Extra whitespace
  - Malformed JSON (returns `{"text": raw_text}` as fallback)
  
- API endpoints return 500 status with error details on failure
- All errors are logged with full stack traces

## Testing the Workflow

### Test 1: Complete Happy Path
1. POST /generate with topic
2. Verify outlines_json in response
3. POST /user_input with "approve"
4. Verify draft_article in response
5. POST /user_input with "approve"
6. Workflow complete

### Test 2: Edit Outlines
1. POST /generate with topic
2. POST /user_input with "add section about X"
3. Verify regenerated outlines_json
4. POST /user_input with "approve"
5. Verify draft_article

### Test 3: Edit Article
1. POST /generate with topic
2. POST /user_input with "approve"
3. POST /user_input with "make it shorter"
4. Verify regenerated draft_article
5. POST /user_input with "approve"
6. Workflow complete
