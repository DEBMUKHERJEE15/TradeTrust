"""
TradeTrust Product Demo Video Generator
Captures the real running TradeTrust web application across the 4 key stages:
  Stage 01: Verify   (0:00 - 0:15) - Business Profile & Verification
  Stage 02: Protect  (0:15 - 0:30) - ZK Revenue Threshold Proof Generation & Verification
  Stage 03: Discover (0:30 - 0:45) - Lender Offer Comparison & Base Sepolia Acceptance
  Stage 04: Execute  (0:45 - 1:00) - Bitrefill AI Agent Commerce & Explicit Human Approval

Generates:
  - public/demo/tradetrust-demo.mp4 (720p 30fps)
  - public/demo/tradetrust-demo-poster.png (1280x720)
  - public/demo/stage-01-verify.png
  - public/demo/stage-02-protect.png
  - public/demo/stage-03-discover.png
  - public/demo/stage-04-execute.png
"""

import os
import time
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

OUTPUT_DIR = "public/demo"
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH, HEIGHT = 1280, 720
FPS = 25
DURATION_PER_STAGE = 15  # seconds
TOTAL_DURATION = 60      # seconds
TOTAL_FRAMES = FPS * TOTAL_DURATION

print("=" * 60)
print("Starting TradeTrust Real Product Demo Video Recording")
print("=" * 60)

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
        headless=True
    )
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    # 1. Capture Stage 1: Verify (Merchant Dashboard & Apply)
    print("1. Capturing Stage 1: Verify (Merchant Dashboard & Application)...")
    page.goto("http://localhost:3000/app", wait_until="networkidle")
    time.sleep(1)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "stage-01-verify.png"))

    # 2. Capture Stage 2: Protect (Privacy Center & ZK Proof Studio)
    print("2. Capturing Stage 2: Protect (ZK Privacy Center)...")
    page.goto("http://localhost:3000/app/privacy", wait_until="networkidle")
    time.sleep(1)
    # Click generate proof button if available
    try:
        page.click("button:has-text('Generate Zero-Knowledge Proof')", timeout=2000)
        time.sleep(1)
    except Exception:
        pass
    page.screenshot(path=os.path.join(OUTPUT_DIR, "stage-02-protect.png"))

    # 3. Capture Stage 3: Discover (Offer Marketplace & Details)
    print("3. Capturing Stage 3: Discover (Offer Marketplace & Amortization)...")
    page.goto("http://localhost:3000/app/offers/OFF-2026-001", wait_until="networkidle")
    time.sleep(1)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "stage-03-discover.png"))

    # 4. Capture Stage 4: Execute (Bitrefill AI Commerce & Approval)
    print("4. Capturing Stage 4: Execute (Bitrefill AI Commerce Agent)...")
    page.goto("http://localhost:3000/app/commerce", wait_until="networkidle")
    time.sleep(1)
    # Click Amazon quick prompt if available
    try:
        page.click("button:has-text('$50 Amazon')", timeout=2000)
        time.sleep(1)
    except Exception:
        pass
    page.screenshot(path=os.path.join(OUTPUT_DIR, "stage-04-execute.png"))

    # 5. Capture Poster: Hero Terminal / Dashboard
    print("5. Generating Master Poster Image...")
    page.goto("http://localhost:3000/app", wait_until="networkidle")
    time.sleep(1)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "tradetrust-demo-poster.png"))

    browser.close()

print("All screenshots successfully captured!")

# Load screenshot images and resize to 1280x720
stage_files = [
    ("stage-01-verify.png", "STAGE 01: VERIFY", "Merchant Profile & Evidence Commitment", "Offchain Private Bank Turnover Stamped on Base Sepolia"),
    ("stage-02-protect.png", "STAGE 02: PROTECT", "Zero-Knowledge Revenue Proof Generation", "Groth16 Curve Points Proving Turnover >= $15,000/mo Without Leaking PII"),
    ("stage-03-discover.png", "STAGE 03: DISCOVER", "Lender Offer Comparison & Onchain Acceptance", "Competing Term Analysis, Monthly Amortization & Smart Contract Acceptance"),
    ("stage-04-execute.png", "STAGE 04: EXECUTE", "Bitrefill AI Agentic Commerce & Approval", "Catalog Discovery, Spending Authorization Check & Explicit Merchant Confirmation"),
]

stage_images = []
for filename, stage_tag, title, desc in stage_files:
    img_path = os.path.join(OUTPUT_DIR, filename)
    img = cv2.imread(img_path)
    if img is not None:
        img_resized = cv2.resize(img, (WIDTH, HEIGHT))
        stage_images.append((img_resized, stage_tag, title, desc))

# Compose 60-second video with smooth transitions and professional fintech overlays
video_path = os.path.join(OUTPUT_DIR, "tradetrust-demo.mp4")
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
writer = cv2.VideoWriter(video_path, fourcc, FPS, (WIDTH, HEIGHT))

print("Compiling video frames...")

frames_per_stage = FPS * DURATION_PER_STAGE

for stage_idx, (base_img, stage_tag, title, desc) in enumerate(stage_images):
    for f in range(frames_per_stage):
        frame = base_img.copy()

        # Add top banner overlay
        cv2.rectangle(frame, (0, 0), (WIDTH, 48), (5, 8, 17), -1)
        cv2.line(frame, (0, 48), (WIDTH, 48), (22, 35, 59), 1)

        # Brand on top left
        cv2.putText(frame, "TRADETRUST", (24, 30), cv2.FONT_HERSHEY_DUPLEX, 0.6, (0, 245, 155), 2)
        cv2.putText(frame, "PRODUCT DEMONSTRATION", (170, 30), cv2.FONT_HERSHEY_DUPLEX, 0.45, (148, 163, 184), 1)

        # Stage badge on top right
        cv2.putText(frame, stage_tag, (WIDTH - 250, 30), cv2.FONT_HERSHEY_DUPLEX, 0.5, (0, 245, 155), 1)

        # Bottom info card overlay
        overlay = frame.copy()
        cv2.rectangle(overlay, (24, HEIGHT - 84), (WIDTH - 24, HEIGHT - 18), (7, 11, 20), -1)
        cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
        cv2.rectangle(frame, (24, HEIGHT - 84), (WIDTH - 24, HEIGHT - 18), (22, 35, 59), 1)

        # Title and description text
        cv2.putText(frame, title, (42, HEIGHT - 54), cv2.FONT_HERSHEY_DUPLEX, 0.55, (255, 255, 255), 1)
        cv2.putText(frame, desc, (42, HEIGHT - 32), cv2.FONT_HERSHEY_DUPLEX, 0.42, (148, 163, 184), 1)

        # Subtle timeline bar at bottom
        progress = (stage_idx * frames_per_stage + f) / TOTAL_FRAMES
        cv2.rectangle(frame, (0, HEIGHT - 4), (int(WIDTH * progress), HEIGHT), (0, 245, 155), -1)

        writer.write(frame)

writer.release()
print(f"Video saved to: {video_path}")
print(f"File size: {os.path.getsize(video_path)} bytes")
print("=" * 60)
print("TradeTrust Product Demo Video Generation Complete!")
print("=" * 60)
