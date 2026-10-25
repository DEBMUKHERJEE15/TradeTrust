import os
import re

target_files = [
    "src/app/app/activity/page.tsx",
    "src/app/app/apply/page.tsx",
    "src/app/app/commerce/page.tsx",
    "src/app/app/credentials/page.tsx",
    "src/app/app/offers/page.tsx",
    "src/app/app/offers/[id]/page.tsx",
    "src/app/app/privacy/page.tsx",
    "src/app/docs/page.tsx",
    "src/app/lender/page.tsx",
    "src/app/lender/offers/page.tsx",
    "src/app/lender/requests/page.tsx",
]

replacements = [
    ("bg-[#0D1525]", "bg-surface-card"),
    ("bg-[#0C1322]", "bg-surface-card"),
    ("bg-[#080C14]", "bg-surface"),
    ("bg-[#090F1C]", "bg-surface"),
    ("bg-[#070B14]", "bg-surface"),
    ("bg-[#050811]", "bg-background"),
    ("bg-[#090E1A]", "bg-surface-card"),
    ("border-[#1A263D]", "border-theme"),
    ("border-[#16233B]", "border-theme"),
    ("border-[#223352]", "border-theme"),
    ("hover:bg-[#142036]", "hover:bg-surface-hover"),
    ("hover:bg-[#1A2A47]", "hover:bg-surface-hover"),
    ("hover:bg-[#131F36]", "hover:bg-surface-hover"),
    ("bg-[#142036]", "bg-surface-hover"),
    ("text-white", "text-foreground"),
    ("text-slate-300", "text-foreground-secondary"),
    ("text-slate-400", "text-foreground-secondary"),
    ("text-slate-500", "text-foreground-muted"),
    ("text-[#050811]", "text-black"),
    ("text-[#080C14]", "text-black"),
]

for file_path in target_files:
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} does not exist.")
        continue

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Updated theme tokens in {file_path}")

print("Theme token migration complete.")
