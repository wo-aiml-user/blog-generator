from pydantic import BaseModel
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, END
from typing import Optional, List, Dict, Any
import logging

from src.nodes import (
    generate_keywords_node,
    search_articles_citations_node,
    generate_outlines_node,
    outline_router_node,
    write_sections_node,
    article_router_node,
    generate_images_node,
)

logger = logging.getLogger(__name__)


class State(BaseModel):
    topic: Optional[str] = ""
    tone: Optional[str] = ""
    length: Optional[int] = None
    num_outlines: Optional[int] = None
    target_audience: Optional[str] = ""
    user_feedback: Optional[str] = ""
    keywords: Optional[str] = ""
    articles: Optional[List[Dict[str, Any]]] = None
    citations: Optional[List[Dict[str, Any]]] = None
    outlines_json: Optional[Dict[str, Any]] = None
    draft_article: Optional[Dict[str, Any]] = None
    follow_up_question: Optional[str] = ""
    routing_decision: Optional[str] = None
    current_stage: str = "start"
    generated_images: Optional[List[str]] = None
    image_prompt: Optional[str] = ""
    image_count: Optional[int] = 0

def route_entry(state: State) -> str:
    """Entry point router that decides where to start based on current state."""
    logger.info("[GRAPH] route_entry called")
    logger.info("[GRAPH] State: topic=%s, keywords=%s, outlines=%s, draft=%s, feedback=%s, stage=%s",
                bool(state.topic), bool(state.keywords), bool(state.outlines_json), 
                bool(state.draft_article), bool(state.user_feedback), state.current_stage)
    
    has_feedback = bool(state.user_feedback and state.user_feedback.strip())

    if has_feedback:
        if state.draft_article:
            logger.info("[GRAPH] Routing to article_router (feedback for draft)")
            return "article_router"
        if state.outlines_json:
            logger.info("[GRAPH] Routing to outline_router (feedback for outline)")
            return "outline_router"
    
    if not state.keywords and state.topic:
        logger.info("[GRAPH] Routing to generate_keywords (new workflow)")
        return "generate_keywords"
    
    logger.info("[GRAPH] No action needed, ending")
    return "end"


def route_after_outline(state: State) -> str:
    decision = state.routing_decision
    logger.info(f"[Graph] route_after_outline -> {decision}")
    return decision

def route_after_article(state: State) -> str:
    decision = state.routing_decision
    logger.info(f"[Graph] route_after_article -> {decision}")
    return decision

memory = MemorySaver()
workflow = StateGraph(State)

workflow.add_node("generate_keywords", generate_keywords_node)
workflow.add_node("search", search_articles_citations_node)
workflow.add_node("generate_outlines", generate_outlines_node)
workflow.add_node("outline_router", outline_router_node)
workflow.add_node("write_sections", write_sections_node)
workflow.add_node("generate_images", generate_images_node)
workflow.add_node("article_router", article_router_node)

workflow.set_conditional_entry_point(
    route_entry,
    {
        "generate_keywords": "generate_keywords",
        "outline_router": "outline_router",
        "article_router": "article_router",
        "end": END,
    },
)

workflow.add_edge("generate_keywords", "search")
workflow.add_edge("search", "generate_outlines")
workflow.add_edge("generate_outlines", END) 

workflow.add_edge("write_sections", "generate_images")
workflow.add_edge("generate_images", END)  

workflow.add_conditional_edges(
    "outline_router",
    route_after_outline,
    {"generate_outlines": "generate_outlines", "write_sections": "write_sections"},
)

workflow.add_conditional_edges(
    "article_router",
    route_after_article,
    {"write_sections": "write_sections", "end": END},
)

app = workflow.compile(checkpointer=memory)