import { useState, useEffect, useMemo } from 'react';
import './index.css';

interface BioEvent {
  id: string;
  date: string;
  date_precision: string;
  event: string;
  category: string;
  entities: string[];
  location: string;
  source: string;
  importance: number;
  notes: string;
}

interface SectionNav {
  onGoTimeline: () => void;
  onGoDictionary: () => void;
  onGoScholars: () => void;
  onGoBiography: () => void;
}

interface BiographyPageProps {
  onBack: () => void;
  dictionaryLookup?: Map<string, string>;
  resolveToDictTerm?: (entity: string, lookup: Map<string, string>) => string | null;
  onNavigateToDict?: (term: string) => void;
  initialFilter?: string | null;
  sectionNav?: SectionNav;
}

const CATEGORY_NAMES: Record<string, string> = {
  birth: 'Birth',
  death: 'Death',
  education: 'Education',
  reading: 'Reading',
  philosophical_influence: 'Philosophical Influence',
  religious_experience: 'Religious Experience',
  visionary_experience: 'Visionary Experience',
  religious_thought: 'Religious Thought',
  publication: 'Publication',
  award: 'Award',
  marriage: 'Marriage',
  divorce: 'Divorce',
  family: 'Family',
  friendship: 'Friendship',
  professional_network: 'Professional Network',
  financial: 'Financial',
  health: 'Health',
  drug_use: 'Drug Use',
  residence: 'Residence',
  travel: 'Travel',
  lecture: 'Lecture',
  correspondence: 'Correspondence',
  employment: 'Employment',
  film_adaptation: 'Film Adaptation',
  crime: 'Crime',
};

const CATEGORY_COLORS: Record<string, string> = {
  birth: '#C09A4D',
  death: '#8B6B6B',
  education: '#6B8E6B',
  reading: '#6B8E6B',
  philosophical_influence: '#6B8E6B',
  religious_experience: '#9B6B9B',
  visionary_experience: '#9B6B9B',
  religious_thought: '#9B6B9B',
  publication: '#8B7355',
  award: '#C09A4D',
  marriage: '#A18B6B',
  divorce: '#A18B6B',
  family: '#A18B6B',
  friendship: '#7B8FA1',
  professional_network: '#7B8FA1',
  financial: '#9B8B8B',
  health: '#8B6B6B',
  drug_use: '#8B6B6B',
  residence: '#9B8B8B',
  travel: '#9B8B8B',
  lecture: '#7B8FA1',
  correspondence: '#7B8FA1',
  employment: '#9B8B8B',
  film_adaptation: '#8B7355',
  crime: '#8B6B6B',
};

const ERA_RANGES: [string, number, number][] = [
  ['Early Life (1928\u20131946)', 1928, 1946],
  ['Apprenticeship (1947\u20131954)', 1947, 1954],
  ['Rising Author (1955\u20131963)', 1955, 1963],
  ['Peak & Crisis (1964\u20131973)', 1964, 1973],
  ['2-3-74 & Exegesis (1974\u20131982)', 1974, 1982],
];

const DENSITY_LABELS: Record<number, string> = {
  0: 'All Events',
  3: 'Intellectual Biography',
  4: 'Major Events Only',
};

function getYear(date: string): number {
  const d = date.replace(/^c\.\s*/, '');
  const m = d.match(/^(\d{4})/);
  return m ? parseInt(m[1]) : 0;
}

function importanceDots(n: number): string {
  return '\u2022'.repeat(n);
}

