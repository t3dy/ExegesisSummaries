import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import './index.css';

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

const ITEMS_PER_PAGE = 50;

function App() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/summaries.json')
      .then(res => res.json())
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
      });
  }, []);

  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // Filter logic
  const filteredSummaries = useMemo(() => {
    return summaries.filter(s => {
      // If there's an active tag, it overrides year filtering conceptually, but let's keep year if searching within a tag? 
      // Actually, standard behavior: if a global tag is clicked, ignore year, just show all for that tag, or show tags WITHIN that year?
      // Let's do: Tag + Search overrides Year. If no tag/search, use Year.

      const inSearch = searchQuery === '' ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.themes.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.entities.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));

      const inTag = !activeTag || s.themes.includes(activeTag) || s.entities.includes(activeTag);

      const bypassYear = searchQuery !== '' || activeTag !== null;
      const inYear = bypassYear ? true : (s.year === activeYear || activeYear === null);

      return inSearch && inTag && inYear;
    });
  }, [summaries, activeYear, searchQuery, activeTag]);

  // Pagination logic
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

  if (loading) return <div style={{ padding: '2rem' }}>Dusting off the volumes...</div>;

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <h1>THE EXEGESIS</h1>
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
            {activeTag && <span className="pill-tag">Tag: {activeTag}</span>}
            {(searchQuery || activeTag) && (
              <button className="clear-filter" onClick={clearFilters}>Clear Filters</button>
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
                      <span
                        key={i}
                        className="pill-tag theme"
                        onClick={(e) => { e.stopPropagation(); setActiveTag(theme); setCurrentPage(1); }}
                      >
                        {theme}
                      </span>
                    ))}
                    {summary.entities.slice(0, 3).map((entity, i) => (
                      <span
                        key={`ent-${i}`}
                        className="pill-tag entity"
                        onClick={(e) => { e.stopPropagation(); setActiveTag(entity); setCurrentPage(1); }}
                      >
                        {entity}
                      </span>
                    ))}
                  </div>
                )}

                {isExpanded && (
                  <div className="markdown-body">
                    <button onClick={(e) => { e.stopPropagation(); setExpandedId(null); }} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-gold)' }}>Collapse [X]</button>
                    <ReactMarkdown>{summary.content}</ReactMarkdown>

                    <div className="tags-container" style={{ marginTop: '2rem' }}>
                      {summary.themes.map((theme, i) => (
                        <span
                          key={i}
                          className="pill-tag theme"
                          onClick={(e) => { e.stopPropagation(); setActiveTag(theme); setCurrentPage(1); setExpandedId(null); }}
                        >
                          {theme}
                        </span>
                      ))}
                      {summary.entities.map((entity, i) => (
                        <span
                          key={`ent-${i}`}
                          className="pill-tag entity"
                          onClick={(e) => { e.stopPropagation(); setActiveTag(entity); setCurrentPage(1); setExpandedId(null); }}
                        >
                          {entity}
                        </span>
                      ))}
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
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(c => c - 1); window.scrollTo(0, 0); }}
            >
              Previous
            </button>
            <span className="page-info">Folio {currentPage} of {totalPages}</span>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(c => c + 1); window.scrollTo(0, 0); }}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
