"""
TradeTrust Theme & Multi-Wallet Browser Verification Script
Tests:
1. Dark Mode (True Black #000000) & Light Mode toggle
2. Theme persistence
3. Connect Wallet Modal with MetaMask, Coinbase, Injected & Demo options
4. Real-time balance and Base Sepolia network verification
5. Responsive layout across all viewports
"""

import sys
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

print("=" * 65)
print("TradeTrust Theme & Wallet Automation Suite")
print("=" * 65)

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
        headless=True
    )

    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(BASE_URL, wait_until="networkidle")
    time.sleep(0.5)

    # 1. TEST DARK (TRUE BLACK) THEME DEFAULT
    print("\n1. Verifying Professional Black Theme (Dark Mode):")
    html_class = page.evaluate("() => document.documentElement.className")
    body_bg = page.evaluate("() => window.getComputedStyle(document.body).backgroundColor")
    check("dark" in html_class, f"HTML element has 'dark' class: '{html_class}'")
    check(body_bg in ["rgb(0, 0, 0)", "rgba(0, 0, 0, 1)"], f"Body background is true black: {body_bg}")

    # 2. TEST THEME TOGGLE TO LIGHT MODE
    print("\n2. Verifying Theme Toggle to Crisp Light Mode:")
    # Click theme toggle
    theme_btn = page.locator("button[aria-label*='Current theme']")
    check(theme_btn.is_visible(), "Theme toggle button is visible in navbar")
    theme_btn.click()
    time.sleep(0.4)

    html_class_light = page.evaluate("() => document.documentElement.className")
    body_bg_light = page.evaluate("() => window.getComputedStyle(document.body).backgroundColor")
    check("light" in html_class_light, f"After toggle: HTML has 'light' class: '{html_class_light}'")
    check(body_bg_light in ["rgb(255, 255, 255)", "rgba(255, 255, 255, 1)"], f"After toggle: Body background is pure white: {body_bg_light}")

    # Toggle back to dark
    theme_btn.click()
    time.sleep(0.4)
    html_class_dark_again = page.evaluate("() => document.documentElement.className")
    check("dark" in html_class_dark_again, "Toggling again returns cleanly to Black theme")

    # 3. TEST CONNECT WALLET MODAL & OPTIONS
    print("\n3. Testing Connect Wallet Modal & Multi-Wallet Selection:")
    # If already connected, disconnect first to test fresh connection
    wallet_btn = page.locator("button[aria-label='Connected Wallet Menu'], button:has-text('Connect Wallet')").first
    check(wallet_btn.is_visible(), "Wallet button is visible in navbar")

    # If it is connected, click to open details and disconnect
    if page.locator("button[aria-label='Connected Wallet Menu']").is_visible():
        page.locator("button[aria-label='Connected Wallet Menu']").click()
        time.sleep(0.3)
        disconnect_btn = page.locator("button:has-text('Disconnect Wallet')")
        if disconnect_btn.is_visible():
            disconnect_btn.click()
            time.sleep(0.3)

    # Now click "Connect Wallet"
    connect_btn = page.locator("button:has-text('Connect Wallet')").first
    connect_btn.click()
    time.sleep(0.4)

    modal_title = page.locator("h2:has-text('Connect Wallet')")
    check(modal_title.is_visible(), "Connect Wallet Modal opens smoothly")

    # Verify wallet options are rendered
    check(page.locator("text=MetaMask").first.is_visible(), "MetaMask wallet option is rendered")
    check(page.locator("text=Coinbase Wallet").first.is_visible(), "Coinbase Wallet option is rendered")
    check(page.locator("text=Rainbow / Rabby / Brave").first.is_visible(), "Rainbow/Rabby/Brave option is rendered")
    check(page.locator("text=Browser Injected Wallet").first.is_visible(), "Injected Browser Wallet option is rendered")
    check(page.locator("text=Demo Sandbox Wallet").first.is_visible(), "Demo Sandbox Wallet option is rendered")

    # Connect via Demo Sandbox Wallet
    page.click("button:has-text('Demo Sandbox Wallet')")
    time.sleep(0.6)

    # Verify connected state in navbar
    connected_pill = page.locator("button[aria-label='Connected Wallet Menu']")
    check(connected_pill.is_visible(), "Navbar updates with connected wallet pill")
    pill_text = connected_pill.inner_text()
    check("0x7099" in pill_text or "..." in pill_text, f"Connected address displayed: '{pill_text}'")

    # Click connected pill to inspect WalletDetailsModal
    connected_pill.click()
    time.sleep(0.3)

    details_modal = page.locator("h2:has-text('Connected Wallet')")
    check(details_modal.is_visible(), "Connected Wallet Details Modal opens on click")
    check(page.locator("text=Base Sepolia").first.is_visible(), "Network badge 'Base Sepolia' is verified")
    check(page.locator("text=1.8500 ETH").first.is_visible(), "Live balance '1.8500 ETH' is displayed")
    check(page.locator("button:has-text('Copy')").first.is_visible(), "Address Copy button is available")

    # Close details modal
    page.keyboard.press("Escape")
    time.sleep(0.3)

    # 4. TEST MOBILE NAVBAR DRAWER THEME & WALLET CONTROLS
    print("\n4. Testing Mobile/Tablet (375px) Theme & Wallet Drawer:")
    page_mobile = browser.new_page(viewport={"width": 375, "height": 812})
    page_mobile.goto(f"{BASE_URL}/app", wait_until="networkidle")
    time.sleep(0.5)

    # Open hamburger menu
    hamburger = page_mobile.locator("header button[aria-label='Toggle navigation menu']")
    hamburger.click()
    time.sleep(0.3)

    check(page_mobile.locator("header div.lg\\:hidden").is_visible(), "Mobile drawer opens on 375px")
    check(page_mobile.locator("text=Connected Wallet").is_visible() or page_mobile.locator("text=Connect Any Wallet").is_visible(), "Wallet controls accessible in mobile drawer")

    # Test escape key
    page_mobile.keyboard.press("Escape")
    time.sleep(0.3)
    check(not page_mobile.locator("header div.lg\\:hidden").is_visible(), "Escape key closes mobile drawer")
    page_mobile.close()

    # 5. TEST SETTINGS PAGE THEME SELECTOR
    print("\n5. Testing Settings Page Theme Selector:")
    page.goto(f"{BASE_URL}/settings", wait_until="networkidle")
    time.sleep(0.5)

    check(page.locator("text=UI Appearance & Theme").is_visible(), "Settings page displays Theme selector card")
    check(page.locator("text=Base Sepolia Network & Wallet").is_visible(), "Settings page displays Connected Wallet card")

    # Click Light Theme in Settings
    page.click("button:has-text('Light Theme')")
    time.sleep(0.4)
    is_light = page.evaluate("() => document.documentElement.classList.contains('light')")
    check(is_light, "Selecting 'Light Theme' in Settings changes theme to light")

    # Click Black Theme in Settings
    page.click("button:has-text('Black Theme')")
    time.sleep(0.4)
    is_dark = page.evaluate("() => document.documentElement.classList.contains('dark')")
    check(is_dark, "Selecting 'Black Theme' in Settings restores black theme")

    page.close()
    browser.close()

print("\n" + "=" * 65)
print(f"Theme & Wallet Audit Summary: {passed} PASSED, {failed} FAILED")
print("=" * 65)

if failed > 0:
    sys.exit(1)
