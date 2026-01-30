-- CreateTable
CREATE TABLE "Pantheon" (
    "pantheon_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "era_note" TEXT
);

-- CreateTable
CREATE TABLE "God" (
    "god_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pantheon_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "symbols" TEXT,
    "notes" TEXT,
    CONSTRAINT "God_pantheon_id_fkey" FOREIGN KEY ("pantheon_id") REFERENCES "Pantheon" ("pantheon_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hero" (
    "hero_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pantheon_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT,
    "archetype" TEXT,
    "notes" TEXT,
    CONSTRAINT "Hero_pantheon_id_fkey" FOREIGN KEY ("pantheon_id") REFERENCES "Pantheon" ("pantheon_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroFavor" (
    "hero_id" INTEGER NOT NULL,
    "god_id" INTEGER NOT NULL,
    "favor_type" TEXT,
    "notes" TEXT,

    PRIMARY KEY ("hero_id", "god_id"),
    CONSTRAINT "HeroFavor_hero_id_fkey" FOREIGN KEY ("hero_id") REFERENCES "Hero" ("hero_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HeroFavor_god_id_fkey" FOREIGN KEY ("god_id") REFERENCES "God" ("god_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroWork" (
    "work_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hero_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT,
    "approx_date" TEXT,
    CONSTRAINT "HeroWork_hero_id_fkey" FOREIGN KEY ("hero_id") REFERENCES "Hero" ("hero_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pantheon_name_key" ON "Pantheon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "God_pantheon_id_name_key" ON "God"("pantheon_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Hero_pantheon_id_name_key" ON "Hero"("pantheon_id", "name");
