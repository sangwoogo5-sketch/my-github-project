import json
import glob
import os

files = [
    "restored_deep_4b0e318e.json", "restored_deep_4b325487.json", "restored_deep_4b89dfa6.json",
    "restored_deep_4d2db78a.json", "restored_deep_4f1fc76e.json", "restored_deep_50c23935.json",
    "restored_deep_5198d1cd.json", "restored_deep_539ae6a8.json", "restored_deep_547afb46.json",
    "restored_deep_5765fd39.json", "restored_deep_586ce1de.json", "restored_deep_58d43479.json",
    "restored_deep_599ba8a2.json", "restored_deep_59a68a64.json", "restored_deep_5e4de4a2.json",
    "restored_deep_5f09d9bf.json", "restored_deep_5f54b837.json", "restored_deep_66c901f7.json",
    "restored_deep_69e4a799.json", "restored_deep_6a24ecb8.json", "restored_deep_6ab1a467.json"
]

base_dir = "/Users/go/my-github-project/app/public/data/articles/"
out_path = os.path.join(base_dir, "dump.txt")

with open(out_path, "w", encoding="utf-8") as out:
    for f in files:
        p = os.path.join(base_dir, f)
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as jf:
                data = json.load(jf)
                out.write(f"=== FILE: {f} ===\n")
                out.write(f"ID: {data.get('id')}\n")
                out.write(f"TITLE: {data.get('title')}\n")
                out.write(f"CONTENT:\n{data.get('content')}\n")
                out.write("="*40 + "\n\n")
print("Dumped to dump.txt")
