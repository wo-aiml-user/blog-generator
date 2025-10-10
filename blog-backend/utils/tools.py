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


def perplexity_search(query: str, max_results: int = 2) -> List[Dict]:
    """
    Perform a Perplexity search for a single query.
    Returns a normalized list with title, url, content.
    """
    logger.info("[PERPLEXITY] query='%s' | max_results=%d", query, max_results)
    client = _get_perplexity_client()
    
    try:
        search = client.search.create(query=[query])
        
        results = []
        for result in search.results:
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


def search_articles(query: str, max_results: int = 2) -> List[Dict]:
    """
    Perform a single Perplexity search for the provided query/keywords and
    return up to max_results normalized items. No additional sorting is applied.
    """
    return perplexity_search(query=query, max_results=max_results)


def search_articles_parallel(queries: List[str], max_results: int = 2) -> List[Dict]:
    """
    Performs Perplexity search for each query separately and limits results per query.
    Returns max_results articles per query (total = len(queries) * max_results).
    """
    if not queries:
        return []
    
    logger.info("[PERPLEXITY_MULTI] queries=%s | max_results_per_query=%d", queries, max_results)
    
    all_results = []
    for query in queries:
        query_results = perplexity_search(query=query, max_results=max_results)
        all_results.extend(query_results[:max_results])
    
    logger.info(
        "[PERPLEXITY_MULTI] total_results=%d (from %d queries) | sample=%s",
        len(all_results),
        len(queries),
        [
            {
                "title": r.get("title", ""),
                "url": r.get("url"),
                "score": r.get("score"),
            }
            for r in all_results[:3]
        ],
    )
    return all_results


def search_articles_and_citations(keywords: str) -> Tuple[List[Dict], List[Dict]]:
    logger.warning("search_articles_and_citations is deprecated; use search_articles instead.")
    articles = search_articles(keywords, max_results=2)
    return articles, []