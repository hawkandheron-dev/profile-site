import { useMemo, useState } from 'react';
import { PlaygroundMap } from './components/HistoricalMapPlayground/PlaygroundMap.jsx';
import { SkinSelector } from './components/HistoricalMapPlayground/SkinSelector.jsx';
import { SKINS, DEFAULT_SKIN_ID } from './components/HistoricalMapPlayground/skins/index.js';

function formatYearForOhm(year) {
  // OHM's filterByDate expects 'YYYY-MM-DD' or a 'YYYY' string. BCE years
  // use ISO 8601 leading-minus form ('-0050' = 50 BCE).
  if (year >= 0) return String(year).padStart(4, '0');
  return '-' + String(Math.abs(year)).padStart(4, '0');
}

export default function HistoricalMapPlaygroundApp() {
  const [activeSkinId, setActiveSkinId] = useState(DEFAULT_SKIN_ID);
  const [year, setYear] = useState(100);

  const activeSkin = useMemo(
    () => SKINS.find(s => s.id === activeSkinId) || SKINS[0],
    [activeSkinId],
  );

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PlaygroundMap activeSkin={activeSkin} year={formatYearForOhm(year)} />
      <SkinSelector
        skins={SKINS}
        activeSkinId={activeSkinId}
        onSelectSkin={setActiveSkinId}
        year={year}
        onYearChange={setYear}
      />
    </div>
  );
}
