# PKD Exegesis Audit Report — 2026-03-13

## Summary
- Data Integrity: 16/21 checks passed
- Viewer Functionality: 26/27 checks passed
- Cross-Navigation: 6/10 checks passed
- Style & UX: 6/7 checks passed
- **Overall: 54/65 checks passed (83%)**

---

## Critical Issues

### 1. summaries.json: 245 entries (37%) have empty themes[] and entities[]
All entries from circa 1977, 1978, and circa 1979-1980 batches lack theme and entity tagging. These entries are unsearchable by topic and produce no pill-tags on cards.

### 2. summaries.json: 1 duplicate ID
`'Exegesis Chunk Summary: 16-16'` appears twice with different content. One should be renamed.

### 3. dictionary.json: 86 entries missing aliases[] field
Entries added in a later batch (indices 257+) omit the `aliases` field entirely. Code guards (`|| []`) prevent crashes, but these entries cannot be matched via aliases.

### 4. dictionary.json: 40 noise terms with inflated evidence counts
Common English words ("Complete" 851, "Well" 342, "However" 293, "Perhaps" 259, etc.) occupy dictionary slots with no scholarly content. These pollute the "Top Terms" filter.

### 5. biography.json: 46 range entries have corrupted date separator
Range dates use an en-dash or corrupted character instead of ASCII hyphen. Expected `1933-1934`, stored with non-ASCII separator. May break parsing/filtering.

### 6. whos_who.json: 4 duplicate scholars across tiers
Same person appears under different scholar_ids at different tiers:
- Andrew M. Butler (Tier 2 + Tier 4)
- David Sandner (Tier 2 + Tier 4)
- Frank Hollander (Tier 3 + Tier 4)
- Gregg Rickman (Tier 2 + Tier 4)

### 7. whos_who.json: 3 names with trailing parenthesis
George Slusser, Joc Potter, R.M.P. stored as `"Name)"` with spurious `)`.

### 8. whos_who.json: "Linguistics" ghost entry
`scholar_id: linguistics` appears to be a data artifact, not a real person.

---

## Warnings

### Data Quality
- **biography.json**: 11 events under 5 words (style guide says 8-16). Mostly marriage/divorce entries ("Marriage to X", "Divorce from X")
- **biography.json**: Only 2 sources used (Sutin 78, Arnold 41). No Rickman, Carrere, PKD Letters, or Exegesis citations
- **biography.json**: No importance=1 entries used. Categories `financial` and `travel` have zero entries
- **biography.json**: 1 approximate date missing `c.` prefix (pkd_bio_1966_jung_reading)
- **dictionary.json**: Only 144/588 entries (24.5%) have substantive card_descriptions
- **dictionary.json**: 147 legitimate terms with 50+ evidence passages lack descriptions
- **dictionary.json**: Category taxonomy heavily skewed — 500/588 are "Top Term"
- **whos_who.json**: 68 entries (Tier 4-5) have blank interpretive_stance
- **whos_who.json**: 1 PDF with null date field (laurie-jui-hua-tseng)

### Viewer Functionality
- **App.tsx**: Timeline entity tags are NOT linked to Dictionary (linking only exists on BiographyPage)
- **DictionaryPage**: No empty-state message when search/filter returns zero results
- **DictionaryPage**: `interpretive_note` field not included in search
- **ScholarsPage**: Search does not cover `key_works` or `affiliation` fields

### Cross-Navigation Gaps
- **No Dictionary → Who's Who link**: Scholar entries are siloed
- **No Timeline → Biography link**: No per-card shortcut to related biographical events
- **No Timeline → Dictionary entity linking**: Entity tags on main timeline only trigger tag-filter, not dictionary navigation
- **dictNavTarget not cleared on Dict→Bio transition**: Stale target may persist if user returns to Dictionary later
- **ENTITY_EXCLUSIONS thin on publishers/awards**: May need additions for Doubleday, DAW, BSFA, etc.

---

## Coverage Statistics

### Exegesis Timeline (summaries.json)
- **659 entries** across 7 year groups
- Year distribution: 1974 (1), 1975 (66), 1976 (116), circa 1977 (119), 1978 (119), circa 1979-1980 (50), 1981 (188)
- 414 entries (63%) have full themes + entities tagging
- 245 entries (37%) have empty themes and entities arrays

### Dictionary (dictionary.json)
- **588 total terms**
- 144 with full card_descriptions (24.5%)
- 437 with no card_description at all
- 7 with stub descriptions (< 100 chars)
- 86 missing aliases field
- 40 noise terms (common English words)
- ~147 legitimate high-evidence terms needing descriptions
- 5 categories: Top Term (500), Theme/Concept (55), Historical/Theological Figure (31), Tradition/Theology (1), General Topic (1)
- see_also graph: fully intact, 0 broken references

### Biography (biography.json)
- **119 entries** across 23 categories (2 unused)
- Sources: Sutin (78), Arnold (41)
- Importance distribution: 2 (18), 3 (60), 4 (29), 5 (12)
- 45 unique entities referenced
- 13 entities linked to dictionary terms
- Date range: 1928–1982

