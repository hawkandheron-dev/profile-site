import { useState, useMemo, useRef, useEffect } from 'react';

/**
 * Header search across churches and people. Selecting a result opens it
 * in the side panel via onSelect(type, id).
 */
export function ChurchSearch({ data, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Flatten churches + people into one searchable index
  const index = useMemo(() => {
    const items = [];
    data.churches.forEach(c => items.push({ type: 'church', id: c.church_id, name: c.name }));
    data.people.forEach(p => items.push({
      type: 'person', id: p.person_id, name: p.name,
      aka: p.also_known_as || '',
      traveler: data.travelerIds.has(p.person_id),
    }));
    return items;
  }, [data]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter(it => it.name.toLowerCase().includes(q) || (it.aka && it.aka.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [query, index]);

  useEffect(() => {
    const onClickAway = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const handleSelect = (it) => {
    onSelect(it.type, it.id);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="fcc-search" ref={wrapRef}>
      <input
        className="fcc-search-input"
        type="text"
        placeholder="Search churches & people…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 && (
        <ul className="fcc-search-results">
          {results.map(it => (
            <li key={`${it.type}:${it.id}`}>
              <button className="fcc-search-result" onClick={() => handleSelect(it)}>
                <span className="fcc-search-result-name">{it.name}</span>
                <span className="fcc-search-result-type">
                  {it.type === 'church' ? 'Church' : (it.traveler ? 'Traveler' : 'Person')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
