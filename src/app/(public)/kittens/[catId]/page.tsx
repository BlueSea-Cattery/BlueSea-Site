import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CatLittersClient from "@/components/kittens/CatLittersClient";
import { getProxiedUrl } from "@/lib/blob";

type Params = Promise<{ catId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { catId } = await params;
  try {
    const cat = await prisma.cat.findUnique({ where: { id: catId }, select: { name: true } });
    if (!cat) return { title: "Не найдено" };
    return {
      title: `Котята ${cat.name} | Blue Sea`,
      description: `Помёты и котята кошки ${cat.name} из питомника Blue Sea.`,
      alternates: { canonical: `/kittens/${catId}` },
    };
  } catch {
    return { title: "Котята | Blue Sea" };
  }
}

async function getCatWithLitters(catId: string) {
  try {
    const cat = await prisma.cat.findUnique({
      where: { id: catId, isActive: true },
      include: {
        littersAsMother: {
          where: { isActive: true },
          include: {
            father: {
              select: { id: true, name: true, photoUrl: true, title: true },
            },
            kittens: {
              where: { isActive: true },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { sortOrder: "desc" },
        },
      },
    });
    return cat;
  } catch {
    return null;
  }
}

export default async function CatLittersPage({ params }: { params: Params }) {
  const { catId } = await params;
  const cat = await getCatWithLitters(catId);

  if (!cat) {
    notFound();
  }

  // All photoUrls are proxied here (server-side) so CatLittersClient receives
  // clean /storage/... paths and never calls getProxiedUrl during hydration.
  const data = {
    id: cat.id,
    name: cat.name,
    title: cat.title,
    photoUrl: getProxiedUrl(cat.photoUrl),
    color: cat.color,
    description: cat.description,
    litters: cat.littersAsMother.map((l) => ({
      id: l.id,
      name: l.name,
      birthDate: l.birthDate,
      description: l.description,
      father: l.father
        ? {
            id: l.father.id,
            name: l.father.name,
            photoUrl: getProxiedUrl(l.father.photoUrl),
            title: l.father.title,
          }
        : null,
      kittens: l.kittens.map((k) => ({
        id: k.id,
        name: k.name,
        gender: k.gender,
        color: k.color,
        birthDate: k.birthDate,
        status: k.status,
        price: k.price,
        photoUrl: getProxiedUrl(k.photoUrl),
        description: k.description,
      })),
    })),
  };

  return <CatLittersClient cat={data} />;
}
