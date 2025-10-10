import os
import logging
from langchain_deepseek import ChatDeepSeek
#from langchain_anthropic import ChatAnthropic
#from langchain_google_genai import ChatGoogleGenerativeAI
#from langchain_xai import ChatXAI

from dotenv import load_dotenv

load_dotenv('.env')


logger = logging.getLogger(__name__)

def get_llm():
    ai_api_key = os.getenv("DEEPSEEK_API_KEY")
    if not ai_api_key:
        raise ValueError("DEEPSEEK_API_KEY environment variable is required")
    logger.info(f"Initializing DeepSeek LLM: model='deepseek-reasoner'")
    llm = ChatDeepSeek(
        model="deepseek-chat",
        api_key=ai_api_key,
        temperature=0.6,
    )
    return llm


"""def get_llm():
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is required")
    logger.info(f"Initializing Google Generative AI LLM: model='gemini-2.5-flash'")
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=google_api_key,
        temperature=0.6,
    )
    return llm"""

"""def get_llm():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is required")
    logger.info(f"Initializing Anthropic LLM: model='claude-sonnet-4-5-20250929'")
    llm = AnthropicLLM(
        model="claude-sonnet-4-5-20250929",
        api_key=api_key,
        temperature=0.4,
    )
    return llm"""

"""def get_llm():
    ai_api_key = os.getenv("XAI_API_KEY")
    if not ai_api_key:
        raise ValueError("XAI_API_KEY environment variable is required")
    logger.info(f"Initializing xAI Grok LLM: model='grok-4-fast-non-reasoning'")
    llm = ChatXAI(
        model="grok-4-fast-non-reasoning",
        api_key=ai_api_key,
        temperature=0.5,
    )
    return llm"""