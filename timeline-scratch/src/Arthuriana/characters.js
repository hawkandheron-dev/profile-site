// characters.js — Arthurian character database.
//
// Each entry has:
//   id, name, title, faction, group ('round-table' | 'pendragon' | 'orkney' | 'cornwall' | 'enchanter' | 'foe' | 'lady' | 'other')
//   blazon  (heraldry blazon object — see ArthurianHeraldry.jsx)
//   relations: [{ to: id, type: 'family'|'marriage'|'mentor'|'fellowship'|'rival'|'quest' }]
//   sources: [{ source: 'Malory', text: '...' }]  — one entry per source they appear in
//
// Heraldic attributions follow traditional armorials where they exist (Le Morte d'Arthur,
// 13th-c. Continental armorials, Sir Gawain & the Green Knight, etc.) and are invented
// in the same idiom where they don't.

export const CHARACTERS = [
  // ─── PENDRAGON LINE ──────────────────────────────────────────────────────
  {
    id: 'arthur', name: 'Arthur Pendragon', title: 'High King of the Britons', group: 'pendragon',
    blazon: { field: 'azure', charges: [{ device: 'crown', tincture: 'or', count: 3, arrangement: 'in pale' }] },
    relations: [
      { to: 'uther', type: 'family' }, { to: 'igraine', type: 'family' },
      { to: 'guinevere', type: 'marriage' }, { to: 'morgan', type: 'family' },
      { to: 'morgause', type: 'family' }, { to: 'mordred', type: 'family' },
      { to: 'kay', type: 'family' }, { to: 'ector', type: 'family' },
      { to: 'merlin', type: 'mentor' }, { to: 'lancelot', type: 'fellowship' },
      { to: 'gawain', type: 'fellowship' }, { to: 'galahad', type: 'fellowship' },
      { to: 'percival', type: 'fellowship' }, { to: 'bedivere', type: 'fellowship' },
      { to: 'tristan', type: 'fellowship' }, { to: 'bors', type: 'fellowship' },
      { to: 'lamorak', type: 'fellowship' }, { to: 'pellinore', type: 'fellowship' },
      { to: 'palamedes', type: 'fellowship' }, { to: 'gareth', type: 'fellowship' },
      { to: 'gaheris', type: 'fellowship' }, { to: 'agravain', type: 'fellowship' },
      { to: 'yvain', type: 'fellowship' }, { to: 'geraint', type: 'fellowship' },
      { to: 'lady-lake', type: 'mentor' }, { to: 'mark', type: 'rival' },
      { to: 'accolon', type: 'rival' }, { to: 'meleagant', type: 'rival' },
    ],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'In the Historia Regum Britanniae (c.1136), Arthur is first cast as a continental war-king: he subdues the Saxons at Mount Badon, crosses the sea to conquer Ireland, Iceland, Norway, and Gaul, and is on the very edge of Rome when Mordred\'s betrayal calls him home. Geoffrey\'s Arthur is more emperor than mystic — there is no Round Table, no Grail, and Guinevere flees to a nunnery without much fuss.' },
      { source: 'Wace', text: 'Wace\'s Roman de Brut (1155) translates Geoffrey into Norman French octosyllabics and adds, almost in passing, the Round Table itself — invented so that none of Arthur\'s lords might claim precedence over another. The piece of furniture eats the legend whole.' },
      { source: 'Chrétien de Troyes', text: 'In the late-12th-century romances Arthur recedes: he is the still center, the courteous host at Camelot or Caerleon from which younger, hotter knights ride out on individual aventures. He is rarely the protagonist of his own story anymore.' },
      { source: 'Vulgate Cycle', text: 'The 13th-century Vulgate makes Arthur the son of an adulterous union, blesses him with the Grail company, and damns him through his own incestuous get on Morgause. He is a tragic Christian king whose Round Table is doomed from the night Mordred is conceived.' },
      { source: 'Malory', text: 'Malory\'s Le Morte d\'Arthur (1485) fuses all of this into the canonical English shape: sword in stone, marriage to Guinevere, the long fellowship, the Grail Quest that hollows out the company, the affair of Lancelot, and the final field at Camlann where father and son end each other. He is given to the three queens and borne to Avalon.' },
      { source: 'Spenser', text: 'In The Faerie Queene (1590) Prince Arthur is a young, pre-coronation knight in search of Gloriana, the Faerie Queene — a chivalric ideal pulled out of legend to flatter Elizabeth I. He is allegory more than man.' },
      { source: 'Tennyson', text: 'The Idylls of the King (1859–85) cast him as a moral idea wronged by every body he loves: blameless, faintly cold, the still center of a court that corrodes around him.' },
      { source: 'Mark Twain', text: 'A Connecticut Yankee in King Arthur\'s Court (1889) presents him as a credulous, decent provincial — proud, capable of nobility, but a king of an age the Yankee finds barbaric. Twain plainly likes him and plainly disdains his world.' },
      { source: 'T.H. White', text: 'The Once and Future King (1938–58) gives us the most human Arthur in English: Wart, the small boy taught by Merlyn to think like a fish, a bird, an ant. He grows into a king who genuinely believes Might must serve Right, and who cannot bring himself to hate Lancelot or Guinevere even when he must.' },
      { source: 'Tolkien', text: 'The Fall of Arthur (composed in the 1930s, published 2013) is an unfinished alliterative poem in Old English meter. Tolkien\'s Arthur is in Saxony fighting the heathen when Mordred\'s treason recalls him; the verse leaves him at sea, the crossing to Avalon never written.' },
    ],
  },
  {
    id: 'uther', name: 'Uther Pendragon', title: 'King of Britain', group: 'pendragon',
    blazon: { field: 'or', charges: [{ device: 'dragon', tincture: 'gules', count: 2, arrangement: 'in pale' }] },
    relations: [
      { to: 'arthur', type: 'family' }, { to: 'igraine', type: 'marriage' },
      { to: 'gorlois', type: 'rival' }, { to: 'merlin', type: 'fellowship' },
    ],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'Uther is the youngest of three royal brothers (Constans, Aurelius Ambrosius, Uther). He takes the crown after Aurelius is poisoned, fights Saxons, and — at a Christmas feast in London — falls so violently in love with Gorlois\'s wife Igraine that Merlin must transform him to gain her bed at Tintagel. Arthur is conceived that night; Gorlois is killed in the same hour.' },
      { source: 'Wace', text: 'Wace follows Geoffrey closely but lingers on the sorcery: it is Merlin\'s herbs and craft that change Uther, not divine providence. The deception is more clearly a sin.' },
      { source: 'Vulgate Cycle', text: 'The Vulgate hardens Uther into a flawed but legitimate Christian king whose lust nonetheless engenders a sacred line. His death is dignified; his ghost is not.' },
      { source: 'Malory', text: 'Malory opens with him: "It befell in the days of Uther Pendragon..." He dies within the first chapters, leaving the infant Arthur to be hidden by Merlin and raised by Ector.' },
      { source: 'T.H. White', text: 'White hardly bothers with Uther — the story has already moved on by the time Wart pulls the sword. He is mentioned mostly as a fact, the way one might mention a grandfather one never met.' },
    ],
  },
  {
    id: 'igraine', name: 'Igraine', title: 'Duchess of Cornwall, Queen of Britain', group: 'lady',
    blazon: { field: { division: 'per pale', tinctures: ['azure', 'sable'] }, charges: [{ device: 'crescent', tincture: 'argent' }] },
    relations: [
      { to: 'arthur', type: 'family' }, { to: 'uther', type: 'marriage' },
      { to: 'gorlois', type: 'marriage' }, { to: 'morgan', type: 'family' },
      { to: 'morgause', type: 'family' }, { to: 'elaine-garlot', type: 'family' },
    ],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'Geoffrey introduces her as the most beautiful woman in Britain. She is the unwitting instrument of Arthur\'s begetting and survives Uther; Geoffrey grants her no further scenes.' },
      { source: 'Malory', text: 'Malory gives her real grief and real bewilderment: when she sees the man who comes to her in Gorlois\'s shape, then learns hours later that Gorlois was already dead, she keeps the secret for years out of fear of being thought mad.' },
      { source: 'Vulgate Cycle', text: 'The Vulgate dwells on her three daughters by Gorlois (Morgan, Morgause, Elaine of Garlot) — making her the matriarch of an entire enchantress line that will haunt her son.' },
    ],
  },
  {
    id: 'gorlois', name: 'Gorlois', title: 'Duke of Cornwall', group: 'cornwall',
    blazon: { field: 'sable', charges: [{ device: 'boar', tincture: 'argent' }] },
    relations: [
      { to: 'igraine', type: 'marriage' }, { to: 'uther', type: 'rival' },
      { to: 'morgan', type: 'family' }, { to: 'morgause', type: 'family' }, { to: 'elaine-garlot', type: 'family' },
    ],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'A loyal duke who pulls his wife out of Uther\'s court to save her from the king. He is killed sallying from a besieged castle in the very hour Uther, disguised, lies with his wife.' },
      { source: 'Malory', text: 'Malory keeps the tragedy crisp: Gorlois rides out at midnight; Merlin\'s glamour falls on Uther in the same moment; both men cannot be Igraine\'s husband and yet, for one night, both are.' },
    ],
  },
  {
    id: 'ector', name: 'Sir Ector', title: 'Foster-father of Arthur', group: 'other',
    blazon: { field: { division: 'per fess', tinctures: ['argent', 'azure'] }, charges: [{ device: 'oak', tincture: 'vert' }] },
    relations: [{ to: 'arthur', type: 'family' }, { to: 'kay', type: 'family' }, { to: 'merlin', type: 'fellowship' }],
    sources: [
      { source: 'Malory', text: 'A good country knight to whom Merlin commits the infant Arthur. He raises Arthur as a younger brother to his own son Kay. When the boy pulls the sword, Ector kneels at once, calls him liege, and weeps. Malory uses him to anchor the whole story in honest, undramatic love.' },
      { source: 'T.H. White', text: 'In White he is Sir Ector of the Forest Sauvage — a bluff, gout-prone English squire who calls Arthur "Wart," frets about taxes, and never quite gets over the fact that the boy he raised is the king.' },
    ],
  },
  {
    id: 'kay', name: 'Sir Kay', title: 'Seneschal of Britain', group: 'round-table',
    blazon: { field: 'argent', charges: [{ device: 'key', tincture: 'sable', count: 2, arrangement: 'in saltire' }] },
    relations: [{ to: 'arthur', type: 'family' }, { to: 'ector', type: 'family' }, { to: 'bedivere', type: 'fellowship' }],
    sources: [
      { source: 'Mabinogion', text: 'In Culhwch and Olwen, Cai is a giant-tall hero who can hold his breath nine nights, never sleep, and grow as tall as the tallest tree. He is one of the first warriors named at Arthur\'s court — older than Camelot.' },
      { source: 'Chrétien de Troyes', text: 'Chrétien turns him into a comic boor: sharp-tongued, jealous, the seneschal you don\'t invite. The Welsh hero has become a snob in a hall.' },
      { source: 'Malory', text: 'Malory keeps Chrétien\'s edge but softens it with brotherhood: Kay is rude, brave, often wrong, and Arthur loves him anyway because Kay\'s mother nursed Arthur as a baby. He dies fighting in Gaul, far from home.' },
      { source: 'T.H. White', text: 'White\'s Kay is a teenager — sulky, awkward, jealous of his foster brother\'s strange ease — exactly the older sibling who has been told he is not the chosen one.' },
    ],
  },
  {
    id: 'merlin', name: 'Merlin', title: 'Prophet, Enchanter', group: 'enchanter',
    blazon: { field: 'azure', charges: [{ device: 'mullet', tincture: 'or', count: 3, arrangement: '2-1' }] },
    relations: [
      { to: 'arthur', type: 'mentor' }, { to: 'uther', type: 'fellowship' },
      { to: 'nimue', type: 'rival' }, { to: 'lady-lake', type: 'fellowship' },
      { to: 'morgan', type: 'rival' }, { to: 'vortigern', type: 'rival' },
    ],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'Geoffrey welds two earlier figures — the Welsh bard Myrddin Wyllt and the fatherless prophet boy Ambrosius — into a single Merlinus Ambrosius. He prophesies the red and white dragons under Vortigern\'s tower, moves Stonehenge from Ireland, and engineers Arthur\'s conception. Then he vanishes from the Historia.' },
      { source: 'Vulgate Cycle', text: 'The Vulgate\'s Estoire de Merlin gives him a demon father (so he is born to know all things past) and a baptismal mother (so he is born to know all things future). His fall is in love: he teaches Nimue every craft until she uses the last spell to seal him in a tower of air.' },
      { source: 'Malory', text: 'Malory keeps the Vulgate end: Nimue ("Nyneve") wearies of his desire, learns his magic, and traps him under a stone in Cornwall. He warns Arthur of his own coming end and goes to it anyway.' },
      { source: 'Spenser', text: 'In The Faerie Queene Merlin is alive in a cavern beneath the earth, still shaping prophecy for Britomart. He is more force of nature than wizard.' },
      { source: 'Tennyson', text: '"Merlin and Vivien" is one of the cruelest Idylls: a brilliant old man worn down by a young woman\'s flattery until he tells her the binding charm, and is sealed in an oak forever.' },
      { source: 'T.H. White', text: 'White\'s Merlyn lives backwards in time, which is why he is so often confused and so often right. He teaches Wart to be a fish, a hawk, an ant, a badger — and then disappears, having done what he could.' },
    ],
  },

  // ─── ORKNEY CLAN ─────────────────────────────────────────────────────────
  {
    id: 'morgause', name: 'Morgause', title: 'Queen of Orkney', group: 'orkney',
    blazon: { field: 'sable', charges: [{ device: 'crescent', tincture: 'argent', count: 3, arrangement: '2-1' }] },
    relations: [
      { to: 'lot', type: 'marriage' }, { to: 'arthur', type: 'family' },
      { to: 'mordred', type: 'family' }, { to: 'gawain', type: 'family' },
      { to: 'gaheris', type: 'family' }, { to: 'gareth', type: 'family' },
      { to: 'agravain', type: 'family' }, { to: 'igraine', type: 'family' },
      { to: 'morgan', type: 'family' }, { to: 'lamorak', type: 'marriage' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'The Vulgate is where the incest enters: Morgause comes to Arthur\'s court not knowing he is her brother, sleeps with him, and goes home pregnant with Mordred. The doom of the Round Table is conceived in one night.' },
      { source: 'Malory', text: 'Malory keeps the incest and adds an extraordinary later scene: her son Gaheris finds her in bed with Lamorak (decades younger) and strikes off her head, leaving Lamorak alive to be hunted down later by his brothers.' },
      { source: 'T.H. White', text: 'White makes her a witch-queen of Lothian, scheming, neglectful, occasionally tender — the engine of the Orkney faction\'s rage. The boys love her too much and badly.' },
    ],
  },
  {
    id: 'lot', name: 'King Lot of Orkney', title: 'King of Lothian and Orkney', group: 'orkney',
    blazon: { field: { division: 'per pale', tinctures: ['sable', 'argent'] } },
    relations: [
      { to: 'morgause', type: 'marriage' }, { to: 'gawain', type: 'family' },
      { to: 'gaheris', type: 'family' }, { to: 'gareth', type: 'family' },
      { to: 'agravain', type: 'family' }, { to: 'arthur', type: 'rival' },
      { to: 'pellinore', type: 'rival' },
    ],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'A loyal lord of Lothian under Arthur, given Orkney as part of Arthur\'s northern reorganization.' },
      { source: 'Malory', text: 'Malory makes him one of the eleven rebel kings who refuse the boy Arthur. He is killed in battle by King Pellinore — a death his sons (the Orkney brothers) will not forgive, no matter how many years pass.' },
    ],
  },
  {
    id: 'gawain', name: 'Sir Gawain', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: 'purpure', charges: [{ device: 'pentangle', tincture: 'or' }] },
    relations: [
      { to: 'arthur', type: 'family' }, { to: 'morgause', type: 'family' }, { to: 'lot', type: 'family' },
      { to: 'gaheris', type: 'family' }, { to: 'gareth', type: 'family' }, { to: 'agravain', type: 'family' },
      { to: 'mordred', type: 'family' }, { to: 'lancelot', type: 'fellowship' },
      { to: 'green-knight', type: 'rival' }, { to: 'lamorak', type: 'rival' },
      { to: 'pellinore', type: 'rival' }, { to: 'percival', type: 'fellowship' },
      { to: 'galahad', type: 'fellowship' }, { to: 'yvain', type: 'fellowship' },
    ],
    sources: [
      { source: 'Mabinogion', text: 'As Gwalchmei ("hawk of May") he is one of the very first Arthurian heroes named — a sun-figure whose strength waxes till noon. The Welsh root of all later Gawains.' },
      { source: 'Chrétien de Troyes', text: 'Chrétien\'s Gauvain is the model courtier: handsome, courteous, second only to the protagonist of whatever romance he\'s in. He is rarely the protagonist himself, but he is always there.' },
      { source: 'Sir Gawain and the Green Knight', text: 'The Pearl Poet (c.1400) gives him the most beautiful single test in English literature: a year and a day to ride to a green chapel and offer his neck to a green axeman. He carries a shield with a pentangle on a purple field — a "endeles knot" of five fives — and he fails by a sash. He survives, and learns, and is ashamed.' },
      { source: 'Malory', text: 'Malory keeps the courtly polish but adds the family curse: Gawain is the one who, after Lancelot accidentally kills Gareth in the rescue of Guinevere, hounds Lancelot across the channel until his own wound (taken from Lancelot before, and re-opened on landing) kills him. He dies asking Arthur\'s forgiveness for his hatred.' },
      { source: 'T.H. White', text: 'White paints him with a Scots accent and a temper — capable of nobility, fiercely loyal to his brothers, the one who can never quite let a grudge go.' },
    ],
  },
  {
    id: 'gareth', name: 'Sir Gareth Beaumains', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: 'vert', charges: [{ device: 'fleur-de-lis', tincture: 'or', count: 3, arrangement: 'in pale' }] },
    relations: [
      { to: 'morgause', type: 'family' }, { to: 'lot', type: 'family' }, { to: 'arthur', type: 'family' },
      { to: 'gawain', type: 'family' }, { to: 'gaheris', type: 'family' }, { to: 'agravain', type: 'family' },
      { to: 'mordred', type: 'family' }, { to: 'lancelot', type: 'fellowship' },
      { to: 'lyonesse', type: 'marriage' }, { to: 'ironside', type: 'rival' },
    ],
    sources: [
      { source: 'Malory', text: 'The youngest Orkney brother arrives at Camelot in disguise and asks only food and a year in the kitchens. Kay nicknames him "Beaumains" — beautiful hands — for mockery. He earns his spurs by escorting the proud lady Lynette to rescue her sister Lyonesse from the Red Knight of the Red Lands. He becomes the kindest man at the table. Lancelot, fighting unarmed in the rescue of Guinevere, kills him by mistake. It is the wound the fellowship never recovers from.' },
      { source: 'T.H. White', text: 'White makes Gareth the moral center of the Orkney boys — the brother who refuses to hate Lancelot even as Agravain plots, and who dies precisely because of his refusal.' },
    ],
  },
  {
    id: 'gaheris', name: 'Sir Gaheris', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: 'sable', charges: [{ device: 'mullet', tincture: 'argent', count: 3, arrangement: 'in chief' }] },
    relations: [
      { to: 'morgause', type: 'family' }, { to: 'lot', type: 'family' }, { to: 'arthur', type: 'family' },
      { to: 'gawain', type: 'family' }, { to: 'gareth', type: 'family' }, { to: 'agravain', type: 'family' },
      { to: 'mordred', type: 'family' }, { to: 'lamorak', type: 'rival' },
    ],
    sources: [
      { source: 'Malory', text: 'The brother who finds his mother Morgause in bed with Lamorak and beheads her on the spot, sparing the knight only so the family can hunt him down later. He is killed beside Gareth in the same disaster — Lancelot, unarmed and trying to save Guinevere, cuts him down without seeing him.' },
    ],
  },
  {
    id: 'agravain', name: 'Sir Agravain', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: 'sable', charges: [{ device: 'arrow', tincture: 'argent' }] },
    relations: [
      { to: 'morgause', type: 'family' }, { to: 'lot', type: 'family' }, { to: 'arthur', type: 'family' },
      { to: 'gawain', type: 'family' }, { to: 'gareth', type: 'family' }, { to: 'gaheris', type: 'family' },
      { to: 'mordred', type: 'family' }, { to: 'lancelot', type: 'rival' },
      { to: 'lamorak', type: 'rival' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'A jealous, sharp-tongued knight, more politician than warrior. He is the one who first puts into the air the open accusation that Lancelot is sleeping with the queen.' },
      { source: 'Malory', text: 'Agravain and Mordred together force the issue: they catch Lancelot in the queen\'s chamber and trigger the war. Lancelot kills Agravain on the spot. Every later death — Gareth, Gaheris, Gawain, Arthur — traces back to that night and that ambush.' },
    ],
  },
  {
    id: 'mordred', name: 'Sir Mordred', title: 'Knight of the Round Table, Usurper', group: 'foe',
    blazon: { field: { division: 'per saltire', tinctures: ['sable', 'argent'] } },
    relations: [
      { to: 'arthur', type: 'family' }, { to: 'morgause', type: 'family' },
      { to: 'gawain', type: 'family' }, { to: 'gareth', type: 'family' },
      { to: 'gaheris', type: 'family' }, { to: 'agravain', type: 'family' },
      { to: 'agravain', type: 'fellowship' }, { to: 'guinevere', type: 'rival' },
      { to: 'lancelot', type: 'rival' },
    ],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'In Geoffrey he is Arthur\'s nephew, not yet his son — left as regent and seducer of Guinevere while Arthur is in Gaul. He crowns himself king, and the two armies meet on the Camlann.' },
      { source: 'Vulgate Cycle', text: 'The Vulgate makes him the son of Arthur and Morgause — incest as the original sin of the realm. Every line of the cycle bends toward that final field.' },
      { source: 'Malory', text: 'Malory keeps the Vulgate parentage. Mordred is born for the destruction of his father\'s reign; Arthur tries to drown him as an infant, fails, and the boy survives to fulfill the prophecy exactly.' },
      { source: 'T.H. White', text: 'White\'s Mordred is a thin pale boy with a club foot, sick with his mother\'s teaching — a study in how a child raised on grievance becomes a terrorist of his father\'s house.' },
    ],
  },

  // ─── ROUND TABLE — GREATS ────────────────────────────────────────────────
  {
    id: 'lancelot', name: 'Sir Lancelot du Lac', title: 'First Knight of the Round Table', group: 'round-table',
    blazon: { field: 'argent', ordinary: { type: 'bend', tincture: 'gules' }, charges: [{ device: 'bend', tincture: 'gules' }] },
    relations: [
      { to: 'arthur', type: 'fellowship' }, { to: 'guinevere', type: 'marriage' },
      { to: 'elaine-corbenic', type: 'marriage' }, { to: 'galahad', type: 'family' },
      { to: 'lady-lake', type: 'family' }, { to: 'bors', type: 'family' },
      { to: 'lionel', type: 'family' }, { to: 'ector-marais', type: 'family' },
      { to: 'gawain', type: 'rival' }, { to: 'mordred', type: 'rival' },
      { to: 'agravain', type: 'rival' }, { to: 'meleagant', type: 'rival' },
      { to: 'elaine-astolat', type: 'rival' }, { to: 'percival', type: 'fellowship' },
    ],
    sources: [
      { source: 'Chrétien de Troyes', text: 'Lancelot enters European literature in Le Chevalier de la Charrette (c.1180), Chrétien\'s romance of the queen\'s rescue. He is so consumed by love of Guinevere that he hesitates two steps before stepping into the shameful cart that will carry him to her — and Chrétien spends a hundred lines on those two steps.' },
      { source: 'Vulgate Cycle', text: 'The Vulgate makes him the whole structure: raised by the Lady of the Lake, the greatest knight, the queen\'s lover, the one barred from the Grail because of her, and the father, by deception with Elaine of Corbenic, of the knight who will succeed where he cannot.' },
      { source: 'Malory', text: 'Malory\'s Lancelot is both the best and the worst — the knight who can break Camelot by being in it. He survives Arthur. He goes to a hermitage with Bors, dies in odor of sanctity, and Ector (his brother) gives one of the great eulogies in English: thou wert the truest lover of a sinful man that ever loved woman.' },
      { source: 'Tennyson', text: 'Tennyson\'s Lancelot is the broken honorable man — wracked, eloquent, doomed by a single love.' },
      { source: 'T.H. White', text: 'White\'s Lancelot is the "Ill-Made Knight" — physically ugly, ferociously gifted, certain he is damned, in love with Arthur and with Guinevere in ways that don\'t resolve.' },
    ],
  },
  {
    id: 'guinevere', name: 'Queen Guinevere', title: 'Queen of Britain', group: 'lady',
    blazon: { field: 'gules', charges: [{ device: 'crown', tincture: 'or' }, { device: 'rose', tincture: 'argent', count: 2, arrangement: 'in chief' }] },
    relations: [
      { to: 'arthur', type: 'marriage' }, { to: 'lancelot', type: 'marriage' },
      { to: 'mordred', type: 'rival' }, { to: 'meleagant', type: 'rival' },
      { to: 'morgan', type: 'rival' }, { to: 'lady-lake', type: 'fellowship' },
    ],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'Geoffrey\'s Guanhumara is Roman-Briton noble; she takes Mordred as consort during Arthur\'s absence, then flees to a Caerleon nunnery when he returns. Geoffrey gives her no inner life.' },
      { source: 'Chrétien de Troyes', text: 'Chrétien is the first to make her an active object of courtly love — Lancelot risks his soul, his honor, and a series of obstacles to reach her bed. She is sharp-tongued and unafraid of giving orders.' },
      { source: 'Malory', text: 'Malory\'s queen is generous and jealous in equal measure, repeatedly endangering Lancelot through fits of suspicion that turn out to be true. At the end she takes the veil at Amesbury and refuses to see Lancelot one last time, "for as much as I am the cause of all this war." She dies abbess.' },
      { source: 'Tennyson', text: '"Guinevere" — perhaps the bitterest of the Idylls — has her prostrate before Arthur at Almesbury while he forgives her in such terms as to ruin them both.' },
      { source: 'T.H. White', text: 'White is unusually fair to her: he refuses the Victorian habit of blaming the queen for the kingdom\'s fall, and gives her real intelligence, real boredom, real love.' },
    ],
  },
  {
    id: 'galahad', name: 'Sir Galahad', title: 'Knight of the Round Table, Grail Knight', group: 'round-table',
    blazon: { field: 'argent', ordinary: { type: 'cross', tincture: 'gules' } },
    relations: [
      { to: 'lancelot', type: 'family' }, { to: 'elaine-corbenic', type: 'family' },
      { to: 'pelles', type: 'family' }, { to: 'percival', type: 'quest' },
      { to: 'bors', type: 'quest' }, { to: 'arthur', type: 'fellowship' },
      { to: 'dindrane', type: 'quest' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'The Queste del Saint Graal (c.1225) introduces Galahad as the prophesied Good Knight — conceived when Elaine of Corbenic, enchanted to look like Guinevere, lies with Lancelot. He sits in the Siege Perilous, achieves the Grail at Sarras, asks God to let him die, and is taken up. He is the Grail Quest\'s only complete success.' },
      { source: 'Malory', text: 'Malory keeps every beat of the Queste but makes Galahad more bearable by sheer plainness. He arrives in red armor, breaks the swords of others by being more worthy, and dies in Sarras with the Grail in his eye.' },
      { source: 'Tennyson', text: '"Sir Galahad" is Tennyson\'s most-quoted Idyll — the perfect virginal knight whose "strength is as the strength of ten."' },
    ],
  },
  {
    id: 'percival', name: 'Sir Percival', title: 'Knight of the Round Table, Grail Knight', group: 'round-table',
    blazon: { field: 'vert', ordinary: { type: 'cross', tincture: 'or' } },
    relations: [
      { to: 'pellinore', type: 'family' }, { to: 'lamorak', type: 'family' },
      { to: 'dindrane', type: 'family' }, { to: 'galahad', type: 'quest' },
      { to: 'bors', type: 'quest' }, { to: 'arthur', type: 'fellowship' },
      { to: 'gawain', type: 'fellowship' }, { to: 'blanchefleur', type: 'marriage' },
    ],
    sources: [
      { source: 'Chrétien de Troyes', text: 'Perceval, ou Le Conte du Graal (c.1190) gives the world the Grail — but only at a feast in a wounded king\'s hall, where Perceval, raised in the forest and told not to ask too many questions, watches the procession in silence and so fails. Chrétien died with the romance unfinished.' },
      { source: 'Wolfram von Eschenbach', text: 'Parzival (c.1210) is the German answer: a vast romance in which Parzival redeems his failure, learns compassion, becomes Grail King. Wagner read it.' },
      { source: 'Mabinogion', text: 'In the Welsh Peredur the Grail is a head on a platter; the romance reads older and stranger, closer to the otherworld.' },
      { source: 'Vulgate Cycle', text: 'The Vulgate makes him secondary to Galahad — a worthy Grail companion, but not the chosen knight. He dies a hermit.' },
      { source: 'Malory', text: 'Malory follows the Vulgate but keeps Percival\'s rustic, watchful innocence intact. He is one of the three to reach Sarras, and the only one of the three to come back, briefly, to tell Camelot what they saw.' },
    ],
  },
  {
    id: 'bors', name: 'Sir Bors de Ganis', title: 'Knight of the Round Table, Grail Knight', group: 'round-table',
    blazon: { field: 'gules', charges: [{ device: 'lion', tincture: 'or', attitude: 'rampant', count: 3, arrangement: '2-1' }] },
    relations: [
      { to: 'lancelot', type: 'family' }, { to: 'lionel', type: 'family' },
      { to: 'ector-marais', type: 'family' }, { to: 'galahad', type: 'quest' },
      { to: 'percival', type: 'quest' }, { to: 'arthur', type: 'fellowship' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'Bors is the third Grail companion and the only one to return to Camelot alive. He is the steady moral keel — the knight who will refuse to lie even when his cousin Lancelot needs him to. His Quest features an agonizing choice: rescue his brother Lionel from torture, or save a maiden from rape. He chooses the maiden. Lionel survives, and almost kills him for it.' },
      { source: 'Malory', text: 'Malory loves Bors. He is the witness — the one who sees, judges, and goes on. He carries Lancelot\'s ashes into a hermitage after the king and queen are dead.' },
    ],
  },
  {
    id: 'lionel', name: 'Sir Lionel', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: 'azure', charges: [{ device: 'lion', tincture: 'or', attitude: 'rampant' }] },
    relations: [
      { to: 'bors', type: 'family' }, { to: 'lancelot', type: 'family' },
      { to: 'ector-marais', type: 'family' }, { to: 'arthur', type: 'fellowship' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'Bors\'s brother. Captured by enemy knights in the Quest and tortured nearly to death. When Bors rides past to save a maiden instead of him, Lionel survives in such a rage that he tries to kill his brother in single combat.' },
      { source: 'Malory', text: 'Malory keeps the fratricidal moment and makes it terrifying — a hermit and a knight throw themselves between the brothers and are killed for it. The two are reconciled only by miracle.' },
    ],
  },
  {
    id: 'ector-marais', name: 'Sir Ector de Maris', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: 'argent', ordinary: { type: 'bend', tincture: 'gules' }, charges: [{ device: 'mullet', tincture: 'gules', count: 3, arrangement: 'in bend' }] },
    relations: [
      { to: 'lancelot', type: 'family' }, { to: 'bors', type: 'family' },
      { to: 'lionel', type: 'family' }, { to: 'arthur', type: 'fellowship' },
    ],
    sources: [
      { source: 'Malory', text: 'Not to be confused with old Sir Ector who raised Arthur. This Ector is Lancelot\'s half-brother — also of the Lake. He gives the great eulogy at Lancelot\'s death, the longest sustained piece of lyrical prose in Malory: "Thou wert never matched of earthly knight\'s hand…"' },
    ],
  },
  {
    id: 'bedivere', name: 'Sir Bedivere', title: 'Knight of the Round Table, Marshal of Britain', group: 'round-table',
    blazon: { field: 'gules', charges: [{ device: 'chalice', tincture: 'or' }] },
    relations: [{ to: 'arthur', type: 'fellowship' }, { to: 'kay', type: 'fellowship' }, { to: 'lucan', type: 'family' }],
    sources: [
      { source: 'Mabinogion', text: 'As Bedwyr he is the oldest companion — paired with Cai (Kay), the two earliest names at Arthur\'s side in the Welsh tradition.' },
      { source: 'Geoffrey of Monmouth', text: 'A high officer in Arthur\'s continental campaigns. Killed in Gaul fighting Romans.' },
      { source: 'Malory', text: 'Malory keeps him alive for the very end. After Camlann, Arthur asks him three times to throw Excalibur back into the lake. Bedivere lies twice — the sword is too beautiful to lose — and only on the third asking does he obey. He is the last man at Arthur\'s side as the barge of queens carries the king away.' },
      { source: 'Tennyson', text: '"The Passing of Arthur" gives Bedivere two of the most famous lines in nineteenth-century English: he describes Excalibur being caught by an arm clothed in white samite.' },
    ],
  },
  {
    id: 'tristan', name: 'Sir Tristan', title: 'Knight of the Round Table, of Lyonesse', group: 'round-table',
    blazon: { field: 'vert', charges: [{ device: 'lion', tincture: 'or', attitude: 'rampant' }] },
    relations: [
      { to: 'isolde-ireland', type: 'marriage' }, { to: 'isolde-hands', type: 'marriage' },
      { to: 'mark', type: 'family' }, { to: 'mark', type: 'rival' },
      { to: 'arthur', type: 'fellowship' }, { to: 'lancelot', type: 'fellowship' },
      { to: 'palamedes', type: 'rival' }, { to: 'morholt', type: 'rival' },
    ],
    sources: [
      { source: 'Other early sources', text: 'The Tristan story is older than Arthurian romance — Welsh Drystan, Pictish, Cornish. It enters French romance in the 12th century via Béroul, Thomas of Britain, and the verse fragments survive only as scraps.' },
      { source: 'Vulgate Cycle', text: 'The Prose Tristan (c.1230) folds him fully into the Arthurian world, making him a member of the Round Table and a foil to Lancelot — two adulterous knights, two doomed loves.' },
      { source: 'Malory', text: 'Malory\'s Book of Sir Tristram is the longest single book in the Morte. He drinks the love potion meant for King Mark and Isolde on the ship from Ireland and never recovers. He dies, in Malory, of treachery — Mark stabs him in the back while he is harping for Isolde.' },
      { source: 'Tennyson', text: '"The Last Tournament" gives him a sardonic late hour: he is no longer the romantic hero but a man who has outlived his own story.' },
    ],
  },
  {
    id: 'lamorak', name: 'Sir Lamorak de Galis', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: 'sable', charges: [{ device: 'fess', tincture: 'or' }, { device: 'mullet', tincture: 'or', count: 3, arrangement: 'in chief' }] },
    relations: [
      { to: 'pellinore', type: 'family' }, { to: 'percival', type: 'family' },
      { to: 'dindrane', type: 'family' }, { to: 'morgause', type: 'marriage' },
      { to: 'gawain', type: 'rival' }, { to: 'gaheris', type: 'rival' },
      { to: 'agravain', type: 'rival' }, { to: 'mordred', type: 'rival' },
      { to: 'arthur', type: 'fellowship' },
    ],
    sources: [
      { source: 'Malory', text: 'Reputedly the third-best knight of the Round Table, after Lancelot and Tristan. His father Pellinore killed King Lot of Orkney in battle long before, and the Orkney brothers never forgave it. Lamorak\'s affair with Morgause — Lot\'s widow — was the spark: Gaheris beheaded her in bed and the brothers ambushed and killed Lamorak weeks later, four against one.' },
    ],
  },
  {
    id: 'pellinore', name: 'King Pellinore', title: 'King of the Isles, Knight of the Round Table', group: 'round-table',
    blazon: { field: { division: 'per pale', tinctures: ['or', 'vert'] }, charges: [{ device: 'serpent', tincture: 'sable' }] },
    relations: [
      { to: 'lamorak', type: 'family' }, { to: 'percival', type: 'family' },
      { to: 'dindrane', type: 'family' }, { to: 'lot', type: 'rival' },
      { to: 'arthur', type: 'fellowship' }, { to: 'gawain', type: 'rival' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'Pellinore hunts the Questing Beast — Glatisant — through forest after forest. The beast has the head of a serpent, body of a leopard, hindquarters of a lion, feet of a hart, and a noise in its belly as of thirty couple hounds. The hunt was a quest no one could finish; it passed from Pellinore to Palamedes.' },
      { source: 'Malory', text: 'Malory keeps the Beast and adds the political crime: Pellinore killed Lot of Orkney in the rebel-kings\' war. He is later killed in turn by Gawain — vengeance taking a generation.' },
      { source: 'T.H. White', text: 'White\'s Pellinore is comic and beloved — a befuddled, exhausted middle-aged king who pursues the Beast because he doesn\'t know what else to do, eventually falls in love with the Beast itself, and is rescued only when it cures his loneliness.' },
    ],
  },
  {
    id: 'palamedes', name: 'Sir Palamedes', title: 'Knight of the Round Table, the Saracen', group: 'round-table',
    blazon: { field: { pattern: 'chequy', tinctures: ['or', 'sable'] } },
    relations: [
      { to: 'arthur', type: 'fellowship' }, { to: 'tristan', type: 'rival' },
      { to: 'isolde-ireland', type: 'rival' }, { to: 'lancelot', type: 'fellowship' },
      { to: 'safir', type: 'family' }, { to: 'segwarides', type: 'family' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'A great Saracen knight who comes to Logres unbaptized and falls hopelessly in love with Isolde of Ireland. The Prose Tristan made him Tristan\'s great rival in love. He inherits the hunt of the Questing Beast from Pellinore.' },
      { source: 'Malory', text: 'Malory loves him — gives him real interior life, real grief, and finally has him baptized by Galahad in the Quest of the Grail. He kills the Questing Beast at last.' },
    ],
  },
  {
    id: 'safir', name: 'Sir Safir', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: { pattern: 'chequy', tinctures: ['argent', 'azure'] } },
    relations: [{ to: 'palamedes', type: 'family' }, { to: 'segwarides', type: 'family' }, { to: 'arthur', type: 'fellowship' }],
    sources: [
      { source: 'Malory', text: 'Palamedes\'s brother. A solid Saracen knight, also eventually baptized.' },
    ],
  },
  {
    id: 'segwarides', name: 'Sir Segwarides', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: { pattern: 'chequy', tinctures: ['gules', 'argent'] } },
    relations: [
      { to: 'palamedes', type: 'family' }, { to: 'safir', type: 'family' },
      { to: 'tristan', type: 'rival' }, { to: 'arthur', type: 'fellowship' },
    ],
    sources: [
      { source: 'Malory', text: 'The third Saracen brother. Tristan once seduced his wife — a minor scandal in a book that has bigger ones.' },
    ],
  },
  {
    id: 'yvain', name: 'Sir Yvain', title: 'Knight of the Round Table, of the Lion', group: 'round-table',
    blazon: { field: 'argent', charges: [{ device: 'lion', tincture: 'gules', attitude: 'rampant' }] },
    relations: [
      { to: 'arthur', type: 'fellowship' }, { to: 'gawain', type: 'fellowship' },
      { to: 'laudine', type: 'marriage' }, { to: 'morgan', type: 'family' },
    ],
    sources: [
      { source: 'Chrétien de Troyes', text: 'Yvain, ou Le Chevalier au Lion (c.1180) is the strangest of Chrétien\'s romances: Yvain marries the widow of a knight he killed, forgets to come home, goes mad in the forest, and is restored by — among other things — a lion he saves from a serpent. The lion follows him for the rest of the romance.' },
      { source: 'Mabinogion', text: 'The Welsh Owain ap Urien is the historical kernel: a 6th-century king of Rheged. The romance retains a Welsh flavor of fountains and otherworlds.' },
      { source: 'Malory', text: 'Malory keeps him a member of the Round Table but tells little of his own story; he is mostly seen riding with Gawain.' },
    ],
  },
  {
    id: 'geraint', name: 'Sir Geraint / Erec', title: 'Knight of the Round Table, of Cornwall', group: 'round-table',
    blazon: { field: 'or', charges: [{ device: 'lion', tincture: 'gules', attitude: 'rampant' }] },
    relations: [
      { to: 'arthur', type: 'fellowship' }, { to: 'enide', type: 'marriage' },
      { to: 'gawain', type: 'fellowship' }, { to: 'kay', type: 'rival' },
    ],
    sources: [
      { source: 'Chrétien de Troyes', text: 'Erec et Enide (c.1170) is the earliest Chrétien romance and the first European novel of married love. Erec falls into uxoriousness, hears his wife weeping over how her love has ruined him, and forces them both on a long humiliating road to test her and himself.' },
      { source: 'Mabinogion', text: 'The Welsh Geraint son of Erbin is a Cornish lord, fully redrafting the romance into a Welsh idiom.' },
      { source: 'Tennyson', text: '"Geraint and Enid" pulls it into Victorian poetry — the same story made gentler and more sentimental.' },
    ],
  },
  {
    id: 'enide', name: 'Enide', title: 'Lady, Wife of Geraint', group: 'lady',
    blazon: { field: 'argent', charges: [{ device: 'rose', tincture: 'gules', count: 3, arrangement: 'in pale' }] },
    relations: [{ to: 'geraint', type: 'marriage' }],
    sources: [
      { source: 'Chrétien de Troyes', text: 'Enide\'s great test is forbidden speech: her husband orders her not to speak as they ride, and she must break the order every time she sees danger threaten him. The romance is the cumulation of those small disobediences into a real love.' },
    ],
  },
  {
    id: 'caradoc', name: 'Sir Caradoc', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: { division: 'per pale', tinctures: ['gules', 'vert'] }, charges: [{ device: 'tower', tincture: 'argent' }] },
    relations: [{ to: 'arthur', type: 'fellowship' }, { to: 'gawain', type: 'fellowship' }],
    sources: [
      { source: 'Other early sources', text: 'The Caradoc romances make him the knight of the magic horn — a chastity test that no lady at Arthur\'s court but his own wife can pass. It is one of the funnier moments in early French Arthuriana.' },
    ],
  },
  {
    id: 'dindrane', name: 'Lady Dindrane', title: 'Sister of Percival', group: 'lady',
    blazon: { field: 'argent', ordinary: { type: 'cross', tincture: 'sable' }, charges: [{ device: 'rose', tincture: 'gules' }] },
    relations: [
      { to: 'percival', type: 'family' }, { to: 'lamorak', type: 'family' },
      { to: 'pellinore', type: 'family' }, { to: 'galahad', type: 'quest' },
      { to: 'bors', type: 'quest' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'Percival\'s sister joins the three Grail companions on the ship of Solomon. They come to a castle where the lady of the place is dying of leukemia and only the blood of a virgin princess will cure her. Dindrane gives the blood — a silver bowl full — and dies. They lay her body on the ship and it sails to Sarras alone.' },
      { source: 'Malory', text: 'Malory tells it more briefly but keeps the central image: the silver bowl, the sister\'s consent, the empty boat. She is the only woman to "achieve" the Grail.' },
    ],
  },
  {
    id: 'blanchefleur', name: 'Blanchefleur', title: 'Lady, beloved of Percival', group: 'lady',
    blazon: { field: 'azure', charges: [{ device: 'rose', tincture: 'argent' }] },
    relations: [{ to: 'percival', type: 'marriage' }],
    sources: [
      { source: 'Chrétien de Troyes', text: 'The lady of Beaurepaire whose castle Perceval relieves in his first great deed. Their love is the first thing that begins to teach him what compassion is for.' },
    ],
  },
  {
    id: 'lyonesse', name: 'Lady Lyonesse', title: 'Lady of Castle Dangerous', group: 'lady',
    blazon: { field: 'azure', charges: [{ device: 'sun', tincture: 'or' }] },
    relations: [{ to: 'gareth', type: 'marriage' }],
    sources: [
      { source: 'Malory', text: 'The proud lady Gareth wins by beating the Red Knight of the Red Lands. Her sister Lynette mocks Gareth for half the romance before consenting to call him a knight.' },
    ],
  },

  // ─── CORNWALL / TRISTAN ──────────────────────────────────────────────────
  {
    id: 'mark', name: 'King Mark', title: 'King of Cornwall', group: 'cornwall',
    blazon: { field: 'sable', charges: [{ device: 'lion', tincture: 'or', attitude: 'passant' }] },
    relations: [
      { to: 'tristan', type: 'family' }, { to: 'tristan', type: 'rival' },
      { to: 'isolde-ireland', type: 'marriage' }, { to: 'arthur', type: 'rival' },
    ],
    sources: [
      { source: 'Other early sources', text: 'In Béroul\'s Tristan (c.1170) Mark is a complicated man — sometimes the cuckold, sometimes a king genuinely trying to be just, sometimes a tyrant. The earlier the source, the more sympathetic.' },
      { source: 'Malory', text: 'Malory turns him into a near-villain: cunning, petty, vindictive. He murders Tristan from behind while Tristan is playing the harp for Isolde. It is one of the few deaths in Malory presented as straightforwardly base.' },
    ],
  },
  {
    id: 'isolde-ireland', name: 'Isolde of Ireland', title: 'Queen of Cornwall', group: 'lady',
    blazon: { field: 'vert', charges: [{ device: 'harp', tincture: 'or' }] },
    relations: [
      { to: 'tristan', type: 'marriage' }, { to: 'mark', type: 'marriage' },
      { to: 'morholt', type: 'family' }, { to: 'palamedes', type: 'rival' },
    ],
    sources: [
      { source: 'Other early sources', text: 'In Béroul she is a queen of formidable wit and self-possession; in Thomas of Britain the doomed love is everything.' },
      { source: 'Malory', text: 'Malory keeps her dignity. She dies on Tristan\'s body, the second great death-by-love in the Morte. (Lancelot\'s is the first.)' },
    ],
  },
  {
    id: 'isolde-hands', name: 'Isolde of the White Hands', title: 'Lady of Brittany', group: 'lady',
    blazon: { field: 'argent', charges: [{ device: 'hand', tincture: 'argent' }] },
    relations: [{ to: 'tristan', type: 'marriage' }],
    sources: [
      { source: 'Other early sources', text: 'Tristan, in exile from Cornwall, marries her in Brittany — she has the same name as the woman he can\'t have. He never sleeps with her. When Tristan lies dying, she lies about the color of the sails of the rescue ship, and he dies of grief minutes before Isolde of Ireland arrives.' },
    ],
  },
  {
    id: 'morholt', name: 'Sir Morholt', title: 'Champion of Ireland', group: 'foe',
    blazon: { field: 'azure', charges: [{ device: 'arm', tincture: 'argent' }] },
    relations: [{ to: 'tristan', type: 'rival' }, { to: 'isolde-ireland', type: 'family' }],
    sources: [
      { source: 'Other early sources', text: 'The Irish champion who comes to Cornwall to demand tribute. Young Tristan, in his first deed, kills him in single combat — but Morholt\'s sword leaves a poisoned shard in Tristan\'s side that only Morholt\'s niece Isolde of Ireland can heal.' },
    ],
  },

  // ─── ENCHANTERS, FAY, GRAIL ──────────────────────────────────────────────
  {
    id: 'morgan', name: 'Morgan le Fay', title: 'Queen of Gore, Enchantress', group: 'enchanter',
    blazon: { field: 'sable', charges: [{ device: 'moon', tincture: 'argent' }, { device: 'mullet', tincture: 'argent', count: 3, arrangement: 'in chief' }] },
    relations: [
      { to: 'arthur', type: 'family' }, { to: 'arthur', type: 'rival' },
      { to: 'morgause', type: 'family' }, { to: 'igraine', type: 'family' },
      { to: 'merlin', type: 'mentor' }, { to: 'merlin', type: 'rival' },
      { to: 'urien', type: 'marriage' }, { to: 'yvain', type: 'family' },
      { to: 'accolon', type: 'marriage' }, { to: 'guinevere', type: 'rival' },
      { to: 'lady-lake', type: 'rival' }, { to: 'green-knight', type: 'fellowship' },
    ],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'Geoffrey introduces her in the Vita Merlini (c.1150) not as a villain but as the chief of the nine sisters of Avalon, a healer. Arthur is brought to her after Camlann to be cured.' },
      { source: 'Vulgate Cycle', text: 'The Vulgate turns her against her brother — a pupil of Merlin gone wrong, a witch who steals Excalibur\'s scabbard, sleeps with knights to set traps for her brother, and is forever scheming. Yet she is also at the barge that bears him to Avalon at the end.' },
      { source: 'Malory', text: 'Malory keeps the duality. She tries to kill Arthur via her lover Accolon, fails, and is exiled. Decades later, when he is dying at Camlann, she is the first of three queens on the black barge to receive him.' },
      { source: 'Sir Gawain and the Green Knight', text: 'In the Pearl Poet she is the secret author of the whole trick: it is Morgan who sent the Green Knight to Camelot, hoping to frighten Guinevere to death.' },
      { source: 'T.H. White', text: 'White separates her sharply from Morgause and makes her a sad, beautiful, malicious fairy of the wet woods.' },
    ],
  },
  {
    id: 'nimue', name: 'Nimue / Vivien', title: 'Lady of the Lake', group: 'enchanter',
    blazon: { field: 'azure', charges: [{ device: 'fish', tincture: 'argent' }] },
    relations: [
      { to: 'merlin', type: 'rival' }, { to: 'merlin', type: 'mentor' },
      { to: 'arthur', type: 'fellowship' }, { to: 'lady-lake', type: 'family' },
      { to: 'pelleas', type: 'marriage' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'The young enchantress who learns Merlin\'s craft from him, falls neither in love nor out, and uses his last great spell to seal him in a cave or air or oak. Her name shifts: Nimue, Niniane, Viviane.' },
      { source: 'Malory', text: 'Malory makes her become the Lady of the Lake after her predecessor\'s death — and a kinder figure than the Vulgate. She protects Arthur at several turns, marries Pelleas, and is one of the three queens on the barge to Avalon.' },
      { source: 'Tennyson', text: '"Merlin and Vivien" is the great Victorian portrait of female cunning corroding male wisdom. Tennyson is not subtle about whose side he is on.' },
    ],
  },
  {
    id: 'lady-lake', name: 'The Lady of the Lake', title: 'Mistress of Avalon', group: 'enchanter',
    blazon: { field: 'azure', charges: [{ device: 'sword', tincture: 'argent' }] },
    relations: [
      { to: 'arthur', type: 'mentor' }, { to: 'merlin', type: 'fellowship' },
      { to: 'lancelot', type: 'family' }, { to: 'nimue', type: 'family' },
      { to: 'morgan', type: 'rival' }, { to: 'balin', type: 'rival' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'The Lady of the Lake raises Lancelot from infancy in her underwater kingdom. She gives Arthur Excalibur from the lake. The Vulgate often distinguishes her from Nimue/Viviane, who succeeds to the title.' },
      { source: 'Malory', text: 'In Malory the original Lady of the Lake comes to Camelot to demand Balin\'s head; Balin beheads her instead, on the spot, in Arthur\'s hall. The title passes to Nimue. The lake remains.' },
    ],
  },
  {
    id: 'pelles', name: 'King Pelles', title: 'The Fisher King, Keeper of the Grail', group: 'enchanter',
    blazon: { field: 'gules', charges: [{ device: 'chalice', tincture: 'or' }, { device: 'fish', tincture: 'argent', arrangement: 'in chief', count: 2 }] },
    relations: [
      { to: 'elaine-corbenic', type: 'family' }, { to: 'galahad', type: 'family' },
      { to: 'pellam', type: 'family' }, { to: 'percival', type: 'mentor' },
      { to: 'lancelot', type: 'fellowship' },
    ],
    sources: [
      { source: 'Chrétien de Troyes', text: 'The Fisher King — wounded so he can only fish, waiting for the right question to be asked by the right knight so the wasted land around his castle can heal. Perceval fails to ask.' },
      { source: 'Vulgate Cycle', text: 'Pelles is the Grail-keeper at Corbenic, father of Elaine, grandfather of Galahad. He plots, with his daughter, to bring Lancelot to her bed so the Grail-knight may be conceived.' },
      { source: 'Malory', text: 'Malory keeps Pelles courtly and grave. He is the source of the Grail line on the mother\'s side.' },
    ],
  },
  {
    id: 'pellam', name: 'King Pellam', title: 'The Maimed King', group: 'enchanter',
    blazon: { field: 'azure', charges: [{ device: 'chalice', tincture: 'or' }] },
    relations: [{ to: 'pelles', type: 'family' }, { to: 'balin', type: 'rival' }],
    sources: [
      { source: 'Malory', text: 'It is Balin\'s "Dolorous Stroke" that wounds Pellam in the thigh with the Spear of Longinus — and that wound creates the Wasteland that the Grail Quest must heal. The blow is one of the first sins of the early Round Table.' },
    ],
  },
  {
    id: 'elaine-corbenic', name: 'Elaine of Corbenic', title: 'Mother of Galahad', group: 'lady',
    blazon: { field: 'argent', charges: [{ device: 'chalice', tincture: 'gules' }] },
    relations: [
      { to: 'pelles', type: 'family' }, { to: 'galahad', type: 'family' },
      { to: 'lancelot', type: 'marriage' }, { to: 'guinevere', type: 'rival' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'Enchanted by her father\'s craft to look like Guinevere, she lies with Lancelot at Corbenic. Galahad is conceived. When she later returns to Camelot openly — wearing her own face — Guinevere discovers everything, and Lancelot goes mad in the forest for two years.' },
      { source: 'Malory', text: 'Malory tells the story softly. She is a tragic figure, not a schemer — used by her father, faithful to a lover who can never love her back.' },
    ],
  },
  {
    id: 'elaine-astolat', name: 'Elaine of Astolat', title: 'Lily Maid of Astolat', group: 'lady',
    blazon: { field: 'argent', charges: [{ device: 'fleur-de-lis', tincture: 'argent' }] },
    relations: [{ to: 'lancelot', type: 'rival' }],
    sources: [
      { source: 'Malory', text: 'A young noblewoman who falls in love with Lancelot at a tournament. He cannot return it. She wills herself to die, leaves a letter in her own dead hand, and is floated down to Camelot in a barge of silks. Arthur reads the letter aloud and Guinevere weeps for the first time over Lancelot.' },
      { source: 'Tennyson', text: '"The Lady of Shalott" is the same girl in a tower. Tennyson made her image — the boat, the mirror cracking — the most-quoted in Arthurian Victoriana.' },
    ],
  },
  {
    id: 'elaine-garlot', name: 'Elaine of Garlot', title: 'Half-sister of Arthur', group: 'lady',
    blazon: { field: 'azure', charges: [{ device: 'fleur-de-lis', tincture: 'argent', count: 3, arrangement: '2-1' }] },
    relations: [
      { to: 'arthur', type: 'family' }, { to: 'morgan', type: 'family' },
      { to: 'morgause', type: 'family' }, { to: 'igraine', type: 'family' },
    ],
    sources: [
      { source: 'Vulgate Cycle', text: 'The third daughter of Igraine and Gorlois — the least storied. Married to King Nentres of Garlot; mother of minor knights. She is the sister who does not become an enchantress.' },
    ],
  },

  // ─── FOES, RIVALS, MISCELLANEA ───────────────────────────────────────────
  {
    id: 'vortigern', name: 'Vortigern', title: 'British King, Treacherous', group: 'foe',
    blazon: { field: 'sable', charges: [{ device: 'dragon', tincture: 'argent' }] },
    relations: [{ to: 'merlin', type: 'rival' }],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'The 5th-century king who, in Geoffrey, invites Hengest and the Saxons in as mercenaries against the Picts and so loses Britain to them. His tower collapses every night until the fatherless prophet boy (the young Merlin) explains the red and white dragons fighting in the pool below.' },
    ],
  },
  {
    id: 'accolon', name: 'Sir Accolon of Gaul', title: 'Knight, Lover of Morgan', group: 'foe',
    blazon: { field: 'gules', charges: [{ device: 'sword', tincture: 'or' }] },
    relations: [{ to: 'morgan', type: 'marriage' }, { to: 'arthur', type: 'rival' }],
    sources: [
      { source: 'Malory', text: 'Morgan steals Excalibur and gives it to her lover Accolon, then arranges for him and Arthur — disarmed and unsuspecting — to be set against each other. Arthur fights nearly to death before recognizing his own sword, gets it back, and forgives Accolon, who dies of his wounds. Morgan is exiled but not punished.' },
    ],
  },
  {
    id: 'meleagant', name: 'Sir Meleagant', title: 'Prince of Gore', group: 'foe',
    blazon: { field: 'gules', charges: [{ device: 'tower', tincture: 'sable' }] },
    relations: [
      { to: 'guinevere', type: 'rival' }, { to: 'lancelot', type: 'rival' },
      { to: 'arthur', type: 'rival' }, { to: 'bagdemagus', type: 'family' },
    ],
    sources: [
      { source: 'Chrétien de Troyes', text: 'The kidnapper-prince of Le Chevalier de la Charrette. He carries Guinevere off to a kingdom from which no traveler returns; Lancelot pursues her across the Sword Bridge and rescues her. The whole structure of courtly love in French romance rests on this kidnapping.' },
      { source: 'Malory', text: 'Malory translates it briskly and ends with Lancelot cleaving Meleagant\'s helm to the chin.' },
    ],
  },
  {
    id: 'bagdemagus', name: 'King Bagdemagus', title: 'King of Gore', group: 'foe',
    blazon: { field: 'gules', ordinary: { type: 'chevron', tincture: 'or' } },
    relations: [{ to: 'meleagant', type: 'family' }, { to: 'arthur', type: 'fellowship' }],
    sources: [
      { source: 'Malory', text: 'A decent old king, father of the villainous Meleagant. He is repeatedly used by Malory as the example of how a worthy father can have a worthless son.' },
    ],
  },
  {
    id: 'balin', name: 'Sir Balin le Sauvage', title: 'Knight of the Two Swords', group: 'other',
    blazon: { field: 'argent', charges: [{ device: 'sword', tincture: 'sable', count: 2, arrangement: 'in saltire' }] },
    relations: [
      { to: 'balan', type: 'family' }, { to: 'arthur', type: 'fellowship' },
      { to: 'lady-lake', type: 'rival' }, { to: 'pellam', type: 'rival' },
    ],
    sources: [
      { source: 'Malory', text: 'A knight cursed by every act of his own justice. He beheads the Lady of the Lake in Arthur\'s own hall. He carries two swords thereafter — one always doomed. He delivers the Dolorous Stroke that wounds King Pellam and creates the Wasteland. Then he and his beloved brother Balan, riding to a strange isle, fail to recognize each other and kill each other in single combat.' },
    ],
  },
  {
    id: 'balan', name: 'Sir Balan', title: 'Brother of Balin', group: 'other',
    blazon: { field: 'argent', charges: [{ device: 'sword', tincture: 'sable' }] },
    relations: [{ to: 'balin', type: 'family' }],
    sources: [
      { source: 'Malory', text: 'The other half of the tragedy. They die in each other\'s arms, recognizing too late, and are buried in a single grave with an inscription naming both.' },
    ],
  },
  {
    id: 'green-knight', name: 'The Green Knight', title: 'Sir Bertilak de Hautdesert', group: 'foe',
    blazon: { field: 'vert', charges: [{ device: 'oak', tincture: 'or' }] },
    relations: [{ to: 'gawain', type: 'rival' }, { to: 'morgan', type: 'fellowship' }],
    sources: [
      { source: 'Sir Gawain and the Green Knight', text: 'A green giant rides into Camelot at Christmas with an axe and offers a blow exchanged for a blow a year later. Gawain takes the bargain. The Green Knight is also (it transpires) the courteous Sir Bertilak of Hautdesert, transformed by Morgan le Fay\'s sorcery — and the whole test is hers, not his.' },
    ],
  },
  {
    id: 'ironside', name: 'Sir Ironside, the Red Knight of the Red Lands', title: 'Foe of Gareth', group: 'foe',
    blazon: { field: 'gules', charges: [{ device: 'sun', tincture: 'or' }] },
    relations: [{ to: 'gareth', type: 'rival' }, { to: 'arthur', type: 'fellowship' }],
    sources: [
      { source: 'Malory', text: 'A knight whose strength waxes till noon and wanes after. Beaumains (Gareth) holds him through the morning, then strikes him down in the afternoon. Ironside surrenders and joins the Round Table — one of Malory\'s many redemption-by-defeat moments.' },
    ],
  },
  {
    id: 'pelleas', name: 'Sir Pelleas', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: 'azure', charges: [{ device: 'rose', tincture: 'or' }] },
    relations: [{ to: 'nimue', type: 'marriage' }, { to: 'ettarde', type: 'rival' }, { to: 'arthur', type: 'fellowship' }],
    sources: [
      { source: 'Malory', text: 'Pelleas loves the lady Ettarde, who scorns him; Gawain, sent to plead his case, sleeps with her instead. Nimue takes pity, enchants Ettarde to love Pelleas (who now despises her), and marries Pelleas herself.' },
      { source: 'Tennyson', text: '"Pelleas and Ettarre" is one of the bleaker Idylls — Pelleas survives only to become a wandering disenchanted knight, witness to the collapse of his own ideals.' },
    ],
  },
  {
    id: 'lucan', name: 'Sir Lucan the Butler', title: 'Knight of the Round Table', group: 'round-table',
    blazon: { field: 'gules', charges: [{ device: 'chalice', tincture: 'argent' }] },
    relations: [{ to: 'bedivere', type: 'family' }, { to: 'arthur', type: 'fellowship' }],
    sources: [
      { source: 'Malory', text: 'Brother to Bedivere. Survives Camlann mortally wounded; tries to lift the dying Arthur and his own guts spill out from the effort. He dies in the king\'s arms — one of the small, awful images that ends the Morte.' },
    ],
  },
  {
    id: 'urien', name: 'King Urien of Gore', title: 'King of Rheged', group: 'other',
    blazon: { field: 'or', charges: [{ device: 'raven', tincture: 'sable' }] },
    relations: [{ to: 'morgan', type: 'marriage' }, { to: 'yvain', type: 'family' }, { to: 'arthur', type: 'fellowship' }],
    sources: [
      { source: 'Mabinogion', text: 'A historical 6th-century king of Rheged, father of the historical Owain. The Welsh poets remember him.' },
      { source: 'Malory', text: 'Married to Morgan. She tries to kill him in his sleep with his own sword; their son Yvain catches her, and she leaves Camelot for good.' },
    ],
  },
  {
    id: 'taliesin', name: 'Taliesin', title: 'Chief Bard of the Island', group: 'enchanter',
    blazon: { field: 'azure', charges: [{ device: 'harp', tincture: 'or' }] },
    relations: [{ to: 'arthur', type: 'fellowship' }, { to: 'merlin', type: 'fellowship' }, { to: 'bran', type: 'fellowship' }],
    sources: [
      { source: 'Mabinogion', text: 'The 6th-century historical poet, almost immediately legendary. In Preiddeu Annwfn ("The Spoils of Annwn") he sails with Arthur to the Otherworld to steal a magic cauldron — and only seven return. The poem is older than any Round Table.' },
    ],
  },
  {
    id: 'bran', name: 'Bran the Blessed', title: 'Giant-King of Britain', group: 'enchanter',
    blazon: { field: 'sable', charges: [{ device: 'raven', tincture: 'argent' }] },
    relations: [{ to: 'taliesin', type: 'fellowship' }],
    sources: [
      { source: 'Mabinogion', text: 'From the Second Branch: a giant Welsh king whose head, after his death in Ireland, is buried at the White Tower of London facing south, to guard Britain from invasion forever. Some scholars trace the Grail (the wounded king, the dish that feeds) back to Bran\'s cauldron.' },
    ],
  },
  {
    id: 'lot-king', name: 'King Bors the Elder', title: 'King of Gaul, Father of Bors', group: 'other',
    blazon: { field: 'gules', charges: [{ device: 'lion', tincture: 'or', attitude: 'passant', count: 2, arrangement: 'in pale' }] },
    relations: [{ to: 'bors', type: 'family' }, { to: 'lionel', type: 'family' }, { to: 'arthur', type: 'fellowship' }],
    sources: [
      { source: 'Vulgate Cycle', text: 'King of Gaunes; father of Bors and Lionel. Dies in the wars after Arthur\'s coronation, leaving his small sons to be raised by the Lady of the Lake alongside Lancelot.' },
    ],
  },
  {
    id: 'cador', name: 'Sir Cador of Cornwall', title: 'Duke of Cornwall after Gorlois', group: 'cornwall',
    blazon: { field: 'sable', ordinary: { type: 'fess', tincture: 'argent' } },
    relations: [{ to: 'arthur', type: 'fellowship' }, { to: 'mark', type: 'rival' }],
    sources: [
      { source: 'Geoffrey of Monmouth', text: 'A loyal duke of Cornwall in Geoffrey, one of Arthur\'s chief continental commanders. By the later romances he has faded almost entirely.' },
    ],
  },
  {
    id: 'ettarde', name: 'Lady Ettarde', title: 'Lady, beloved of Pelleas', group: 'lady',
    blazon: { field: 'purpure', charges: [{ device: 'rose', tincture: 'argent' }] },
    relations: [{ to: 'pelleas', type: 'rival' }, { to: 'gawain', type: 'rival' }],
    sources: [
      { source: 'Malory', text: 'Scorns Pelleas. Sleeps with Gawain. Cursed by Nimue\'s enchantment to love Pelleas hopelessly while Pelleas now despises her. She dies of it.' },
    ],
  },
  {
    id: 'laudine', name: 'Laudine', title: 'Lady of the Fountain', group: 'lady',
    blazon: { field: 'azure', charges: [{ device: 'sun', tincture: 'argent' }] },
    relations: [{ to: 'yvain', type: 'marriage' }],
    sources: [
      { source: 'Chrétien de Troyes', text: 'Yvain kills her husband and, within days, marries her — a transition Chrétien handles with such bald irony that critics have argued about it for eight centuries.' },
    ],
  },
];

