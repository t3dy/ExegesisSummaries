.mode csv
.import manifests/section_manifest.csv manifests_sections --skip 1
.import manifests/chunk_manifest.csv manifests_chunks --skip 1
.import extraction/concept_glossary.csv concepts --skip 1
.import extraction/timeline.csv timeline --skip 1
.import extraction/argument_map.csv arguments --skip 1
.import extraction/people_index.csv people --skip 1
.import extraction/texts_works_index.csv texts_works --skip 1
.import extraction/entity_mentions.csv entity_mentions --skip 1
.import extraction/theme_passages.csv theme_passages --skip 1
.import extraction/cross_reference_table.csv cross_references --skip 1