### Who's Who (whos_who.json)
- **110 scholars** across 5 tiers
- Tier distribution: T1 (5), T2 (17), T3 (4), T4 (77), T5 (7)
- **153 archived PDFs** totaling **16,709 pages**
- 68 entries with blank interpretive_stance (all Tier 4-5)

---

## Viewer Functionality Results (26/27 PASS)

| Component | Check | Result |
|---|---|---|
| App.tsx | Year filtering | PASS |
| App.tsx | Search (content, excerpt, themes, entities) | PASS |
| App.tsx | Pagination (50/page) | PASS |
| App.tsx | Tag clicks → TagPage | PASS |
| App.tsx | Section navigation | PASS |
| App.tsx | **Timeline entity tags linked to Dictionary** | **FAIL** |
| DictionaryPage | Filter modes (With Entries / Top / All) | PASS |
| DictionaryPage | Search | PASS |
| DictionaryPage | Detail view sections | PASS |
| DictionaryPage | Null guards | PASS |
| DictionaryPage | initialEntry auto-select | PASS |
| DictionaryPage | Biography cross-reference | PASS |
| BiographyPage | Era filtering | PASS |
| BiographyPage | Category filtering + counts | PASS |
| BiographyPage | Density control | PASS |
| BiographyPage | Search filters | PASS |
| BiographyPage | Linked entity tags | PASS |
| BiographyPage | initialFilter prop | PASS |
| ScholarsPage | Tier filtering | PASS |
| ScholarsPage | Search | PASS |
| ScholarsPage | Scholar card expansion | PASS |
| ScholarsPage | PDF archive display | PASS |
| ScholarsPage | Back navigation | PASS |
| TagPage | Groups by year | PASS |
| TagPage | Tag navigation | PASS |
| TagPage | Back button | PASS |
| TagPage | Expanded markdown content | PASS |

## Cross-Navigation Results (6/10 PASS)

| Check | Result |
|---|---|
| dictionaryLookup → BiographyPage | PASS |
| resolveToDictTerm → BiographyPage | PASS |
| onNavigateToDict → BiographyPage | PASS |
| initialEntry → DictionaryPage | PASS |
| onNavigateToBio → DictionaryPage | PASS |
| Nav targets cleared on back | PARTIAL |
| ENTITY_EXCLUSIONS comprehensive | PARTIAL |
| Timeline entities linked to Dictionary | FAIL |
| Dictionary → Who's Who link | FAIL |
| Timeline → Biography link | FAIL |

## Style & UX Results (6/7 PASS)

| Check | Result |
|---|---|
| Consistent CSS classes | PASS |
| Sidebar navigation consistent | PASS |
| Mobile responsive (768px) | PASS |
| Loading states | PASS |
| Empty states | PARTIAL (DictionaryPage missing) |
| .pill-tag.entity.linked style | PASS |
| Color scheme consistent | PASS |

---

## Recommendations (Priority Order)

### P0 — Data Fixes (no code changes needed)
1. **Tag the 245 untagged summaries** with themes and entities — this is the single largest quality gap
2. **Remove 40 noise terms** from dictionary.json (Complete, Well, However, etc.)
3. **Fix biography date separators** — replace corrupted characters with ASCII hyphens
4. **Deduplicate 4 scholar entries** in whos_who.json
5. **Fix 3 scholar names** with trailing parenthesis
6. **Remove "Linguistics" ghost entry** from whos_who.json
7. **Add aliases field** to 86 dictionary entries missing it
8. **Fix duplicate summaries ID** (Exegesis Chunk Summary: 16-16)

### P1 — Content Gaps
9. **Write card_descriptions for 147 high-evidence dictionary terms** — only 24.5% of terms are fully described
10. **Add biography entries from additional sources** — currently only Sutin and Arnold; add Rickman, Carrere, PKD Letters
11. **Fill short biography events** to 8-16 word style guide minimum
12. **Add importance=1 entries** for minor anecdotes and fill `financial`/`travel` categories

### P2 — Cross-Navigation Enhancements
13. **Link timeline entity tags to Dictionary** — apply same resolveToDictTerm logic from BiographyPage to App.tsx timeline cards
14. **Add Dictionary → Who's Who link** — when a dictionary entry mentions a scholar, link to their Who's Who profile
15. **Add Timeline → Biography link** — per-card or per-entity shortcut to related biography events
16. **Clear dictNavTarget on Dict→Bio transition** to prevent stale auto-selection
17. **Expand ENTITY_EXCLUSIONS** with publishers, awards, and genre-industry proper nouns

### P3 — UX Polish
18. **Add empty-state message to DictionaryPage** when search/filter returns no results
19. **Add key_works and affiliation to ScholarsPage search**
20. **Add interpretive_note to DictionaryPage search**
21. **Add cross-page section navigation** in sub-page sidebars (currently must go back to switch pages)
