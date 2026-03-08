import os

prompts_dir = 'c:/ExegesisAnalysis/prompts'
os.makedirs(prompts_dir, exist_ok=True)

templates = {
    'chunk_summary.md': """You are a scholarly assistant analyzing a chunk of a complex, ambiguous humanities/theological corpus.
Read the following chunk and produce a summary exactly following the schema below.
- Preserve contradictory claims rather than harmonizing them.
- Ensure evidence quotes are short and selective.

# {chunk_id}
# {source_section}
# {date}
# {recipient}
## concise_summary
## key_claims
## recurring_concepts
## people_entities
## texts_works_referenced
## autobiographical_events
## theological_philosophical_motifs
## literary_self_reference
## symbols_images_metaphors
## tensions_contradictions
## evidence_quotes
## uncertainty_flags

[SOURCE TEXT FOLLOWS]
{text}
""",

    'section_synthesis.md': """You are synthesizing multiple chunk summaries into a coherent section-level analysis for a humanities corpus.
Review the provided chunk summaries and output a markdown document that answers:
- What is being argued?
- What is being narrated?
- Which concepts dominate?
- Which entities and texts matter most?
- How does the section relate to fiction and literary production?
- What changes relative to earlier or nearby sections?
- What is uncertain or unstable?

Include exactly this subheading at the end:
## scholarly_value
Explain why this section may matter for a researcher.

[CHUNK SUMMARIES FOLLOW]
{chunk_summaries}
""",

    'global_synthesis.md': """You are tasked with generating global synthesis documents from a large corpus of section summaries.
Depending on the specific output required, highlight either the global narrative overview, or the analytical/conceptual patterns.
Ensure that unresolved tensions and conceptual instability are preserved. Focus on developmental shifts over time, major conceptual systems, and literary-theological fusions.

[SECTION SUMMARIES FOLLOW]
{section_summaries}
""",

    'verification.md': """You are to audit an extraction or summary against the original source chunk.
Verify the following claims. Look for omissions, overclaims, probable hallucinations, or compressed ambiguities.
If any point is uncertain, mark it explicitly rather than smoothing it away.
Output a log detailing any discrepancies.

[SOURCE TEXT]
{source_text}

[CLAIMS TO VERIFY]
{claims}
""",

    'entity_extraction.md': """Extract all specific entities (People, Places, Organizations, Works) from the provided text.
Return the results tailored for an entity mentions CSV or database table.
Format:
mention_id | entity_name | entity_type | context_snippet

[SOURCE TEXT]
{text}
""",

    'motif_extraction.md': """Analyze the following text for the presence of major thematic motifs.
Rate the presence (High, Medium, Low, 0) of known motifs (e.g. orthogonal time, Parousia, Rome/Iron City, etc.) and list any new emergent motifs.
Ensure output is easily parsable to a matrix structure.

[SOURCE TEXT]
{text}
""",

    'argument_mapping.md': """Extract structured arguments from the text.
Identify:
- Claim
- Claim Type (Metaphysical, Autobiographical, Literary, etc.)
- Supporting Evidence (brief)
- Countertension (if the text contradicts itself)
- Related Concepts

[SOURCE TEXT]
{text}
"""
}

for filename, content in templates.items():
    path = os.path.join(prompts_dir, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Generated {len(templates)} prompt templates in {prompts_dir}.")