// ─── REALMS ──────────────────────────────────────────────────────────────────
export const REALM_BY_ID = {
  arthur: 'logres', guinevere: 'logres', merlin: 'other',
  kay: 'logres', bedivere: 'logres', lucan: 'logres', pelleas: 'logres', caradoc: 'logres',
  ector: 'logres', vortigern: 'logres', uther: 'logres', igraine: 'logres',
  'elaine-astolat': 'logres', lyonesse: 'logres', ironside: 'logres',
  tristan: 'cornwall', mark: 'cornwall', gorlois: 'cornwall', cador: 'cornwall',
  yvain: 'wales', geraint: 'wales',
  pellinore: 'wales', lamorak: 'wales', percival: 'wales', dindrane: 'wales',
  bran: 'wales', taliesin: 'wales', enide: 'wales',
  bagdemagus: 'wales', meleagant: 'wales', blanchefleur: 'wales', 'green-knight': 'wales',
  gawain: 'north', gareth: 'north', gaheris: 'north', agravain: 'north',
  lot: 'north', morgause: 'north', mordred: 'north', urien: 'north', ettarde: 'north',
  balin: 'north', balan: 'north',
  'isolde-ireland': 'ireland', morholt: 'ireland',
  lancelot: 'france', bors: 'france', lionel: 'france', 'ector-marais': 'france',
  'lot-king': 'france', accolon: 'france', 'isolde-hands': 'france', laudine: 'france',
  galahad: 'other', palamedes: 'other', safir: 'other', segwarides: 'other',
  morgan: 'other', nimue: 'other', 'lady-lake': 'other',
  pelles: 'other', pellam: 'other', 'elaine-corbenic': 'other', 'elaine-garlot': 'other',
};

export const REALMS = [
  { id: 'logres',   label: 'LOGRES',          width: 70 },
  { id: 'north',    label: 'THE NORTH',       width: 56 },
  { id: 'other',    label: 'OTHER REALMS',    width: 56 },
  { id: 'france',   label: 'GAUL & BRITTANY', width: 56 },
  { id: 'cornwall', label: 'CORNWALL',        width: 20 },
  { id: 'wales',    label: 'WALES',           width: 77 },
  { id: 'ireland',  label: 'IRELAND',         width: 25 },
];

export const KNIGHT_ORDER_BY_REALM = {
  logres:   ['kay', 'bedivere', 'lucan', 'caradoc', 'pelleas'],
  cornwall: ['tristan'],
  wales:    ['pellinore', 'lamorak', 'percival', 'yvain', 'geraint'],
  north:    ['gawain', 'agravain', 'gaheris', 'gareth'],
  ireland:  [],
  france:   ['lancelot', 'bors', 'lionel', 'ector-marais'],
  other:    ['galahad', 'palamedes', 'safir', 'segwarides'],
};

export const REALM_LABEL = Object.fromEntries(REALMS.map(r => [r.id, r.label]));
