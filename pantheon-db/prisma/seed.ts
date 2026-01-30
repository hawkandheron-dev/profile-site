import "dotenv/config";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl =
  process.env.DATABASE_URL ??
  `file:${resolve(process.cwd(), "prisma", "dev.db")}`;
const databasePath = databaseUrl.replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: databasePath });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.heroFavor.deleteMany();
  await prisma.heroWork.deleteMany();
  await prisma.god.deleteMany();
  await prisma.hero.deleteMany();
  await prisma.pantheon.deleteMany();

  const greek = await prisma.pantheon.create({
    data: {
      name: "Greek",
      region: "Aegean",
      era_note: "Archaic to Classical periods",
    },
  });

  const roman = await prisma.pantheon.create({
    data: {
      name: "Roman",
      region: "Italian Peninsula",
      era_note: "Republic to Imperial eras",
    },
  });

  const egyptian = await prisma.pantheon.create({
    data: {
      name: "Egyptian",
      region: "Nile Valley",
      era_note: "Old Kingdom to Late Period",
    },
  });

  const babylonian = await prisma.pantheon.create({
    data: {
      name: "Babylonian",
      region: "Mesopotamia",
      era_note: "Old Babylonian to Neo-Babylonian",
    },
  });

  const greekGods = await prisma.god.createMany({
    data: [
      {
        pantheon_id: greek.pantheon_id,
        name: "Zeus",
        domain: "sky and kingship",
        symbols: "thunderbolt, eagle",
      },
      {
        pantheon_id: greek.pantheon_id,
        name: "Athena",
        domain: "wisdom and warfare",
        symbols: "owl, aegis",
      },
      {
        pantheon_id: greek.pantheon_id,
        name: "Apollo",
        domain: "light and music",
        symbols: "lyre, laurel",
      },
    ],
  });

  const romanGods = await prisma.god.createMany({
    data: [
      {
        pantheon_id: roman.pantheon_id,
        name: "Jupiter",
        domain: "sky and law",
        symbols: "thunderbolt, eagle",
      },
      {
        pantheon_id: roman.pantheon_id,
        name: "Mars",
        domain: "war and agriculture",
        symbols: "spear, helmet",
      },
      {
        pantheon_id: roman.pantheon_id,
        name: "Venus",
        domain: "love and prosperity",
        symbols: "dove, myrtle",
      },
    ],
  });

  const egyptianGods = await prisma.god.createMany({
    data: [
      {
        pantheon_id: egyptian.pantheon_id,
        name: "Ra",
        domain: "sun",
        symbols: "solar disk",
      },
      {
        pantheon_id: egyptian.pantheon_id,
        name: "Isis",
        domain: "magic and healing",
        symbols: "throne, ankh",
      },
      {
        pantheon_id: egyptian.pantheon_id,
        name: "Osiris",
        domain: "afterlife",
        symbols: "crook and flail",
      },
    ],
  });

  const babylonianGods = await prisma.god.createMany({
    data: [
      {
        pantheon_id: babylonian.pantheon_id,
        name: "Marduk",
        domain: "order and kingship",
        symbols: "dragon, spade",
      },
      {
        pantheon_id: babylonian.pantheon_id,
        name: "Ishtar",
        domain: "love and war",
        symbols: "star, lion",
      },
      {
        pantheon_id: babylonian.pantheon_id,
        name: "Shamash",
        domain: "sun and justice",
        symbols: "sun disk, saw",
      },
    ],
  });

  const greekHeroes = await prisma.hero.createMany({
    data: [
      {
        pantheon_id: greek.pantheon_id,
        name: "Heracles",
        origin: "Thebes",
        archetype: "strongman",
        notes: "Known for the Twelve Labors.",
      },
      {
        pantheon_id: greek.pantheon_id,
        name: "Odysseus",
        origin: "Ithaca",
        archetype: "clever voyager",
        notes: "Hero of the Odyssey.",
      },
    ],
  });

  const romanHeroes = await prisma.hero.createMany({
    data: [
      {
        pantheon_id: roman.pantheon_id,
        name: "Aeneas",
        origin: "Troy",
        archetype: "founder",
        notes: "Ancestor of Rome per the Aeneid.",
      },
      {
        pantheon_id: roman.pantheon_id,
        name: "Romulus",
        origin: "Alba Longa",
        archetype: "founder king",
        notes: "Traditional founder of Rome.",
      },
    ],
  });

  const egyptianHeroes = await prisma.hero.createMany({
    data: [
      {
        pantheon_id: egyptian.pantheon_id,
        name: "Sinuhe",
        origin: "Egypt",
        archetype: "exile",
        notes: "Protagonist of a Middle Kingdom tale.",
      },
      {
        pantheon_id: egyptian.pantheon_id,
        name: "Setne Khamwas",
        origin: "Memphis",
        archetype: "magician prince",
        notes: "Hero of Late Period stories.",
      },
    ],
  });

  const babylonianHeroes = await prisma.hero.createMany({
    data: [
      {
        pantheon_id: babylonian.pantheon_id,
        name: "Gilgamesh",
        origin: "Uruk",
        archetype: "king",
        notes: "Hero of the Epic of Gilgamesh.",
      },
      {
        pantheon_id: babylonian.pantheon_id,
        name: "Etana",
        origin: "Kish",
        archetype: "sky-seeker",
        notes: "King who rode an eagle to heaven.",
      },
    ],
  });

  const zeus = await prisma.god.findFirst({
    where: { pantheon_id: greek.pantheon_id, name: "Zeus" },
  });
  const athena = await prisma.god.findFirst({
    where: { pantheon_id: greek.pantheon_id, name: "Athena" },
  });
  const heracles = await prisma.hero.findFirst({
    where: { pantheon_id: greek.pantheon_id, name: "Heracles" },
  });
  const odysseus = await prisma.hero.findFirst({
    where: { pantheon_id: greek.pantheon_id, name: "Odysseus" },
  });

  const jupiter = await prisma.god.findFirst({
    where: { pantheon_id: roman.pantheon_id, name: "Jupiter" },
  });
  const mars = await prisma.god.findFirst({
    where: { pantheon_id: roman.pantheon_id, name: "Mars" },
  });
  const aeneas = await prisma.hero.findFirst({
    where: { pantheon_id: roman.pantheon_id, name: "Aeneas" },
  });
  const romulus = await prisma.hero.findFirst({
    where: { pantheon_id: roman.pantheon_id, name: "Romulus" },
  });

  const isis = await prisma.god.findFirst({
    where: { pantheon_id: egyptian.pantheon_id, name: "Isis" },
  });
  const sinuhe = await prisma.hero.findFirst({
    where: { pantheon_id: egyptian.pantheon_id, name: "Sinuhe" },
  });

  const shamash = await prisma.god.findFirst({
    where: { pantheon_id: babylonian.pantheon_id, name: "Shamash" },
  });
  const gilgamesh = await prisma.hero.findFirst({
    where: { pantheon_id: babylonian.pantheon_id, name: "Gilgamesh" },
  });

  if (
    !zeus ||
    !athena ||
    !heracles ||
    !odysseus ||
    !jupiter ||
    !mars ||
    !aeneas ||
    !romulus ||
    !isis ||
    !sinuhe ||
    !shamash ||
    !gilgamesh
  ) {
    throw new Error("Seed lookup failed; expected entities were not found.");
  }

  await prisma.heroFavor.createMany({
    data: [
      {
        hero_id: heracles.hero_id,
        god_id: zeus.god_id,
        favor_type: "patronage",
        notes: "Zeus shields Heracles during his labors.",
      },
      {
        hero_id: odysseus.hero_id,
        god_id: athena.god_id,
        favor_type: "guidance",
        notes: "Athena advises Odysseus on his return.",
      },
      {
        hero_id: aeneas.hero_id,
        god_id: jupiter.god_id,
        favor_type: "destiny",
        notes: "Jupiter affirms Aeneas's fate in Italy.",
      },
      {
        hero_id: romulus.hero_id,
        god_id: mars.god_id,
        favor_type: "ancestry",
        notes: "Mars is credited as Romulus's divine father.",
      },
      {
        hero_id: sinuhe.hero_id,
        god_id: isis.god_id,
        favor_type: "protection",
        notes: "Isis offers safe return in later versions.",
      },
      {
        hero_id: gilgamesh.hero_id,
        god_id: shamash.god_id,
        favor_type: "aid",
        notes: "Shamash supports the journey against Humbaba.",
      },
    ],
  });

  await prisma.heroWork.createMany({
    data: [
      {
        hero_id: heracles.hero_id,
        title: "The Twelve Labors",
        kind: "labors",
        approx_date: "Mythic",
      },
      {
        hero_id: odysseus.hero_id,
        title: "The Odyssey",
        kind: "journey",
        approx_date: "8th century BCE (composition)",
      },
      {
        hero_id: aeneas.hero_id,
        title: "Founding of Lavinium",
        kind: "founding",
        approx_date: "Mythic",
      },
      {
        hero_id: romulus.hero_id,
        title: "Founding of Rome",
        kind: "founding",
        approx_date: "753 BCE (traditional)",
      },
      {
        hero_id: sinuhe.hero_id,
        title: "Tale of Sinuhe",
        kind: "story",
        approx_date: "Middle Kingdom",
      },
      {
        hero_id: gilgamesh.hero_id,
        title: "Epic of Gilgamesh",
        kind: "epic",
        approx_date: "2nd millennium BCE",
      },
      {
        hero_id: gilgamesh.hero_id,
        title: "Journey with Enkidu",
        kind: "quest",
        approx_date: "Mythic",
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
