import re
from collections import Counter

def inspect_file(filepath):
    print(f"Inspecting {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    word_count = sum(len(line.split()) for line in lines)
    print(f"Total lines: {len(lines)}")
    print(f"Approximate word count: {word_count}")
    
    # Look for dates
    date_pattern = re.compile(r'\b(?:19[78]\d|20\d\d)[-/](?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12]\d|3[01])\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (?:19[78]\d)\b', re.IGNORECASE)
    
    dates_found = []
    structural_markers = []
    
    for i, line in enumerate(lines):
        if date_pattern.search(line):
            dates_found.append(line.strip())
        
        # Look for possible headers/section markers
        if len(line.strip()) > 0 and len(line.strip()) < 50:
            if line.strip().isupper():
                structural_markers.append(line.strip())
            elif line.startswith('To:') or line.startswith('Dear'):
                structural_markers.append(line.strip())
                
    print(f"\nSample dates found ({len(dates_found)} total):")
    for d in dates_found[:10]:
        print(f" - {d}")
        
    print(f"\nSample structural markers ({len(structural_markers)} total):")
    for m in structural_markers[:10]:
        print(f" - {m}")
        
if __name__ == '__main__':
    inspect_file('c:/ExegesisAnalysis/exegesis_ordered.txt')
