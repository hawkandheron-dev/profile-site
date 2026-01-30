import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const pantheons = await prisma.pantheon.findMany({
    orderBy: { pantheon_id: "asc" },
  });

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Pantheon DB</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Browse ancient pantheons, their gods, and heroic figures.
      </p>
      <ul style={{ paddingLeft: "1.25rem" }}>
        {pantheons.map((pantheon) => (
          <li key={pantheon.pantheon_id} style={{ marginBottom: "0.5rem" }}>
            <Link href={`/pantheons/${pantheon.pantheon_id}`}>
              {pantheon.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
