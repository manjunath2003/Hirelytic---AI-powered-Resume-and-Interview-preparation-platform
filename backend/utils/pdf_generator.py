from playwright.sync_api import sync_playwright
import os


def generate_pdf_from_html(html_content, output_path):
    """
    Generates a pixel-perfect PDF from HTML using Playwright (Chromium)
    """

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()

        page = browser.new_page()

        # Load HTML content
        page.set_content(html_content, wait_until="networkidle")

        # Generate PDF (A4 format)
        page.pdf(
            path=output_path,
            format="A4",
            print_background=True
        )

        browser.close()
        