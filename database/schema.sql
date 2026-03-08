-- Exegesis Humanities Workbench Database Schema

CREATE TABLE manifests_sections (
    section_id TEXT PRIMARY KEY,
    section_order INTEGER,
    section_title TEXT,
    date_text TEXT,
    iso_date_if_inferable TEXT,
    recipient TEXT,
    section_type TEXT,
    source_filename TEXT,
    start_marker TEXT,
    end_marker TEXT,
    notes TEXT
);

CREATE TABLE manifests_chunks (
    chunk_id TEXT PRIMARY KEY,
    section_id TEXT,
    chunk_order_within_section INTEGER,
    filename TEXT,
    word_count INTEGER,
    overlap_previous INTEGER,
    overlap_next INTEGER,
    date_text TEXT,
    recipient TEXT,
    notes TEXT,
    FOREIGN KEY(section_id) REFERENCES manifests_sections(section_id)
);

CREATE TABLE concepts (
    concept_id TEXT PRIMARY KEY,
    concept_term TEXT,
    definition_in_context TEXT,
    variant_terms TEXT,
    first_section_id TEXT,
    recurring_sections TEXT,
    notes TEXT
);

CREATE TABLE timeline (
    timeline_id TEXT PRIMARY KEY,
    date_text TEXT,
    iso_date_if_inferable TEXT,
    event_type TEXT,
    event_summary TEXT,
    section_id TEXT,
    chunk_id TEXT,
    confidence TEXT,
    FOREIGN KEY(section_id) REFERENCES manifests_sections(section_id),
    FOREIGN KEY(chunk_id) REFERENCES manifests_chunks(chunk_id)
);

CREATE TABLE arguments (
    argument_id TEXT PRIMARY KEY,
    claim TEXT,
    claim_type TEXT,
    supporting_evidence TEXT,
    countertension TEXT,
    related_concepts TEXT,
    section_ids TEXT,
    confidence TEXT
);

CREATE TABLE people (
    person_id TEXT PRIMARY KEY,
    name TEXT,
    role_in_document TEXT,
    relation_to_author TEXT,
    associated_sections TEXT,
    notes TEXT
);

CREATE TABLE texts_works (
    work_id TEXT PRIMARY KEY,
    title_or_short_name TEXT,
    work_type TEXT,
    role_in_document TEXT,
    associated_sections TEXT,
    notes TEXT
);

CREATE TABLE entity_mentions (
    mention_id TEXT PRIMARY KEY,
    entity_name TEXT,
    entity_type TEXT,
    chunk_id TEXT,
    section_id TEXT,
    context_snippet TEXT,
    FOREIGN KEY(section_id) REFERENCES manifests_sections(section_id),
    FOREIGN KEY(chunk_id) REFERENCES manifests_chunks(chunk_id)
);

CREATE TABLE theme_passages (
    passage_id TEXT PRIMARY KEY,
    theme TEXT,
    chunk_id TEXT,
    section_id TEXT,
    short_excerpt TEXT,
    why_it_matters TEXT,
    FOREIGN KEY(section_id) REFERENCES manifests_sections(section_id),
    FOREIGN KEY(chunk_id) REFERENCES manifests_chunks(chunk_id)
);

CREATE TABLE cross_references (
    source_item_type TEXT,
    source_item_id TEXT,
    target_item_type TEXT,
    target_item_id TEXT,
    relation_type TEXT,
    notes TEXT
);
