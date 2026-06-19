import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import CatProfileClient from "@/components/cats/CatProfileClient";
import { getProxiedUrl } from "@/lib/blob";

// Demo data for when DB is empty
const demoCats: Record<string, { name: string; title: string; gender: string; color: string; photoUrl: string; description: string; birthDate: string }> = {
  "demo-m1": { name: "Гранд Лорд Арктур", title: "Grand International Champion", gender: "male", color: "Сил тэбби пойнт", photoUrl: "/images/cat-male-1.png", description: "Великолепный кот с мощным костяком и роскошной шерстью. Обладатель множества наград на международных выставках. Арктур — образец породы невская маскарадная, сочетающий в себе силу сибирского кота и утончённую красоту колорпойнтового окраса.", birthDate: "2021-03-15" },
  "demo-m2": { name: "Северный Шторм", title: "Champion", gender: "male", color: "Сил пойнт", photoUrl: "/images/cat-male-2.png", description: "Мощный и харизматичный кот с глубокими голубыми глазами. Северный Шторм впечатляет своим характером — уравновешенным и дружелюбным. Его потомство неизменно радует отличным типом и прекрасным здоровьем.", birthDate: "2022-01-20" },
  "demo-f1": { name: "Бриллиант Нева", title: "International Champion", gender: "female", color: "Блю тэбби пойнт", photoUrl: "/images/cat-female-1.png", description: "Элегантная кошка с безупречным типом и изысканным окрасом. Бриллиант Нева — жемчужина нашего питомника, отличная мать, передающая потомству лучшие качества породы.", birthDate: "2021-08-10" },
  "demo-f2": { name: "Снежная Королева", title: "Champion", gender: "female", color: "Крем пойнт", photoUrl: "/images/cat-female-2.png", description: "Нежная и грациозная кошка с редким кремовым окрасом. Снежная Королева покоряет своей красотой и ласковым нравом. Её котята всегда отличаются прекрасным характером.", birthDate: "2022-05-03" },
};

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const demo = demoCats[id];
  if (demo) {
    return { title: demo.name, description: demo.description, alternates: { canonical: `/cats/${id}` } };
  }
  try {
    const cat = await prisma.cat.findUnique({ where: { id } });
    if (!cat) return { title: "Кошка не найдена" };
    return {
      title: cat.name,
      description: cat.description || `${cat.name} — невская маскарадная кошка питомника Blue Sea`,
      alternates: { canonical: `/cats/${id}` },
    };
  } catch {
    return { title: "Кошка не найдена" };
  }
}

export default async function CatProfilePage({ params }: { params: Params }) {
  const { id } = await params;

  // Check demo data first
  const demo = demoCats[id];
  if (demo) {
    return <CatProfileClient cat={{ id, ...demo, litters: [] }} />;
  }

  try {
    const cat = await prisma.cat.findUnique({
      where: { id },
      include: {
        littersAsMother: {
          where: { isActive: true },
          include: {
            father: { select: { id: true, name: true } },
            kittens: { where: { isActive: true }, select: { id: true, name: true, status: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
        littersAsFather: {
          where: { isActive: true },
          include: {
            mother: { select: { id: true, name: true } },
            kittens: { where: { isActive: true }, select: { id: true, name: true, status: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!cat) notFound();

    // Combine litters where this cat is either mother or father
    const litters = [
      ...cat.littersAsMother.map((l) => ({
        id: l.id,
        name: l.name,
        birthDate: l.birthDate,
        partnerName: l.father?.name || null,
        partnerId: l.father?.id || null,
        kittensCount: l.kittens.length,
        kittens: l.kittens,
      })),
      ...cat.littersAsFather.map((l) => ({
        id: l.id,
        name: l.name,
        birthDate: l.birthDate,
        partnerName: l.mother?.name || null,
        partnerId: l.mother?.id || null,
        kittensCount: l.kittens.length,
        kittens: l.kittens,
      })),
    ];

    // Proxy all photo URLs server-side so CatProfileClient + PhotoGallery receive
    // already-transformed /storage/... paths — no getProxiedUrl needed client-side.
    return <CatProfileClient cat={{
      id: cat.id,
      name: cat.name,
      title: cat.title || "",
      gender: cat.gender,
      color: cat.color || "",
      photoUrl: getProxiedUrl(cat.photoUrl) || "/images/hero-cat.png",
      photos: (cat.photos || []).map((p) => getProxiedUrl(p) || p),
      description: cat.description || "",
      birthDate: cat.birthDate || "",
      litters,
    }} />;
  } catch {
    // If DB isn't available, show not found
    notFound();
  }
}
