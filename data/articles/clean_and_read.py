import json
import re
import os

files = [
    "restored_deep_f63c841b.json", "restored_deep_f6579b63.json", "restored_deep_f69f3828.json",
    "restored_deep_f6f2d7db.json", "restored_deep_f7a5e634.json", "restored_deep_f804261a.json",
    "restored_deep_f85e8ce4.json", "restored_deep_f88dd015.json", "restored_deep_f9b31bb6.json",
    "restored_deep_fae71798.json", "restored_deep_fafe83f7.json", "restored_deep_fc221572.json",
    "restored_deep_fc8554c6.json", "restored_deep_fdc1dc8e.json", "restored_deep_fe08d611.json",
    "restored_deep_fe7a1bff.json", "restored_deep_ff486f5c.json", "restored_df6e1b41.json",
    "restored_e5720255.json", "restored_e5e011bc.json", "restored_e6e7b81a.json"
]

base_dir = "/Users/go/my-github-project/app/public/data/articles"

for f in files:
    path = os.path.join(base_dir, f)
    if not os.path.exists(path):
        print(f"Skipping {f}, not found.")
        continue
    
    with open(path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    content = data.get('content', '')
    
    # 1. Reconstruct broken hyphenated words
    content = re.sub(r'([A-Za-z]+)-\s*\n\s*([A-Za-z]+)', r'\1\2', content)
    content = re.sub(r'([A-Za-z]+)-\s+([A-Za-z]+)', r'\1\2', content)
    
    # 2. Remove OCR junk characters
    content = content.replace('\ufffd', '')
    # Replace unprintable characters with space
    content = re.sub(r'[\u0000-\u0008\u000b-\u000c\u000e-\u001f]', ' ', content)
    # Remove strings that look like the Caesar cipher garbage we saw (all caps with punctuation, no vowels)
    content = re.sub(r'\b[A-Z\[\]\(\)\{\}\'\-\^\|\\]{5,}\b', '', content)
    
    # 3. Remove any page numbers or magazine name footers/headers
    content = re.sub(r'(?i)Illustrations? by [A-Za-z\s]+', '', content)
    content = re.sub(r'(?i)Photo(?:graph)? by [A-Za-z\s]+', '', content)
    content = re.sub(r'(?i)PhotoAP\s*', '', content)
    content = re.sub(r'(?i)may/june\s*\d{4}\s*\d*\s*[A-Za-z\.\s]+', '', content)
    content = re.sub(r'(?i)\b\d+\s+(?:Bloomberg Businessweek|foreign affairs|The Economist|Time|Newsweek|Forbes)\b', '', content)
    content = re.sub(r'(?i)\b(?:Bloomberg Businessweek|foreign affairs|The Economist|Time|Newsweek|Forbes)\s+\d+\b', '', content)
    
    # 4. Fix logically broken paragraphs
    content = re.sub(r'([^\.!?\n\r"\'”’])\s*\n\s*([a-z])', r'\1 \2', content)
    
    # Final whitespace cleanup
    content = re.sub(r'\s+', ' ', content).strip()
    
    data['content'] = content
    
    # Save back
    with open(path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
    
    print(f"FILE: {f}")
    print(f"ID: {data['id']}")
    print(f"TITLE_HINT: {content[:300]}...")
    print("-" * 50)
