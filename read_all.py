import json

files = [
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_f63c841b.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_f6579b63.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_f69f3828.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_f6f2d7db.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_f7a5e634.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_f804261a.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_f85e8ce4.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_f88dd015.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_f9b31bb6.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_fae71798.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_fafe83f7.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_fc221572.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_fc8554c6.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_fdc1dc8e.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_fe08d611.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_fe7a1bff.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_ff486f5c.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_df6e1b41.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_e5720255.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_e5e011bc.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_e6e7b81a.json"
]

for i, f in enumerate(files):
    try:
        with open(f, 'r') as fp:
            data = json.load(fp)
            print(f"=== FILE {i}: {f} ===")
            print(data.get('content', ''))
            print("=====================\n")
    except Exception as e:
        print(f"Error reading {f}: {e}")

