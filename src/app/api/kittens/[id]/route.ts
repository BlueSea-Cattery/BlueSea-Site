import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    const kitten = await prisma.kitten.update({
      where: { id },
      data: {
        name: data.name,
        gender: data.gender,
        color: data.color || null,
        birthDate: data.birthDate || null,
        status: data.status,
        price: data.price ? parseFloat(data.price) : null,
        description: data.description || null,
        photoUrl: data.photoUrl || null,
        photos: Array.isArray(data.photos) ? data.photos : [],
        parentId: data.parentId || null,
        litterId: data.litterId || null,
        isActive: data.isActive,
      },
    });
    revalidateTag("kittens", "default");
    revalidatePath("/kittens");
    return NextResponse.json(kitten);
  } catch (error) {
    console.error("Update kitten error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.kitten.delete({ where: { id } });
    revalidateTag("kittens", "default");
    revalidatePath("/kittens");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete kitten error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
