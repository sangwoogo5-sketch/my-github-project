import json

files = [
    "restored_deep_a543af22.json", "restored_deep_a62fca5a.json", "restored_deep_a7af1941.json",
    "restored_deep_a88070db.json", "restored_deep_aa0c97ab.json", "restored_deep_ab49acc3.json",
    "restored_deep_ab719637.json", "restored_deep_ad73428e.json", "restored_deep_ae7c8a99.json",
    "restored_deep_aec39792.json", "restored_deep_af809412.json", "restored_deep_b12bff99.json",
    "restored_deep_b233e942.json", "restored_deep_b2d80095.json", "restored_deep_b60c06bf.json",
    "restored_deep_b74e8efa.json", "restored_deep_b84580e3.json", "restored_deep_bc7837d6.json",
    "restored_deep_bcf3b955.json", "restored_deep_bdc62e9d.json", "restored_deep_bef7b1af.json"
]

for f in files:
    try:
        with open(f, 'r') as fd:
            data = json.load(fd)
            print(f"{f}: {len(data.get('content', ''))} chars")
    except Exception as e:
        pass
