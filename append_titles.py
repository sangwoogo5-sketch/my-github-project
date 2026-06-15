import json
import sys
import os

filepath = "/Users/go/my-github-project/titles_collected.json"

new_data_str = """
[
  {
    "id": "restored_deep_f63c841b",
    "title": "Political Debates, News Round-Up, and Italy's World Cup Miss"
  },
  {
    "id": "restored_deep_f6579b63",
    "title": "How North Korea Won: Advancing Nuclear Goals and Ties with China"
  },
  {
    "id": "restored_deep_f69f3828",
    "title": "RFK Jr. as Health Secretary: Paranoia and the MAHA Movement"
  },
  {
    "id": "restored_deep_f6f2d7db",
    "title": "Art & Music: William Eggleston and a Recipe for Meen Moilee"
  },
  {
    "id": "restored_deep_f7a5e634",
    "title": "Navigating Human and Agentic Workforces: Change Management Strategies"
  },
  {
    "id": "restored_deep_f804261a",
    "title": "Embracing Real-World Experimentation for Generative AI in the Workplace"
  },
  {
    "id": "restored_deep_f85e8ce4",
    "title": "Global Fiction Reviews: Authoritarian Realities and Postcolonial Murder"
  },
  {
    "id": "restored_deep_f88dd015",
    "title": "The Fractured Post-American World and the Future of Democracy"
  },
  {
    "id": "restored_deep_f9b31bb6",
    "title": "Farah Khan's Culinary Show Shines a Light on the Real Heroes: Cooks"
  },
  {
    "id": "restored_deep_fae71798",
    "title": "Race to the Top: How the Xiamen Marathon is Shaping the City's Future"
  },
  {
    "id": "restored_deep_fafe83f7",
    "title": "America's CEO-in-Chief: Tariffs and the New Face of Warfare"
  },
  {
    "id": "restored_deep_fc221572",
    "title": "Dear Mary: Navigating Tricky Etiquette in Social Gatherings"
  },
  {
    "id": "restored_deep_fc8554c6",
    "title": "Hard Fork Podcast: AI's Economic Impact and Cleaning Tech"
  },
  {
    "id": "restored_deep_fdc1dc8e",
    "title": "Nuclear Power for Data Centers and Robyn's Triumphant Return"
  },
  {
    "id": "restored_deep_fe08d611",
    "title": "Marquis Who's Who Honors Top Professionals in Various Fields"
  },
  {
    "id": "restored_deep_fe7a1bff",
    "title": "A Novice's Journey Through the Slippery Slopes of Sports Betting"
  },
  {
    "id": "restored_deep_ff486f5c",
    "title": "The High-Stakes Reality and Risks of Professional Sports Betting"
  },
  {
    "id": "restored_df6e1b41",
    "title": "Economic Turbulence Looms Amid Surging Oil Prices and Unrest"
  },
  {
    "id": "restored_e5720255",
    "title": "Scoring Internships: Navigating the Brutal Job Market"
  },
  {
    "id": "restored_e5e011bc",
    "title": "China-U.S. Relations: Ping-Pong Diplomacy and the Realities of Rivalry"
  },
  {
    "id": "restored_e6e7b81a",
    "title": "Leadership in the Age of AI: Judgment Over Prediction"
  }
]
"""

new_data = json.loads(new_data_str)

existing = []
if os.path.exists(filepath):
    with open(filepath, "r") as f:
        existing = json.load(f)

existing.extend(new_data)

with open(filepath, "w") as f:
    json.dump(existing, f, indent=2)

print(f"Total titles collected so far: {len(existing)}")
