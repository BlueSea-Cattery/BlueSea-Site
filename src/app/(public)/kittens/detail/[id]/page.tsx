import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import KittenProfileClient from "@/components/kittens/KittenProfileClient";
import { getProxiedUrl } from "@/lib/blob";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  try {
    const kitten = await prisma.kitten.findUnique({
      where: { id },
      select: { name: true, description: true, color: true },
    });
    if (!kitten) return { title: "Котёнок не найден" };
    return {
      title: `${kitten.name} | Blue Sea`,
      description:
        kitten.description ||
        `${kitten.name} — котёнок невской маскарадной породы питомника Blue Sea${kitten.color ? `, окрас: ${kitten.color}` : ""}.`,
      alternates: { canonical: `/kittens/detail/${id}` },
    };
  } catch {
    return { title: "Котёнок | Blue Sea" };
  }
}

export default async function KittenDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  try {
    const kitten = await prisma.kitten.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, photoUrl: true, title: true },
        },
        litter: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            mother: {
              select: { id: true, name: true, photoUrl: true, title: true },
            },
            father: {
              select: { id: true, name: true, photoUrl: true, title: true },
            },
          },
        },
      },
    });

    if (!kitten) notFound();

    // All photoUrls are proxied here (server-side) so KittenProfileClient and
    // PhotoGallery receive clean /storage/... paths without calling getProxiedUrl
    // during client hydration.
    return (
      <KittenProfileClient
        kitten={{
          id: kitten.id,
          name: kitten.name,
          gender: kitten.gender,
          color: kitten.color,
          birthDate: kitten.birthDate,
          status: kitten.status,
          price: kitten.price,
          description: kitten.description,
          photoUrl: getProxiedUrl(kitten.photoUrl),
          photos: (kitten.photos || []).map((p) => getProxiedUrl(p) || p),
          parent: kitten.parent
            ? {
                id: kitten.parent.id,
                name: kitten.parent.name,
                photoUrl: getProxiedUrl(kitten.parent.photoUrl),
                title: kitten.parent.title,
              }
            : null,
          litter: kitten.litter
            ? {
                id: kitten.litter.id,
                name: kitten.litter.name,
                birthDate: kitten.litter.birthDate,
                mother: kitten.litter.mother
                  ? {
                      id: kitten.litter.mother.id,
                      name: kitten.litter.mother.name,
                      photoUrl: getProxiedUrl(kitten.litter.mother.photoUrl),
                      title: kitten.litter.mother.title,
                    }
                  : null,
                father: kitten.litter.father
                  ? {
                      id: kitten.litter.father.id,
                      name: kitten.litter.father.name,
                      photoUrl: getProxiedUrl(kitten.litter.father.photoUrl),
                      title: kitten.litter.father.title,
                    }
                  : null,
              }
            : null,
        }}
      />
    );
  } catch {
    notFound();
  }
}
