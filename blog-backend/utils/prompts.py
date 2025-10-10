from langchain.prompts import PromptTemplate

keyword_prompt = PromptTemplate(
    input_variables=["topic"],
    template="""You are an SEO strategist trained in RankBrain and semantic search.
Given a topic, generate exactly three **high-intent, long-tail keyword phrases** that prioritize authoritative sources and user review signals.

<topic>{topic}</topic>

### Guidelines
- Classify the **search intent** for this topic (informational, transactional, or navigational) and ensure all keywords align with that intent.
- Each keyword should reflect **natural language phrasing** used by real users.
- Include **semantic variants** and **entity-based keywords** (related concepts or questions RankBrain would associate with the topic).
- Prioritize phrases that appear in:
  * Government, educational (.gov, .edu), and industry authority sites
  * User review platforms and community discussions (Reddit, Quora, forums)
  * Expert blog commentary and case studies
- Focus on **question-based keywords** that reveal user intent ("how does X work", "is X worth it", "X vs Y reviews")
- Include **comparison and review modifiers** (best, top-rated, verified, expert-reviewed, user experience)
- Avoid generic one-word terms.
- Make sure to add one keywords to extract from community discussions.

### Output (valid JSON only):
{{
  "keywords": ["keyword1", "keyword2", "keyword3"]
}}
"""
)

outlines_prompt = PromptTemplate(
    input_variables=["keywords", "articles", "user_input", "previous_outline", "num_outlines"],
    template="""Create a RankBrain-optimized article outline that maximizes user engagement and SERP visibility with authoritative data and expert quotes.

<keywords>{keywords}</keywords>
<articles>{articles}</articles>
<previous_outline>{previous_outline}</previous_outline>
<user_input>{user_input}</user_input>

Create EXACTLY {num_outlines} sections.

### RankBrain Signals to Maximize
- Dwell Time: Progressive value delivery keeps readers engaged
- Low Bounce: Answer queries comprehensively 
- CTR: Compelling titles/H2s that stand out in SERPs
- Scroll Depth: Structure encourages full-page reading

### Content Flow Framework
Distribute these 6 elements *throughout* the {num_outlines} sections.
**Hook** - Problem/opportunity with urgency (include surprising statistic)
**Recognition** - Reveal underlying issue (back with expert quote)
**Proof** - Data tables, examples, case studies, user testimonials
**Insight** - Unique perspective/framework (supported by research)
**Path Forward** - Actionable strategies (with success metrics)
**Momentum** - Reinforce takeaways, inspire action

### Enhanced Requirements
- **Statistical Tables**: Include 1-2 sections that will feature data tables (comparison charts, before/after metrics, industry benchmarks)
- **Expert Quotes**: Mark 2-3 sections that should incorporate authoritative quotes from industry leaders, researchers, or verified practitioners
- **User Insights**: Identify 1-2 sections for real user experiences, reviews, or community feedback
- **Data Visualization**: Note which sections benefit from presenting data in table format vs. narrative

### Optimization Requirements
- Title: Include primary keyword naturally, promise specific value
- Sections: CTR-optimized titles using power words, numbers, curiosity gaps
- Include 1+ section formatted for featured snippet (definition, list, comparison, FAQ, steps)
- Cover full semantic field: what, why, how, when, who, where
- Address related questions to reduce follow-up searches
- Use engagement triggers: curiosity gaps, pattern interrupts
- Show expertise through firsthand experience signals

### Section Creation (for each of {num_outlines} sections)
- Compelling, descriptive title (NOT generic labels like "Introduction" or "Conclusion")
- 2-3 sentence description covering:
  * What's included
  * Why it matters
  * Unique value provided


When modifying (if user_input and previous_outline exist):
- Start with the previous outline
- Apply user feedback exactly as requested
- Maintain the natural flow and reader journey

You MUST respond with ONLY valid JSON in this exact format:
{{
  "title": "Main Article Title That Promises Specific Value",
  "outlines": [
    {{"section": "Section 1 Title", "description": "Description"}},
    {{"section": "Section 2 Title", "description": "Description"}},
    ... (continue for EXACTLY {num_outlines} sections total)
  ],
  "follow_up_question": "Does this article structure and flow match your expectations, or would you like any section adjusted?"
}}
"""
)

