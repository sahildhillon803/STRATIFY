import pandas as pd
import io
import json
import logging
from fastapi import UploadFile, HTTPException
from app.models.financial import FinancialRecord
from app.models.user import User
from app.core.config import settings
from groq import Groq

# Configure logging
logger = logging.getLogger(__name__)

async def process_csv_upload(user: User, file_path: str = "cleaned_investors.csv"):
    # Now you can use file_path to load the data!
    import pandas as pd
    
    # This reads the actual file from that location
    df = pd.read_csv(file_path)
    """
    Smart CSV Import:
    1. Tries to use AI (Groq) to map your CSV columns to our database.
    2. If AI fails, falls back to "Fuzzy Matching" (guessing based on names).
    3. Saves data to MongoDB.
    """
    
    # 1. Read the file using Pandas (handles CSVs better than standard lib)
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        # Clean: fill empty cells with 0
        df = df.fillna(0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {str(e)}")

    columns = list(df.columns)
    logger.info(f"CSV Headers Found: {columns}")

    # ---------------------------------------------------------
    # STEP 2: The "Smart" Mapping (AI + Fallback)
    # ---------------------------------------------------------
    
    # Target fields we need in the database
    # We map 'revenue' -> 'revenue_recurring' for simplicity in this view
    mapping = {}
    
    # Try AI Mapping first
    ai_success = False
    try:
        # Check if key exists and isn't the placeholder
        if settings.GROQ_API_KEY and "gsk_" in settings.GROQ_API_KEY:
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            prompt = f"""
            I have a CSV with these headers: {columns}.
            I need to map them to these database fields: 
            ['month', 'revenue_recurring', 'expenses_salaries', 'cash_balance']
            
            Rules:
            - 'month' matches dates (e.g. Date, Month, Period)
            - 'revenue_recurring' matches income (e.g. Revenue, Sales, Income)
            - 'expenses_salaries' matches costs (e.g. Expenses, Cost, Burn)
            - 'cash_balance' matches cash (e.g. Cash, Bank, Balance)
            
            Return ONLY a valid JSON object mapping CSV headers to DB fields. 
            Example: {{"My Date Col": "month", "Total Sales": "revenue_recurring"}}
            """
            
            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.0
            )
            
            response_text = completion.choices[0].message.content
            # Extract JSON cleanly
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            mapping = json.loads(response_text[start:end])
            ai_success = True
            logger.info(f"AI Mapping Used: {mapping}")
    except Exception as e:
        logger.warning(f"AI Mapping failed: {e}. Switching to Manual Fallback.")

    # Fallback: Manual "Fuzzy" Matching if AI failed or didn't map everything
    if not ai_success or not mapping:
        for col in columns:
            col_lower = col.lower()
            if 'date' in col_lower or 'month' in col_lower or 'period' in col_lower:
                mapping[col] = 'month'
            elif 'rev' in col_lower or 'income' in col_lower or 'sales' in col_lower:
                mapping[col] = 'revenue_recurring'
            elif 'exp' in col_lower or 'cost' in col_lower or 'burn' in col_lower:
                mapping[col] = 'expenses_salaries'
            elif 'cash' in col_lower or 'balance' in col_lower or 'bank' in col_lower:
                mapping[col] = 'cash_balance'
        logger.info(f"Fallback Mapping Used: {mapping}")

    # ---------------------------------------------------------
    # STEP 3: Save to Database
    # ---------------------------------------------------------
    records_saved = 0
    errors = []

    # Invert mapping to find which CSV column goes to which DB field
    # e.g. {'month': 'Date Column', ...}
    db_map = {v: k for k, v in mapping.items()}

    for index, row in df.iterrows():
        try:
            # 1. Get Month (Required)
            col_name = db_map.get('month')
            month_val = str(row[col_name]) if col_name else "2024-01"
            
            # 2. Get Values (Safely handle $ symbols and commas)
            def clean_val(field_key):
                col = db_map.get(field_key)
                if not col: return 0.0
                val = str(row[col]).replace('$', '').replace(',', '').strip()
                try:
                    return float(val)
                except:
                    return 0.0

            rev = clean_val('revenue_recurring')
            exp = clean_val('expenses_salaries')
            cash = clean_val('cash_balance')

            # 3. Update or Create in DB
            existing = await FinancialRecord.find_one(
                FinancialRecord.user.id == user.id,
                FinancialRecord.month == month_val
            )

            if existing:
                existing.revenue_recurring = rev
                existing.expenses_salaries = exp
                existing.cash_balance = cash
                await existing.save()
            else:
                new_rec = FinancialRecord(
                    user=user,
                    month=month_val,
                    revenue_recurring=rev,
                    expenses_salaries=exp,
                    cash_balance=cash
                )
                await new_rec.create()
            
            records_saved += 1

        except Exception as e:
            errors.append(f"Row {index}: {str(e)}")

    return {
        "status": "success",
        "processed": len(df),
        "saved": records_saved,
        "mapping_used": mapping,
        "errors": errors
    }