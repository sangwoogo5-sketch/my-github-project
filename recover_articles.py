import os
import json
import glob

log_pattern = "/Users/go/.gemini/antigravity/brain/*/.system_generated/logs/transcript.jsonl"
recovered = 0

for filepath in glob.glob(log_pattern):
    try:
        with open(filepath, 'r') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    if "tool_calls" in data:
                        for tc in data["tool_calls"]:
                            args = tc.get("function", {}).get("arguments", {})
                            if isinstance(args, str):
                                try:
                                    args = json.loads(args)
                                except:
                                    pass
                            if isinstance(args, dict):
                                target_file = args.get("TargetFile", "")
                                code_content = args.get("CodeContent", "")
                                
                                if target_file.startswith("/Users/go/my-github-project/app/public/data/articles/") and target_file.endswith(".json") and code_content:
                                    with open(target_file, "w") as out:
                                        out.write(code_content)
                                    recovered += 1
                except Exception as e:
                    pass
    except Exception as e:
        pass

print(f"Total recovered files via write_to_file from transcript.jsonl: {recovered}")
