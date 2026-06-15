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

missing = []

for f in files:
    if os.path.basename(f) in ['summary.json', 'snippets.json', 'index.json']:
        continue
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
    if not new_title:
        missing.append(fid)

print("Missing:", missing)
