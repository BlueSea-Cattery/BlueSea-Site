import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const kittens = await prisma.kitten.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        parent: { select: { id: true, name: true } },
        litter: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(kittens);
  } catch (error) {
    console.error("Get kittens error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const kitten = await prisma.kitten.create({
      data: {
        name: data.name,
        gender: data.gender,
        color: data.color || null,
        birthDate: data.birthDate || null,
        status: data.status || "available",
        price: data.price ? parseFloat(data.price) : null,
        description: data.description || null,
        photoUrl: data.photoUrl || null,
        photos: Array.isArray(data.photos) ? data.photos : [],
        parentId: data.parentId || null,
        litterId: data.litterId || null,
        isActive: data.isActive !== false,
      },
    });
    revalidateTag("kittens", "default");
    revalidatePath("/kittens");
    return NextResponse.json(kitten, { status: 201 });
  } catch (error) {
    console.error("Create kitten error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
