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

def test_dual_dashboards():
    global passed, failed
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
            headless=True
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("\n1. Testing Merchant Overview (/app):")
        page.goto(f"{BASE_URL}/app", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=Apex Provisions").first.is_visible() or page.locator("text=Overview").first.is_visible(), "Merchant business overview loaded")
        check(page.locator("a[href='/app/repayments']").first.is_visible(), "Sidebar links to /app/repayments")
        check(page.locator("a[href='/app/stress-test']").first.is_visible(), "Sidebar links to /app/stress-test")

        print("\n2. Testing Merchant Repayments Operations (/app/repayments):")
        page.goto(f"{BASE_URL}/app/repayments", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=Merchant Repayment Management").is_visible(), "Repayment management heading displayed")
        check(page.locator("text=Next Installment Due").is_visible(), "Next installment due card visible")
        check(page.locator("text=Cash-Flow Health Check").is_visible(), "Cash-Flow health status visible")
        
        # Test repayment modal open and close
        pay_btn = page.locator("button:has-text('Make Installment Payment')").first
        if pay_btn.is_visible():
            pay_btn.click()
            time.sleep(0.4)
            check(page.locator("text=Base Sepolia Repayment Settlement").is_visible(), "Base Sepolia repayment settlement modal opened")
            page.locator("button:has-text('Cancel')").first.click()
            time.sleep(0.3)

        print("\n3. Testing Cash-Flow Stress Simulator (/app/stress-test):")
        page.goto(f"{BASE_URL}/app/stress-test", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=Cash-Flow Stress Simulator").is_visible(), "Stress simulator heading displayed")
        check(page.locator("text=Debt Service Coverage Ratio").is_visible(), "DSCR metrics displayed")
        check(page.locator("text=Shock Scenario Variables").is_visible(), "Scenario stress variables panel present")
        check(page.locator("text=Simulated DSCR").is_visible(), "Simulated DSCR metric displayed")

        print("\n4. Testing Cash-Flow Passport & Credentials Registry (/app/credentials):")
        page.goto(f"{BASE_URL}/app/credentials", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=Cash-Flow Passport & Credentials Registry").is_visible(), "Credentials registry page loaded")
        
        # Tab: Passport
        passport_tab = page.locator("button:has-text('Passport Dossier')").first
        passport_tab.click()
        time.sleep(0.4)
        check(page.locator("text=SOVEREIGN IDENTITY").is_visible(), "Cash-flow passport dossier rendered")
        
        # Tab: Suppliers
        supplier_tab = page.locator("button:has-text('Supplier Trust')").first
        supplier_tab.click()
        time.sleep(0.4)
        check(page.locator("text=Verified Supplier Trust Network").is_visible(), "Supplier trust network rendered")
        
        # Tab: Disputes
        dispute_tab = page.locator("button:has-text('Correction & Dispute')").first
        dispute_tab.click()
        time.sleep(0.4)
        check(page.locator("text=Correction & Dispute Registry").is_visible(), "Correction & dispute registry rendered")

        print("\n5. Testing Lender Dashboard (/lender):")
        page.goto(f"{BASE_URL}/lender", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=BlueHarbor Micro-Credit Fund").first.is_visible(), "Lender portal header rendered")
        check(page.locator("text=Capital Available").first.is_visible(), "Liquid working-capital fund KPI rendered")
        check(page.locator("a[href='/lender/agreements']").first.is_visible(), "Sidebar links to /lender/agreements")
        check(page.locator("a[href='/lender/analytics']").first.is_visible(), "Sidebar links to /lender/analytics")

        print("\n6. Testing Lender Financing Requests (/lender/requests):")
        page.goto(f"{BASE_URL}/lender/requests", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=Merchant Financing Requests").is_visible(), "Merchant financing requests listed")
        check(page.locator("a:has-text('Audit Dossier')").first.is_visible(), "Audit Dossier button rendered")

        print("\n7. Testing Lender Request Detailed Dossier (/lender/requests/REQ-2026-001):")
        page.goto(f"{BASE_URL}/lender/requests/REQ-2026-001", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=UNDERWRITING DOSSIER").is_visible(), "Underwriting dossier badge displayed")
        check(page.locator("text=ZK Revenue Proof Verification Inspector").is_visible(), "ZK revenue proof inspector displayed")
        check(page.locator("text=Curve: alt_bn128 (BN254)").is_visible(), "BN254 curve verification displayed")
        check(page.locator("text=Underwrite & Issue Offer").is_visible(), "Offer issuance desk form displayed")

        print("\n8. Testing Lender Active Agreements (/lender/agreements):")
        page.goto(f"{BASE_URL}/lender/agreements", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=Active Financing Agreements").is_visible(), "Financing agreements portfolio displayed")
        check(page.locator("text=Repayment Progress").first.is_visible(), "Repayment progress meter displayed")
        check(page.locator("text=Total Capital Deployed").is_visible(), "Total capital deployed KPI displayed")

        print("\n9. Testing Lender Repayment Operations & Ledger (/lender/repayments):")
        page.goto(f"{BASE_URL}/lender/repayments", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=Lender Repayment Operations").is_visible(), "Lender repayment operations displayed")
        check(page.locator("text=REPAYMENT AUDIT LEDGER").is_visible(), "Audit ledger badge displayed")
        
        # Test record repayment modal
        rec_btn = page.locator("button:has-text('Record Repayment')").first
        rec_btn.click()
        time.sleep(0.4)
        check(page.locator("text=Record Verified Repayment").is_visible(), "Record repayment modal displayed")
        page.locator("button:has-text('Cancel')").first.click()
        time.sleep(0.3)

        print("\n10. Testing Lender Portfolio Analytics & Risk Intelligence (/lender/analytics):")
        page.goto(f"{BASE_URL}/lender/analytics", wait_until="networkidle")
        time.sleep(0.5)
        check(page.locator("text=Lender Portfolio Analytics").first.is_visible(), "Portfolio analytics header displayed")
        check(page.locator("text=Underwriting Funnel Conversion").first.is_visible(), "Underwriting conversion funnel displayed")
        check(page.locator("text=Sector Portfolio Allocation").first.is_visible(), "Sector portfolio allocation displayed")
        check(page.locator("text=Debt-Service-Coverage (DSCR) Health").first.is_visible(), "DSCR health risk intelligence displayed")
        check(page.locator("text=Bitrefill Agentic Commerce Covenant Integrity").first.is_visible(), "Bitrefill AI agent covenant integrity displayed")

        print("\n" + "=" * 65)
        print(f"Results: {passed} passed, {failed} failed")
        print("=" * 65)
        
        browser.close()
        return failed == 0

if __name__ == "__main__":
    success = test_dual_dashboards()
    if not success:
        exit(1)
