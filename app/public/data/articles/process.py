import json
import os
import re

files = [
    "restored_b8d8615e.json",
    "restored_bd456136.json",
    "restored_c5cf0f62.json",
    "restored_c62faf9b.json",
    "restored_c62fdd65.json",
    "restored_cd12ac8b.json",
    "restored_d9306f9a.json",
    "restored_d9b9efaa.json",
    "restored_dbabcc17.json",
    "restored_dcd8032b.json",
    "restored_de3dd269.json",
    "restored_deep_0000e1c9.json",
    "restored_deep_00d218ca.json",
    "restored_deep_02243bf3.json",
    "restored_deep_0370f518.json",
    "restored_deep_04178c21.json",
    "restored_deep_04bcfbc7.json",
    "restored_deep_074273b6.json",
    "restored_deep_096be9ab.json",
    "restored_deep_0a2b9911.json",
    "restored_deep_0a8cdd27.json"
]

base_dir = "/Users/go/my-github-project/app/public/data/articles"

def clean_content(text):
    text = text.replace('\ufffd', '')
    
    # split into lines to remove lines that look like footers
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        line_clean = line.strip()
        # skip lines with page numbers and magazine names
        if re.search(r'(?i)(bloomberg businessweek|foreign policy|foreign affairs|barron\u2019s|fortune|the week)', line_clean):
            if len(line_clean) < 100:
                continue
        if re.match(r'^(ARGUMENTS|FEATURES|BRIEFING|FORTUNE50058.*|INSIDE SC OOP.*)$', line_clean, re.IGNORECASE):
            continue
        cleaned_lines.append(line)
        
    text = '\n'.join(cleaned_lines)

    # broken hyphens
    text = re.sub(r'([a-zA-Z]+)-\s*\n\s*([a-zA-Z]+)', r'\1\2', text)
    
    # remove out-of-place image captions:
    text = re.sub(r'(?i)(Illustration by [A-Za-z ]+|[A-Za-z \.]+speaks to the media on.*?\d{4}\.|A plume of smoke rises over.*?\.)', '', text)
    
    # broken paragraphs: replace single newlines with space, but preserve double newlines
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
    
    text = re.sub(r' +', ' ', text)
    return text.strip()

output = []
for fname in files:
    fpath = os.path.join(base_dir, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cleaned = clean_content(data.get('content', ''))
    data['content'] = cleaned
    
    with open(fpath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    snippet = cleaned[:1000]
    output.append({"id": data['id'], "snippet": snippet, "old_title": data.get('title', '')})

with open(os.path.join(base_dir, "snippets.json"), "w") as f:
    json.dump(output, f, indent=2)
