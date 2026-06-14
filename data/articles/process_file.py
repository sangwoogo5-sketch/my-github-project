import json
import sys

def process_file(filename, new_content):
    with open(filename, 'r') as f:
        data = json.load(f)
    data['content'] = new_content
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Processed {filename}")

if __name__ == "__main__":
    process_file(sys.argv[1], sys.argv[2])
