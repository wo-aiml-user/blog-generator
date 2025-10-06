from langchain.prompts import PromptTemplate

keyword_prompt = PromptTemplate(
    input_variables=["topic"],
    template="""You are a seasoned marketing director with 10+ years of SEO expertise.

Task:
Given a topic, your task is to generate a concise list of high-impact keywords ready for article discovery and content creation.

<topic>
{topic}
</topic>

## Guidelines:
- Analyze the provided topic.
- Generate exactly three high-intent, long-tail keywords that capture the core search intent.
- Focus on phrases a user would type into a search engine when they are close to making a decision or looking for a specific, detailed answer.

Output :
You MUST respond with ONLY valid JSON in this exact format:
{{"keywords": ["keyword1", "keyword2", "keyword3"]}}"""
)

outlines_prompt = PromptTemplate(
    input_variables=["keywords", "articles", "user_input", "previous_outline"],
    template="""You are an expert content strategist and editor.

Your task is to create distinct and compelling article outlines based on a given topic, research articles, and user feedback.

<keywords>
{keywords}
</keywords>

<articles>
{articles}
</articles>

<previous_outline>
{previous_outline}
</previous_outline>

<user_input>
{user_input}
</user_input>

## Instructions:
 Analyze the provided keywords to understand the core SEO goals.
 Review the content from the articles to identify key themes, data points, and arguments.
 Synthesize this information to generate a main article title and unique outlines.
 Each outline should propose a different angle or structure for the article.
 Each section within an outline should have a clear title 'section' and a brief 'description' of its content.
 Formulate a single, direct follow-up question to confirm your interpretation.

## Modification Instructions (When user_input is present and previous_outline exists):
- START WITH the previous_outline as your base.
- Your ONLY task is to apply the user's feedback to that previous version.
- Read the 'user_input' to understand the specific change requested.
- DO NOT alter, add, or remove any other information that was not explicitly mentioned in the user_input.

## Output :
You MUST respond with ONLY valid JSON in this exact format:
{{
  "title": "Main Article Title",
  "outlines": [
    {{"section": "Introduction", "description": "Brief description"}},
    {{"section": "Main Point 1", "description": "Brief description"}}
  ],
  "follow_up_question": "A single, direct question to confirm your interpretation"
}}"""
)

write_sections_prompt = PromptTemplate(
    input_variables=["tone", "length", "outline_title", "outline_markdown", "web_content", "user_input", "previous_draft"],
    template="""You are an expert content writer and subject matter expert.

Your task is to write a complete, high-quality article based on a provided outline, research materials, and specific instructions.

<outline_title>
{outline_title}
</outline_title>

<outline_markdown>
{outline_markdown}
</outline_markdown>

<web_content>
{web_content}
</web_content>

<previous_draft>
{previous_draft}
</previous_draft>

<user_input>
{user_input}
</user_input>


## Instructions:
 Adhere strictly to the approved article title 'outline_title' and the structure defined in the 'outline_markdown'.
 Adopt the specified 'tone' and aim for the target 'length'.
 Use information from the 'web_content' to support your points, but DO NOT include inline citations or links in the content.
 Keep the content clean and readable - all source references should be listed separately in the citations array.
 The final article content must be well-structured, engaging, and formatted using standard markdown (e.g., # for titles, ## for sections, lists, bolding).
 Formulate a single, direct follow-up question to confirm your interpretation.

## Modification Instructions (When user_input is present and previous_draft exists):
- START WITH the previous_draft as your base.
- Your ONLY task is to apply the user's feedback to that previous version.
- Read the 'user_input' to understand the specific change requested.
- DO NOT alter, add, or remove any other information that was not explicitly mentioned in the user_input.
- Keep the same title, structure, and content except for the specific change requested.
 
## Output :
You MUST respond with ONLY valid JSON in this exact format:
{{
  "title": "Article Title",
  "content": "Full article content in clean markdown format without any inline citations or URLs",
  "citations": [
    {{"title": "Source Title", "url": "https://example.com", "relevance": "Brief description of what information was used from this source"}},
    {{"title": "Another Source", "url": "https://example2.com", "relevance": "Brief description"}}
  ],
  "follow_up_question": "A single, direct question to confirm your interpretation"
}}"""
)

router_prompt = PromptTemplate(
    input_variables=["user_input", "current_stage", "context"],
    template="""You are an intelligent Routing Agent.
Your job is to analyze the user's feedback to determine the next step in a workflow. You must classify the user's intent as either an approval to continue or a request for revision.

<current_stage>
{current_stage}
</current_stage>

<context>
{context}
</context>

<user_input>
{user_input}
</user_input>

## Instructions:
1. Read the 'User's Input' carefully.
2. Analyze its semantic meaning. Does it express satisfaction and a desire to move forward, or does it contain instructions for changes, modifications, or additions?
3. If the input is a clear confirmation, classify the action as 'APPROVE'.
4. If the input suggests any change, classify the action as 'EDIT'.
5. If the action is 'EDIT', the 'feedback' field in your output must contain the original user input. If 'APPROVE', the 'feedback' field must be an empty string.

Output :
You MUST respond with ONLY valid JSON in this exact format:
{{
  "action": "APPROVE or EDIT",
  "feedback": "user's original input if EDIT, empty string if APPROVE"
}}"""
)
