"""
Batch deterministic extraction across all 890 chunks.
Extracts: people, works, dates, motif keywords, entity mentions.
Appends results to CSVs in extraction/.
"""

import os
import re
import csv
import glob
from collections import Counter, defaultdict

CHUNKS_DIR = 'c:/ExegesisAnalysis/chunks'
EXTRACTION_DIR = 'c:/ExegesisAnalysis/extraction'

# ── Known entity dictionaries ──────────────────────────────────────────────

KNOWN_PEOPLE = [
    "Claudia", "Phyllis", "Tony", "Tessa", "Dorothy", "Pat", "Doris",
    "Ursula", "Henry", "Anne", "Laura", "Christopher", "Isa",
    "Nixon", "Richard Nixon", "Erasmus", "Pinky", "Rog Phillips",
    "Tony Boucher", "Tim Powers", "K.W. Jeter", "Jim Blaylock",
    "Victoria Principal", "Mr. Wiggins", "Dante", "Virgil",
    "St. Paul", "Jesus", "Christ", "God", "Holy Spirit",
    "Plato", "Aristotle", "Plotinus", "Parmenides", "Heraclitus",
    "Empedocles", "Xenophanes", "Pythagoras", "Spinoza", "Hegel",
    "Leibniz", "Whitehead", "Tillich", "Heidegger", "Jung",
    "Freud", "Goethe", "Wagner", "Bach", "Beethoven", "Mozart",
    "Luther", "Calvin", "Augustine", "Aquinas", "Boehme", "Eckhart",
    "Dionysos", "Dionysus", "Aphrodite", "Apollo", "Athena", "Zeus",
    "Simon Magus", "Mani", "Valentinus", "Basilides", "Marcion",
    "Bishop Pike", "Jim Pike", "Kozyrev", "Dr. Ornstein",
    "Thomas", "Firebright", "Fat", "Horselover Fat",
    "Zebra", "VALIS", "Sophia", "Logos",
    "Joe Chip", "Glen Runciter", "Jason Taverner", "Angel Archer",
    "Timothy Archer", "Palmer Eldritch", "Rick Deckard",
    "Tagomi", "Juliana", "Frank Frink", "Baynes",
    "Bob Arctor", "Donna", "Barris",
]

KNOWN_WORKS = [
    "UBIK", "Ubik",
    "FLOW MY TEARS", "Flow My Tears",
    "VALIS", "Valis",
    "DIVINE INVASION", "Divine Invasion",
    "TRANSMIGRATION", "Transmigration of Timothy Archer",
    "SCANNER DARKLY", "Scanner Darkly", "A Scanner Darkly",
    "THREE STIGMATA", "Three Stigmata", "Palmer Eldritch",
    "MAN IN THE HIGH CASTLE", "Man in the High Castle", "High Castle",
    "DO ANDROIDS DREAM", "Do Androids Dream", "Androids",
    "MAZE OF DEATH", "Maze of Death",
    "GALACTIC POT-HEALER", "Galactic Pot-Healer",
    "PENULTIMATE TRUTH", "Penultimate Truth",
    "EYE IN THE SKY", "Eye in the Sky",
    "SOLAR LOTTERY", "Solar Lottery",
    "MARTIAN TIME-SLIP", "Martian Time-Slip",
    "DR. BLOODMONEY", "Dr. Bloodmoney",
    "CLANS OF THE ALPHANE MOON", "Clans of the Alphane Moon",
    "COUNTER-CLOCK WORLD", "Counter-Clock World",
    "TEARS", "EXEGESIS",
    "DEUS IRAE", "Deus Irae",
    "Bible", "Torah", "Quran",
    "Republic", "Timaeus", "Symposium", "Phaedrus",
    "Tractatus", "I Ching", "Tao Te Ching",
    "Book of Acts", "Acts", "Revelation", "Genesis", "Exodus",
    "Gospel of John", "Gospel of Thomas",
    "Parsifal", "Ring", "Faust",
    "Hamlet", "King Lear",
    "Britannica", "Brit 3",
]

