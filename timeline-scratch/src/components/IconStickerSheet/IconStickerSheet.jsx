import { useState, useEffect } from 'react';
import './IconStickerSheet.css';

// Icon manifest data embedded (from icons/index.json)
const iconManifest = {
  collections: {
    classical: {
      name: "Classical (Greek/Roman)",
      period: "800 BCE - 476 CE",
      icons: [
        { id: "laurel-wreath", name: "Laurel Wreath" },
        { id: "meander", name: "Meander (Greek Key)" },
        { id: "amphora", name: "Amphora" },
        { id: "column-ionic", name: "Ionic Column" },
        { id: "lyre", name: "Lyre" },
        { id: "helmet-corinthian", name: "Corinthian Helmet" },
        { id: "acanthus-leaf", name: "Acanthus Leaf" },
        { id: "olive-branch", name: "Olive Branch" },
        { id: "serpent", name: "Serpent" },
        { id: "chi-rho", name: "Chi-Rho" }
      ]
    },
    medieval: {
      name: "Medieval (Manuscripts & Heraldry)",
      period: "500 - 1500 CE",
      icons: [
        { id: "fleur-de-lis", name: "Fleur-de-lis" },
        { id: "manicule", name: "Manicule" },
        { id: "cross-maltese", name: "Maltese Cross" },
        { id: "cross-celtic", name: "Celtic Cross" },
        { id: "shield-heater", name: "Heater Shield" },
        { id: "shield-plessy", name: "Plessy Shield" },
        { id: "crown", name: "Crown" },
        { id: "quatrefoil", name: "Quatrefoil" },
        { id: "trefoil", name: "Trefoil" },
        { id: "lion-rampant", name: "Lion Rampant" },
        { id: "eagle-displayed", name: "Eagle Displayed" },
        { id: "sword", name: "Sword" },
        { id: "chalice", name: "Chalice" },
        { id: "dragon", name: "Dragon" }
      ]
    },
    renaissance: {
      name: "Renaissance (Early Print)",
      period: "1400 - 1600 CE",
      icons: [
        { id: "fleuron-leaf", name: "Fleuron (Leaf)" },
        { id: "fleuron-flower", name: "Fleuron (Flower)" },
        { id: "pilcrow", name: "Pilcrow" },
        { id: "section-mark", name: "Section Mark" },
        { id: "asterism", name: "Asterism" },
        { id: "dagger", name: "Dagger" },
        { id: "double-dagger", name: "Double Dagger" },
        { id: "printers-fist", name: "Printer's Fist" },
        { id: "ornament-bracket", name: "Ornamental Bracket" },
        { id: "vine-divider", name: "Vine Divider" },
        { id: "anchor-aldine", name: "Aldine Anchor" },
        { id: "woodcut-sun", name: "Woodcut Sun" },
        { id: "skull-memento", name: "Memento Mori" }
      ]
    },
    universal: {
      name: "Universal (Functional)",
      period: "Timeless",
      icons: [
        { id: "close-x", name: "Close (X)" },
        { id: "arrow-up", name: "Arrow Up" },
        { id: "arrow-down", name: "Arrow Down" },
        { id: "arrow-left", name: "Arrow Left" },
        { id: "arrow-right", name: "Arrow Right" },
        { id: "plus", name: "Plus" },
        { id: "minus", name: "Minus" },
        { id: "check", name: "Check" },
        { id: "profile", name: "Profile" },
        { id: "menu", name: "Menu" },
        { id: "search", name: "Search" },
        { id: "star", name: "Star" },
        { id: "heart", name: "Heart" },
        { id: "bullet", name: "Bullet" },
        { id: "home", name: "Home" },
        { id: "scroll", name: "Scroll" },
        { id: "quill", name: "Quill" },
        { id: "book", name: "Book" }
      ]
    }
  }
};

function IconCard({ collection, iconId, name }) {
  const [svgContent, setSvgContent] = useState(null);

  useEffect(() => {
    fetch(`/icons/${collection}/${iconId}.svg`)
      .then(res => res.text())
      .then(text => setSvgContent(text))
      .catch(err => console.error(`Failed to load icon: ${collection}/${iconId}`, err));
  }, [collection, iconId]);

  return (
    <div className="icon-card" title={name}>
      <div
        className="icon-preview"
        dangerouslySetInnerHTML={{ __html: svgContent || '' }}
      />
      <span className="icon-name">{name}</span>
    </div>
  );
}

function CollectionSection({ collectionKey, collection }) {
  return (
    <section className="collection-section">
      <div className="collection-header">
        <h2>{collection.name}</h2>
        <span className="collection-period">{collection.period}</span>
      </div>
      <div className="icon-grid">
        {collection.icons.map(icon => (
          <IconCard
            key={icon.id}
            collection={collectionKey}
            iconId={icon.id}
            name={icon.name}
          />
        ))}
      </div>
    </section>
  );
}

export function IconStickerSheet() {
  const [activeFilter, setActiveFilter] = useState('all');

  const collections = Object.entries(iconManifest.collections);
  const filteredCollections = activeFilter === 'all'
    ? collections
    : collections.filter(([key]) => key === activeFilter);

  return (
    <div className="icon-sticker-sheet">
      <div className="sheet-header">
        <h1>Antiquarian Icon Set</h1>
        <p className="sheet-description">
          55 period-styled SVG icons inspired by Greek scrolls, medieval manuscripts, and early printing
        </p>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          {collections.map(([key, col]) => (
            <button
              key={key}
              className={`filter-tab ${activeFilter === key ? 'active' : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {col.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
      <div className="collections-container">
        {filteredCollections.map(([key, collection]) => (
          <CollectionSection
            key={key}
            collectionKey={key}
            collection={collection}
          />
        ))}
      </div>
    </div>
  );
}
