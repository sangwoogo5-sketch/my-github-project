import os
import json
import glob

articles_dir = "/Users/go/my-github-project/app/public/data/articles"
index_path = "/Users/go/my-github-project/app/public/data/index.json"

articles = []
for filepath in glob.glob(os.path.join(articles_dir, "*.json")):
    with open(filepath, "r") as f:
        try:
            data = json.load(f)
            # Create metadata entry
            meta = {
                "id": data.get("id"),
                "title": data.get("title"),
                "source": data.get("source"),
                "issue": data.get("issue"),
                "difficulty": data.get("difficulty"),
                "date": data.get("date"),
                "fileUrl": data.get("fileUrl")
            }
            articles.append(meta)
        except Exception as e:
            pass

# Sort articles by date descending
articles.sort(key=lambda x: x.get("date") or "", reverse=True)

with open(index_path, "w") as f:
    json.dump({"articles": articles}, f, indent=2)

print(f"Rebuilt index.json with {len(articles)} articles.")
