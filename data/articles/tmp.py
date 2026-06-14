import json

with open("/Users/go/my-github-project/app/public/data/articles/restored_deep_0ac3bf76.json", "r") as f:
    data = json.load(f)

lines = data["content"].split('\n')
print(f"Lines count: {len(lines)}")
for i, line in enumerate(lines):
    print(f"{i}: {repr(line)}")
