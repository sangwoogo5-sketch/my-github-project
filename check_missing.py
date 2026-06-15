import json
import glob

with open('/Users/go/my-github-project/titles_collected.json', 'r') as f:
    collected = json.load(f)

collected_ids = set(c['id'] for c in collected)

all_files = glob.glob('/Users/go/my-github-project/app/public/data/articles/*.json')
all_ids = set([f.split('/')[-1].replace('.json', '') for f in all_files])

missing = all_ids - collected_ids
print(f"Total collected: {len(collected_ids)}")
print(f"Total expected: {len(all_ids)}")
print(f"Missing count: {len(missing)}")
if len(missing) > 0:
    print(f"Missing IDs: {list(missing)[:10]}")
