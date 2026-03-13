import { useState, useEffect, useMemo } from 'react';
import './index.css';

interface DictEntry {
  term: string;
  category: string;
  aliases: string[];
  technical_definition: string;
  interpretive_note: string;
  scholarly_weight: number;
  linked_segments: string[];
  evidence_count: number;
  evidence_anchors: string[];
  see_also: string[];
  card_description: string;
}

interface BioEvent {
  id: string;
  date: string;
  event: string;
  category: string;
  entities: string[];
  source: string;
}

interface SectionNav {
  onGoTimeline: () => void;
  onGoDictionary: () => void;
  onGoScholars: () => void;
  onGoBiography: () => void;
}

interface DictionaryPageProps {
  onBack: () => void;
  initialEntry?: string | null;
  onNavigateToBio?: (term: string) => void;
  sectionNav?: SectionNav;
}

export default function DictionaryPage({ onBack, initialEntry, onNavigateToBio, sectionNav }: DictionaryPageProps) {
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DictEntry | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'described' | 'top'>('described');
  const [bioEvents, setBioEvents] = useState<BioEvent[] | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}dictionary.json`)
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dictionary", err);
        setLoading(false);
      });
  }, []);

  // Auto-select entry when navigating from Biography
  useEffect(() => {
    if (initialEntry && entries.length > 0 && !selectedEntry) {
      const target = initialEntry.toLowerCase();
      const found = entries.find(e =>
        e.term.toLowerCase() === target ||
        (e.aliases || []).some(a => a.toLowerCase() === target)
      );
      if (found) setSelectedEntry(found);
    }
  }, [initialEntry, entries, selectedEntry]);

  // Lazy-load biography data for cross-reference
  useEffect(() => {
    if (selectedEntry && bioEvents === null) {
      fetch(`${import.meta.env.BASE_URL}biography.json`)
        .then(res => res.json())
        .then(data => setBioEvents(data))
        .catch(() => setBioEvents([]));
    }
  }, [selectedEntry, bioEvents]);

  const relatedBioEvents = useMemo(() => {
    if (!selectedEntry || !bioEvents) return [];
    const termLower = selectedEntry.term.toLowerCase();
    const aliasesLower = (selectedEntry.aliases || []).map(a => a.toLowerCase());
    const matchTerms = [termLower, ...aliasesLower];
    return bioEvents.filter(ev =>
      (ev.entities || []).some(ent => {
        const el = ent.toLowerCase();
        if (matchTerms.includes(el)) return true;
        // Last-name match
        const parts = el.split(' ');
        if (parts.length > 1 && matchTerms.includes(parts[parts.length - 1])) return true;
        return false;
      })
    );
  }, [selectedEntry, bioEvents]);

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filter by mode
    if (filterMode === 'described') {
      filtered = filtered.filter(e => (e.card_description || '').length > 100);
    } else if (filterMode === 'top') {
      filtered = filtered.filter(e => e.evidence_count >= 50);
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.term.toLowerCase().includes(q) ||
        (e.card_description || '').toLowerCase().includes(q) ||
        (e.technical_definition || '').toLowerCase().includes(q) ||
        (e.aliases || []).some(a => a.toLowerCase().includes(q))
      );
    }

    // Sort by evidence count
    filtered.sort((a, b) => b.evidence_count - a.evidence_count);
    return filtered;
  }, [entries, searchQuery, filterMode]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading the dictionary...</div>;

  if (selectedEntry) {
    return (
      <div className="app-container">
        <main className="main-content" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <button className="back-btn" onClick={() => setSelectedEntry(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '1rem', padding: 0, marginBottom: '1.5rem' }}>
            &larr; Back to Dictionary
          </button>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{selectedEntry.term}</h1>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="pill-tag theme">{selectedEntry.category}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedEntry.evidence_count} evidence passages</span>
            {(selectedEntry.aliases || []).length > 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Also: {(selectedEntry.aliases || []).join(', ')}
              </span>
            )}
          </div>

          <div style={{ borderTop: '2px solid var(--accent-gold)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>Definition</h2>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              {selectedEntry.technical_definition}
            </p>

            {(selectedEntry.card_description || '').length > 100 && (
              <>
                <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>Entry</h2>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  {selectedEntry.card_description.split('\n\n').map((para, i) => (
                    <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
                  ))}
                </div>
              </>
            )}

            {(selectedEntry.see_also || []).length > 0 && (
              <>
                <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)', marginTop: '2rem', marginBottom: '0.75rem' }}>See Also</h2>
                <div className="tags-container">
                  {(selectedEntry.see_also || []).map((sa, i) => {
                    const linked = entries.find(e => e.term === sa);
                    return (
                      <span
                        key={i}
                        className="pill-tag theme"
                        style={{ cursor: linked ? 'pointer' : 'default', opacity: linked ? 1 : 0.6 }}
                        onClick={() => linked && setSelectedEntry(linked)}
                      >
                        {sa}
                      </span>
                    );
                  })}
                </div>
              </>
            )}

            {(selectedEntry.linked_segments || []).length > 0 && (
              <>
                <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)', marginTop: '2rem', marginBottom: '0.75rem' }}>Linked Segments</h2>
                <div className="tags-container">
                  {(selectedEntry.linked_segments || []).slice(0, 20).map((seg, i) => (
                    <span key={i} className="pill-tag entity">{seg}</span>
                  ))}
                  {(selectedEntry.linked_segments || []).length > 20 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      +{(selectedEntry.linked_segments || []).length - 20} more
                    </span>
                  )}
                </div>
              </>
            )}

            {relatedBioEvents.length > 0 && (
              <>
                <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)', marginTop: '2rem', marginBottom: '0.75rem' }}>
                  Biography ({relatedBioEvents.length})
                </h2>
                {relatedBioEvents.map((ev) => (
                  <div key={ev.id} style={{ borderLeft: '3px solid var(--accent-gold)', paddingLeft: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)' }}>{ev.date}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>{ev.source}</span>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                      {ev.event}
                    </p>
                  </div>
                ))}
                {onNavigateToBio && (
                  <button
                    onClick={() => onNavigateToBio(selectedEntry.term)}
                    style={{ background: 'none', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem' }}
                  >
                    View all in Biography &rarr;
                  </button>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <h1>DICTIONARY</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
            {filteredEntries.length} terms
          </p>
        </div>

        {sectionNav ? (
          <div className="nav-section">
            <h3>Sections</h3>
            <div className="year-list">
              <button className="year-button" onClick={sectionNav.onGoTimeline}>Timeline</button>
              <button className="year-button active" style={{ fontWeight: 700 }}>Dictionary</button>
              <button className="year-button" onClick={sectionNav.onGoScholars}>Who's Who</button>
              <button className="year-button" onClick={sectionNav.onGoBiography}>Biography</button>
            </div>
          </div>
        ) : (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', textAlign: 'left', padding: '0.5rem 0', fontSize: '0.95rem' }}>
            &larr; Back to Exegesis
          </button>
        )}

        <input
          type="text"
          className="search-input"
          placeholder="Search terms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="nav-section">
          <h3>Filter</h3>
          <div className="year-list">
            <button className={`year-button ${filterMode === 'described' ? 'active' : ''}`} onClick={() => setFilterMode('described')}>
              With Entries ({entries.filter(e => (e.card_description || '').length > 100).length})
            </button>
            <button className={`year-button ${filterMode === 'top' ? 'active' : ''}`} onClick={() => setFilterMode('top')}>
              Top Terms (50+ evidence)
            </button>
            <button className={`year-button ${filterMode === 'all' ? 'active' : ''}`} onClick={() => setFilterMode('all')}>
              All ({entries.length})
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content" style={{ maxWidth: '900px' }}>
        <div className="timeline-grid">
          {filteredEntries.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No terms match the current search.</p>
          )}
          {filteredEntries.map(entry => (
            <div
              key={entry.term}
              className="summary-card"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="card-header">
                <span className="chunk-id">{entry.term}</span>
                <span className="chunk-date">{entry.evidence_count} passages</span>
              </div>
              <p className="card-excerpt">
                {(entry.card_description || '').length > 100
                  ? entry.card_description.slice(0, 200) + '...'
                  : entry.technical_definition.slice(0, 200)}
              </p>
              <div className="tags-container">
                <span className="pill-tag theme">{entry.category}</span>
                {(entry.aliases || []).slice(0, 2).map((a, i) => (
                  <span key={i} className="pill-tag entity">{a}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
