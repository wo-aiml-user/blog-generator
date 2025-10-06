import os
from typing import List, Dict, Tuple
from dotenv import load_dotenv
from perplexity import Perplexity
import logging

logger = logging.getLogger(__name__)


load_dotenv('.env')


def _get_perplexity_client() -> Perplexity:
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        raise ValueError("PERPLEXITY_API_KEY environment variable is required for web search")
    return Perplexity(api_key=api_key)


def perplexity_search(query: str, max_results: int = 1) -> List[Dict]:
    """
    Perform a Perplexity search for a single query.
    Returns a normalized list with title, url, content.
    """
    logger.info("[PERPLEXITY] query='%s' | max_results=%d", query, max_results)
    client = _get_perplexity_client()
    
    try:
        search = client.search.create(query=[query])
        
        results = []
        for idx, result in enumerate(search.results):
            if idx >= max_results:
                break
            
            norm = {
                "title": getattr(result, 'title', ''),
                "url": getattr(result, 'url', ''),
                "content": getattr(result, 'content', '') or getattr(result, 'snippet', '') or '',
                "score": getattr(result, 'score', None),
                "published_date": getattr(result, 'published_date', '') or getattr(result, 'date', '') or '',
            }
            results.append(norm)
        
        logger.info(
            "[PERPLEXITY] results=%d | sample=%s",
            len(results),
            [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url"),
                    "score": r.get("score"),
                }
                for r in results[:3]
            ],
        )
        return results
    except Exception as e:
        logger.error(f"[PERPLEXITY] Search failed: {e}")
        return []


def search_articles(query: str, max_results: int = 1) -> List[Dict]:
    """
    Perform a single Perplexity search for the provided query/keywords and
    return up to max_results normalized items. No additional sorting is applied.
    """
    return perplexity_search(query=query, max_results=max_results)


def search_articles_parallel(queries: List[str], max_results: int = 1) -> List[Dict]:
    """
    Performs Perplexity search with multiple queries in a single API call.
    Uses Perplexity's native multi-query support instead of parallel execution.
    """
    if not queries:
        return []
    
    logger.info("[PERPLEXITY_MULTI] queries=%s | max_results=%d", queries, max_results)
    client = _get_perplexity_client()
    
    try:
        search = client.search.create(query=queries)
        
        results = []
        for idx, result in enumerate(search.results):
            if idx >= max_results * len(queries):
                break
            
            norm = {
                "title": getattr(result, 'title', ''),
                "url": getattr(result, 'url', ''),
                "content": getattr(result, 'content', '') or getattr(result, 'snippet', '') or '',
                "score": getattr(result, 'score', None),
                "published_date": getattr(result, 'published_date', '') or getattr(result, 'date', '') or '',
            }
            results.append(norm)
        
        unique_articles = {article['url']: article for article in results}.values()
        unique_list = list(unique_articles)
        
        logger.info(
            "[PERPLEXITY_MULTI] total_results=%d | unique_results=%d | sample=%s",
            len(results),
            len(unique_list),
            [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url"),
                    "score": r.get("score"),
                }
                for r in unique_list[:3]
            ],
        )
        return unique_list
    except Exception as e:
        logger.error(f"[PERPLEXITY_MULTI] Search failed: {e}")
        logger.exception("Full traceback:")
        return []


def search_articles_and_citations(keywords: str) -> Tuple[List[Dict], List[Dict]]:
    logger.warning("search_articles_and_citations is deprecated; use search_articles instead.")
    articles = search_articles(keywords, max_results=1)
    return articles, []