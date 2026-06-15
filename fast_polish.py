import glob
import json
import re
import os

files = glob.glob("/Users/go/my-github-project/app/public/data/articles/*.json")

def polish_content(text):
    # Remove OCR replacement character
    text = text.replace('\ufffd', '')
    
    # Fix hyphenated line breaks e.g. "sin- gle" -> "single"
    text = re.compile(r'([a-zA-Z]+)-\s+([a-zA-Z]+)').sub(r'\1\2', text)
    
    # Try to clean up footers like "46 Bloomberg Businessweek"
    # Match lines that start with numbers followed by magazine names or just page numbers
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        # If the line is just a number
        if stripped.isdigit():
            continue
        # If the line starts with a number and has typical magazine footer length
        if re.match(r'^\d+\s+[A-Za-z\s]+$', stripped) and len(stripped) < 40:
            continue
        cleaned_lines.append(line)
        
    return '\n'.join(cleaned_lines)

def polish_title(title):
    # Remove ellipsis at end if present
    if title.endswith('...'):
        title = title[:-3].strip()
    
    # Truncate to a reasonable length if it's super long (like a whole paragraph)
    if len(title) > 120:
        title = title[:117] + '...'
    
    return title

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        try:
            data = json.load(file)
        except:
            continue
            
    if 'content' in data:
        data['content'] = polish_content(data['content'])
    if 'title' in data:
        data['title'] = polish_title(data['title'])
        
    with open(f, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2)

print(f"Polished {len(files)} files via Python Regex!")
