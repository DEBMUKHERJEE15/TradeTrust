import os
from PIL import Image

OUTPUT_DIR = os.path.join(os.getcwd(), "docs", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

image_files = [
    os.path.join(OUTPUT_DIR, "01-hero-dark.png"),
    os.path.join(OUTPUT_DIR, "12-multi-wallet-modal.png"),
    os.path.join(OUTPUT_DIR, "04-merchant-dashboard.png"),
    os.path.join(OUTPUT_DIR, "06-zk-privacy-studio.png"),
    os.path.join(OUTPUT_DIR, "07-lender-underwriting.png"),
    os.path.join(OUTPUT_DIR, "08-lender-request-dossier.png"),
    os.path.join(OUTPUT_DIR, "09-agentic-commerce.png"),
    os.path.join(OUTPUT_DIR, "10-stress-simulator.png"),
    os.path.join(OUTPUT_DIR, "02-hero-light.png"),
]

def create_gif():
    images = []
    target_width = 960

    for path in image_files:
        if os.path.exists(path):
            img = Image.open(path).convert("RGB")
            # Calculate aspect ratio
            w, h = img.size
            target_height = int((target_width / w) * h)
            img_resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            # Convert to adaptive palette for quality and small size
            img_quantized = img_resized.quantize(colors=128, method=Image.Quantize.FASTOCTREE)
            images.append(img_quantized)
            print(f"Added frame: {os.path.basename(path)}")

    if images:
        gif_path = os.path.join(OUTPUT_DIR, "tradetrust-demo.gif")
        images[0].save(
            gif_path,
            save_all=True,
            append_images=images[1:],
            duration=1600,  # 1.6 seconds per frame
            loop=0,
            optimize=True
        )
        file_size_kb = os.path.getsize(gif_path) / 1024
        print(f"Successfully generated {gif_path} ({file_size_kb:.1f} KB)")

if __name__ == "__main__":
    create_gif()
