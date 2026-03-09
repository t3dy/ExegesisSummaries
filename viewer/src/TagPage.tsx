import { useState, useMemo } from 'react';
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

interface TagPageProps {
    tag: string;
    summaries: Summary[];
    onBack: () => void;
    onTagClick: (tag: string) => void;
}

export default function TagPage({ tag, summaries, onBack, onTagClick }: TagPageProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Group by year
    const grouped = useMemo(() => {
        const groups: Record<string, Summary[]> = {};
        for (const s of summaries) {
            if (!groups[s.year]) groups[s.year] = [];
            groups[s.year].push(s);
        }
        return groups;
    }, [summaries]);

    const years = Object.keys(grouped).sort((a, b) => {
        if (a === "Unknown") return 1;
        if (b === "Unknown") return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="app-container" style={{ background: 'var(--bg-parchment)' }}>
            <main className="main-content" style={{ margin: '0 auto', maxWidth: '1000px', width: '100%', paddingLeft: 0 }}>
                <header className="timeline-header" style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: '2px solid rgba(212, 175, 55, 0.4)', paddingBottom: '2rem' }}>
                    <button className="back-btn" onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '1.1rem', padding: 0, marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                        &larr; Return to Timeline
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline' }}>
                        <h1 style={{ fontSize: '3rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                            <span style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '1rem' }}>TAG:</span>
                            {tag}
                        </h1>
                        <div className="result-count" style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                            {summaries.length} entries across {years.length} years
                        </div>
                    </div>
                </header>

                <div className="tag-timeline" style={{ marginTop: '2rem' }}>
                    {years.map(year => (
                        <div key={year} className="year-group" style={{ marginBottom: '4rem' }}>
                            <h2 style={{ color: 'var(--accent-gold)', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem', marginBottom: '2rem', fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
                                Volume: {year}
                            </h2>
                            <div className="timeline-grid">
                                {grouped[year].map(summary => {
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
                                                            onClick={(e) => { e.stopPropagation(); onTagClick(theme); setExpandedId(null); window.scrollTo(0, 0); }}
                                                        >
                                                            {theme}
                                                        </span>
                                                    ))}
                                                    {summary.entities.slice(0, 3).map((entity, i) => (
                                                        <span
                                                            key={`ent-${i}`}
                                                            className="pill-tag entity"
                                                            onClick={(e) => { e.stopPropagation(); onTagClick(entity); setExpandedId(null); window.scrollTo(0, 0); }}
                                                        >
                                                            {entity}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {isExpanded && (
                                                <div className="markdown-body">
                                                    <button onClick={(e) => { e.stopPropagation(); setExpandedId(null); }} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-gold)', fontFamily: 'var(--font-heading)' }}>[ Collapse ]</button>
                                                    <ReactMarkdown>{summary.content}</ReactMarkdown>

                                                    <div className="tags-container" style={{ marginTop: '2rem' }}>
                                                        {summary.themes.map((theme, i) => (
                                                            <span
                                                                key={i}
                                                                className="pill-tag theme"
                                                                onClick={(e) => { e.stopPropagation(); onTagClick(theme); setExpandedId(null); window.scrollTo(0, 0); }}
                                                            >
                                                                {theme}
                                                            </span>
                                                        ))}
                                                        {summary.entities.map((entity, i) => (
                                                            <span
                                                                key={`ent-${i}`}
                                                                className="pill-tag entity"
                                                                onClick={(e) => { e.stopPropagation(); onTagClick(entity); setExpandedId(null); window.scrollTo(0, 0); }}
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
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