write_sections_prompt = PromptTemplate(
    input_variables=["tone", "length", "target_audience", "title","outlines","web_content", "user_input", "previous_draft"],
    template="""Write a #1-ranking article optimized for RankBrain satisfaction signals with authoritative data, expert quotes, and user insights.

<tone>{tone}</tone>
<length>{length}</length>
<target_audience>{target_audience}</target_audience>
<title>{title}</title>
<outlines>{outlines}</outlines>
<web_content>{web_content}</web_content>
<previous_draft>{previous_draft}</previous_draft>
<user_input>{user_input}</user_input>

### RankBrain Success Targets
1. Dwell Time: 3+ minutes (engaging content)
2. Low Bounce: Complete query answer prevents return-to-search
3. CTR: Outperform competitor meta titles/descriptions
4. Authority Signals: Expert quotes, statistical tables, user reviews

### Article Structure
- Use the exact section titles from the <outlines> as your ## headings.
- Write content for each <outlines> section based on the <web_content>.
- Incorporate content_type indicators from outlines (DATA TABLE, EXPERT QUOTE, USER REVIEW).

### Enhanced Content Elements

**Statistical Tables**: 
- Create markdown tables for data comparisons, benchmarks, or metrics
- Include 3-5 rows minimum, clearly labeled columns
- Source all statistics with authoritative citations
- Use tables for: comparison matrices, before/after results, industry benchmarks, survey data

**Expert Quotes**:
- Incorporate 2-4 quotes from authoritative sources (researchers, industry leaders, verified practitioners)
- Format as blockquotes with attribution
- Use quotes that provide unique insights or validate key points
- Prioritize quotes from .gov, .edu, established industry authorities

**User Reviews & Testimonials**:
- Include real-world experiences and user feedback
- Balance positive and constructive perspectives
- Aggregate common themes from multiple reviews
- Format user quotes distinctly (e.g., italics with "— Username, Platform")

### SEO Optimization
**Keywords**: Primary 3-5x (title, H2, intro, body, conclusion), secondary 2-3x each, LSI naturally
**Featured Snippets**: 40-60 word definitions, numbered steps, comparison tables, direct question answers, contextualized statistics
**EEAT**: Firsthand examples, authoritative sources (in citations), acknowledge limitations, current data, deep analysis, original insights, expert validation

### Writing Quality
**Readability**: Flesch 60-70, sentences 15-20 words avg (5-30 range), paragraphs 2-4 sentences, 80% active voice, varied transitions
**Engagement**: Hook in first 100 words, subheadings promise quick wins, curiosity loops, varied paragraph length, strategic lists/bold, smooth transitions, "you" language, layered proof
**Depth**: Answer "5 Whys", explain what+why, provide context, address objections, share what doesn't work, real-world connections
**Authority**: Back claims with data, include expert perspectives, acknowledge multiple viewpoints, cite authoritative sources

### Formatting
- Markdown: # title, ## sections, ### subsections
- **Bold** key insights, statistics, takeaways
- Bullets for 3+ items, steps, examples, comparisons
- Numbered lists only for sequential/ranked items
- Tables for data: `| Column 1 | Column 2 |`
- Blockquotes for expert quotes: `> Quote text`
- Italics for user testimonials: `*"User quote" — User Name*`
- NO inline citations (use citations JSON)
- Max 5 lines per paragraph

### Table Format Example
| Metric | Before | After | % Change |
|--------|--------|-------|----------|
| Value1 | 100    | 150   | +50%     |

### Quote Format Example
> "Expert insight that adds credibility and depth to the article." — Dr. Jane Smith, Industry Expert

When modifying (if user_input and previous_draft exist):
- Start with previous_draft as the foundation
- Make only the specific changes the user requested
- Keep everything else consistent in quality, tone, and flow
- Don't rebuild what's already working

You MUST respond with ONLY valid JSON in this exact format:
{{
  "title": "Article Title",
  "content": "Full article content in clean markdown format without any inline citations or URLs. Start with # title, then ## Introduction (The Hook), then follow all Main Body sections from the outline with ## headings (Recognition, Proof, Insight, Path Forward), and end with ## Conclusion (Momentum). The flow should naturally progress from hooking the reader → revealing the problem → building evidence → providing insight → offering solutions → creating momentum for action.",
  "citations": [
    {{"title": "Source Title", "url": "https://example.com", "relevance": "Specific information or data used from this source"}},
    {{"title": "Another Source", "url": "https://example2.com", "relevance": "How this source contributed to the article"}}
  ],
  "follow_up_question": "A single, direct question to confirm your interpretation"
}}
"""
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

