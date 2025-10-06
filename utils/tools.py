import os
from typing import List, Dict, Tuple
from dotenv import load_dotenv
from tavily import TavilyClient
import logging
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)


load_dotenv('.env')


def _get_tavily_client() -> "TavilyClient":
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        raise ValueError("TAVILY_API_KEY environment variable is required for web search")
    return TavilyClient(api_key=api_key)


def tavily_search(query: str, max_results: int = 2) -> List[Dict]:
    logger.info("[TAVILY] query='%s' | max_results=%d", query, max_results)
    client = _get_tavily_client()
    resp = client.search(query=query, max_results=max_results)

    results = []
    for item in resp.get("results", []):
        norm = (
            {
                "title": item.get("title") or "",
                "url": item.get("url") or "",
                "content": item.get("content") or item.get("snippet") or "",
                "score": item.get("score"),
                "published_date": item.get("published_date") or item.get("date") or "",
                "raw": item,
            }
        )
        results.append(norm)
    logger.info(
        "[TAVILY] results=%d | sample=%s",
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


def tavily_advanced_search(query: str, max_results: int = 2) -> List[Dict]:
    """
    Wrapper around TavilyClient.search using recommended params:
    - search_depth="advanced"
    - include_raw_content=True (full extracted text)
    - include_answer=False, include_images=False
    Returns a normalized list with title, url, content, score, published_date.
    """
    logger.info("[TAVILY_ADV] query='%s' | max_results=%d", query, max_results)
    client = _get_tavily_client()
    resp = client.search(
        query=query,
        search_depth="advanced",
        max_results=max_results,
        include_raw_content=True,
        include_answer=False,
    )
    results = []
    for item in resp.get("results", []):
        results.append(
            {
                "title": item.get("title") or "",
                "url": item.get("url") or "",
                "content": item.get("content"),
                "score": item.get("score"),
                "published_date": item.get("published_date") or item.get("date") or "",
                "raw": item,
            }
        )
    logger.info(
        "[TAVILY_ADV] results=%d | sample=%s",
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

def search_articles(query: str, max_results: int = 2) -> List[Dict]:
    """
    Perform a single advanced Tavily search for the provided query/keywords and
    return up to max_results normalized items. No additional sorting is applied.
    """
    return tavily_advanced_search(query=query, max_results=max_results)


def search_articles_parallel(queries: List[str], max_results: int = 2) -> List[Dict]:
    """
    Performs Tavily searches for a list of queries in parallel.
    """
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(search_articles, query, max_results) for query in queries]
        all_results = []
        for future in futures:
            try:
                all_results.extend(future.result())
            except Exception as e:
                logger.error(f"A search query failed: {e}")
    unique_articles = {article['url']: article for article in all_results}.values()
    return list(unique_articles)


def search_articles_and_citations(keywords: str) -> Tuple[List[Dict], List[Dict]]:
    logger.warning("search_articles_and_citations is deprecated; use search_articles instead.")
    articles = search_articles(keywords, max_results=2)
    return articles, []