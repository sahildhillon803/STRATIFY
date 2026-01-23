from groq import AsyncGroq
from app.core.config import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def generate_strategy_ideas(financial_summary: str, startup_context: str) -> str:
    """
    Generates startup strategy ideas using Groq (Llama 3).
    """
    if not settings.GROQ_API_KEY:
        return '{"error": "No AI API Key configured"}'

    prompt = f"""
    You are a world-class startup strategy consultant with experience helping 100+ startups achieve product-market fit and scale.
    
    Analyze the following data and provide 3-4 highly actionable pivot or growth strategies.

    FINANCIAL SUMMARY:
    {financial_summary}

    STARTUP CONTEXT:
    {startup_context}

    REQUIREMENTS FOR EACH STRATEGY:
    1. Title: Clear, specific strategy name (e.g., "Enterprise Tier Launch" not just "New Product")
    
    2. Description: MUST be 3-5 sentences including:
       - WHAT: What exactly is this strategy?
       - WHY: Why is this the right move given their situation?
       - HOW: High-level approach to execute this
       - OUTCOME: What success looks like (with metrics if possible)
       
    3. Impact Score (1-10): Based on potential revenue impact, runway extension, or growth acceleration
    
    4. Difficulty (Low/Medium/High): Based on resources, time, and complexity required

    EXAMPLE OF A GOOD DESCRIPTION:
    "Launch a premium enterprise tier priced at $499/month targeting mid-size retailers with 10+ locations. This addresses the growth stall by capturing higher-value customers while leveraging existing product capabilities. Start by identifying 20 potential enterprise accounts from your current user base and conducting discovery calls. Success looks like 5 enterprise customers within 90 days, adding $2,500+ MRR."

    OUTPUT FORMAT:
    Return ONLY a valid JSON object with a key "suggestions" containing a list of objects.
    Each object must have: 'title', 'description', 'impact_score' (1-10), and 'difficulty' (Low/Medium/High).
    Do not output markdown or explanations, just the JSON.
    """

    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert startup strategy advisor. Always provide detailed, actionable advice with specific steps and expected outcomes. Respond only in valid JSON format."},
                {"role": "user", "content": prompt}
            ],
            model=settings.LLM_MODEL,
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f'{{"error": "{str(e)}"}}'
