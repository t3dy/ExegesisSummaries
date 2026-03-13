import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import './index.css';
import TagPage from './TagPage';
import DictionaryPage from './DictionaryPage';
import ScholarsPage from './ScholarsPage';
import BiographyPage from './BiographyPage';

interface Summary {
  id: string;
  section: string;
  themes: string[];
  entities: string[];
  date: string;
  year: string;
  excerpt: string;
  content: string;
}

interface DictEntryBasic {
  term: string;
  aliases: string[];
}

const ENTITY_EXCLUSIONS = new Set([
  'uc berkeley', 'ace books', 'planet stories', 'if magazine',
  'jane dick', 'dorothy dick', 'edgar dick', 'christopher dick',
  'tessa dick', 'laura archer dick', 'anne williams rubinstein',
  'jeanette marlin', 'kleo apostolides', 'nancy hackett',
  'hugo award', 'don wollheim',
]);

function buildDictLookup(entries: DictEntryBasic[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const e of entries) {
    if (!e.term) continue;
    map.set(e.term.toLowerCase(), e.term);
    for (const a of (e.aliases || [])) {
      map.set(a.toLowerCase(), e.term);
    }
  }
  return map;
}

function resolveToDictTerm(entity: string, lookup: Map<string, string>): string | null {
  const el = entity.toLowerCase();
  if (ENTITY_EXCLUSIONS.has(el)) return null;
  if (lookup.has(el)) return lookup.get(el)!;
  const parts = el.split(' ');
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (lookup.has(last)) return lookup.get(last)!;
  }
  return null;
}

type ActiveView = 'summaries' | 'dictionary' | 'scholars' | 'biography';

const ITEMS_PER_PAGE = 50;

