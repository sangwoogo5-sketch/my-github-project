import json

with open("subagent_payload.json", "r") as f:
    payload = json.load(f)

failed_roles = [
    "Rewriter 1", "Rewriter 2", "Rewriter 3", "Rewriter 4", "Rewriter 5",
    "Rewriter 6", "Rewriter 8", "Rewriter 9", "Rewriter 13", "Rewriter 15"
]

respawn_payload = [item for item in payload if item["Role"] in failed_roles]

with open("respawn_payload.json", "w") as f:
    json.dump(respawn_payload, f, indent=2)

print(f"Prepared {len(respawn_payload)} subagents for respawning.")
