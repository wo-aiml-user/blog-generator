from langchain.prompts import PromptTemplate

outlines_prompt = PromptTemplate(
    input_variables=["keywords", "articles", "user_input", "previous_outline", "num_outlines", "writing_style"],
    template="""Create a RankBrain-optimized article outline that maximizes user engagement and SERP visibility with authoritative data and expert quotes.

<keywords>{keywords}</keywords>
<articles>{articles}</articles>
<previous_outline>{previous_outline}</previous_outline>
<user_input>{user_input}</user_input>
<writing_style>{writing_style}</writing_style>

Create EXACTLY {num_outlines} sections.

### Writing Style Guidelines
- If <writing_style> is provided, consider the writing style when structuring sections and descriptions.
- Ensure section titles and descriptions align with the specified tone and approach.
- If no writing_style is provided, follow general best practices.


### RankBrain Success Metrics
**Engagement Signals:**
- Dwell Time Target: 4-6 minutes (300-400 words per minute reading speed)
- Bounce Rate: <40% (comprehensive query satisfaction)
- Scroll Depth: 70%+ (compelling section progression)
- CTR: 5-8% above category average
**Quality Indicators:**
- Topical Authority: Cover semantic cluster comprehensively
- Content Freshness: Include recent data, trends, developments
- User Intent Match: Address informational, navigational, transactional needs
- EEAT Signals: Expertise, Experience, Authoritativeness, Trustworthiness


### Content Flow Framework
Distribute these 6 elements *throughout* the {num_outlines} sections.
**Hook** - Problem/opportunity with urgency (include surprising statistic)
**Recognition** - Reveal underlying issue (back with expert quote)
**Proof** - Data tables, examples, case studies, user testimonials
**Insight** - Unique perspective/framework (supported by research)
**Path Forward** - Actionable strategies (with success metrics)
**Momentum** - Reinforce takeaways, inspire action

### Featured Snippet Optimization
Designate 2-3 sections for featured snippet targeting:
- **Definition Boxes**: 40-60 word precise definitions
- **Numbered Lists**: 5-8 step processes with action verbs
- **Comparison Tables**: Side-by-side feature/benefit analysis
- **FAQ Format**: Question as H3, direct answer in first 2-3 sentences

### SEO Semantic Clustering
Each section should address related query clusters:
- Primary intent keyword (main topic)
- 2-3 secondary keywords (variations, related terms)
- Long-tail questions (what, why, how, when, where, who)
- People Also Ask (PAA) queries
- Related searches from SERP analysis


### Section Creation (for each of {num_outlines} sections)
### Quality Checkpoints
- Keyword Density: Primary 1-2%, secondary 0.5-1% per section
- Readability: Flesch 60-70, Grade Level 8-10
- Sentence Variety: 40% short (<15 words), 40% medium (15-25), 20% long (>25)
- Active Voice: 75%+ of sentences
- Transition Quality: Every section connects logically to next
- Subheading Power: Each H2/H3 promises specific value

### Title and Description
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
    input_variables=["tone", "length", "target_audience", "keywords", "title","outlines","web_content", "user_input", "previous_draft", "writing_style"],
    template="""Write a #1-ranking article optimized for RankBrain, EEAT signals, and maximum user engagement.

<tone>{tone}</tone>
<length>{length}</length>
<target_audience>{target_audience}</target_audience>
<keywords>{keywords}</keywords>
<title>{title}</title>
<outlines>{outlines}</outlines>
<web_content>{web_content}</web_content>
<previous_draft>{previous_draft}</previous_draft>
<user_input>{user_input}</user_input>
<writing_style>{writing_style}</writing_style>

### RankBrain Performance Targets
**Engagement Metrics:**
- Dwell Time: 4-6 minutes (compelling, progressive value delivery)
- Bounce Rate: <35% (immediate value, clear path forward)
- Scroll Depth: 75%+ (curiosity loops, strategic subheadings)
- Return Visits: 15%+ (bookmark-worthy, comprehensive)

### Writing Style Guidelines
- If <writing_style> is provided, STRICTLY follow the writing style characteristics described.
- Match the tone, sentence structure, vocabulary level, and formatting preferences from the reference style.
- Maintain consistency with the perspective and engagement techniques specified.
- If no writing_style is provided, follow the <tone> parameter and general best practices.

### Article Structure
**Quality Signals:**
- Helpful Content Score: 8+/10 (unique insights, actionable advice)
- EEAT: Expert authorship signals, first-hand experience, authoritative sources
- Freshness: Recent data (last 12 months), current examples, updated best practices
- Comprehensiveness: Answer all related queries, address objections, provide context
- Use the exact section titles from the <outlines> as your ## headings.
- Write content for each <outlines> section based on the <web_content>.

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

### SEO Optimization Matrix
**Keyword Integration:**
- Primary keyword: 
  - Title (beginning preferred)
  - First H2 heading
  - First 100 words of introduction
  - 2-3 times in body (natural placement)
- Secondary keywords: 2-3 times each across relevant sections
- LSI keywords: Natural semantic variations throughout
- Avoid keyword stuffing: <2% density per keyword


### Writing Quality Standards
**Readability (Flesch Score 60-70):**
- Average sentence length: 15-20 words
- Sentence variety: 40% short (<15), 40% medium (15-25), 20% long (>25)
- Paragraph length: 2-4 sentences (max 5 lines on mobile)
- Active voice: 80%+ of sentences
- Transition words: 30% of paragraphs start with transition
- Grade level: 8-10 (accessible to broad audience)

**Engagement Architecture:**
- **Curiosity Loops**: End sections with question or teaser for next section
- **Pattern Interrupts**: Vary paragraph length every 3-4 paragraphs
- **Visual Breaks**: Subheadings every 300-400 words
- **Scannability**: Bold 1-2 key phrases per section, use bullets/numbers
- **Personal Connection**: Use "you" language (3-5 times per section)
- **Specificity**: Replace vague terms with concrete details (numbers, names, examples)

**Depth & Authority:**
- Answer "5 Whys": Explain root causes, not just surface symptoms
- Provide context: History, evolution, current state, future trends
- Show expertise: First-hand experience, original research, unique data
- Acknowledge limitations: What doesn't work, when to avoid, edge cases
- Multiple perspectives: Balance pros/cons, different approaches
- Practical wisdom: Hard-won insights beyond obvious advice

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
  "content": "Full article content in clean markdown format without any inline citations or URLs. Start with # title, then follow all sections from the outline with ## headings. The flow should naturally progress from hooking the reader → revealing the problem → building evidence → providing insight → offering solutions → creating momentum for action.",
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

image_prompt = PromptTemplate(
    input_variables=["title", "tone", "target_audience"],
    template="""Generate a photorealistic, professional image for the blog article: {title}

Style Requirements:
- Tone: {tone}
- Target Audience: {target_audience}
- Aspect Ratio: 16:9 (suitable for blog headers)

Visual Guidelines:
- Use a medium or wide shot composition
- Professional lighting (natural light, soft diffused, or golden hour)
- Modern, clean aesthetic
- High quality, engaging visual storytelling
- No text, words, or titles in the image
- Emphasize relevant textures and details related to the topic
- Create a mood that matches the {tone} tone
- Appeal visually to {target_audience}

Technical Specifications:
- Photorealistic quality
- Sharp focus on main subject
- Professional color grading
- Suitable for web publication"""
)

writing_style_prompt = PromptTemplate(
    input_variables=["reference_content"],
    template="""Analyze the following content from reference URLs and extract the writing style characteristics.

<reference_content>
{reference_content}
</reference_content>

## Instructions:
Analyze the writing style and provide a comprehensive description covering:

**Tone & Voice**: (e.g., formal, casual, conversational, authoritative, friendly, technical)
**Sentence Structure**: (e.g., short and punchy, long and descriptive, varied, complex)
**Vocabulary Level**: (e.g., simple, technical, academic, industry-specific jargon)
**Paragraph Style**: (e.g., brief, detailed, uses transitions, direct)
**Engagement Techniques**: (e.g., questions, storytelling, examples, data-driven, anecdotes)
**Formatting Preferences**: (e.g., bullet points, numbered lists, subheadings, bold emphasis)
**Perspective**: (e.g., first-person, second-person, third-person)
**Unique Characteristics**: Any distinctive patterns or stylistic choices

You MUST respond with ONLY valid JSON in this exact format:
{{
  "summary": "A concise 3-4 sentence summary of the overall writing style that can be used as guidance"
}}"""
)

