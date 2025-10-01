import logging
import json
from typing import Dict, Any
from langchain.prompts import ChatPromptTemplate

from utils.model_config import get_llm
from utils.tools import search_articles_parallel
from utils.prompts import (
    keyword_prompt,
    outlines_prompt,
    write_sections_prompt,
    router_prompt,
)
logger = logging.getLogger(__name__)
llm = get_llm()


def _coerce_json(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except Exception:
        clean = text.strip()
        if clean.startswith("```json"):
            clean = clean[7:]
        elif clean.startswith("```"):
            clean = clean[3:]
        if clean.endswith("```"):
            clean = clean[:-3]
        clean = clean.strip()
        try:
            return json.loads(clean)
        except Exception:
            return {"text": text}


def _trunc(s: str, n: int = 1200) -> str:
    return s if len(s) <= n else s[:n] + "... [truncated]"


def generate_keywords_node(state):
    """Node 1: Generate 3 keywords from topic using LLM"""
    logger.info("="*80)
    logger.info("[NODE 1 - GENERATE_KEYWORDS] START")
    logger.info("[NODE 1] Input - topic='%s'", state.topic)
    logger.info("[NODE 1] Input - tone='%s'", state.tone)
    logger.info("[NODE 1] Input - length='%s'", state.length)
    
    prompt = ChatPromptTemplate.from_template(keyword_prompt.template)
    chain = prompt | llm
    prompt_vars = {"topic": state.topic}
    
    logger.info("[NODE 1] LLM Call - Full Prompt:")
    logger.info(keyword_prompt.template.format(**prompt_vars))
    
    out = chain.invoke(prompt_vars)
    
    logger.info("[NODE 1] LLM Response - Raw output:")
    logger.info(out.content)
    
    # Parse JSON response
    parsed = _coerce_json(out.content)
    keywords_list = parsed.get("keywords", [])
    keywords_str = ", ".join(keywords_list) if isinstance(keywords_list, list) else str(keywords_list)
    
    logger.info("[NODE 1] Output - keywords=%s", keywords_str)
    logger.info("[NODE 1 - GENERATE_KEYWORDS] END")
    logger.info("="*80)
    
    return {"keywords": keywords_str, "current_stage": "keywords"}


def search_articles_citations_node(state):
    """Node 2: Search web articles in parallel for each keyword"""
    logger.info("="*80)
    logger.info("[NODE 2 - SEARCH_ARTICLES] START")
    
    kw_string = state.keywords or state.topic
    queries = [kw.strip() for kw in kw_string.split(',') if kw.strip()]
    
    logger.info("[NODE 2] Input - keywords=%s", kw_string)
    logger.info("[NODE 2] Parallel search queries=%s", queries)
    
    articles = search_articles_parallel(queries, max_results=3)
    
    logger.info("[NODE 2] Output - Total articles found=%d", len(articles))
    for idx, article in enumerate(articles):
        logger.info("[NODE 2] Article %d:", idx + 1)
        logger.info("  - Title: %s", article.get("title", ""))
        logger.info("  - URL: %s", article.get("url", ""))
        logger.info("  - Content length: %d chars", len(article.get("content", "")))
    
    logger.info("[NODE 2 - SEARCH_ARTICLES] END")
    logger.info("="*80)
    
    return {
        "articles": articles,
        "citations": [],
        "current_stage": "search",
    }


def generate_outlines_node(state):
    """Node 3: Generate article outline and title from web content"""
    logger.info("="*80)
    logger.info("[NODE 3 - GENERATE_OUTLINES] START")
    
    # Check if we have user feedback for regeneration
    user_feedback = getattr(state, 'user_feedback', None)
    if user_feedback:
        logger.info("[NODE 3] Regenerating with user feedback: %s", user_feedback)
    
    articles = state.articles or []
    logger.info("[NODE 3] Input - articles count=%d", len(articles))
    logger.info("[NODE 3] Input - keywords=%s", state.keywords)
    
    articles_text = "\n\n".join(
        [f"Title: {a.get('title','')}\nURL: {a.get('url','')}\nContent: {a.get('content','')[:500]}..." 
         for a in articles]
    )
    
    prompt = ChatPromptTemplate.from_template(outlines_prompt.template)
    chain = prompt | llm
    prompt_vars = {
        "keywords": state.keywords, 
        "articles": _trunc(articles_text, 3000),
        "user_input": user_feedback if user_feedback else "None"
    }
    
    logger.info("[NODE 3] LLM Call - Full Prompt:")
    logger.info(outlines_prompt.template.format(**prompt_vars))
    
    out = chain.invoke(prompt_vars)
    
    logger.info("[NODE 3] LLM Response - Raw output:")
    logger.info(out.content)
    
    parsed = _coerce_json(out.content)
    
    logger.info("[NODE 3] Output - Parsed JSON:")
    logger.info(json.dumps(parsed, indent=2, ensure_ascii=False))
    
    # Extract follow-up question
    follow_up = parsed.get("follow_up_question", "")
    logger.info("[NODE 3] Output - follow_up_question=%s", follow_up)
    
    logger.info("[NODE 3 - GENERATE_OUTLINES] END")
    logger.info("="*80)
    
    return {
        "outlines_json": parsed, 
        "current_stage": "outlines", 
        "user_feedback": "",
        "follow_up_question": follow_up
    }


# --- ROUTER NODES ---

def outline_router_node(state):
    """Node 4: Router node after outline generation - uses LLM to decide APPROVE or EDIT"""
    logger.info("="*80)
    logger.info("[NODE 4 - OUTLINE_ROUTER] START")
    
    user_input = (state.user_feedback or "").strip()
    logger.info("[NODE 4] Input - user_feedback='%s'", user_input)
    logger.info("[NODE 4] Input - current_stage='%s'", state.current_stage)
    
    # Prepare context
    context = f"Generated outlines: {json.dumps(state.outlines_json, ensure_ascii=False)[:500]}"
    
    prompt = ChatPromptTemplate.from_template(router_prompt.template)
    chain = prompt | llm
    prompt_vars = {
        "user_input": user_input,
        "current_stage": state.current_stage,
        "context": context
    }
    
    logger.info("[NODE 4] LLM Call - Full Prompt:")
    logger.info(router_prompt.template.format(**prompt_vars))
    
    out = chain.invoke(prompt_vars)
    
    logger.info("[NODE 4] LLM Response - Raw output:")
    logger.info(out.content)
    
    parsed = _coerce_json(out.content)
    action = parsed.get("action", "EDIT").upper()
    feedback = parsed.get("feedback", "")
    
    logger.info("[NODE 4] Output - action=%s", action)
    logger.info("[NODE 4] Output - feedback=%s", feedback)
    
    if action == "APPROVE":
        decision = "write_sections"
        logger.info("[NODE 4] Decision: Proceeding to write sections")
    else:
        decision = "generate_outlines"
        logger.info("[NODE 4] Decision: Regenerating outlines with feedback")
    
    logger.info("[NODE 4 - OUTLINE_ROUTER] END")
    logger.info("="*80)
    
    return {"routing_decision": decision, "user_feedback": feedback if action == "EDIT" else ""}


def write_sections_node(state):
    """Node 5: Write full article using approved outline, tone, length, and web content"""
    logger.info("="*80)
    logger.info("[NODE 5 - WRITE_SECTIONS] START")
    
    # Check if we have user feedback for regeneration
    user_feedback = getattr(state, 'user_feedback', None)
    if user_feedback:
        logger.info("[NODE 5] Regenerating with user feedback: %s", user_feedback)
    
    tone = state.tone or "neutral"
    length = state.length or "medium"
    
    logger.info("[NODE 5] Input - tone='%s'", tone)
    logger.info("[NODE 5] Input - length='%s'", length)
    logger.info("[NODE 5] Input - keywords='%s'", state.keywords)
    
    # Get approved outline
    outlines = state.outlines_json or {}
    outline_title = outlines.get("title", "")
    outline_sections = outlines.get("outlines", [])
    outline_markdown = "\n".join([f"## {s.get('section', '')}\n{s.get('description', '')}" for s in outline_sections])
    
    logger.info("[NODE 5] Input - outline_title='%s'", outline_title)
    logger.info("[NODE 5] Input - outline sections count=%d", len(outline_sections))
    
    # Prepare web content for citations
    articles = state.articles or []
    web_content = "\n\n".join(
        [f"Source: {a.get('title', '')}\nURL: {a.get('url', '')}\nContent: {a.get('content', '')[:1000]}..." 
         for a in articles]
    )
    
    prompt = ChatPromptTemplate.from_template(write_sections_prompt.template)
    chain = prompt | llm
    prompt_vars = {
        "tone": tone,
        "length": length,
        "outline_title": outline_title,
        "outline_markdown": outline_markdown,
        "web_content": _trunc(web_content, 3000),
        "user_input": user_feedback if user_feedback else "None"
    }
    
    logger.info("[NODE 5] LLM Call - Full Prompt:")
    logger.info(write_sections_prompt.template.format(**prompt_vars))
    
    out = chain.invoke(prompt_vars)
    
    logger.info("[NODE 5] LLM Response - Raw output:")
    logger.info(out.content[:2000] + ("..." if len(out.content) > 2000 else ""))
    
    # Parse JSON response
    parsed = _coerce_json(out.content)
    
    logger.info("[NODE 5] Output - Parsed JSON keys: %s", list(parsed.keys()))
    
    # Extract follow-up question
    follow_up = parsed.get("follow_up_question", "")
    logger.info("[NODE 5] Output - follow_up_question=%s", follow_up)
    
    logger.info("[NODE 5 - WRITE_SECTIONS] END")
    logger.info("="*80)
    
    return {
        "draft_article": parsed, 
        "current_stage": "draft", 
        "user_feedback": "",
        "follow_up_question": follow_up
    }


def article_router_node(state):
    """Node 6: Router node after article generation - uses LLM to decide APPROVE or EDIT"""
    logger.info("="*80)
    logger.info("[NODE 6 - ARTICLE_ROUTER] START")
    
    user_input = (state.user_feedback or "").strip()
    logger.info("[NODE 6] Input - user_feedback='%s'", user_input)
    logger.info("[NODE 6] Input - current_stage='%s'", state.current_stage)
    
    # Prepare context
    draft = state.draft_article or {}
    context = f"Generated article title: {draft.get('title', '')}, content length: {len(str(draft.get('content', '')))} chars"
    
    prompt = ChatPromptTemplate.from_template(router_prompt.template)
    chain = prompt | llm
    prompt_vars = {
        "user_input": user_input,
        "current_stage": state.current_stage,
        "context": context
    }
    
    logger.info("[NODE 6] LLM Call - Full Prompt:")
    logger.info(router_prompt.template.format(**prompt_vars))
    
    out = chain.invoke(prompt_vars)
    
    logger.info("[NODE 6] LLM Response - Raw output:")
    logger.info(out.content)
    
    parsed = _coerce_json(out.content)
    action = parsed.get("action", "EDIT").upper()
    feedback = parsed.get("feedback", "")
    
    logger.info("[NODE 6] Output - action=%s", action)
    logger.info("[NODE 6] Output - feedback=%s", feedback)
    
    if action == "APPROVE":
        decision = "end"
        logger.info("[NODE 6] Decision: Workflow complete - article approved")
    else:
        decision = "write_sections"
        logger.info("[NODE 6] Decision: Regenerating article with feedback")
    
    logger.info("[NODE 6 - ARTICLE_ROUTER] END")
    logger.info("="*80)
    
    return {"routing_decision": decision, "user_feedback": feedback if action == "EDIT" else ""}