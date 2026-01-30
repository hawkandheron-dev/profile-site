import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function PantheonPage({ params }: PageProps) {
  const pantheonId = Number(params.id);

  if (!Number.isInteger(pantheonId)) {
    notFound();
  }

  const pantheon = await prisma.pantheon.findUnique({
    where: { pantheon_id: pantheonId },
    include: {
      gods: { orderBy: { name: "asc" } },
      heroes: { orderBy: { name: "asc" } },
    },
  });

  if (!pantheon) {
    notFound();
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <Link href="/">← Back to pantheons</Link>
      <h1 style={{ marginBottom: "0.25rem" }}>{pantheon.name}</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        {pantheon.region || "Region unknown"}
        {pantheon.era_note ? ` · ${pantheon.era_note}` : ""}
      </p>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Gods</h2>
        {pantheon.gods.length === 0 ? (
          <p>No gods recorded.</p>
        ) : (
          <ul style={{ paddingLeft: "1.25rem" }}>
            {pantheon.gods.map((god) => (
              <li key={god.god_id} style={{ marginBottom: "0.5rem" }}>
                <strong>{god.name}</strong>
                {god.domain ? ` — ${god.domain}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Heroes</h2>
        {pantheon.heroes.length === 0 ? (
          <p>No heroes recorded.</p>
        ) : (
          <ul style={{ paddingLeft: "1.25rem" }}>
            {pantheon.heroes.map((hero) => (
              <li key={hero.hero_id} style={{ marginBottom: "0.5rem" }}>
                <strong>{hero.name}</strong>
                {hero.archetype ? ` — ${hero.archetype}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
