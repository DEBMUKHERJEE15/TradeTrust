import os
import cv2
import numpy as np

OUTPUT_DIR = "public/demo"
WIDTH, HEIGHT = 1280, 720
FPS = 25
DURATION_PER_STAGE = 15
TOTAL_FRAMES = FPS * DURATION_PER_STAGE * 4

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

webm_path = os.path.join(OUTPUT_DIR, "tradetrust-demo.webm")
fourcc = cv2.VideoWriter_fourcc(*'VP90')
writer = cv2.VideoWriter(webm_path, fourcc, FPS, (WIDTH, HEIGHT))

frames_per_stage = FPS * DURATION_PER_STAGE
print("Writing WebM frames...")

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
print(f"WebM video successfully generated: {webm_path}")
print(f"Size: {os.path.getsize(webm_path)} bytes")
