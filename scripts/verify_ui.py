"""
Comprehensive Browser UI/UX and Responsiveness Audit for TradeTrust
Tests:
1. Responsiveness across 320px, 375px, 768px, 1024px, 1440px, 1920px
2. Zero horizontal overflow (scrollWidth <= clientWidth)
3. Navbar positioning, fixed height, and zero overlap with hero/anchors
4. Mobile menu toggle and touch drawer
5. How It Works product demo video player and interactive 4-stage synchronization
6. Merchant dashboard, apply, offers, privacy, and commerce views
"""

import sys
import time
from playwright.sync_api import sync_playwright

TEST_WIDTHS = [320, 375, 768, 1024, 1440, 1920]
BASE_URL = "http://localhost:3000"

print("=" * 65)
print("TradeTrust Automated Browser UI/UX & Responsive Testing")
print("=" * 65)

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

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
        headless=True
    )

    # 1. TEST ALL RESPONSIVE VIEWPORT SIZES FOR OVERFLOW & NAVBAR
    print("\n1. Testing Responsive Viewports & Horizontal Overflow:")
    for width in TEST_WIDTHS:
        page = browser.new_page(viewport={"width": width, "height": 900})
        page.goto(BASE_URL, wait_until="networkidle")

        # Check for horizontal scroll / overflow
        scroll_width = page.evaluate("() => document.documentElement.scrollWidth")
        client_width = page.evaluate("() => document.documentElement.clientWidth")
        check(scroll_width <= client_width + 1, f"Viewport {width}px: Zero horizontal overflow ({scroll_width}px <= {client_width}px)")

        # Check navbar height & positioning
        nav_height = page.evaluate("() => document.querySelector('header').getBoundingClientRect().height")
        check(nav_height >= 70 and nav_height <= 76, f"Viewport {width}px: Navbar predictable height ({nav_height}px)")

        # Verify hero content is not obscured by navbar
        hero_top = page.evaluate("() => document.querySelector('h1').getBoundingClientRect().top")
        check(hero_top > nav_height, f"Viewport {width}px: Hero headline is completely visible below navbar (top: {hero_top:.1f}px > {nav_height}px)")

        page.close()

    # 2. TEST MOBILE & TABLET HAMBURGER DRAWER
    print("\n2. Testing Mobile / Tablet Navigation Drawer (375px & 768px):")
    for mobile_w in [375, 768]:
        page = browser.new_page(viewport={"width": mobile_w, "height": 812})
        page.goto(BASE_URL, wait_until="networkidle")

        # Hamburger toggle button should be visible
        toggle_btn = page.locator("button[aria-label='Toggle navigation menu']")
        check(toggle_btn.is_visible(), f"Viewport {mobile_w}px: Mobile hamburger button is visible")

        # Click hamburger to open drawer
        toggle_btn.click()
        time.sleep(0.3)

        drawer = page.locator("header div.lg\\:hidden")
        check(drawer.is_visible(), f"Viewport {mobile_w}px: Navigation drawer opens smoothly on tap")

        # Verify escape key closes menu
        page.keyboard.press("Escape")
        time.sleep(0.3)
        check(not drawer.is_visible(), f"Viewport {mobile_w}px: Escape key closes navigation drawer")

        page.close()

    # 3. TEST HOW IT WORKS VIDEO PLAYER & INTERACTIVE CHAPTERS
    print("\n3. Testing How It Works Product Demo Player & Synchronized Chapters (1440px):")
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(f"{BASE_URL}/#how-it-works", wait_until="networkidle")
    time.sleep(0.5)

    # Check anchor offset (navbar must not obscure How It Works title)
    title_top = page.evaluate("() => document.getElementById('how-it-works').getBoundingClientRect().top")
    check(title_top >= 50, f"Anchor Scroll: 'How It Works' section is not obscured by sticky navbar (top: {title_top:.1f}px)")

    # Check video element and poster
    video_el = page.query_selector("video")
    if video_el:
        video_src = page.evaluate("() => document.querySelector('video')?.getAttribute('src')")
        poster_src = page.evaluate("() => document.querySelector('video')?.getAttribute('poster')")
        check(video_src == "/demo/tradetrust-demo.mp4", f"Video src correctly set: {video_src}")
        check(poster_src == "/demo/tradetrust-demo-poster.png", f"Poster image correctly set: {poster_src}")
    else:
        # Check fallback preview container
        fallback_visible = page.locator("text=Interactive Product Preview").is_visible()
        check(fallback_visible, "Product player preview container is rendered")

    # Check the 4 interactive stages
    stages = page.locator("button:has-text('STAGE')")
    check(page.locator("text=Interactive 4-Stage Workflow").is_visible(), "Interactive 4-stage workflow container is rendered")

    # Click Stage 2 (Protect)
    page.click("button:has-text('Protect')")
    time.sleep(0.3)
    active_chapter = page.evaluate("() => document.querySelector('[data-testid=\"active-chapter-label\"]')?.textContent")
    check("02" in str(active_chapter) or "Protect" in str(active_chapter), f"Clicking Stage 2 seeks chapter to: {active_chapter}")

    # Click Stage 4 (Execute)
    page.click("button:has-text('Execute')")
    time.sleep(0.3)
    active_chapter_4 = page.evaluate("() => document.querySelector('[data-testid=\"active-chapter-label\"]')?.textContent")
    check("04" in str(active_chapter_4) or "Execute" in str(active_chapter_4), f"Clicking Stage 4 seeks chapter to: {active_chapter_4}")

    # 4. TEST MAJOR APP ROUTES FOR POLISH & FUNCTIONALITY
    print("\n4. Testing Major Application Routes for Visual Polish:")
    app_routes = [
        ("/app", "Merchant Financing Overview"),
        ("/app/apply", "Merchant Working-Capital Application"),
        ("/app/offers", "Lender Offer Marketplace"),
        ("/app/privacy", "Privacy Center & ZK Verification Studio"),
        ("/app/commerce", "AI Agentic Commerce Terminal"),
        ("/lender", "BlueHarbor Micro-Credit Fund"),
        ("/lender/requests", "Merchant Financing Requests"),
        ("/settings", "Platform Settings & Configurations"),
        ("/docs", "TradeTrust Technical Architecture"),
    ]

    for route, expected_text in app_routes:
        page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
        body_text = page.inner_text("body")
        check(expected_text in body_text, f"Route {route}: Renders cleanly with expected content '{expected_text}'")

    page.close()
    browser.close()

print("\n" + "=" * 65)
print(f"Audit Summary: {passed} PASSED, {failed} FAILED")
print("=" * 65)

if failed > 0:
    sys.exit(1)
