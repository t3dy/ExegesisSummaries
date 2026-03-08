import re
import os

def clean_corpus(input_path, output_path, notes_path):
    print(f"Cleaning {input_path}...")
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    cleaned_lines = []
    removed_count = 0
    noise_patterns = [
        re.compile(r'^Last edit .* ago by .*$', re.IGNORECASE),
        re.compile(r'^\s*\d+\s*$'),
        re.compile(r'^Indexed$', re.IGNORECASE),
        re.compile(r'^Complete$', re.IGNORECASE),
        re.compile(r'^Needs Review$', re.IGNORECASE)
    ]
    
    for line in lines:
        stripped = line.strip()
        
        is_noise = False
        for p in noise_patterns:
            if p.match(stripped):
                is_noise = True
                break
                
        if is_noise:
            removed_count += 1
            continue
            
        cleaned_lines.append(line)
        
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)
        
    # Write cleaning notes
    notes = f"""# CLEANING NOTES

- Source file: {os.path.basename(input_path)}
- Output file: {os.path.basename(output_path)}
- Original lines: {len(lines)}
- Cleaned lines: {len(cleaned_lines)}
- Lines removed: {removed_count}

## Description of removed noise
- Wiki/Forum indicators ("Last edit OVER X years ago by User")
- Lone page numbers spanning single lines
- Status markers ("Indexed", "Complete", "Needs Review") standing alone on lines.

We preserved all textual content, dates, salutations, blocks, and signatures as requested.
"""
    with open(notes_path, 'w', encoding='utf-8') as f:
        f.write(notes)
        
    print(f"Done. Removed {removed_count} lines of noise. Saved to {output_path}")

if __name__ == '__main__':
    base_dir = 'c:/ExegesisAnalysis'
    clean_corpus(
        os.path.join(base_dir, 'exegesis_ordered.txt'),
        os.path.join(base_dir, 'cleaned', 'exegesis_cleaned.txt'),
        os.path.join(base_dir, 'cleaned', 'CLEANING_NOTES.md')
    )