MOTIF_KEYWORDS = {
    "orthogonal_time": ["orthogonal", "retrograde axis", "counter-time", "counter time"],
    "linear_time": ["linear time", "lineal time", "ordinary time"],
    "parousia": ["Parousia", "Final Things", "eschatology", "eschaton", "Second Coming"],
    "rome_iron_city": ["Rome", "Iron City", "Empire", "Black Iron Prison"],
    "anamnesis": ["anamnesis", "loss of forgetting", "unforgetting", "remembering"],
    "entelechy": ["entelechy", "completion", "actualization"],
    "logos": ["Logos", "Word", "Cosmic Christ"],
    "the_divine": ["God", "Holy Spirit", "Christ", "Savior", "Lord"],
    "gnosticism": ["gnostic", "Gnosticism", "demiurge", "archon", "kenoma", "pleroma", "hypostasis"],
    "two_source_cosmology": ["Yin", "Yang", "Form I", "Form II"],
    "dreaming": ["dream", "dreaming", "sleeping", "vision"],
    "childhood": ["child", "childhood", "little children", "infant"],
    "death_rebirth": ["death", "dying", "rebirth", "resurrection", "reborn"],
    "judgment": ["judgment", "Judgment Day", "Dies Irae", "Wrath", "condemned"],
    "dionysos": ["Dionysos", "Dionysus", "Bacchus", "maenads"],
    "zebra": ["Zebra", "ZEBRA"],
    "valis_entity": ["VALIS", "Vast Active Living Intelligence"],
    "pink_light": ["pink light", "pink beam", "pink laser"],
    "information": ["information", "living information", "plasmate"],
    "hologram": ["hologram", "holographic", "hologramatic"],
    "symmetry_breaking": ["symmetry", "symmetry-breaking", "parity"],
    "music": ["music", "Bach", "Beethoven", "Mozart", "Wagner", "Parsifal"],
    "fish_sign": ["fish", "ichthys", "ICHTHYS", "vesicle piscis"],
    "maze": ["maze", "labyrinth"],
    "android": ["android", "simulacra", "simulacrum", "replicant"],
    "drug_perception": ["acid", "LSD", "drug", "stoned", "loaded", "high"],
    "writing_process": ["writing", "wrote", "my novel", "my book", "manuscript"],
    "garden": ["garden", "Garden of Eden", "paradise", "Palm Tree"],
    "cat": ["cat", "Pinky", "kitten"],
    "rat": ["rat", "Rat in the Skull"],
}

