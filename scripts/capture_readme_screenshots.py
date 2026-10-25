import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.join(os.getcwd(), "docs", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)
BASE_URL = "http://localhost:3000"

def capture_screenshots():
    print(f"Capturing screenshots to {OUTPUT_DIR}...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
            headless=True
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1.5)
        page = context.new_page()

        # 1. Homepage Dark Mode
        print("1. Capturing Homepage Dark Mode...")
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "01-hero-dark.png"), full_page=False)

        # 2. Homepage Light Mode
        print("2. Capturing Homepage Light Mode...")
        light_btn = page.locator("button:has-text('Light')").first
        if light_btn.is_visible():
            light_btn.click()
            time.sleep(0.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "02-hero-light.png"), full_page=False)
            # Switch back to dark mode
            page.locator("button:has-text('Dark')").first.click()
            time.sleep(0.5)

        # 3. How It Works & Video Player Section
        print("3. Capturing How It Works Demo Section...")
        page.evaluate("() => document.getElementById('how-it-works')?.scrollIntoView()")
        time.sleep(0.8)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "03-how-it-works-video.png"), full_page=False)

        # 4. Multi-Wallet Connect Modal
        print("4. Capturing Multi-Wallet Modal...")
        page.evaluate("() => window.scrollTo(0, 0)")
        time.sleep(0.3)
        page.locator("button:has-text('Connect Wallet')").first.click()
        time.sleep(0.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "12-multi-wallet-modal.png"), full_page=False)
        # Connect demo wallet so dashboards show rich connected state
        demo_btn = page.locator("button:has-text('Demo Sandbox Wallet')").first
        if demo_btn.is_visible():
            demo_btn.click(force=True)
            time.sleep(0.8)

        # 5. Merchant Dashboard (/app)
        print("5. Capturing Merchant Dashboard...")
        page.goto(f"{BASE_URL}/app")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "04-merchant-dashboard.png"), full_page=False)

        # 6. Merchant Working-Capital Application (/app/apply)
        print("6. Capturing Financing Application...")
        page.goto(f"{BASE_URL}/app/apply")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "05-financing-application.png"), full_page=False)

        # 7. ZK Privacy Studio (/app/privacy)
        print("7. Capturing ZK Privacy Studio...")
        page.goto(f"{BASE_URL}/app/privacy")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "06-zk-privacy-studio.png"), full_page=False)

        # 8. Lender Portal Overview (/lender)
        print("8. Capturing Lender Portal...")
        page.goto(f"{BASE_URL}/lender")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "07-lender-underwriting.png"), full_page=False)

        # 9. Lender Request Underwriting Dossier (/lender/requests/REQ-2026-001)
        print("9. Capturing Lender Request Underwriting Dossier...")
        page.goto(f"{BASE_URL}/lender/requests/REQ-2026-001")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "08-lender-request-dossier.png"), full_page=False)

        # 10. Bitrefill Agentic Commerce Terminal (/app/commerce)
        print("10. Capturing Bitrefill Agentic Commerce...")
        page.goto(f"{BASE_URL}/app/commerce")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "09-agentic-commerce.png"), full_page=False)

        # 11. Cash-Flow Stress Simulator (/app/stress-test)
        print("11. Capturing Cash-Flow Stress Simulator...")
        page.goto(f"{BASE_URL}/app/stress-test")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "10-stress-simulator.png"), full_page=False)

        # 12. Cash-Flow Passport & Credential Registry (/app/credentials)
        print("12. Capturing Cash-Flow Passport...")
        page.goto(f"{BASE_URL}/app/credentials")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "11-cash-flow-passport.png"), full_page=False)

        browser.close()
        print("All screenshots successfully captured!")

if __name__ == "__main__":
    capture_screenshots()
