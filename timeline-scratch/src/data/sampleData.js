/**
 * Sample timeline data for testing
 * Based on ancient Roman history
 */

export const sampleData = {
  people: [
    {
      id: 'person-1',
      name: 'Julius Caesar',
      startDate: '-0099-07-12',
      endDate: '-0043-03-15',
      dateCertainty: 'year only',
      periodId: 'roman-republic',
      preview: 'Roman general and statesman who played a critical role in the rise of the Roman Empire.',
      description: '<p>Gaius Julius Caesar was a Roman general and statesman. A member of the First Triumvirate, Caesar led the Roman armies in the Gallic Wars before defeating his political rival Pompey in a civil war, and subsequently became dictator from 49 BC until his assassination in 44 BC.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Julius_Caesar' }
      ]
    },
    {
      id: 'person-2',
      name: 'Augustus',
      startDate: '-0062-09-23',
      endDate: '0014-08-19',
      dateCertainty: 'year only',
      periodId: 'roman-empire',
      preview: 'First Roman emperor, founder of the Roman Principate.',
      description: '<p>Caesar Augustus was the first Roman emperor, reigning from 27 BC until his death in AD 14. His status as the founder of the Roman Principate has consolidated a legacy as one of the greatest leaders in human history.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Augustus' }
      ]
    },
    {
      id: 'person-3',
      name: 'Cicero',
      startDate: '-0105-01-03',
      endDate: '-0042-12-07',
      dateCertainty: 'year only',
      periodId: 'roman-republic',
      preview: 'Roman statesman, lawyer, scholar, and philosopher.',
      description: '<p>Marcus Tullius Cicero was a Roman statesman, lawyer, scholar, philosopher and Academic Skeptic, who tried to uphold optimate principles during the political crises that led to the establishment of the Roman Empire.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Cicero' }
      ]
    },
    {
      id: 'person-4',
      name: 'Mark Antony',
      startDate: '-0082-01-14',
      endDate: '-0029-08-01',
      dateCertainty: 'year only',
      periodId: 'roman-republic',
      preview: 'Roman politician and general, ally of Julius Caesar.',
      description: '<p>Marcus Antonius, commonly known in English as Mark Antony, was a Roman politician and general who played a critical role in the transformation of the Roman Republic from a constitutional republic into the autocratic Roman Empire.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mark_Antony' }
      ]
    },
    {
      id: 'person-5',
      name: 'Cleopatra VII',
      startDate: '-0068-01-01',
      endDate: '-0029-08-12',
      dateCertainty: 'circa',
      periodId: 'ptolemaic-egypt',
      preview: 'Last active ruler of the Ptolemaic Kingdom of Egypt.',
      description: '<p>Cleopatra VII Philopator was the last active ruler of the Ptolemaic Kingdom of Egypt. As a member of the Ptolemaic dynasty, she was a descendant of its founder Ptolemy I Soter, a Macedonian Greek general and companion of Alexander the Great.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Cleopatra' }
      ]
    },
    {
      id: 'person-6',
      name: 'Nero',
      startDate: '0037-12-15',
      endDate: '0068-06-09',
      dateCertainty: 'year only',
      periodId: 'roman-empire',
      preview: 'Fifth Roman emperor, known for his tyrannical rule.',
      description: '<p>Nero Claudius Caesar Augustus Germanicus was the fifth Roman emperor and final emperor of the Julio-Claudian dynasty, reigning from AD 54 until his death in AD 68.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Nero' }
      ]
    },
    {
      id: 'person-7',
      name: 'Trajan',
      startDate: '0053-09-18',
      endDate: '0117-08-08',
      dateCertainty: 'year only',
      periodId: 'roman-empire',
      preview: 'Roman emperor, best known for his military campaigns.',
      description: '<p>Trajan was Roman emperor from 98 to 117. Officially declared optimus princeps ("best ruler") by the senate, Trajan is remembered as a successful soldier-emperor who presided over one of the greatest military expansions in Roman history.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Trajan' }
      ]
    },
    {
      id: 'person-8',
      name: 'Marcus Aurelius',
      startDate: '0121-04-26',
      endDate: '0180-03-17',
      dateCertainty: 'year only',
      periodId: 'roman-empire',
      preview: 'Roman emperor and Stoic philosopher.',
      description: '<p>Marcus Aurelius Antoninus was Roman emperor from 161 to 180 and a Stoic philosopher. He was the last of the rulers known as the Five Good Emperors, and the last emperor of the Pax Romana.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Marcus_Aurelius' }
      ]
    }
  ],

  points: [
    {
      id: 'point-1',
      name: 'Battle of Actium',
      date: '-0030-09-02',
      dateCertainty: 'year only',
      shape: 'diamond',
      color: '#d32f2f',
      preview: 'Naval battle where Octavian defeated Mark Antony and Cleopatra.',
      description: '<p>The Battle of Actium was a naval battle fought between a maritime fleet led by Octavian and the combined fleets of both Mark Antony and Cleopatra VII Philopator. The battle took place on 2 September 31 BC, on the Ionian Sea near the former Roman colony of Actium, Greece.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Battle_of_Actium' }
      ]
    },
    {
      id: 'point-2',
      name: 'Great Fire of Rome',
      date: '0064-07-19',
      dateCertainty: 'year only',
      shape: 'triangle',
      color: '#f57c00',
      preview: 'Devastating fire that destroyed much of Rome.',
      description: '<p>The Great Fire of Rome occurred in July AD 64. The fire began in the merchant shops around Rome\'s chariot stadium, Circus Maximus. After six days, the fire was brought under control, but before the damage could be assessed, the fire reignited and burned for another three days.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Great_Fire_of_Rome' }
      ]
    },
    {
      id: 'point-3',
      name: 'Eruption of Vesuvius',
      date: '0079-08-24',
      dateCertainty: 'year only',
      shape: 'triangle',
      color: '#d32f2f',
      preview: 'Volcanic eruption that destroyed Pompeii and Herculaneum.',
      description: '<p>Of the many eruptions of Mount Vesuvius, a major stratovolcano in southern Italy, the most famous is its eruption in 79 AD, which was one of the deadliest in European history. The eruption buried the Roman cities of Pompeii and Herculaneum under a thick carpet of volcanic ash.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Eruption_of_Mount_Vesuvius_in_79_AD' }
      ]
    },
    {
      id: 'point-4',
      name: 'Dacian Wars Begin',
      date: '0101-01-01',
      dateCertainty: 'year only',
      shape: 'diamond',
      color: '#d32f2f',
      preview: 'Trajan\'s military campaigns against Dacia.',
      description: '<p>The Dacian Wars were two military campaigns fought between the Roman Empire and Dacia during Emperor Trajan\'s rule. The conflicts were triggered by the constant Dacian threat on the Danubian Roman Province of Moesia and also by the increasing need for resources of the economy of the Roman Empire.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Dacian_Wars' }
      ]
    }
  ],

  periods: [
    {
      id: 'roman-republic',
      name: 'Roman Republic',
      startDate: '-0508-01-01',
      endDate: '-0026-01-01',
      dateCertainty: 'year only',
      color: '#8B0000',
      preview: 'Period of ancient Roman civilization with republican government.',
      description: '<p>The Roman Republic was the period of ancient Roman civilization beginning with the overthrow of the Roman Kingdom and ending with the establishment of the Roman Empire. It was characterized by a government headed by elected magistrates.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Roman_Republic' }
      ]
    },
    {
      id: 'roman-empire',
      name: 'Roman Empire',
      startDate: '-0026-01-01',
      endDate: '0200-12-31',
      dateCertainty: 'year only',
      color: '#4a148c',
      preview: 'Period when Rome was ruled by emperors.',
      description: '<p>The Roman Empire was the post-Republican period of ancient Rome. As a polity it included large territorial holdings around the Mediterranean Sea in Europe, Northern Africa, and Western Asia ruled by emperors.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Roman_Empire' }
      ]
    },
    {
      id: 'ptolemaic-egypt',
      name: 'Ptolemaic Kingdom',
      startDate: '-0304-01-01',
      endDate: '-0029-08-01',
      dateCertainty: 'year only',
      color: '#FFD700',
      preview: 'Hellenistic kingdom based in Egypt.',
      description: '<p>The Ptolemaic Kingdom was an Ancient Greek state based in Egypt during the Hellenistic Period. It was founded in 305 BC by Ptolemy I Soter, a companion of Alexander the Great, and lasted until the death of Cleopatra VII in 30 BC.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Ptolemaic_Kingdom' }
      ]
    },
    {
      id: 'pax-romana',
      name: 'Pax Romana',
      startDate: '-0026-01-01',
      endDate: '0180-01-01',
      dateCertainty: 'year only',
      color: '#00838f',
      preview: 'Period of relative peace and stability across the Roman Empire.',
      description: '<p>The Pax Romana (Roman Peace) was a long period of relative peace and minimal expansion by military forces experienced by the Roman Empire in the 1st and 2nd centuries AD. It is sometimes called Pax Augusta since it was established by Augustus.</p>',
      links: [
        { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Pax_Romana' }
      ]
    }
  ]
};

export const sampleConfig = {
  initialViewport: {
    startDate: '-0110-01-01',
    endDate: '0200-12-31'
  },
  eraLabels: 'BC/AD',
  maxTimeSpan: 6000,
  laneOrder: ['people', 'points', 'periods'],
  legend: [
    {
      type: 'period',
      id: 'roman-republic',
      name: 'Roman Republic',
      color: '#8B0000'
    },
    {
      type: 'period',
      id: 'roman-empire',
      name: 'Roman Empire',
      color: '#4a148c'
    },
    {
      type: 'period',
      id: 'ptolemaic-egypt',
      name: 'Ptolemaic Kingdom',
      color: '#FFD700'
    },
    {
      type: 'period',
      id: 'pax-romana',
      name: 'Pax Romana',
      color: '#00838f'
    }
  ]
};
