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
        ### ROLE
        You are a veteran Y Combinator-level startup advisor and turnaround expert. You have a reputation for ruthless prioritization and financial discipline. Your goal is to save startups from failure or skyrocket their growth based strictly on their data.

        ### INPUT DATA
        FINANCIAL SUMMARY:
        {financial_summary}

        STARTUP CONTEXT:
        {startup_context}

        ### INSTRUCTIONS
        1. Analyze the financial health first. Calculate implied runway (Cash / Burn).
        - IF RUNWAY < 6 MONTHS: Prioritize survival, cost-cutting, and immediate revenue realization (pivots).
        - IF RUNWAY > 12 MONTHS: Prioritize aggressive scaling and market capture (growth).
        2. Generate 3-4 distinct, high-impact strategies tailored to this specific scenario.

        ### STRATEGY REQUIREMENTS
        For each strategy object, provide:
        1. "title": Action-oriented and specific (e.g., "Kill Freemium Tier," not "Change Pricing").
        2. "description": A dense, high-value paragraph (3-5 sentences) strictly following this structure:
        - [THE DIAGNOSIS]: Identify the specific financial or structural bottleneck.
        - [THE PRESCRIPTION]: The exact strategic move to make.
        - [THE EXECUTION]: A concrete first step to take tomorrow.
        - [THE RESULT]: Quantifiable financial outcome (e.g., "Reduces burn by 15%").
        3. "impact_score" (1-10): 10 being "Company saving/defining."
        4. "difficulty" (Low/Medium/High): Based on engineering lift and operational drag.

        ### OUTPUT FORMAT
        Return ONLY raw, valid JSON. Do not include markdown formatting (like ```json), introduction, or conclusion.

        Expected JSON Structure:
        {{
        "suggestions": [
            {{
            "title": "String",
            "description": "String",
            "impact_score": Integer,
            "difficulty": "String"
            }}
        ]
        }}
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
