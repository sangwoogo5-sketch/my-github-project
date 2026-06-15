import os
import glob
import subprocess
import concurrent.futures
import json
import uuid
import re

docs_dir = "/Users/go/my-github-project/docs"
articles_dir = "/Users/go/my-github-project/app/public/data/articles"
index_path = "/Users/go/my-github-project/app/public/data/index.json"

os.makedirs(articles_dir, exist_ok=True)

def get_word_count(text):
    return len(re.findall(r'\b\w+\b', text))

def extract_from_markdown(md_path, source_name):
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return []
        
    # We want to extract ALL articles throughout the entire document!
    # Let's skip only the first 5% (table of contents)
    start_idx = int(len(content) * 0.05)
    content = content[start_idx:]
    
    # Clean kordoc tags
    content = re.sub(r'^\|.*\|$', '', content, flags=re.MULTILINE)
    content = re.sub(r'\[kordoc\].*$', '', content, flags=re.MULTILINE)
    
    blocks = re.split(r'\n\s*\n', content)
    
    valid_blocks = []
    for b in blocks:
        b = b.replace('\n', ' ').strip()
        if not b: continue
        letters = sum(c.isalpha() for c in b)
        if len(b) > 0 and letters / len(b) > 0.65:
            valid_blocks.append(b)
            
    articles = []
    current_article = []
    current_wc = 0
    
    for b in valid_blocks:
        wc = get_word_count(b)
        if wc < 15: continue
        
        current_article.append(b)
        current_wc += wc
        
        if current_wc >= 350: # Slightly stricter word count for higher quality
            art_id = f"restored_deep_{uuid.uuid4().hex[:8]}"
            body = "\n\n".join(current_article)
            title = current_article[0].split('.')[0]
            if len(title) > 80: title = title[:80] + "..."
            
            # Determine difficulty based on word length
            avg_word_len = sum(len(w) for w in re.findall(r'\b\w+\b', body)) / max(1, current_wc)
            difficulty = "Advanced" if avg_word_len > 5.5 else "Intermediate" if avg_word_len > 4.5 else "Beginner"
            
            article_data = {
                "id": art_id,
                "title": title,
                "source": source_name,
                "issue": "Spring 2026",
                "difficulty": difficulty,
                "date": "2026-05-10T00:00:00Z",
                "fileUrl": f"/data/articles/{art_id}.json",
                "content": body
            }
            articles.append(article_data)
            
            current_article = []
            current_wc = 0
            
            # Extract up to 20 articles per magazine to guarantee we exceed original numbers
            if len(articles) >= 20:
                break
                
    return articles

def process_magazine(folder_path):
    magazine_name = os.path.basename(folder_path)
    pdf_files = glob.glob(os.path.join(folder_path, "*.pdf"))
    if not pdf_files:
        return []
    
    pdf_path = pdf_files[0]
    md_path = f"/tmp/restore_{magazine_name.replace(' ', '_')}.md"
    
    # Run kordoc if md doesn't exist
    if not os.path.exists(md_path):
        subprocess.run(["npx", "kordoc", pdf_path, "-o", md_path], capture_output=True)
    
    # Extract
    return extract_from_markdown(md_path, magazine_name)

def main():
    folders = [f.path for f in os.scandir(docs_dir) if f.is_dir() and not f.name.startswith('.')]
    all_articles = []
    
    # Preserve existing articles
    existing_meta = []
    if os.path.exists(index_path):
        try:
            with open(index_path, 'r') as f:
                existing_meta = json.load(f)
        except:
            pass
            
    # Multiprocessing kordoc and extraction
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(process_magazine, f): f for f in folders}
        for future in concurrent.futures.as_completed(futures):
            arts = future.result()
            all_articles.extend(arts)
            
    print(f"Extracted {len(all_articles)} NEW deep articles from {len(folders)} magazines.")
    
    # Write new articles to disk
    for art in all_articles:
        file_path = os.path.join(articles_dir, f"{art['id']}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(art, f, indent=2)
            
    # Rebuild index.json
    final_meta = existing_meta.copy()
    for art in all_articles:
        meta = art.copy()
        meta.pop("content", None)
        final_meta.append(meta)
        
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(final_meta, f, indent=2)
        
    print(f"Success! index.json now contains {len(final_meta)} articles.")

if __name__ == "__main__":
    main()
