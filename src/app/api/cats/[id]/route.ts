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
    const cat = await prisma.cat.update({
      where: { id },
      data: {
        name: data.name,
        title: data.title || null,
        gender: data.gender,
        color: data.color || null,
        description: data.description || null,
        photoUrl: data.photoUrl || null,
        photos: Array.isArray(data.photos) ? data.photos : [],
        birthDate: data.birthDate || null,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    revalidateTag("cats", "default");
    revalidatePath("/cats");
    revalidatePath("/");
    return NextResponse.json(cat);
  } catch (error) {
    console.error("Update cat error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.cat.delete({ where: { id } });
    revalidateTag("cats", "default");
    revalidatePath("/cats");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete cat error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
