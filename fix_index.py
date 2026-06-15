import json

index_path = "/Users/go/my-github-project/app/public/data/index.json"

with open(index_path, "r") as f:
    data = json.load(f)

if isinstance(data, list):
    new_data = { "articles": data }
    with open(index_path, "w") as f:
        json.dump(new_data, f, indent=2)
    print("Fixed index.json!")
else:
    print("index.json is already an object.")
