import json
import glob
import os

with open("/Users/go/my-github-project/titles_collected.json", "r") as f:
    collected = json.load(f)

title_map = {}
for item in collected:
    if 'id' not in item or 'title' not in item: continue
    cid = item['id'].replace('.json', '')
    title = item['title']
    title_map[cid] = title
    if cid.endswith('_v4'):
        title_map[cid[:-3]] = title
    if cid.endswith('_v5'):
        title_map[cid[:-3]] = title

files = glob.glob("/Users/go/my-github-project/app/public/data/articles/*.json")

matched_count = 0
updated_articles = []

for f in files:
    if os.path.basename(f) in ['summary.json', 'snippets.json', 'index.json']:
        continue
        
    try:
        with open(f, "r") as file:
            data = json.load(file)
            
        if not isinstance(data, dict) or 'id' not in data:
            continue
            
        fid = data['id'].replace('.json', '')
        base_fid = fid
        if fid.endswith('_v4'):
            base_fid = fid[:-3]
        if fid.endswith('_v5'):
            base_fid = fid[:-3]
            
        new_title = title_map.get(fid) or title_map.get(base_fid)
        
        if new_title:
            data['title'] = new_title
            matched_count += 1
            
        with open(f, "w") as file:
            json.dump(data, file, indent=2)
            
        index_entry = dict(data)
        if 'content' in index_entry:
            del index_entry['content']
        updated_articles.append(index_entry)
        
    except Exception as e:
        print(f"Error processing {f}: {e}")

print(f"Matched and updated {matched_count} out of {len(updated_articles)} valid articles.")

# Update index.json
index_path = "/Users/go/my-github-project/app/public/data/index.json"
with open(index_path, "w") as f:
    json.dump({"articles": updated_articles}, f, indent=2)
print("Updated index.json successfully.")

