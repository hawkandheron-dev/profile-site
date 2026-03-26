/**
 * Scene definitions for the Getting Started Tour.
 *
 * Each scene's `personIds` is cumulative — it includes everyone visible so far.
 * A `personIds` of `null` means "show everything" (used for the final build-out).
 */

export const TOUR_SCENES = [
  {
    id: 'jesus',
    personIds: ['jesus'],
    title: 'Jesus',
    narrative:
      'This timeline shows how key figures in church history were connected through overlapping lifespans — teacher to student, mentor to disciple — forming an unbroken chain across centuries. We begin with Jesus of Nazareth, whose life and teachings launched a movement that would reshape the world.',
  },
  {
    id: 'john',
    personIds: ['jesus', 'john-evangelist'],
    title: 'John the Evangelist',
    narrative:
      'John, the beloved disciple, outlived the other apostles. Notice how his lifespan stretches across the entire first century, overlapping with the next generation of church leaders.',
  },
  {
    id: 'polycarp',
    personIds: ['jesus', 'john-evangelist', 'polycarp'],
    title: 'Polycarp',
    narrative:
      'Polycarp of Smyrna was traditionally held to be a disciple of John and ordained as bishop by him, according to Jerome. His life bridges the apostolic age and the era of the early church fathers.',
  },
  {
    id: 'irenaeus',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus'],
    title: 'Irenaeus of Lyons',
    narrative:
      'As a boy growing up in Smyrna, Irenaeus listened to the aged Polycarp preach — and through Polycarp, he heard the living echo of the apostle John himself.',
  },
  {
    id: 'irenaeus-2',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus'],
    title: 'Irenaeus of Lyons',
    narrative:
      'As a boy growing up in Smyrna, Irenaeus listened to the aged Polycarp preach — and through Polycarp, he heard the living echo of the apostle John himself.',
    additionalNarrative:
      'Irenaeus carried that apostolic witness westward, becoming bishop of Lyon in Gaul — bringing the good news of Jesus from the heart of Asia Minor to the frontiers of the Roman world.',
    openPersonId: 'irenaeus',
  },
  {
    id: 'irenaeus-3',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus'],
    title: 'Irenaeus of Lyons',
    narrative:
      'As a boy growing up in Smyrna, Irenaeus listened to the aged Polycarp preach — and through Polycarp, he heard the living echo of the apostle John himself.',
    additionalNarrative:
      'Irenaeus carried that apostolic witness westward, becoming bishop of Lyon in Gaul — bringing the good news of Jesus from the heart of Asia Minor to the frontiers of the Roman world.',
    thirdNarrative:
      'Notice his connections: Polycarp, who shaped him, and Hippolytus of Rome, whom he in turn influenced. Each link in the chain carries the faith forward.',
    highlightConnectionId: 'hippolytus',
    keepModalOpen: true,
  },
  {
    id: 'hippolytus',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus'],
    title: 'Hippolytus of Rome',
    narrative:
      'Hippolytus is believed to have been a student of Irenaeus. A prolific writer, he carried the theological tradition forward in Rome.',
  },
  {
    id: 'origen',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen'],
    title: 'Origen',
    narrative:
      'Origen heard Hippolytus preach in Rome. One of the most influential early Christian scholars, he established a school of theology in Alexandria and later Caesarea.',
  },
  {
    id: 'gregory-thaumaturgus',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen', 'gregory-thaumaturgus'],
    title: 'Gregory Thaumaturgus',
    narrative:
      'Gregory Thaumaturgus was a student of Origen in Caesarea. His grateful farewell address to Origen survives as one of the earliest accounts of a Christian education.',
  },
  {
    id: 'macrina-elder',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen', 'gregory-thaumaturgus', 'macrina-elder'],
    title: 'Macrina the Elder',
    narrative:
      'Macrina the Elder studied under Gregory Thaumaturgus in Pontus. During the persecutions under Diocletian, she and her husband fled into the wilderness for seven years, preserving the faith they had received.',
  },
  {
    id: 'cappadocians',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen', 'gregory-thaumaturgus', 'macrina-elder', 'macrina-younger', 'gregory-nyssa', 'basil-great'],
    staggerIds: ['macrina-younger', 'gregory-nyssa', 'basil-great'],
    title: 'The Grandchildren',
    narrative:
      'Macrina the Younger, Gregory of Nyssa, and Basil the Great were grandchildren of Macrina the Elder. She passed the faith directly to them, and they became three of the most important theologians of the fourth century.',
  },
  {
    id: 'ambrose',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen', 'gregory-thaumaturgus', 'macrina-elder', 'macrina-younger', 'gregory-nyssa', 'basil-great', 'ambrose-milan'],
    title: 'Ambrose of Milan',
    narrative:
      'Ambrose of Milan corresponded with Basil the Great. A Roman governor who became bishop, he was renowned for his eloquent preaching and his defense of orthodoxy.',
  },
  {
    id: 'augustine',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen', 'gregory-thaumaturgus', 'macrina-elder', 'macrina-younger', 'gregory-nyssa', 'basil-great', 'ambrose-milan', 'augustine'],
    title: 'Augustine of Hippo',
    narrative:
      'Augustine was baptized by Ambrose in Milan in 387. His writings — especially the Confessions and the City of God — shaped Western Christianity for a millennium and beyond.',
  },
  {
    id: 'prosper',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen', 'gregory-thaumaturgus', 'macrina-elder', 'macrina-younger', 'gregory-nyssa', 'basil-great', 'ambrose-milan', 'augustine', 'prosper-aquitaine'],
    title: 'Prosper of Aquitaine',
    narrative:
      'Prosper of Aquitaine corresponded with Augustine and became one of his most devoted defenders, championing his theology of grace in the debates that followed.',
  },
  {
    id: 'pomerius',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen', 'gregory-thaumaturgus', 'macrina-elder', 'macrina-younger', 'gregory-nyssa', 'basil-great', 'ambrose-milan', 'augustine', 'prosper-aquitaine', 'julianus-pomerius'],
    title: 'Julianus Pomerius',
    narrative:
      'Meanwhile, back in North Africa, Julianus Pomerius preserved Augustine\u2019s works by fleeing with them to Gaul to escape the Vandal conquest. He established a school in Arles, ensuring that Augustine\u2019s thought survived the collapse of Roman Africa.',
  },
  {
    id: 'caesarius',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen', 'gregory-thaumaturgus', 'macrina-elder', 'macrina-younger', 'gregory-nyssa', 'basil-great', 'ambrose-milan', 'augustine', 'prosper-aquitaine', 'julianus-pomerius', 'caesarius-arles'],
    title: 'Caesarius of Arles',
    narrative:
      'Caesarius of Arles was a student of Pomerius. As bishop, he drew heavily on Augustine\u2019s writings in his sermons, bringing the theology of the early church to the people of early medieval Gaul.',
  },
  {
    id: 'year-530',
    personIds: ['jesus', 'john-evangelist', 'polycarp', 'irenaeus', 'hippolytus', 'origen', 'gregory-thaumaturgus', 'macrina-elder', 'macrina-younger', 'gregory-nyssa', 'basil-great', 'ambrose-milan', 'augustine', 'prosper-aquitaine', 'julianus-pomerius', 'caesarius-arles', 'benedict-nursia', 'columba', 'finnian-moville', 'eastern-justinian-i', 'maurus'],
    title: 'What else is going on in 530\u00A0AD?',
    narrative:
      'By the year 530, Caesarius is an old man. The Western Roman Empire has fallen, but the faith endures. Justinian reigns in Constantinople, codifying Roman law. Benedict of Nursia is writing his Rule, laying the foundation for Western monasticism.',
    additionalNarrative:
      'Click on a blank part of the timeline to see who\u2019s where, which monarchs are reigning, and what events take place before, during, and after a given year.',
    additionalNarrativeStyle: 'italic',
    openYearSummary: 530,
    includePeriodsAndPoints: true,
  },
  {
    id: 'build-out',
    personIds: null, // null = show ALL
    title: 'The Full Picture',
    narrative:
      'From Jesus to Caesarius — an unbroken chain of overlapping lifespans spanning over five centuries. Now see the complete timeline: hundreds of interconnected lives across two millennia. Explore at your leisure.',
    isBuildOut: true,
  },
];

/** IDs of people featured in the tour (scenes 1-14), for filtering during build-out. */
export const TOUR_PERSON_IDS = new Set(
  TOUR_SCENES.filter(s => s.personIds && s.personIds.length > 0)
    .flatMap(s => s.personIds)
);
