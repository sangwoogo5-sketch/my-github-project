import json

files = [
    "restored_deep_1afb2421.json",
    "restored_deep_1dc56c6e.json",
    "restored_deep_1e249208.json",
    "restored_deep_20243ee7.json",
    "restored_deep_2066a13a.json"
]

for f in files:
    path = f"/Users/go/my-github-project/app/public/data/articles/{f}"
    with open(path) as f_in:
        data = json.load(f_in)
        print(f"--- {f} ---")
        print(data["content"][:2000])
        print("\n")
