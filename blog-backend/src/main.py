from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import logging
import os
from logging.handlers import RotatingFileHandler
from time import perf_counter
from src.graph import app as graph_app
from typing import Optional

def _setup_logging():
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    if not any(isinstance(h, logging.StreamHandler) for h in root.handlers):
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        ch.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s"))
        root.addHandler(ch)
    logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
    os.makedirs(logs_dir, exist_ok=True)
    log_path = os.path.join(logs_dir, "app.log")
    if not any(isinstance(h, RotatingFileHandler) and getattr(h, 'baseFilename', '') == log_path for h in root.handlers):
        fh = RotatingFileHandler(log_path, maxBytes=2_000_000, backupCount=5, encoding="utf-8")
        fh.setLevel(logging.INFO)
        fh.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s"))
        root.addHandler(fh)

_setup_logging()
logger = logging.getLogger(__name__)


app = FastAPI(title="Blog Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    session_id: str
    topic: str
    tone: Optional[str] = None
    length: Optional[int] = None

class UserInputRequest(BaseModel):
    session_id: str
    user_feedback: str

class GenerateResponse(BaseModel):
    status: str
    session_id: str
    current_stage: str
    keywords: Optional[str] = None
    articles: Optional[list] = None
    citations: Optional[list] = None
    outlines_json: Optional[dict] = None
    draft_article: Optional[dict] = None
    follow_up_question: Optional[str] = None


def _get_graph_response(session_id: str) -> GenerateResponse:
    """Helper to fetch the current state and format it as a GenerateResponse."""
    config = {"configurable": {"thread_id": session_id}}
    st = graph_app.get_state(config)
    values = st.values

    current_stage = values.get("current_stage") or "start"

    return GenerateResponse(
        status="success",
        session_id=session_id,
        current_stage=current_stage,
        keywords=values.get("keywords"),
        articles=values.get("articles"),
        citations=values.get("citations"),
        outlines_json=values.get("outlines_json"),
        draft_article=values.get("draft_article"),
        follow_up_question=values.get("follow_up_question"),
    )


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    """
    Endpoint 1: /generate
    - Takes: topic, tone, length
    - Runs: Node 1 (keywords) -> Node 2 (search) -> Node 3 (outlines)
    - Returns: outlines_json with title and outlines
    """
    start = perf_counter()
    config = {"configurable": {"thread_id": req.session_id}}
    
    logger.info("="*100)
    logger.info("[API /generate] START | session_id=%s", req.session_id)
    logger.info("[API /generate] Request - topic='%s', tone='%s', length='%s'", 
                req.topic, req.tone, req.length)
    
    try:
        graph_app.invoke(
            {"topic": req.topic, "tone": req.tone, "length": req.length},
            config=config,
        )
        duration_ms = int((perf_counter() - start) * 1000)
        
        response = _get_graph_response(req.session_id)
        
        logger.info("[API /generate] Response - stage=%s, has_outlines=%s", 
                    response.current_stage, bool(response.outlines_json))
        logger.info("[API /generate] SUCCESS | duration_ms=%d", duration_ms)
        logger.info("="*100)
        
        return response
    except Exception as e:
        duration_ms = int((perf_counter() - start) * 1000)
        logger.exception("[API /generate] FAILED | duration_ms=%d | error=%s", duration_ms, str(e))
        logger.info("="*100)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user_input", response_model=GenerateResponse)
def user_input(req: UserInputRequest):
    """
    Endpoint 2: /user_input
    - Takes: user_feedback (for router node decision)
    - Runs: Node 4 (outline_router) -> either back to Node 3 or forward to Node 5 (write_sections)
    - OR: Node 6 (article_router) -> either back to Node 5 or END
    - Returns: draft_article (full article JSON) when workflow completes
    """
    start = perf_counter()
    config = {"configurable": {"thread_id": req.session_id}}

    logger.info("="*100)
    logger.info("[API /user_input] START | session_id=%s", req.session_id)
    logger.info("[API /user_input] Request - feedback='%s'", req.user_feedback)

    try:
        graph_app.invoke(
            {
                "user_feedback": req.user_feedback,
            },
            config=config,
        )
        duration_ms = int((perf_counter() - start) * 1000)
        
        response = _get_graph_response(req.session_id)
        
        logger.info("[API /user_input] Response - stage=%s, has_draft=%s", 
                    response.current_stage, bool(response.draft_article))
        logger.info("[API /user_input] SUCCESS | duration_ms=%d", duration_ms)
        logger.info("="*100)
        
        return response
    except Exception as e:
        duration_ms = int((perf_counter() - start) * 1000)
        logger.exception("[API /user_input] FAILED | duration_ms=%d | error=%s", duration_ms, str(e))
        logger.info("="*100)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)