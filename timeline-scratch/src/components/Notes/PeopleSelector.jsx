/**
 * Searchable multi-select autocomplete for selecting People.
 */
import { useState, useRef, useEffect, useCallback } from 'react';

export function PeopleSelector({ people, selectedIds, onChange, excludeId }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = people.filter(p => {
    if (p.id === excludeId) return false;
    if (selectedIds.includes(p.id)) return false;
    if (!query.trim()) return true;
    return p.name.toLowerCase().includes(query.toLowerCase());
  }).slice(0, 20);

  const handleAdd = useCallback((personId) => {
    onChange([...selectedIds, personId]);
    setQuery('');
  }, [selectedIds, onChange]);

  const handleRemove = useCallback((personId) => {
    onChange(selectedIds.filter(id => id !== personId));
  }, [selectedIds, onChange]);

  const selectedPeople = selectedIds
    .map(id => people.find(p => p.id === id))
    .filter(Boolean);

  return (
    <div className="people-selector" ref={wrapperRef}>
      <div className="people-selector-tags">
        {selectedPeople.map(p => (
          <span key={p.id} className="people-selector-tag">
            {p.name}
            <button
              type="button"
              className="people-selector-tag-remove"
              onClick={() => handleRemove(p.id)}
              aria-label={`Remove ${p.name}`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          className="people-selector-input"
          type="text"
          placeholder={selectedIds.length ? 'Add another person...' : 'Search people...'}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="people-selector-dropdown">
          {filtered.map(p => (
            <li key={p.id}>
              <button
                type="button"
                className="people-selector-option"
                onClick={() => { handleAdd(p.id); setOpen(false); }}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
