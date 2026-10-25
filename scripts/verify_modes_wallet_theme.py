import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
passed = 0
failed = 0

def check(condition, message):
    global passed, failed
    if condition:
        print(f"  [PASS] {message}")
        passed += 1
    else:
        print(f"  [FAIL] {message}")
        failed += 1

def run_tests():
    global passed, failed
    print("=" * 70)
    print("TradeTrust Verification: Dual Modes, Real Wallet & Explicit Theme")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
            headless=True
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Clean storage for fresh initial visit
        page.goto(BASE_URL)
        page.evaluate("() => { localStorage.clear(); sessionStorage.clear(); }")
        page.reload(wait_until="networkidle")
        time.sleep(0.5)

        # -------------------------------------------------------------
        # TEST 1: NO HARDCODED WALLET ADDRESS ON INITIAL LOAD
        # -------------------------------------------------------------
        print("\n1. Verifying No Hardcoded Wallet Address on Initial Load:")
        content = page.content()
        # Must NOT show 0x7099... on initial load
        check("0x7099" not in content, "No legacy hardcoded wallet address '0x7099...' displayed")
        
        # Must show "Connect Wallet" button
        connect_btn = page.locator("button:has-text('Connect Wallet')").first
        check(connect_btn.is_visible(), "Prominent 'Connect Wallet' button is visible in navbar")

        # Open connect wallet modal
        connect_btn.click()
        time.sleep(0.4)
        check(page.locator("h2:has-text('Connect Wallet')").is_visible(), "Multi-wallet connection modal opened")
        check(page.locator("text=MetaMask").first.is_visible(), "MetaMask wallet option available")
        check(page.locator("text=Coinbase Wallet").first.is_visible(), "Coinbase wallet option available")
        check(page.locator("text=Browser Injected Wallet").first.is_visible(), "Browser Injected wallet option available")
        check(page.locator("text=Demo Sandbox Wallet").first.is_visible(), "Sandbox demo wallet option available")
        
        # Close modal
        page.locator("button[aria-label='Close modal']").click()
        time.sleep(0.3)

        # -------------------------------------------------------------
        # TEST 2: EXPLICIT DARK AND LIGHT MODE OPTIONS
        # -------------------------------------------------------------
        print("\n2. Verifying Explicit Dark & Light Mode Toggle:")
        dark_btn = page.locator("button:has-text('Dark')").first
        light_btn = page.locator("button:has-text('Light')").first
        check(dark_btn.is_visible(), "Explicit 'Dark' button is visible in navbar with text")
        check(light_btn.is_visible(), "Explicit 'Light' button is visible in navbar with text")

        # Verify initial Dark Mode (True Black)
        body_bg = page.evaluate("() => window.getComputedStyle(document.body).backgroundColor")
        check(body_bg == "rgb(0, 0, 0)", f"Default theme is True Black (#000000): {body_bg}")

        # Switch to Light Mode
        light_btn.click()
        time.sleep(0.4)
        light_bg = page.evaluate("() => window.getComputedStyle(document.body).backgroundColor")
        html_class = page.evaluate("() => document.documentElement.className")
        check("light" in html_class, f"HTML class updated to 'light': {html_class}")
        check(light_bg == "rgb(255, 255, 255)", f"Body background switched to crisp white: {light_bg}")

        # Switch back to Dark Mode
        dark_btn.click()
        time.sleep(0.4)
        dark_bg = page.evaluate("() => window.getComputedStyle(document.body).backgroundColor")
        html_class_dark = page.evaluate("() => document.documentElement.className")
        check("dark" in html_class_dark, f"HTML class restored to 'dark': {html_class_dark}")
        check(dark_bg == "rgb(0, 0, 0)", f"Body background restored to True Black: {dark_bg}")

        # -------------------------------------------------------------
        # TEST 3: DUAL MODES IN ONE SITE (MERCHANT & LENDER)
        # -------------------------------------------------------------
        print("\n3. Verifying Dual Modes (Merchant & Lender):")
        merchant_mode_btn = page.locator("a:has-text('Merchant Mode')").first
        lender_mode_btn = page.locator("a:has-text('Lender Mode')").first
        check(merchant_mode_btn.is_visible(), "Prominent 'Merchant Mode' button visible in navbar")
        check(lender_mode_btn.is_visible(), "Prominent 'Lender Mode' button visible in navbar")

        # Switch to Lender Mode
        lender_mode_btn.click()
        page.wait_for_url("**/lender**", timeout=10000)
        time.sleep(0.5)
        check("/lender" in page.url, f"Navigated immediately to Lender Portal: {page.url}")
        check(page.locator("text=Lender Portfolio").first.is_visible() or page.locator("text=LENDER").first.is_visible(), "Lender Mode badge is active in sidebar")
        check(page.locator("a[href='/lender/requests']").first.is_visible(), "Lender workflow 'Merchant Requests' visible in navigation")
        check(page.locator("a[href='/lender/agreements']").first.is_visible(), "Lender workflow 'Active Agreements' visible in navigation")
        check(page.locator("a[href='/lender/analytics']").first.is_visible(), "Lender workflow 'Portfolio Analytics' visible in navigation")

        # In Lender mode, check sidebar also has Mode switcher & Theme switcher
        sidebar_merchant_btn = page.locator("aside a:has-text('Merchant')").first
        check(sidebar_merchant_btn.is_visible(), "Sidebar contains quick 'Merchant' mode switch button")

        sidebar_dark_btn = page.locator("aside button:has-text('Dark')").first
        sidebar_light_btn = page.locator("aside button:has-text('Light')").first
        check(sidebar_dark_btn.is_visible() and sidebar_light_btn.is_visible(), "Sidebar contains explicit 'Dark' and 'Light' appearance buttons")

        # Switch to Merchant Mode from sidebar
        sidebar_merchant_btn.click()
        page.wait_for_url("**/app**", timeout=10000)
        time.sleep(0.5)
        check("/app" in page.url, f"Navigated immediately to Merchant Hub: {page.url}")
        check(page.locator("text=Merchant Account").first.is_visible() or page.locator("text=MERCHANT").first.is_visible(), "Merchant Mode badge is active in sidebar")
        check(page.locator("a[href='/app/apply']").first.is_visible(), "Merchant tool 'Apply for Capital' visible in navigation")
        check(page.locator("a[href='/app/repayments']").first.is_visible(), "Merchant tool 'Repayments & Health' visible in navigation")
        check(page.locator("a[href='/app/stress-test']").first.is_visible(), "Merchant tool 'Stress Simulator' visible in navigation")

        # -------------------------------------------------------------
        # TEST 4: USER WALLET CONNECT INTERACTION
        # -------------------------------------------------------------
        print("\n4. Verifying Wallet Connection Flow:")
        sidebar_connect_btn = page.locator("aside button:has-text('Connect Wallet')").first
        check(sidebar_connect_btn.is_visible(), "Sidebar shows 'Connect Wallet' button when disconnected")
        
        sidebar_connect_btn.click()
        time.sleep(0.5)
        demo_btn = page.locator("button:has-text('Demo Sandbox Wallet')").first
        demo_btn.click(force=True)
        time.sleep(1.0)
        
        # After user explicitly connects:
        check(page.locator("aside").locator("text=Address:").first.is_visible(), "Sidebar now shows connected wallet address")
        check(page.locator("button[aria-label='Connected Wallet Menu']").is_visible(), "Navbar now shows connected wallet status pill")

        print("\n" + "=" * 70)
        print(f"Final Verification Results: {passed} PASSED, {failed} FAILED")
        print("=" * 70)

        browser.close()
        return failed == 0

if __name__ == "__main__":
    success = run_tests()
    if not success:
        exit(1)
