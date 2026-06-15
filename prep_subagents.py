import json
import glob
import os

files = glob.glob("/Users/go/my-github-project/app/public/data/articles/*.json")
valid_files = []
for f in files:
    base = os.path.basename(f)
    if base in ['summary.json', 'snippets.json', 'index.json']:
        continue
    valid_files.append(f)

valid_files.sort()

chunk_size = len(valid_files) // 15 + (1 if len(valid_files) % 15 != 0 else 0)
chunks = [valid_files[i:i + chunk_size] for i in range(0, len(valid_files), chunk_size)]

subagents = []
for i, chunk in enumerate(chunks):
    prompt_lines = ["Please process the following files:\n"]
    for f in chunk:
        prompt_lines.append(f"- {f}")
    
    subagents.append({
        "TypeName": "PassageRewriter",
        "Role": f"Rewriter {i+1}",
        "Prompt": "\n".join(prompt_lines)
    })

with open("subagent_payload.json", "w") as f:
    json.dump(subagents, f, indent=2)

print(f"Generated {len(subagents)} subagents payload.")
print("Preview of first agent prompt:")
print(subagents[0]["Prompt"])
