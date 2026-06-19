import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const content = await prisma.siteContent.findMany();
    const map: Record<string, string> = {};
    content.forEach((c) => {
      map[c.key] = c.value;
    });
    return NextResponse.json(map);
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const updates = Object.entries(data).map(([key, value]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string },
      })
    );
    await Promise.all(updates);
    revalidateTag("content", "default");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update content error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
