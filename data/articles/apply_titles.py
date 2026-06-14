import json
import os

titles = {
  "restored_b8d8615e": "Securing the Hemispheric Infrastructure Battleground",
  "restored_bd456136": "KKR Co-CEOs Buy the Dip Amidst Shifting Activist Holdings",
  "restored_c5cf0f62": "How to Fight an Economic War: China's Parallel Financial System",
  "restored_c62faf9b": "The K-Shaped Economy and the Threat of Autocracy",
  "restored_c62fdd65": "Can Copilot Put Microsoft Back on Course in the AI Race?",
  "restored_cd12ac8b": "Defying the E-Commerce Curse: How Quince is Winning Over Shoppers",
  "restored_d9306f9a": "Market Impacts: War Affects LNG Decisions While Trade Desk Soars",
  "restored_d9b9efaa": "A Journey of Peace: Cross-Straits Dialogue and Resource Sharing",
  "restored_dbabcc17": "Finding the Real Ireland Amidst Tourist Complaints",
  "restored_dcd8032b": "Jane Fraser's Impact: Five Years Leading Citi as Wall Street's First Woman CEO",
  "restored_de3dd269": "UK Elections: What Major Council Losses Could Mean for Starmer",
  "restored_deep_0000e1c9": "Software-mageddon: Agentic AI Wipes Out Billions in Outsourcing Stocks",
  "restored_deep_00d218ca": "Restrain or Abolish? The Debate Over Border Enforcement Tactics",
  "restored_deep_02243bf3": "Designing an Effective Deal Review Process for Complex Negotiations",
  "restored_deep_0370f518": "The Shock Waves of Iran: Navigating Energy Weaponization and Inflation",
  "restored_deep_04178c21": "Maximizing Engagement: The Power of Hybrid Work and Unlocked Projects",
  "restored_deep_04bcfbc7": "Global Tariffs Rise to 15% as Trump Administration Enforces Duties",
  "restored_deep_074273b6": "The Founder's Next Chapter: Transitioning Roles for Long-Term Value",
  "restored_deep_096be9ab": "From Schoolyard Swaps to Ancient Egypt: The Enduring History of Liquorice",
  "restored_deep_0a2b9911": "The Insatiable Beast: Layoffs and the Extraordinary Cost of the AI Race",
  "restored_deep_0a8cdd27": "Renewing the Alliance: Navigating the Future of Trans-Atlantic Relations"
}

base_dir = "/Users/go/my-github-project/app/public/data/articles"
results = []

for id_val, title in titles.items():
    fname = id_val + ".json"
    fpath = os.path.join(base_dir, fname)
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data['title'] = title
        
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
        results.append({"id": id_val, "title": title})

with open(os.path.join(base_dir, "results.json"), "w") as f:
    json.dump(results, f, indent=2)
