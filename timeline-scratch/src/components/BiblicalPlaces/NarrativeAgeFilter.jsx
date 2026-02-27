import { useState } from 'react';
import './BiblicalPlacesMap.css';

const LOGO_PATH = new URL('../../../../../resources/logos/Windhover_BLK.png', import.meta.url).href;

const TABS = [
  { id: 'periods', label: 'Periods' },
  { id: 'themes',  label: 'Themes' },
  { id: 'journeys', label: 'Journeys' },
];

/**
 * Tabbed filter bar at the bottom of the map.
 * Three sections: Periods (narrative ages), Themes (theological threads),
 * and Journeys (animated routes).
 */
export function NarrativeAgeFilter({
  ages, activeAgeFilter, onFilter,
  themes, activeTheme, onThemeSelect,
  journeys, activeJourney, onJourneySelect,
  showReset, onReset, siteTitle,
  activeTab: controlledTab, onTabChange,
}) {
  const [localTab, setLocalTab] = useState('periods');
  const activeTab = controlledTab || localTab;
  const setActiveTab = onTabChange || setLocalTab;

  if (!ages || ages.length === 0) return null;

  return (
    <div className="bp-age-filter">
      <div className="bp-age-filter-header">
        <div className="bp-age-filter-brand">
          <img className="bp-age-filter-brand-logo" src={LOGO_PATH} alt="Windhover" />
          <span className="bp-age-filter-brand-title">Windhover</span>
          {siteTitle && <h2 className="bp-age-filter-site-title">{siteTitle}</h2>}
        </div>
      </div>

      {/* Tab row */}
      <div className="bp-filter-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`bp-filter-tab ${activeTab === tab.id ? 'bp-filter-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {showReset && (
          <button className="bp-reset-btn bp-reset-btn-tabs" onClick={onReset} title="Reset view">
            Reset
          </button>
        )}
      </div>

      {/* Content for each tab */}
      <div className="bp-age-filter-pills">
        {activeTab === 'periods' && ages.map(age => {
          const isActive = activeAgeFilter === age.age_id;
          return (
            <button
              key={age.age_id}
              className={`bp-age-pill ${isActive ? 'bp-age-pill-active' : ''}`}
              style={{ '--age-color': age.color || '#8b7355' }}
              onClick={() => onFilter(age.age_id)}
              title={age.scripture_range || age.name}
            >
              <span className="bp-age-pill-dot" />
              <span className="bp-age-pill-label">{age.name}</span>
            </button>
          );
        })}

        {activeTab === 'themes' && (
          <>
            {(themes || []).map(theme => {
              const isActive = activeTheme === theme.theme_id;
              return (
                <button
                  key={theme.theme_id}
                  className={`bp-age-pill ${isActive ? 'bp-age-pill-active' : ''}`}
                  style={{ '--age-color': theme.color || '#8b7355' }}
                  onClick={() => onThemeSelect?.(theme.theme_id)}
                  title={theme.description || theme.name}
                >
                  <span className="bp-age-pill-dot" />
                  <span className="bp-age-pill-label">{theme.name}</span>
                </button>
              );
            })}
            {/* Women of the Bible as a special theme pill */}
            <button
              className={`bp-age-pill ${activeTheme === '__women__' ? 'bp-age-pill-active' : ''}`}
              style={{ '--age-color': '#C47AC0' }}
              onClick={() => onThemeSelect?.('__women__')}
              title="Places connected to women of the Bible"
            >
              <span className="bp-age-pill-dot" />
              <span className="bp-age-pill-label">Women of the Bible</span>
            </button>
          </>
        )}

        {activeTab === 'journeys' && (journeys || []).map(journey => {
          const isActive = activeJourney === journey.journey_id;
          return (
            <button
              key={journey.journey_id}
              className={`bp-age-pill ${isActive ? 'bp-age-pill-active' : ''}`}
              style={{ '--age-color': journey.color || '#8b7355' }}
              onClick={() => onJourneySelect?.(journey.journey_id)}
              title={journey.description || journey.name}
            >
              <span className="bp-age-pill-dot" />
              <span className="bp-age-pill-label">{journey.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
