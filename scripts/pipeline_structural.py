import os
import re
import csv
from datetime import datetime
from dateutil import parser as date_parser

def is_date_line(line):
    # Matches common date formats e.g. February 27, 1975 or Feb. 29, 1975
    date_pattern = re.compile(r'^\s*(?:[A-Z][a-z]+\.?\s+\d{1,2},?\s+19[78]\d|19[78]\d-\d{2}-\d{2})\s*$')
    return bool(date_pattern.match(line))

def is_salutation(line):
    # Matches "Dear Name,"
    salutation_pattern = re.compile(r'^\s*Dear\s+[A-Za-z. ]+,?\s*$')
    return bool(salutation_pattern.match(line))

def parse_date(text):
    try:
        dt = date_parser.parse(text)
        return dt.strftime('%Y-%m-%d')
    except:
        return ""

def process_structural(cleaned_path, manifests_dir, chunks_dir):
    print("Reading cleaned text...")
    with open(cleaned_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    sections = []
    current_section = {
        'lines': [],
        'start_line': 0,
        'date_text': '',
        'recipient': '',
        'title': ''
    }
    
    # Very basic sectioning logic: a new section begins if we see a date or salutation 
    # and the current section implies we've already moved past the previous header metadata.
    state = 'HEADER' # or 'BODY'
    
    for idx, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            current_section['lines'].append(line)
            continue
            
        if is_date_line(line) or is_salutation(line):
            # If we're already accumulating body text, and suddenly see a date or salutation, it's a new section!
            # Or if the current section is huge (> 50 lines), we definitely must cut.
            if state == 'BODY' and len(current_section['lines']) > 10:
                # Save previous section
                sections.append(current_section)
                # Reset
                current_section = {
                    'lines': [line],
                    'start_line': idx,
                    'date_text': '',
                    'recipient': '',
                    'title': ''
                }
                state = 'HEADER'
                if is_date_line(line):
                    current_section['date_text'] = stripped
                else:
                    current_section['recipient'] = stripped.replace('Dear ', '').replace(',', '').strip()
            else:
                # Still in header phase, accumulate metadata
                if is_date_line(line) and not current_section['date_text']:
                    current_section['date_text'] = stripped
                elif is_salutation(line) and not current_section['recipient']:
                    current_section['recipient'] = stripped.replace('Dear ', '').replace(',', '').strip()
                current_section['lines'].append(line)
        else:
            state = 'BODY'
            current_section['lines'].append(line)
            
    if current_section['lines']:
        sections.append(current_section)

    print(f"Detected {len(sections)} sections.")
    
    section_rows = []
    chunk_rows = []
    
    for s_idx, sec in enumerate(sections, 1):
        sec_text = "".join(sec['lines'])
        sec_id = f"SECTION_{s_idx:03d}"
        iso_date = parse_date(sec['date_text'])
        title = sec['recipient'] if sec['recipient'] else ("Letter" if sec['date_text'] else "Fragment")
        if not title: title = "Entry"
        
        section_rows.append({
            'section_id': sec_id,
            'section_order': s_idx,
            'section_title': title,
            'date_text': sec['date_text'],
            'iso_date_if_inferable': iso_date,
            'recipient': sec['recipient'],
            'section_type': 'Letter' if sec['recipient'] else 'Journal',
            'source_filename': 'exegesis_cleaned.txt',
            'start_marker': sec['lines'][0].strip()[:50] if sec['lines'] else '',
            'end_marker': sec['lines'][-1].strip()[:50] if sec['lines'] else '',
            'notes': f"{len(sec_text.split())} words"
        })
        
        # CHUNKING
        # Split into ~2000 word chunks with ~200 word overlap
        words = sec_text.split()
        chunk_size = 2000
        overlap = 200
        
        c_idx = 1
        pos = 0
        while pos < len(words):
            end_pos = pos + chunk_size
            chunk_words = words[pos:end_pos]
            chunk_text = " ".join(chunk_words)
            
            # chunk_id format: YYYY-MM-DD_recipient_or_label_01
            label = sec['recipient'].replace(' ', '_') if sec['recipient'] else sec_id
            date_pref = iso_date if iso_date else "U"
            c_id = f"{date_pref}_{label}_{c_idx:02d}"
            
            c_filename = f"{c_id}.txt"
            c_path = os.path.join(chunks_dir, c_filename)
            
            with open(c_path, 'w', encoding='utf-8') as cf:
                cf.write(chunk_text)
                
            chunk_rows.append({
                'chunk_id': c_id,
                'section_id': sec_id,
                'chunk_order_within_section': c_idx,
                'filename': c_filename,
                'word_count': len(chunk_words),
                'overlap_previous': overlap if pos > 0 else 0,
                'overlap_next': overlap if end_pos < len(words) else 0,
                'date_text': sec['date_text'],
                'recipient': sec['recipient'],
                'notes': ''
            })
            
            pos += (chunk_size - overlap)
            c_idx += 1
            
    # Write manifests
    with open(os.path.join(manifests_dir, 'section_manifest.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=section_rows[0].keys())
        writer.writeheader()
        writer.writerows(section_rows)
        
    with open(os.path.join(manifests_dir, 'chunk_manifest.csv'), 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=chunk_rows[0].keys())
        writer.writeheader()
        writer.writerows(chunk_rows)

    print(f"Generated {len(chunk_rows)} chunks manifest and files.")

if __name__ == '__main__':
    process_structural(
        'c:/ExegesisAnalysis/cleaned/exegesis_cleaned.txt',
        'c:/ExegesisAnalysis/manifests',
        'c:/ExegesisAnalysis/chunks'
    )
