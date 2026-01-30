import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pantheons = await prisma.pantheon.findMany({
    orderBy: { pantheon_id: "asc" },
  });

  return NextResponse.json(pantheons);
}
