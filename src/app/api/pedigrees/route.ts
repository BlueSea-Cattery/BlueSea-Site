import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const pedigrees = await prisma.pedigree.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pedigrees);
  } catch {
    return NextResponse.json({ error: "Failed to fetch pedigrees" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const pedigree = await prisma.pedigree.create({
      data: {
        name: body.name,
        photoUrl: body.photoUrl,
      },
    });
    return NextResponse.json(pedigree);
  } catch {
    return NextResponse.json({ error: "Failed to create pedigree" }, { status: 500 });
  }
}
