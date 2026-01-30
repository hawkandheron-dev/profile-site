import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const pantheonId = Number(context.params.id);

  if (!Number.isInteger(pantheonId)) {
    return NextResponse.json(
      { error: "Pantheon id must be an integer." },
      { status: 400 }
    );
  }

  const pantheon = await prisma.pantheon.findUnique({
    where: { pantheon_id: pantheonId },
    include: {
      gods: { orderBy: { name: "asc" } },
      heroes: { orderBy: { name: "asc" } },
    },
  });

  if (!pantheon) {
    return NextResponse.json(
      { error: "Pantheon not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(pantheon);
}
