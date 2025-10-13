import logging
import json
from typing import Dict, Any
from langchain.prompts import ChatPromptTemplate
from langsmith import traceable

from utils.model_config import get_llm, generate_images
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


@traceable(name="generate_keywords_node")
def generate_keywords_node(state):
    """Node 1: Generate 3 keywords from topic using LLM"""
    logger.info("="*80)
    logger.info("[NODE 1 - GENERATE_KEYWORDS] START")
    logger.info("[NODE 1] Input - topic='%s'", state.topic)
    logger.info("[NODE 1] Input - tone='%s'", state.tone)
    logger.info("[NODE 1] Input - length='%s'", state.length)
    logger.info("[NODE 1] Input - target_audience='%s'", state.target_audience)
    
    prompt = ChatPromptTemplate.from_template(keyword_prompt.template)
    chain = prompt | llm
    prompt_vars = {"topic": state.topic}
    
    logger.info("[NODE 1] LLM Call - Full Prompt:")
    logger.info(keyword_prompt.template.format(**prompt_vars))
    
    out = chain.invoke(prompt_vars)
    
    logger.info("[NODE 1] LLM Response - Raw output:")
    logger.info(out.content)
    
    parsed = _coerce_json(out.content)
    keywords_list = parsed.get("keywords", [])
    keywords_str = ", ".join(keywords_list) if isinstance(keywords_list, list) else str(keywords_list)
    
    logger.info("[NODE 1] Output - keywords=%s", keywords_str)
    logger.info("[NODE 1 - GENERATE_KEYWORDS] END")
    
    return {"keywords": keywords_str, "current_stage": "keywords"}


@traceable(name="search_articles_citations_node")
def search_articles_citations_node(state):
    """Node 2: Search web articles for each keyword (keywords-only mode)"""
    logger.info("="*80)
    logger.info("[NODE 2 - SEARCH_ARTICLES] START")
    
    kw_string = state.keywords or state.topic
    queries = [kw.strip() for kw in kw_string.split(',') if kw.strip()]
    
    articles = search_articles_parallel(queries, max_results=2)
    
    logger.info("[NODE 2] Retrieved %d articles", len(articles))
    logger.info("[NODE 2 - SEARCH_ARTICLES] END")
    logger.info("="*80)
    
    return {
        "articles": articles,
        "citations": [],
        "current_stage": "search",
    }


@traceable(name="generate_outlines_node")
def generate_outlines_node(state):
    logger.info("="*80)
    logger.info("[NODE 3 - GENERATE_OUTLINES] START")
    
    user_feedback = getattr(state, 'user_feedback', None)
    if user_feedback:
        logger.info("[NODE 3] Regenerating with user feedback: %s", user_feedback)
    

    if user_feedback and state.outlines_json:
        logger.info("[NODE 3] Mode: MODIFICATION (using only previous_outline + user_input)")
        previous_outline = json.dumps(state.outlines_json, indent=2, ensure_ascii=False)
        if getattr(state, 'num_outlines', None) is None:
            logger.error("[NODE 3] Missing required num_outlines in state for modification mode")
            raise ValueError("num_outlines is required")
        prompt_vars = {
            "keywords": "",  
            "articles": "",
            "user_input": user_feedback,
            "previous_outline": previous_outline,
            "num_outlines": state.num_outlines,
        }
    else:
        logger.info("[NODE 3] Mode: INITIAL GENERATION (using articles + keywords)")
        articles = state.articles or []
        logger.info("[NODE 3] Input - articles count=%d", len(articles))
        logger.info("[NODE 3] Input - keywords=%s", state.keywords)
        logger.info("[NODE 3] Input - num_outlines=%s", getattr(state, 'num_outlines', None))
        articles_text = "\n\n".join(
            [f"Title: {a.get('title','')}\nContent: {a.get('content','')}" 
             for a in articles]
        )
        
        prompt_vars = {
            "keywords": state.keywords, 
            "articles": articles_text,
            "user_input": "None",
            "previous_outline": "",
            "num_outlines": state.num_outlines,
        }
    
    prompt = ChatPromptTemplate.from_template(outlines_prompt.template)
    chain = prompt | llm
    
    logger.info("[NODE 3] LLM Call - Full Prompt:")
    logger.info(outlines_prompt.template.format(**prompt_vars))
    
    out = chain.invoke(prompt_vars)
    
    logger.info("[NODE 3] LLM Response - Raw output:")
    logger.info(out.content)
    
    parsed = _coerce_json(out.content)
    
    logger.info("[NODE 3] Output - Parsed JSON keys: %s", list(parsed.keys()))
    
    follow_up = parsed.get("follow_up_question", "")
    if isinstance(parsed, dict) and "follow_up_question" in parsed:
        parsed.pop("follow_up_question", None)
    logger.info("[NODE 3] Output - follow_up_question=%s", follow_up)
    
    logger.info("[NODE 3 - GENERATE_OUTLINES] END")
    logger.info("="*80)
    
    return {
        "outlines_json": parsed,
        "current_stage": "outlines",
        "follow_up_question": follow_up
    }



@traceable(name="outline_router_node")
def outline_router_node(state):
    """Node 4: Router node after outline generation - uses LLM to decide APPROVE or EDIT"""
    logger.info("="*80)
    logger.info("[NODE 4 - OUTLINE_ROUTER] START")
    
    user_input = (state.user_feedback or "").strip()
    logger.info("[NODE 4] Input - user_feedback='%s'", user_input)
    logger.info("[NODE 4] Input - current_stage='%s'", state.current_stage)
    
    context = f"Generated outlines: {json.dumps(state.outlines_json, ensure_ascii=False)}"
    
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


