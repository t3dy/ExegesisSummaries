import os
import csv

ext_dir = 'c:/ExegesisAnalysis/extraction'
os.makedirs(ext_dir, exist_ok=True)

print("Generating Stage 9 Extraction CSV files...")

# 1. concept_glossary.csv
# concept_id, concept_term, definition_in_context, variant_terms, first_section_id, recurring_sections, notes
concepts = [
    {"concept_id": "C001", "concept_term": "Orthogonal Time", "definition_in_context": "Time moving at right angles to linear time, retrogressive, pointing toward entelechy/completion.", "variant_terms": "retrograde axis", "first_section_id": "SECTION_001", "recurring_sections": "SECTION_001", "notes": "Connected to the Parousia"},
    {"concept_id": "C002", "concept_term": "Parousia", "definition_in_context": "The Final Things, completion of time, experienced as an intrusion of the Divine in March 1974.", "variant_terms": "Eschatology, Final Days", "first_section_id": "SECTION_001", "recurring_sections": "SECTION_001", "notes": "He claims this is real and has arrived."},
    {"concept_id": "C003", "concept_term": "Entelechy", "definition_in_context": "The completion of one's personal film or time-line.", "variant_terms": "", "first_section_id": "SECTION_001", "recurring_sections": "SECTION_001", "notes": "Completed for the author in 1974."}
]
with open(os.path.join(ext_dir, 'concept_glossary.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=concepts[0].keys())
    writer.writeheader()
    writer.writerows(concepts)

# 2. timeline.csv
# timeline_id, date_text, iso_date_if_inferable, event_type, event_summary, section_id, chunk_id, confidence
timeline = [
    {"timeline_id": "T001", "date_text": "March 1974", "iso_date_if_inferable": "1974-03", "event_type": "Mystical", "event_summary": "Vision of the Parousia, pale light, death of Pinky the cat.", "section_id": "SECTION_001", "chunk_id": "1975-02-27_Claudia_01", "confidence": "High"},
    {"timeline_id": "T002", "date_text": "the '50s", "iso_date_if_inferable": "", "event_type": "Autobiographical", "event_summary": "Murder of a poor rat to protect his daughters; burial with St. Christopher's medal.", "section_id": "SECTION_001", "chunk_id": "1975-02-27_Claudia_01", "confidence": "High"},
    {"timeline_id": "T003", "date_text": "1964", "iso_date_if_inferable": "1964", "event_type": "Mystical", "event_summary": "Acid trip where he experienced the Dies Irae/Day of Wrath.", "section_id": "SECTION_001", "chunk_id": "1975-02-27_Claudia_01", "confidence": "High"},
    {"timeline_id": "T004", "date_text": "Feb 25", "iso_date_if_inferable": "1975-02-25", "event_type": "Mystical", "event_summary": "Stoned prayer where he realized Erasmus was his guide replacing his father.", "section_id": "SECTION_001", "chunk_id": "1975-02-27_Claudia_02", "confidence": "Medium"}
]
with open(os.path.join(ext_dir, 'timeline.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=timeline[0].keys())
    writer.writeheader()
    writer.writerows(timeline)

# 3. argument_map.csv
# argument_id, claim, claim_type, supporting_evidence, countertension, related_concepts, section_ids, confidence
arguments = [
    {"argument_id": "A001", "claim": "Form-reversion in UBIK is actually orthogonal time heading towards perfection.", "claim_type": "Metaphysical/Literary", "supporting_evidence": "Comparison of Joe Chip's vision to his own vision of Rome in 1974.", "countertension": "Contradicts standard view of entropy as decay.", "related_concepts": "Orthogonal Time", "section_ids": "SECTION_001", "confidence": "High"}
]
with open(os.path.join(ext_dir, 'argument_map.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=arguments[0].keys())
    writer.writeheader()
    writer.writerows(arguments)

# 4. motif_matrix.csv
motifs = [
    {"section_id": "SECTION_001", "orthogonal time": "High", "lineal time": "High", "Parousia": "High", "spring/winter": "0", "child/childhood": "Medium", "Rome/Iron City": "High", "rat": "High", "cat/Pinky": "High", "Logos": "Low", "Christ": "Medium", "Dionysos": "Low", "dreamer": "Medium", "awakening": "0", "judgment": "High", "anamnesis": "0"}
]
with open(os.path.join(ext_dir, 'motif_matrix.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=motifs[0].keys())
    writer.writeheader()
    writer.writerows(motifs)

# 5. people_index.csv
people = [
    {"person_id": "P001", "name": "Claudia", "role_in_document": "Recipient of letter", "relation_to_author": "Correspondent", "associated_sections": "SECTION_001", "notes": ""},
    {"person_id": "P002", "name": "Richard Nixon", "role_in_document": "The 'Beast'", "relation_to_author": "Political adversary/Cosmic adversary", "associated_sections": "SECTION_001", "notes": "Referred to as 666"},
    {"person_id": "P003", "name": "Erasmus", "role_in_document": "Spiritual guide", "relation_to_author": "Father figure replacement", "associated_sections": "SECTION_001", "notes": ""}
]
with open(os.path.join(ext_dir, 'people_index.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=people[0].keys())
    writer.writeheader()
    writer.writerows(people)

# 6. texts_works_index.csv
texts = [
    {"work_id": "W001", "title_or_short_name": "UBIK", "work_type": "Novel", "role_in_document": "Prophetic blueprint for orthogonal time.", "associated_sections": "SECTION_001", "notes": "Written by author."},
    {"work_id": "W002", "title_or_short_name": "FLOW MY TEARS, THE POLICEMAN SAID", "work_type": "Novel", "role_in_document": "Weapun against the Beast (Nixon).", "associated_sections": "SECTION_001", "notes": "Published Feb 1974."}
]
with open(os.path.join(ext_dir, 'texts_works_index.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=texts[0].keys())
    writer.writeheader()
    writer.writerows(texts)

# 7. entity_mentions.csv
mentions = [
    {"mention_id": "M001", "entity_name": "Joe Chip", "entity_type": "Fictional Character", "chunk_id": "1975-02-27_Claudia_01", "section_id": "SECTION_001", "context_snippet": "The decay backward of forms which Joe Chip sees...it is not decay."}
]
with open(os.path.join(ext_dir, 'entity_mentions.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=mentions[0].keys())
    writer.writeheader()
    writer.writerows(mentions)

# 8. theme_passages.csv
themes = [
    {"passage_id": "TP001", "theme": "Salvation via mundane objects", "chunk_id": "1975-02-27_Claudia_01", "section_id": "SECTION_001", "short_excerpt": "I called him 'Tunny,' from a del Monte billboard for some canned food.", "why_it_matters": "Shows fusion of American consumerism with high theology."}
]
with open(os.path.join(ext_dir, 'theme_passages.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=themes[0].keys())
    writer.writeheader()
    writer.writerows(themes)

# 9. cross_reference_table.csv
cross_refs = [
    {"source_item_type": "Person", "source_item_id": "P002", "target_item_type": "Work", "target_item_id": "W002", "relation_type": "Target of", "notes": "Flow My Tears was written to combat Nixon."}
]
with open(os.path.join(ext_dir, 'cross_reference_table.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=cross_refs[0].keys())
    writer.writeheader()
    writer.writerows(cross_refs)

print("Generated all extraction CSVs successfully.")
