import pandas as pd
import torch
from sentence_transformers import SentenceTransformer, util
from app.core.config import settings
import os
from pathlib import Path

# Load a lightweight NLP model for Semantic Search
embedder = SentenceTransformer('all-MiniLM-L6-v2')

class InvestorMatchingService:
    def __init__(self):
        backend_dir = Path(__file__).resolve().parent.parent.parent
        csv_path = backend_dir / 'cleaned_investors.csv'
        print(f"--- STARTIFY ENGINE: Loading VC data from {csv_path} ---")
        
        self.df = pd.read_csv(csv_path)
        
        # 1. Fill missing values
        self.df['global_hq'] = self.df['global_hq'].fillna("Location Unknown").astype(str)
        self.df['website'] = self.df['website'].fillna("")
        self.df['investor_name'] = self.df['investor_name'].fillna("Unknown Investor")
        self.df['investor_type'] = self.df['investor_type'].fillna("VC")
        self.df['stage_of_investment'] = self.df['stage_of_investment'].fillna("")
        
        # 2. Extract just the Country for the dropdown UI
        def extract_country(loc):
            if loc == "Location Unknown": return loc
            parts = [p.strip() for p in loc.split(',')]
            return parts[-1] if len(parts) > 0 else loc
            
        self.df['dropdown_hq'] = self.df['global_hq'].apply(extract_country)
        
        # 3. Calculate embeddings
        self.thesis_embeddings = embedder.encode(self.df['investment_thesis'].tolist(), convert_to_tensor=True)

    def get_filter_options(self):
        hqs = sorted(list(set([
            x for x in self.df['dropdown_hq'].tolist() 
            if x and x != 'Location Unknown'
        ])))
        
        stage_set = set()
        for stages_str in self.df['stage_of_investment']:
            parts = [s.strip() for s in stages_str.split('|') if s.strip()]
            stage_set.update(parts)
            
        return {
            "hqs": hqs,
            "stages": sorted(list(stage_set))
        }

    def filter_investors(self, stage: str = "All", hq: str = "All", sort_by: str = 'name_asc', limit: int = 50, skip: int = 0):
        filtered_df = self.df.copy()

        if stage and stage != 'All':
            filtered_df = filtered_df[filtered_df['stage_of_investment'].str.contains(stage, case=False, na=False)]
        
        if hq and hq != 'All':
            filtered_df = filtered_df[filtered_df['global_hq'].str.contains(hq, case=False, na=False, regex=False)]

        if sort_by == 'name_asc':
            filtered_df.sort_values(by='investor_name', ascending=True, inplace=True)
        elif sort_by == 'name_desc':
            filtered_df.sort_values(by='investor_name', ascending=False, inplace=True)
        elif sort_by == 'cheque_desc' and 'first_cheque_maximum' in filtered_df.columns:
            filtered_df.sort_values(by='first_cheque_maximum', ascending=False, inplace=True)

        total_count = len(filtered_df)
        subset = filtered_df.iloc[skip : skip + limit]

        results = []
        for idx, row in subset.iterrows():
            results.append({
                "investor_id": int(idx),
                "name": str(row.get('investor_name', 'Unknown Investor')),
                "match_score": 0, 
                "website": str(row.get('website', '')),
                "hq": str(row.get('dropdown_hq', 'Location Unknown')), 
                "type": str(row.get('investor_type', 'VC'))
            })
            
        return results, total_count

    # --- RESTORED AI MATCHMAKER METHOD ---
    async def get_matches(self, startup_id: int, startup_description: str, raise_amount: float, stage: str):
        # 1. Add a 20% buffer so $1.1M matches with VCs looking for $1M
        min_acceptable = raise_amount * 0.8
        max_acceptable = raise_amount * 1.2
        
        # 2. INDESTRUCTIBLE FILTER: Fill NaNs with 0 and Infinity so we don't lose data!
        mask = (
            (self.df['first_cheque_minimum'].fillna(0) <= max_acceptable) & 
            (self.df['first_cheque_maximum'].fillna(9999999999) >= min_acceptable) &
            (self.df['stage_of_investment'].str.contains(stage, case=False, na=False))
        )
        filtered_df = self.df[mask].copy()

        # 3. If STILL empty, just grab the top 50 VCs in that stage regardless of check size
        if filtered_df.empty:
            print(f"⚠️ Check size filter failed for ${raise_amount:,.0f}. Ignoring check size...")
            fallback_mask = self.df['stage_of_investment'].str.contains(stage, case=False, na=False)
            filtered_df = self.df[fallback_mask].copy()

        if filtered_df.empty:
            print("❌ TOTAL FAILURE: No investors match this stage at all.")
            return []

        # 4. Run Semantic AI Search
        startup_vec = embedder.encode(startup_description, convert_to_tensor=True)
        subset_indices = filtered_df.index.tolist()
        subset_embeddings = self.thesis_embeddings[subset_indices]
        cosine_scores = util.cos_sim(startup_vec, subset_embeddings)[0]

        results = []
        for i, idx in enumerate(subset_indices):
            row = filtered_df.loc[idx]
            results.append({
                "investor_id": idx,
                "name": str(row['investor_name']),
                "match_score": float(cosine_scores[i]),
                "website": str(row['website']),
                "hq": str(row['dropdown_hq']),
                "type": str(row['investor_type'])
            })

        results.sort(key=lambda x: x['match_score'], reverse=True)
        return results[:10]

# Instantiate once on startup
print("🧠 Booting up global Startify AI Engine in memory...")
investor_service_instance = InvestorMatchingService()