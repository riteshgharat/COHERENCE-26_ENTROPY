import asyncio
from py_compile import main
from linkedin_scraper import BrowserManager, PersonScraper, wait_for_manual_login

async def create_session():
    async with BrowserManager(headless=False) as browser:
        await browser.page.goto("https://www.linkedin.com/login")

        print("Log in to LinkedIn in this window...")
        # give yourself plenty of time
        await wait_for_manual_login(browser.page, timeout=900)

        await browser.save_session("session.json")
        print("✓ Session saved, closing browser.")

# async def main():
#     # Initialize browser
#     async with BrowserManager(headless=False) as browser:
#         # Load authenticated session
#         await browser.load_session("session.json")
        
#         # Create scraper
#         scraper = PersonScraper(browser.page)
        
#         # Scrape a profile
#         person = await scraper.scrape("https://linkedin.com/in/williamhgates/")
        
#         # Access data
#         print(f"Name: {person.name}")
#         print(f"Headline: {person.headline}")
#         print(f"Location: {person.location}")
#         print(f"Experiences: {len(person.experiences)}")
#         print(f"Education: {len(person.educations)}")

asyncio.run(create_session())