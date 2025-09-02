import re
from playwright.sync_api import Page, expect

def test_dark_mode_toggle(page: Page):
    # 1. Arrange: Go to the homepage.
    page.goto("http://localhost:3001")

    # 2. Act: Take a screenshot of the light mode.
    page.screenshot(path="jules-scratch/verification/light-mode.png")

    # 3. Act: Find the theme toggle and click it.
    # The toggle is a switch, so we can get it by its role.
    theme_toggle = page.get_by_role("switch")
    theme_toggle.click()

    # 4. Assert: Wait for the dark mode to be applied.
    # We can check that the html element has the class "dark".
    expect(page.locator("html")).to_have_class(re.compile(r"\bdark\b"))

    # 5. Act: Take a screenshot of the dark mode.
    page.screenshot(path="jules-scratch/verification/dark-mode.png")
