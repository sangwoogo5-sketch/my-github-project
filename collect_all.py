import json
import glob
import os

agent_ids = [
    "b767c981-23f2-4e4c-bbea-b60693beebed",
    "331eccab-6295-4dbb-b8a0-0703b6fa8ec1",
    "4b37f58d-680f-43ac-9286-7b084ea2d3a5",
    "53c637d7-1710-4a03-b27c-7cce94e2c284",
    "96bf893e-1617-4769-8b32-adf3a49c1a9c",
    "6984094a-6c0f-4755-85fc-49c0f70759d3",
    "86c19718-1ca5-4382-be4f-d3fcfd67dd79",
    "89b89ee6-e45d-4e4e-822b-f0b7045bcc41",
    "e41c64c5-395b-499e-81e8-0c3aa43d18c1",
    "a5a6b759-b157-421e-ab4a-d372379870f5",
    "9d99530d-2e4a-49c4-baea-1c9ec3917757",
    "499ab226-ab34-4b60-8c62-c3a5824dc314",
    "25f2216b-a71f-4539-991f-4e014cddd15a",
    "3afcd51e-296c-49b1-89f9-cb7f4ef41633",
    "8164944e-c6f3-457c-92bb-8f688ee1e687"
]

all_titles = []
pending_agents = []

for aid in agent_ids:
    log_path = f"/Users/go/.gemini/antigravity/brain/{aid}/.system_generated/logs/transcript_full.jsonl"
    if not os.path.exists(log_path):
        pending_agents.append(aid)
        continue
        
    found = False
    with open(log_path, 'r') as f:
        for line in f:
            try:
                data = json.loads(line)
            except:
                continue
            if data.get('type') == 'PLANNER_RESPONSE':
                tc = data.get('tool_calls', [])
                if tc:
                    for t in tc:
                        if t.get('name') == 'default_api:send_message':
                            msg = t.get('arguments', {}).get('Message', '')
                            try:
                                # extract json
                                start = msg.find('[')
                                end = msg.rfind(']') + 1
                                if start != -1 and end != -1:
                                    arr = json.loads(msg[start:end])
                                    all_titles.extend(arr)
                                    found = True
                            except:
                                pass
    if not found:
        pending_agents.append(aid)

with open("/Users/go/my-github-project/titles_collected.json", "w") as f:
    json.dump(all_titles, f, indent=2)

print(f"Total collected: {len(all_titles)}")
print(f"Pending agents: {len(pending_agents)}")
if pending_agents:
    print(f"Pending IDs: {pending_agents}")
