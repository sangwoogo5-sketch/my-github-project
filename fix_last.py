import json

with open("/Users/go/my-github-project/titles_collected.json", "r") as f:
    collected = json.load(f)

collected.append({
    "id": "restored_a8977f39",
    "title": "Top Companies and National Elite Honorees List"
})

with open("/Users/go/my-github-project/titles_collected.json", "w") as f:
    json.dump(collected, f, indent=2)

