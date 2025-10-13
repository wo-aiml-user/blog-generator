import os
import logging
from langchain_deepseek import ChatDeepSeek
#from langchain_anthropic import ChatAnthropic
#from langchain_google_genai import ChatGoogleGenerativeAI
#from langchain_xai import ChatXAI
from google import genai
from utils.prompts import image_prompt
import base64
from langsmith import traceable
from google.genai import types
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

@traceable(name="generate_images", run_type="tool")
def generate_images(title: str, tone: str, target_audience: str, number_of_images: int = 1, user_feedback: str = "", previous_image_bytes: bytes = None):
    """
    Generate images using Google's Gemini image generation model.
    
    Args:
        title (str): The blog article title
        tone (str): The tone of the article (e.g., "Professional", "Casual", "Friendly")
        target_audience (str): The target audience (e.g., "Business Professionals", "General Public")
        number_of_images (int): Number of images to generate (default: 1)
        user_feedback (str): Optional user feedback for image refinement (default: "")
        previous_image_bytes (bytes): Optional image bytes to refine (default: None)
    
    Returns:
        tuple: (list of base64-encoded image strings, formatted prompt string)
              Images format: "data:image/png;base64,{base64_string}"
              Returns (empty list, empty string) if generation fails or is skipped
    """
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        logger.info("GOOGLE_API_KEY not configured, skipping image generation")
        return [], ""
    
    base_prompt = image_prompt.format(
        title=title,
        tone=tone,
        target_audience=target_audience
    )
    
    try:
        client = genai.Client(api_key=google_api_key)
        
        if user_feedback and previous_image_bytes:
            prompt = f"{base_prompt}\n\nUser Refinement Request:\n{user_feedback}\n\nApply the user's requested changes while maintaining the overall style and quality."
            logger.info(f"Generating {number_of_images} images with user feedback and previous image ({len(previous_image_bytes)} bytes)")
            
            response = client.models.generate_content(
                model='gemini-2.5-flash-image',
                contents=[
                    types.Part.from_bytes(data=previous_image_bytes, mime_type='image/png'),
                    prompt
                ],
            )
        else:
            prompt = base_prompt
            logger.info(f"Generating {number_of_images} images with base prompt")
            
            response = client.models.generate_content(
                model='gemini-2.5-flash-image',
                contents=[prompt],
            )
        
        base64_images = []
        
        for candidate in response.candidates:
            for part in candidate.content.parts:
                if part.inline_data is not None:
                    img_bytes = part.inline_data.data
                    logger.info(f"Found inline_data with {len(img_bytes)} bytes")
                    img_str = base64.b64encode(img_bytes).decode('utf-8')
                    base64_images.append(f"data:image/png;base64,{img_str}")
                    logger.info(f"Successfully converted to base64 (size: {len(img_bytes)} bytes, base64 length: {len(img_str)} chars)")
        logger.info(f"Successfully generated {len(base64_images)} base64 images")
        return base64_images, prompt
    
    except Exception as e:
        logger.error(f"Error generating images: {str(e)}")
        logger.warning("Image generation failed, returning empty list")
        return [], ""


"""def get_llm():
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is required")
    logger.info(f"Initializing Google Generative AI LLM: model='gemini-2.5-pro'")
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",
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
        temperature=0.6,
    )
    return llm"""