export default function BiographyPage({ onBack, dictionaryLookup, resolveToDictTerm, onNavigateToDict, initialFilter, sectionNav }: BiographyPageProps) {
  const [events, setEvents] = useState<BioEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeEra, setActiveEra] = useState<number | null>(null);
  const [minImportance, setMinImportance] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialFilter) {
      setSearchQuery(initialFilter);
    }
  }, [initialFilter]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}biography.json`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load biography", err);
        setLoading(false);
      });
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (activeCategory) {
      filtered = filtered.filter(e => e.category === activeCategory);
    }
    if (activeEra !== null) {
      const [, start, end] = ERA_RANGES[activeEra];
      filtered = filtered.filter(e => {
        const y = getYear(e.date);
        return y >= start && y <= end;
      });
    }
    if (minImportance > 0) {
      filtered = filtered.filter(e => e.importance >= minImportance);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.event.toLowerCase().includes(q) ||
        e.date.includes(q) ||
        e.source.toLowerCase().includes(q) ||
        (e.entities || []).some(ent => ent.toLowerCase().includes(q)) ||
        (e.location || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [events, activeCategory, activeEra, minImportance, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      counts[e.category] = (counts[e.category] || 0) + 1;
    }
    return counts;
  }, [events]);

  if (loading) return <div style={{ padding: '2rem' }}>Reconstructing a life...</div>;

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <h1>BIOGRAPHY</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
            Philip K. Dick (1928–1982)
          </p>
        </div>

        {sectionNav ? (
          <div className="nav-section">
            <h3>Sections</h3>
            <div className="year-list">
              <button className="year-button" onClick={sectionNav.onGoTimeline}>Timeline</button>
              <button className="year-button" onClick={sectionNav.onGoDictionary}>Dictionary</button>
              <button className="year-button" onClick={sectionNav.onGoScholars}>Who's Who</button>
              <button className="year-button active" style={{ fontWeight: 700 }}>Biography</button>
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
          placeholder="Search events, people, places..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="nav-section">
          <h3>Density</h3>
          <div className="year-list">
            {Object.entries(DENSITY_LABELS).map(([level, label]) => (
              <button
                key={level}
                className={`year-button ${minImportance === Number(level) ? 'active' : ''}`}
                onClick={() => setMinImportance(Number(level))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="nav-section">
          <h3>Eras</h3>
          <div className="year-list">
            <button className={`year-button ${activeEra === null ? 'active' : ''}`} onClick={() => setActiveEra(null)}>
              All Eras ({events.length})
            </button>
            {ERA_RANGES.map(([label], i) => (
              <button
                key={i}
                className={`year-button ${activeEra === i ? 'active' : ''}`}
                onClick={() => setActiveEra(i)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="nav-section">
          <h3>Categories</h3>
          <div className="year-list">
            <button className={`year-button ${activeCategory === null ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>
              All Categories
            </button>
            {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
              categoryCounts[key] ? (
                <button
                  key={key}
                  className={`year-button ${activeCategory === key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(key)}
                >
                  {name} ({categoryCounts[key]})
                </button>
              ) : null
            ))}
          </div>
        </div>
      </aside>

      <main className="main-content" style={{ maxWidth: '900px' }}>
        <header className="timeline-header">
          <div className="result-count">
            {filteredEvents.length} events
            {minImportance > 0 && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(importance {'\u2265'} {minImportance})</span>}
          </div>
        </header>

        <div className="timeline-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="summary-card" style={{ cursor: 'default' }}>
              <div className="card-header">
                <span className="chunk-id" style={{ fontVariantNumeric: 'tabular-nums' }}>{event.date}</span>
                <span className="chunk-date" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', letterSpacing: '1px' }} title={`Importance: ${event.importance}/5`}>
                    {importanceDots(event.importance)}
                  </span>
                  {event.source}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', margin: '0.5rem 0', lineHeight: 1.6 }}>
                {event.event}
              </p>
              {event.location && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.25rem 0' }}>
                  {event.location}
                </p>
              )}
              <div className="tags-container">
                <span
                  className="pill-tag theme"
                  style={{ background: (CATEGORY_COLORS[event.category] || '#9B8B8B') + '33', borderColor: CATEGORY_COLORS[event.category] || '#9B8B8B', cursor: 'pointer' }}
                  onClick={() => setActiveCategory(event.category)}
                >
                  {CATEGORY_NAMES[event.category] || event.category}
                </span>
                {(event.entities || []).map((entity, j) => {
                  const dictTerm = dictionaryLookup && resolveToDictTerm ? resolveToDictTerm(entity, dictionaryLookup) : null;
                  return (
                    <span
                      key={j}
                      className={`pill-tag entity${dictTerm ? ' linked' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => dictTerm && onNavigateToDict ? onNavigateToDict(dictTerm) : setSearchQuery(entity)}
                    >
                      {entity}{dictTerm ? ' \u2197' : ''}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events match the current filters.</p>
          )}
        </div>
      </main>
    </div>
  );
}
