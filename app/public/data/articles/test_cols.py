import json
import glob
import os
import re

base_dir = "/Users/go/my-github-project/app/public/data/articles/"
files = glob.glob(os.path.join(base_dir, "restored_deep_*.json"))

for f in files[:5]:
    with open(f, "r", encoding="utf-8") as jf:
        data = json.load(jf)
        content = data.get("content", "")
        if "\t" in content:
            print(f"File {os.path.basename(f)} HAS tabs!")
        else:
            print(f"File {os.path.basename(f)} NO tabs!")
