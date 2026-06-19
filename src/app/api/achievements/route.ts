import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const items = await prisma.achievement.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Get achievements error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const item = await prisma.achievement.create({
      data: {
        url: data.url,
        caption: data.caption || null,
        sortOrder: data.sortOrder || 0,
      },
    });
    revalidateTag("achievements", "default");
    revalidatePath("/achievements");
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Create achievement error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
