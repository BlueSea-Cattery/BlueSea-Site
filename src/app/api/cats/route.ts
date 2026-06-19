import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const cats = await prisma.cat.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { kittens: { select: { id: true, name: true, status: true } } },
    });
    return NextResponse.json(cats);
  } catch (error) {
    console.error("Get cats error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const cat = await prisma.cat.create({
      data: {
        name: data.name,
        title: data.title || null,
        gender: data.gender,
        color: data.color || null,
        description: data.description || null,
        photoUrl: data.photoUrl || null,
        photos: Array.isArray(data.photos) ? data.photos : [],
        birthDate: data.birthDate || null,
        isActive: data.isActive !== false,
        sortOrder: data.sortOrder || 0,
      },
    });
    revalidateTag("cats", "default");
    revalidatePath("/cats");
    revalidatePath("/");
    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    console.error("Create cat error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
