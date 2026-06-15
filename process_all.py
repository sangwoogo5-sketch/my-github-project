import json
import glob
import re

files = [
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_74928ba2.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_74dc4175.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_77246da2.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_7883aa97.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_78f554e9.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_792d824e.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_79c05961.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_7bda6f0f.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_7d9b4667.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_7db9e1a5.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_7ddd30c6.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_81440784.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_83f6f494.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_86160e7a.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_861f904e.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_880be766.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_8b369379.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_8b39669b.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_8d766319.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_8d886840.json",
    "/Users/go/my-github-project/app/public/data/articles/restored_deep_8dccecdf.json"
]

def refine_content(text):
    # Normalize spaces
    text = re.sub(r' +', ' ', text)
    # Ensure paragraphs are split properly and cleaned
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    return '\n\n'.join(paragraphs)

for f in files:
    with open(f, 'r') as file:
        data = json.load(file)
    
    # We apply the refinement logic to all
    updated_content = refine_content(data['content'])
    data['content'] = updated_content
    
    with open(f, 'w') as file:
        json.dump(data, file, indent=2)

print("All 21 files processed and overwritten.")
