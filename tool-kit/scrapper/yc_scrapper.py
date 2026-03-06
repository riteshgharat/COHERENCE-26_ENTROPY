from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup


def scrape_startups():
    url = "https://www.ycombinator.com/companies"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        html = page.content()
        soup = BeautifulSoup(html, "html.parser")
        companies = []

        for card in soup.select(".company-card"):
            name = card.select_one(".name").text
            website = card.select_one("a")["href"]

            companies.append({"company": name, "website": website})

        browser.close()

    return companies