function App() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('summaries');

  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [dictEntries, setDictEntries] = useState<DictEntryBasic[]>([]);
  const [dictNavTarget, setDictNavTarget] = useState<string | null>(null);
  const [bioNavTarget, setBioNavTarget] = useState<string | null>(null);

  const dictionaryLookup = useMemo(() => buildDictLookup(dictEntries), [dictEntries]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}dictionary.json`)
      .then(res => res.json())
      .then(data => setDictEntries(data))
      .catch(err => console.error("Failed to load dictionary for lookup", err));
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}summaries.json`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch summaries");
        return res.json();
      })
      .then(data => {
        setSummaries(data);
        const years = [...new Set(data.map((s: Summary) => s.year))].filter(Boolean) as string[];
        years.sort((a, b) => {
          if (a === "Unknown") return 1;
          if (b === "Unknown") return -1;
          return a.localeCompare(b);
        });
        setAvailableYears(years);
        if (years.length > 0) setActiveYear(years[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load summaries", err);
        setLoading(false);
      });
  }, []);

  const [availableYears, setAvailableYears] = useState<string[]>([]);

  const filteredSummaries = useMemo(() => {
    return summaries.filter(s => {
      const inSearch = searchQuery === '' ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.themes.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.entities.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
      const inYear = (searchQuery !== '' || activeYear === null) ? true : s.year === activeYear;
      return inSearch && inYear;
    });
  }, [summaries, activeYear, searchQuery]);

  const totalPages = Math.ceil(filteredSummaries.length / ITEMS_PER_PAGE);
  const paginatedSummaries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSummaries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSummaries, currentPage]);

  const handleYearClick = (year: string) => {
    setActiveYear(year);
    setActiveTag(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveTag(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const sectionNav = {
    onGoTimeline: () => { setDictNavTarget(null); setBioNavTarget(null); setActiveView('summaries'); },
    onGoDictionary: () => { setBioNavTarget(null); setActiveView('dictionary'); },
    onGoScholars: () => { setDictNavTarget(null); setBioNavTarget(null); setActiveView('scholars'); },
    onGoBiography: () => { setDictNavTarget(null); setActiveView('biography'); },
  };

  if (activeView === 'dictionary') {
    return (
      <DictionaryPage
        onBack={sectionNav.onGoTimeline}
        initialEntry={dictNavTarget}
        onNavigateToBio={(term) => { setDictNavTarget(null); setBioNavTarget(term); setActiveView('biography'); }}
        sectionNav={sectionNav}
      />
    );
  }
  if (activeView === 'scholars') {
    return <ScholarsPage onBack={sectionNav.onGoTimeline} sectionNav={sectionNav} />;
  }
  if (activeView === 'biography') {
    return (
      <BiographyPage
        onBack={sectionNav.onGoTimeline}
        dictionaryLookup={dictionaryLookup}
        resolveToDictTerm={resolveToDictTerm}
        onNavigateToDict={(term) => { setDictNavTarget(term); setActiveView('dictionary'); }}
        initialFilter={bioNavTarget}
        sectionNav={sectionNav}
      />
    );
  }

  if (loading) return <div style={{ padding: '2rem' }}>Dusting off the volumes...</div>;

  if (activeTag) {
    const tagSummaries = summaries.filter(s => s.themes.includes(activeTag) || s.entities.includes(activeTag));
    return (
      <TagPage
        tag={activeTag}
        summaries={tagSummaries}
        onBack={() => setActiveTag(null)}
        onTagClick={(tag) => { setActiveTag(tag); window.scrollTo(0, 0); }}
      />
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <h1>THE EXEGESIS</h1>
        </div>

        <div className="nav-section">
          <h3>Sections</h3>
          <div className="year-list">
            <button className="year-button active" style={{ fontWeight: 700 }}>
              Timeline
            </button>
            <button className="year-button" onClick={() => setActiveView('dictionary')}>
              Dictionary
            </button>
            <button className="year-button" onClick={() => setActiveView('scholars')}>
              Who's Who
            </button>
            <button className="year-button" onClick={() => setActiveView('biography')}>
              Biography
            </button>
          </div>
        </div>

        <div>
          <input
            type="text"
            className="search-input"
            placeholder="Search the void..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="nav-section">
          <h3>Volumes (Years)</h3>
          <div className="year-list">
            {availableYears.map(year => (
              <button
                key={year}
                className={`year-button ${activeYear === year && !activeTag && !searchQuery ? 'active' : ''}`}
                onClick={() => handleYearClick(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="timeline-header">
          <div className="active-filters">
            {searchQuery && <span className="pill-tag">Search: "{searchQuery}"</span>}
            {searchQuery && (
              <button className="clear-filter" onClick={clearFilters}>Clear Search</button>
            )}
          </div>
          <div className="result-count">
            {filteredSummaries.length} entries found
          </div>
        </header>

        <div className="timeline-grid">
          {paginatedSummaries.map((summary) => {
            const isExpanded = expandedId === summary.id;
            return (
              <div
                key={summary.id}
                className={`summary-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => !isExpanded && setExpandedId(summary.id)}
              >
                <div className="card-header">
                  <span className="chunk-id">{summary.id}</span>
                  <span className="chunk-date">{summary.date}</span>
                </div>
                {!isExpanded && (
                  <p className="card-excerpt">{summary.excerpt || "Reading..."}</p>
                )}
                {!isExpanded && (
                  <div className="tags-container">
                    {summary.themes.slice(0, 3).map((theme, i) => (
                      <span key={i} className="pill-tag theme" onClick={(e) => { e.stopPropagation(); setActiveTag(theme); setCurrentPage(1); }}>{theme}</span>
                    ))}
                    {summary.entities.slice(0, 3).map((entity, i) => {
                      const dictTerm = resolveToDictTerm(entity, dictionaryLookup);
                      return (
                        <span
                          key={`ent-${i}`}
                          className={`pill-tag entity${dictTerm ? ' linked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (dictTerm) { setDictNavTarget(dictTerm); setActiveView('dictionary'); }
                            else { setActiveTag(entity); setCurrentPage(1); }
                          }}
                        >
                          {entity}{dictTerm ? ' \u2197' : ''}
                        </span>
                      );
                    })}
                  </div>
                )}
                {isExpanded && (
                  <div className="markdown-body">
                    <button onClick={(e) => { e.stopPropagation(); setExpandedId(null); }} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-gold)' }}>Collapse [X]</button>
                    <ReactMarkdown>{summary.content}</ReactMarkdown>
                    <div className="tags-container" style={{ marginTop: '2rem' }}>
                      {summary.themes.map((theme, i) => (
                        <span key={i} className="pill-tag theme" onClick={(e) => { e.stopPropagation(); setActiveTag(theme); setCurrentPage(1); setExpandedId(null); }}>{theme}</span>
                      ))}
                      {summary.entities.map((entity, i) => {
                        const dictTerm = resolveToDictTerm(entity, dictionaryLookup);
                        return (
                          <span
                            key={`ent-${i}`}
                            className={`pill-tag entity${dictTerm ? ' linked' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (dictTerm) { setDictNavTarget(dictTerm); setActiveView('dictionary'); }
                              else { setActiveTag(entity); setCurrentPage(1); setExpandedId(null); }
                            }}
                          >
                            {entity}{dictTerm ? ' \u2197' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {paginatedSummaries.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>The timeline yields no fragments.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => { setCurrentPage(c => c - 1); window.scrollTo(0, 0); }}>Previous</button>
            <span className="page-info">Folio {currentPage} of {totalPages}</span>
            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => { setCurrentPage(c => c + 1); window.scrollTo(0, 0); }}>Next</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
