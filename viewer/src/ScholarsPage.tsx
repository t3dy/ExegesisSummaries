import { useState, useEffect, useMemo } from 'react';
import './index.css';

interface ScholarPDF {
  title: string;
  filename: string;
  category: string;
  date: string;
  pages: number;
}

interface Scholar {
  scholar_id: string;
  name: string;
  role: string;
  tier: number;
  affiliation: string;
  key_works: string[];
  archive_pdfs: ScholarPDF[];
  pdf_count: number;
  interpretive_stance: string;
  relevance: string;
}

interface SectionNav {
  onGoTimeline: () => void;
  onGoDictionary: () => void;
  onGoScholars: () => void;
  onGoBiography: () => void;
}

interface ScholarsPageProps {
  onBack: () => void;
  sectionNav?: SectionNav;
}

const TIER_NAMES: Record<number, string> = {
  1: 'Major Biographers',
  2: 'Scholars & Critics',
  3: 'Editors & Curators',
  4: 'Associates & Contributors',
  5: 'Media Sources',
};

const TIER_COLORS: Record<number, string> = {
  1: '#C09A4D',
  2: '#8B7355',
  3: '#6B8E6B',
  4: '#7B8FA1',
  5: '#9B8B8B',
};

export default function ScholarsPage({ onBack, sectionNav }: ScholarsPageProps) {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScholar, setSelectedScholar] = useState<Scholar | null>(null);
  const [activeTier, setActiveTier] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}whos_who.json`)
      .then(res => res.json())
      .then(data => {
        setScholars(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load scholars", err);
        setLoading(false);
      });
  }, []);

  const filteredScholars = useMemo(() => {
    let filtered = scholars;
    if (activeTier !== null) {
      filtered = filtered.filter(s => s.tier === activeTier);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.interpretive_stance.toLowerCase().includes(q) ||
        (s.key_works || []).some(w => w.toLowerCase().includes(q)) ||
        (s.affiliation || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [scholars, activeTier, searchQuery]);

  const tierCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of scholars) {
      counts[s.tier] = (counts[s.tier] || 0) + 1;
    }
    return counts;
  }, [scholars]);

  if (loading) return <div style={{ padding: '2rem' }}>Assembling the scholars...</div>;

  if (selectedScholar) {
    const s = selectedScholar;
    return (
      <div className="app-container">
        <main className="main-content" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <button onClick={() => setSelectedScholar(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '1rem', padding: 0, marginBottom: '1.5rem' }}>
            &larr; Back to Scholars
          </button>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{s.name}</h1>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="pill-tag theme" style={{ background: TIER_COLORS[s.tier] + '33', borderColor: TIER_COLORS[s.tier] }}>{s.role}</span>
            <span className="pill-tag entity">{TIER_NAMES[s.tier]}</span>
            {s.affiliation && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.affiliation}</span>}
          </div>

          <div style={{ borderTop: '2px solid var(--accent-gold)', paddingTop: '1.5rem' }}>
            {s.interpretive_stance && (
              <>
                <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>Interpretive Stance</h2>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                  {s.interpretive_stance}
                </p>
              </>
            )}

            {s.relevance && (
              <>
                <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>Relevance to This Project</h2>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                  {s.relevance}
                </p>
              </>
            )}

            <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>
              Archive Documents ({s.pdf_count})
            </h2>
            <div className="timeline-grid">
              {s.archive_pdfs.map((pdf, i) => (
                <div key={i} className="summary-card" style={{ cursor: 'default' }}>
                  <div className="card-header">
                    <span className="chunk-id" style={{ fontSize: '0.8rem' }}>{pdf.category}</span>
                    <span className="chunk-date">{pdf.date}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', margin: '0.5rem 0' }}>
                    {pdf.title || pdf.filename}
                  </p>
                  {pdf.pages > 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{pdf.pages} pages</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <h1>WHO'S WHO</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
            {filteredScholars.length} scholars & sources
          </p>
        </div>

        {sectionNav ? (
          <div className="nav-section">
            <h3>Sections</h3>
            <div className="year-list">
              <button className="year-button" onClick={sectionNav.onGoTimeline}>Timeline</button>
              <button className="year-button" onClick={sectionNav.onGoDictionary}>Dictionary</button>
              <button className="year-button active" style={{ fontWeight: 700 }}>Who's Who</button>
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
          placeholder="Search scholars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="nav-section">
          <h3>Tiers</h3>
          <div className="year-list">
            <button className={`year-button ${activeTier === null ? 'active' : ''}`} onClick={() => setActiveTier(null)}>
              All ({scholars.length})
            </button>
            {[1, 2, 3, 4, 5].map(tier => (
              tierCounts[tier] ? (
                <button
                  key={tier}
                  className={`year-button ${activeTier === tier ? 'active' : ''}`}
                  onClick={() => setActiveTier(tier)}
                >
                  {TIER_NAMES[tier]} ({tierCounts[tier]})
                </button>
              ) : null
            ))}
          </div>
        </div>
      </aside>

      <main className="main-content" style={{ maxWidth: '900px' }}>
        <div className="timeline-grid">
          {filteredScholars.map(s => (
            <div
              key={s.scholar_id}
              className="summary-card"
              onClick={() => setSelectedScholar(s)}
            >
              <div className="card-header">
                <span className="chunk-id">{s.name}</span>
                <span className="chunk-date">{s.pdf_count} PDF{s.pdf_count !== 1 ? 's' : ''}</span>
              </div>
              <p className="card-excerpt">
                {s.interpretive_stance
                  ? s.interpretive_stance.slice(0, 200) + (s.interpretive_stance.length > 200 ? '...' : '')
                  : s.role}
              </p>
              <div className="tags-container">
                <span className="pill-tag theme" style={{ background: TIER_COLORS[s.tier] + '33' }}>{s.role}</span>
                <span className="pill-tag entity">{TIER_NAMES[s.tier]}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