def extract_from_chunk(filepath):
    """Run deterministic extraction on a single chunk file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    basename = os.path.basename(filepath).replace('.txt', '')
    
    # Extract section_id from chunk manifest mapping
    # Parse from filename pattern: DATE_LABEL_NN
    parts = basename.rsplit('_', 1)
    
    # People found
    people_found = []
    for person in KNOWN_PEOPLE:
        # Use word boundary matching
        pattern = re.compile(r'\b' + re.escape(person) + r'\b', re.IGNORECASE)
        matches = pattern.findall(text)
        if matches:
            # Get a context snippet
            match = pattern.search(text)
            start = max(0, match.start() - 40)
            end = min(len(text), match.end() + 40)
            snippet = text[start:end].replace('\n', ' ').strip()
            people_found.append({
                'entity_name': person,
                'count': len(matches),
                'context_snippet': snippet[:120]
            })
    
    # Works found
    works_found = []
    for work in KNOWN_WORKS:
        pattern = re.compile(r'\b' + re.escape(work) + r'\b', re.IGNORECASE)
        matches = pattern.findall(text)
        if matches:
            match = pattern.search(text)
            start = max(0, match.start() - 40)
            end = min(len(text), match.end() + 40)
            snippet = text[start:end].replace('\n', ' ').strip()
            works_found.append({
                'work_name': work,
                'count': len(matches),
                'context_snippet': snippet[:120]
            })
    
    # Motif scoring
    motif_scores = {}
    for motif, keywords in MOTIF_KEYWORDS.items():
        total = 0
        for kw in keywords:
            total += len(re.findall(re.escape(kw), text, re.IGNORECASE))
        if total >= 5:
            motif_scores[motif] = 'High'
        elif total >= 2:
            motif_scores[motif] = 'Medium'
        elif total >= 1:
            motif_scores[motif] = 'Low'
        else:
            motif_scores[motif] = '0'
    
    # Date extraction
    dates_found = []
    date_patterns = [
        re.compile(r'\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b'),
        re.compile(r'\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4})\b'),
        re.compile(r'\b(\d{4})\b'),  # standalone years
    ]
    for dp in date_patterns[:2]:  # only explicit dates
        for m in dp.finditer(text):
            dates_found.append(m.group(1))
    
    # Standalone years (filter to plausible range)
    year_pattern = re.compile(r'\b(1[89]\d{2}|20[0-2]\d)\b')
    years_found = [y for y in year_pattern.findall(text)]
    year_counts = Counter(years_found)
    
    return {
        'chunk_id': basename,
        'people': people_found,
        'works': works_found,
        'motifs': motif_scores,
        'dates': dates_found,
        'year_counts': dict(year_counts),
        'word_count': len(text.split())
    }


def main():
    chunk_files = sorted(glob.glob(os.path.join(CHUNKS_DIR, '*.txt')))
    print(f"Processing {len(chunk_files)} chunks...")
    
    all_entity_mentions = []
    all_motif_rows = []
    all_people_global = Counter()
    all_works_global = Counter()
    all_years_global = Counter()
    section_motif_agg = defaultdict(lambda: defaultdict(int))
    
    mention_id = 1
    
    for i, fpath in enumerate(chunk_files):
        result = extract_from_chunk(fpath)
        chunk_id = result['chunk_id']
        
        # Infer section_id from chunk_id pattern
        # Patterns: DATE_LABEL_NN or U_LABEL_NN
        # We need the section manifest to map properly, but a rough parse:
        # just use the chunk's prefix
        
        for p in result['people']:
            all_people_global[p['entity_name']] += p['count']
            all_entity_mentions.append({
                'mention_id': f'M{mention_id:05d}',
                'entity_name': p['entity_name'],
                'entity_type': 'Person',
                'chunk_id': chunk_id,
                'section_id': '',
                'context_snippet': p['context_snippet']
            })
            mention_id += 1
        
        for w in result['works']:
            all_works_global[w['work_name']] += w['count']
            all_entity_mentions.append({
                'mention_id': f'M{mention_id:05d}',
                'entity_name': w['work_name'],
                'entity_type': 'Work',
                'chunk_id': chunk_id,
                'section_id': '',
                'context_snippet': w['context_snippet']
            })
            mention_id += 1
        
        # Motif row for this chunk
        motif_row = {'chunk_id': chunk_id}
        motif_row.update(result['motifs'])
        all_motif_rows.append(motif_row)
        
        for yr, cnt in result['year_counts'].items():
            all_years_global[yr] += cnt
        
        if (i + 1) % 100 == 0:
            print(f"  ...processed {i+1}/{len(chunk_files)} chunks")
    
    print(f"Total entity mentions extracted: {len(all_entity_mentions)}")
    
    # Write expanded entity_mentions.csv
    em_path = os.path.join(EXTRACTION_DIR, 'entity_mentions.csv')
    with open(em_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['mention_id', 'entity_name', 'entity_type', 'chunk_id', 'section_id', 'context_snippet'])
        writer.writeheader()
        writer.writerows(all_entity_mentions)
    
    # Write full motif_matrix.csv
    motif_path = os.path.join(EXTRACTION_DIR, 'motif_matrix.csv')
    if all_motif_rows:
        fieldnames = list(all_motif_rows[0].keys())
        with open(motif_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_motif_rows)
    
    # Write people_index.csv (global aggregation)
    pi_path = os.path.join(EXTRACTION_DIR, 'people_index.csv')
    with open(pi_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['person_id', 'name', 'total_mentions', 'role_in_document', 'relation_to_author', 'associated_sections', 'notes'])
        writer.writeheader()
        for idx, (name, count) in enumerate(all_people_global.most_common(), 1):
            writer.writerow({
                'person_id': f'P{idx:03d}',
                'name': name,
                'total_mentions': count,
                'role_in_document': '',
                'relation_to_author': '',
                'associated_sections': '',
                'notes': ''
            })
    
    # Write texts_works_index.csv (global aggregation)
    tw_path = os.path.join(EXTRACTION_DIR, 'texts_works_index.csv')
    with open(tw_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['work_id', 'title_or_short_name', 'total_mentions', 'work_type', 'role_in_document', 'associated_sections', 'notes'])
        writer.writeheader()
        for idx, (name, count) in enumerate(all_works_global.most_common(), 1):
            writer.writerow({
                'work_id': f'W{idx:03d}',
                'title_or_short_name': name,
                'total_mentions': count,
                'work_type': '',
                'role_in_document': '',
                'associated_sections': '',
                'notes': ''
            })
    
    # Write year frequency distribution
    yr_path = os.path.join(EXTRACTION_DIR, 'year_frequency.csv')
    with open(yr_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['year', 'mention_count'])
        writer.writeheader()
        for yr, cnt in sorted(all_years_global.items()):
            writer.writerow({'year': yr, 'mention_count': cnt})
    
    print(f"\nTop 20 People:")
    for name, count in all_people_global.most_common(20):
        print(f"  {name}: {count}")
    
    print(f"\nTop 20 Works:")
    for name, count in all_works_global.most_common(20):
        print(f"  {name}: {count}")
    
    print(f"\nTop 15 Years Referenced:")
    for yr, cnt in all_years_global.most_common(15):
        print(f"  {yr}: {cnt}")
    
    print(f"\nDone. Extraction files written to {EXTRACTION_DIR}")


if __name__ == '__main__':
    main()
