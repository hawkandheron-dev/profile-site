/**
 * Maps location strings from people data to [latitude, longitude] coordinates.
 * Used by the HistoricalMap component to center the map and place markers.
 */

const LOCATION_COORDINATES = {
  // Holy Land & Near East
  'Judea': [31.7, 35.2],
  'Jerusalem': [31.77, 35.23],
  'Bethlehem': [31.71, 35.21],
  'Holy Land': [31.77, 35.23],
  'Antioch': [36.2, 36.16],
  'Ephesus': [37.94, 27.34],
  'Smyrna': [38.42, 27.14],
  'Hierapolis': [37.93, 29.12],
  'Asia Minor': [39.0, 32.0],
  'Galatia / Asia Minor': [39.65, 32.65],

  // Egypt & North Africa
  'Alexandria': [31.2, 29.92],
  'Egypt': [30.04, 31.24],
  'Egypt or Caesarea': [30.04, 31.24],
  'Syrian Desert': [33.51, 36.29],
  'Syria or Egypt': [33.51, 36.29],
  'Egyptian Desert': [28.5, 30.5],
  'Carthage': [36.85, 10.32],
  'North Africa': [34.0, 9.0],
  'Hippo Regius': [36.89, 7.77],
  'Calama, Numidia': [36.46, 7.43],

  // Caesarea (Palestine)
  'Caesarea': [32.5, 34.89],

  // Thessalonica
  'Thessalonica': [40.64, 22.94],

  // Asia Minor / Cappadocia / Pontus
  'Neocaesarea, Pontus': [40.33, 36.56],
  'Cappadocia / Pontus': [38.65, 35.48],
  'Caesarea, Cappadocia': [38.73, 35.49],
  'Arianzus, Cappadocia': [38.4, 34.8],
  'Nyssa, Cappadocia': [38.62, 34.5],
  'Nicaea, Byzantine Empire': [40.43, 29.72],

  // Constantinople / Byzantine
  'Constantinople': [41.01, 28.98],
  'Constantinople / Nicomedia': [41.01, 28.98],
  'Nicaea': [40.43, 29.72],
  'Chalcedon': [40.98, 29.03],

  // Empires (broad)
  'Roman Empire': [41.9, 12.5],
  'Western Roman Empire': [41.9, 12.5],
  'Eastern Roman Empire': [41.01, 28.98],
  'Holy Roman Empire': [50.0, 10.0],
  'Bohemia': [49.82, 15.47],

  // Italy
  'Rome': [41.9, 12.5],
  'Milan': [45.46, 9.19],
  'Monte Cassino': [41.49, 13.81],
  'Aquileia / Sicily': [45.77, 13.37],
  'Aquileia, Italy': [45.77, 13.37],
  'Bologna, Italy': [44.49, 11.34],
  'Assisi, Italy': [43.07, 12.62],
  'Naples, Italy': [40.85, 14.27],
  'Florence, Italy': [43.77, 11.25],
  'Italy': [41.9, 12.5],

  // France / Gaul
  'Lyons, Gaul': [45.76, 4.83],
  'Lyon, France': [45.76, 4.84],
  'Gaul': [46.6, 2.2],
  'Arles, Gaul': [43.68, 4.63],
  'Vienne, Gaul': [45.52, 4.88],
  'Riez, Gaul': [43.82, 6.09],
  'Noyon, Gaul': [49.58, 3.0],
  'Rouen, Gaul': [49.44, 1.1],
  'Auxerre, Gaul': [47.8, 3.57],
  'Auxerre, Francia': [47.8, 3.57],
  'Aquitaine': [44.84, -0.58],
  'Tours, Francia': [47.39, 0.69],
  'Paris, France': [48.86, 2.35],
  'Paris / Rome': [48.86, 2.35],
  'Clairvaux, France': [48.14, 4.77],
  'Laon, France': [49.56, 3.62],
  'Reims': [49.25, 4.03],
  'Aachen, Francia': [50.78, 6.08],
  'Frankish Kingdom': [48.86, 2.35],
  'Uzès, Francia': [44.01, 4.42],

  // Normandy
  'Bec, Normandy': [49.23, 0.72],

  // Burgundy
  'Cluny, Burgundy': [46.43, 4.66],

  // Germany
  'Mainz, Germania': [50.0, 8.27],
  'Mainz, Germany': [50.0, 8.27],
  'Bingen, Germany': [49.97, 7.9],
  'Wittenberg, Germany': [51.87, 12.65],
  'Kues, Germany': [49.91, 7.07],
  'Augsburg, Germany': [48.37, 10.9],
  'Frankfurt': [50.11, 8.68],
  'Worms, Germany': [49.63, 8.36],

  // England
  'Canterbury, England': [51.28, 1.08],
  'Canterbury': [51.28, 1.08],
  'Whitby, England': [54.49, -0.61],
  'Jarrow, England': [54.98, -1.47],
  'Oxford, England': [51.75, -1.25],
  'Lincoln, England': [53.23, -0.54],
  'Norwich, England': [52.63, 1.3],
  'London, England': [51.51, -0.13],
  'Bedford, England': [52.14, -0.46],
  'Herefordshire, England': [52.08, -2.75],
  'Cambridge, England': [52.21, 0.12],
  'England': [52.36, -1.17],
  'Northumbria, England': [55.0, -1.8],
  'Wearmouth, England': [54.91, -1.38],
  'Worcester, England': [52.19, -2.22],
  'England / Plymouth': [50.37, -4.14],

  // Scotland / Ireland
  'Iona': [56.33, -6.4],
  'Iona, Scotland': [56.33, -6.4],
  'Ireland': [53.35, -6.26],

  // Belgium / Netherlands / Low Countries
  'Nivelles, Belgium': [50.6, 4.33],
  'Utrecht, Frisia': [52.09, 5.12],
  'Zwolle, Netherlands': [52.51, 6.09],
  'Rotterdam, Netherlands': [51.92, 4.48],
  'Deventer': [52.25, 6.16],
  'Leiden': [52.16, 4.49],

  // Switzerland
  'Zurich, Switzerland': [47.37, 8.54],
  'Geneva, Switzerland': [46.2, 6.14],
  'Basel / Geneva': [46.2, 6.14],
  'Trent, Italy': [46.07, 11.12],

  // Spain / Iberia
  'Seville': [37.39, -5.98],
  'Liébana, Spain': [43.15, -4.65],
  'Ávila, Spain': [40.66, -4.7],
  'Segovia, Spain': [40.95, -4.12],
  'Spain': [40.42, -3.7],

  // Central / Eastern Europe
  'Prague, Bohemia': [50.08, 14.44],
  'Moravia': [49.2, 16.6],
  'Central/Eastern Europe': [50.0, 20.0],
  'Prussia': [54.36, 19.68],

  // France
  'France': [48.86, 2.35],

  // Greece
  'Corinth, Greece': [37.91, 22.88],

  // Poland
  'Frauenburg, Poland': [54.36, 19.68],

  // Russia
  "Kievan Rus'": [50.45, 30.52],

  // Americas
  'Hispaniola': [19.0, -70.7],
  'Plymouth, Massachusetts': [41.96, -70.67],

  // Asia
  'India / Japan / China': [20.6, 78.96],
};

/**
 * Look up coordinates for a location string.
 * Returns [lat, lng] or null if not found.
 */
export function getCoordinatesForLocation(location) {
  if (!location) return null;

  // Direct match
  if (LOCATION_COORDINATES[location]) {
    return LOCATION_COORDINATES[location];
  }

  // Case-insensitive match
  const lowerLocation = location.toLowerCase();
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (key.toLowerCase() === lowerLocation) {
      return coords;
    }
  }

  return null;
}
