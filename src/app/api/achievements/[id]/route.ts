import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.achievement.delete({ where: { id } });
    revalidateTag("achievements", "default");
    revalidatePath("/achievements");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete achievement error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
