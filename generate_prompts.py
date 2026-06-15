import glob
import json
import math

files = sorted(glob.glob("/Users/go/my-github-project/app/public/data/articles/*.json"))
num_agents = 15
chunk_size = math.ceil(len(files) / num_agents)

subagents = []
for i in range(num_agents):
    chunk = files[i*chunk_size : (i+1)*chunk_size]
    if not chunk:
        continue
        
    prompt = f"""You are a Magazine Polisher Agent. Your task is to polish {len(chunk)} JSON articles.
Here are the files you must process:
"""
    for f in chunk:
        prompt += f"- {f}\n"
        
    prompt += """
For EACH file:
1. Read the JSON.
2. Clean the `content`:
   - Reconstruct broken hyphenated words at the end of lines (e.g. `sin- gle` -> `single`, `radi- cally` -> `radically`).
   - Remove ALL OCR junk characters like `\\ufffd` or weird symbols.
   - Remove any page numbers or magazine name footers/headers (e.g., "46 Bloomberg Businessweek").
   - Fix logically broken paragraphs by connecting sentences appropriately and removing out-of-place image captions.
3. Rewrite the `title`:
   - Generate a concise, engaging, and highly accurate title for the article (max 80 chars). Do NOT use generic or cut-off titles.
4. Save the modified JSON back to the SAME file path.
5. Record the new title and the article `id`.

When you are completely finished with ALL files, send a single `send_message` back to your parent agent containing a JSON array of the updated metadata:
```json
[
  { "id": "<article_id>", "title": "<new_title>" },
  ...
]
```
Do NOT include the `content` in your message. If a file is unreadable, skip it.
"""
    subagents.append({
        "TypeName": "self",
        "Role": f"Polisher {i+1}",
        "Prompt": prompt
    })

with open("subagents_payload.json", "w") as f:
    json.dump(subagents, f, indent=2)

print("Generated subagents_payload.json")
