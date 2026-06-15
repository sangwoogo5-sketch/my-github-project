import json
import re

log_path = "/Users/go/.gemini/antigravity/brain/4bcf0a2c-1c25-4348-bbab-2bf1dccef91e/.system_generated/logs/transcript_full.jsonl"

all_titles = []
seen_ids = set()

with open(log_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        content = data.get('content', '')
        # Check if it has a json array
        if '[Message]' in content and 'sender=' in content and '[' in content and ']' in content:
            # Try to find JSON arrays
            # We look for something starting with [ and ending with ] that parses as a list of dicts with 'id' and 'title'
            start_idx = content.find('[')
            
            # Since there could be multiple brackets, let's try to extract the main JSON array block
            # specifically we look for `[\n  {\n` or similar
            # An easier way is just to regex search for the json block
            match = re.search(r'\[\s*\{\s*"id":.*\}\s*\]', content, re.DOTALL)
            if match:
                json_str = match.group(0)
                try:
                    arr = json.loads(json_str)
                    for item in arr:
                        if 'id' in item and 'title' in item:
                            if item['id'] not in seen_ids:
                                all_titles.append(item)
                                seen_ids.add(item['id'])
                except Exception as e:
                    pass
                    
with open("/Users/go/my-github-project/titles_collected.json", "w") as f:
    json.dump(all_titles, f, indent=2)

print(f"Total unique titles successfully recovered: {len(all_titles)}")
