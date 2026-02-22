import asyncio
from playwright.async_api import async_playwright
import json

async def scrape_openvc(url):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Using a standard user agent to avoid looking like a bot
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()
        
        print(f"Scraping OpenVC list: {url}")
        await page.goto(url, wait_until="networkidle")
        
        # We inject JavaScript to parse the DOM directly in the browser
        investors = await page.evaluate("""() => {
            // Note: You will need to right-click -> 'Inspect' on OpenVC 
            // to confirm these exact CSS class names, as they update their UI occasionally.
            const cards = Array.from(document.querySelectorAll('.investor-card, tr'));
            
            return cards.map(card => ({
                name: card.querySelector('.name, h3')?.innerText.trim() || 'Unknown',
                type: card.querySelector('.investor-type, .badge')?.innerText.trim() || 'VC',
                checkSize: card.querySelector('.check-size')?.innerText.trim() || 'N/A',
                location: card.querySelector('.location, .country')?.innerText.trim() || 'Global'
            })).filter(inv => inv.name !== 'Unknown');
        }""")
        
        await browser.close()
        return investors

if __name__ == "__main__":
    # Example targeting their Developer Tools / SaaS investor list
    target = "https://www.openvc.app/investor-lists/developer-tools-investors"
    
    data = asyncio.run(scrape_openvc(target))
    print(f"Successfully scraped {len(data)} investors.")
    
    # Save the JSON straight into your Vite project's data directory
    with open('investors.json', 'w') as f:
        json.dump(data, f, indent=2)