@traceable(name="write_sections_node")
def write_sections_node(state):
    logger.info("="*80)
    logger.info("[NODE 5 - WRITE_SECTIONS] START")
    
    user_feedback = getattr(state, 'user_feedback', None)
    if user_feedback:
        logger.info("[NODE 5] Regenerating with user feedback: %s", user_feedback)
    
    tone = state.tone
    length = state.length
    target_audience = state.target_audience
    keywords = state.keywords
    outlines_data = state.outlines_json or {}
    outline_title = outlines_data.get("title", "") or ((state.draft_article or {}).get("title", "") if getattr(state, 'draft_article', None) else "")
    outline_sections = outlines_data.get("outlines", [])
    outlines_str = "\n".join([
        f"- {s.get('section', '')}: {s.get('description', '')}" for s in outline_sections
    ]) if outline_sections else ""
    if user_feedback and state.draft_article:
        logger.info("[NODE 5] Mode: MODIFICATION (using only previous_draft + user_input)")
        previous_draft = json.dumps(state.draft_article, indent=2, ensure_ascii=False)
        prompt_vars = {
            "tone": tone,
            "length": length,
            "target_audience": target_audience,
            "keywords": keywords,
            "outlines": outlines_str,
            "title": outline_title,
            "web_content": "",
            "user_input": user_feedback,
            "previous_draft": previous_draft
        }
    else:
        logger.info("[NODE 5] Mode: INITIAL GENERATION (using outlines + web_content)")
        logger.info("[NODE 5] Input - tone='%s'", tone)
        logger.info("[NODE 5] Input - length='%s'", length)
        logger.info("[NODE 5] Input - target_audience='%s'", target_audience)
        logger.info("[NODE 5] Input - keywords='%s'", state.keywords)

        logger.info("[NODE 5] Input - outline_title='%s'", outline_title)
        logger.info("[NODE 5] Input - outline sections count=%d", len(outline_sections))
        
        articles = state.articles or []
        web_content = "\n\n".join(
            [f"Source: {a.get('title', '')}\nURL: {a.get('url', '')}\nContent: {a.get('content', '')}" 
             for a in articles]
        )
        
        prompt_vars = {
            "tone": tone,
            "length": length,
            "target_audience": target_audience,
            "keywords": keywords,
            "title": outline_title,
            "outlines": outlines_str,
            "web_content": web_content,
            "user_input": "None",
            "previous_draft": ""
        }
    
    prompt = ChatPromptTemplate.from_template(write_sections_prompt.template)
    chain = prompt | llm
    
    logger.info("[NODE 5] LLM Call - Full Prompt:")
    logger.info(write_sections_prompt.template.format(**prompt_vars))
    
    out = chain.invoke(prompt_vars)
    
    logger.info("[NODE 5] LLM Response - Raw output:")
    logger.info(out.content)
    
    parsed = _coerce_json(out.content)
    
    logger.info("[NODE 5] Output - Parsed JSON keys: %s", list(parsed.keys()))
    
    follow_up = parsed.get("follow_up_question", "")
    if isinstance(parsed, dict) and "follow_up_question" in parsed:
        parsed.pop("follow_up_question", None)
    logger.info("[NODE 5] Output - follow_up_question=%s", follow_up)
    
    logger.info("[NODE 5 - WRITE_SECTIONS] END")
    logger.info("="*80)
    
    return {
        "draft_article": parsed, 
        "current_stage": "draft", 
        "user_feedback": "",
        "follow_up_question": follow_up
    }

@traceable(name="article_router_node")
def article_router_node(state):
    """Node 6: Router node after article generation - uses LLM to decide APPROVE or EDIT"""
    logger.info("="*80)
    logger.info("[NODE 6 - ARTICLE_ROUTER] START")
    
    user_input = (state.user_feedback or "").strip()
    logger.info("[NODE 6] Input - user_feedback='%s'", user_input)
    logger.info("[NODE 6] Input - current_stage='%s'", state.current_stage)
    
    context = json.dumps(state.draft_article or {}, ensure_ascii=False)
    logger.info("[NODE 6] Input - context='%s'", context)
    
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


@traceable(name="generate_images_node")
def generate_images_node(state):
    """Node 7: Generate images for the blog article based on the title"""
    
    logger.info("="*80)
    logger.info("[NODE 7 - GENERATE_IMAGES] START")
    
    draft_article = state.draft_article
    title = draft_article.get("title")
    tone = state.tone
    target_audience = state.target_audience
    
    logger.info("[NODE 7] Input - title='%s', tone='%s', target_audience='%s'", title, tone, target_audience)
    logger.info("[NODE 7] Generating images directly with title, tone, and target_audience")
    
    try:
        base64_images, formatted_prompt = generate_images(
            title=title,
            tone=tone,
            target_audience=target_audience,
            number_of_images=1
        )
        logger.info("[NODE 7] Successfully received %d base64 images from generate_images()", len(base64_images))
        
        logger.info("[NODE 7 - GENERATE_IMAGES] END")
        logger.info("="*80)
        
        return {
            "generated_images": base64_images,
            "image_prompt": formatted_prompt,
            "image_count": len(base64_images)
        }
    except Exception as e:
        logger.error("[NODE 7] Error generating images: %s", str(e))
        logger.info("[NODE 7 - GENERATE_IMAGES] END")
        logger.info("="*80)
        return {
            "generated_images": [],
            "image_prompt": "",
            "image_count": 0
        }