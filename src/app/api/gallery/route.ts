import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Get gallery error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const image = await prisma.galleryImage.create({
      data: {
        url: data.url,
        caption: data.caption || null,
        sortOrder: data.sortOrder || 0,
      },
    });
    revalidateTag("gallery", "default");
    revalidatePath("/gallery");
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Create gallery image error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
