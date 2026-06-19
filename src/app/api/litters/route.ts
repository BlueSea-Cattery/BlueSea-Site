import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const litters = await prisma.litter.findMany({
      include: {
        mother: { select: { id: true, name: true } },
        father: { select: { id: true, name: true } },
        kittens: { select: { id: true, name: true, status: true } },
        pedigree: { select: { id: true, name: true } },
      },
      orderBy: { sortOrder: "desc" },
    });
    return NextResponse.json(litters);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch litters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const litter = await prisma.litter.create({
      data: {
        name: body.name,
        birthDate: body.birthDate || null,
        description: body.description || null,
        motherId: body.motherId || null,
        fatherId: body.fatherId || null,
        pedigreeId: body.pedigreeId || null,
        sortOrder: body.sortOrder || 0,
      },
    });
    revalidateTag("kittens", "default");
    revalidatePath("/kittens");
    return NextResponse.json(litter);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create litter" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const litter = await prisma.litter.update({
      where: { id: body.id },
      data: {
        name: body.name,
        birthDate: body.birthDate || null,
        description: body.description || null,
        motherId: body.motherId || null,
        fatherId: body.fatherId || null,
        pedigreeId: body.pedigreeId || null,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive ?? true,
      },
    });
    revalidateTag("kittens", "default");
    revalidatePath("/kittens");
    return NextResponse.json(litter);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update litter" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.litter.delete({ where: { id } });
    revalidateTag("kittens", "default");
    revalidatePath("/kittens");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete litter" }, { status: 500 });
  }
}
