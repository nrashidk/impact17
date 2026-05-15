// Seeds the 17 SDG records with official UN names and colors.
//
// Arabic names below are the standard UN-published Arabic translations.
// Arabic descriptions are left as empty strings — they need an official UN
// translation pass before being shown to users (see flag list in the seed
// summary).

import type { PrismaClient } from "@prisma/client";

export type SdgSeed = {
  id: number;
  number: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  color: string;
  descriptionEn: string;
  descriptionAr: string;
};

export const SDG_SEED_DATA: readonly SdgSeed[] = [
  {
    id: 1,
    number: 1,
    slug: "no-poverty",
    nameEn: "No Poverty",
    nameAr: "القضاء على الفقر",
    color: "#E5243B",
    descriptionEn: "End poverty in all its forms everywhere.",
    descriptionAr: "",
  },
  {
    id: 2,
    number: 2,
    slug: "zero-hunger",
    nameEn: "Zero Hunger",
    nameAr: "القضاء التام على الجوع",
    color: "#DDA63A",
    descriptionEn:
      "End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.",
    descriptionAr: "",
  },
  {
    id: 3,
    number: 3,
    slug: "good-health-and-well-being",
    nameEn: "Good Health and Well-being",
    nameAr: "الصحة الجيدة والرفاه",
    color: "#4C9F38",
    descriptionEn: "Ensure healthy lives and promote well-being for all at all ages.",
    descriptionAr: "",
  },
  {
    id: 4,
    number: 4,
    slug: "quality-education",
    nameEn: "Quality Education",
    nameAr: "التعليم الجيد",
    color: "#C5192D",
    descriptionEn:
      "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
    descriptionAr: "",
  },
  {
    id: 5,
    number: 5,
    slug: "gender-equality",
    nameEn: "Gender Equality",
    nameAr: "المساواة بين الجنسين",
    color: "#FF3A21",
    descriptionEn: "Achieve gender equality and empower all women and girls.",
    descriptionAr: "",
  },
  {
    id: 6,
    number: 6,
    slug: "clean-water-and-sanitation",
    nameEn: "Clean Water and Sanitation",
    nameAr: "المياه النظيفة والنظافة الصحية",
    color: "#26BDE2",
    descriptionEn:
      "Ensure availability and sustainable management of water and sanitation for all.",
    descriptionAr: "",
  },
  {
    id: 7,
    number: 7,
    slug: "affordable-and-clean-energy",
    nameEn: "Affordable and Clean Energy",
    nameAr: "طاقة نظيفة وبأسعار معقولة",
    color: "#FCC30B",
    descriptionEn: "Ensure access to affordable, reliable, sustainable and modern energy for all.",
    descriptionAr: "",
  },
  {
    id: 8,
    number: 8,
    slug: "decent-work-and-economic-growth",
    nameEn: "Decent Work and Economic Growth",
    nameAr: "العمل اللائق ونمو الاقتصاد",
    color: "#A21942",
    descriptionEn:
      "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.",
    descriptionAr: "",
  },
  {
    id: 9,
    number: 9,
    slug: "industry-innovation-and-infrastructure",
    nameEn: "Industry, Innovation and Infrastructure",
    nameAr: "الصناعة والابتكار والهياكل الأساسية",
    color: "#FD6925",
    descriptionEn:
      "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.",
    descriptionAr: "",
  },
  {
    id: 10,
    number: 10,
    slug: "reduced-inequalities",
    nameEn: "Reduced Inequalities",
    nameAr: "الحد من أوجه عدم المساواة",
    color: "#DD1367",
    descriptionEn: "Reduce inequality within and among countries.",
    descriptionAr: "",
  },
  {
    id: 11,
    number: 11,
    slug: "sustainable-cities-and-communities",
    nameEn: "Sustainable Cities and Communities",
    nameAr: "مدن ومجتمعات محلية مستدامة",
    color: "#FD9D24",
    descriptionEn: "Make cities and human settlements inclusive, safe, resilient and sustainable.",
    descriptionAr: "",
  },
  {
    id: 12,
    number: 12,
    slug: "responsible-consumption-and-production",
    nameEn: "Responsible Consumption and Production",
    nameAr: "الاستهلاك والإنتاج المسؤولان",
    color: "#BF8B2E",
    descriptionEn: "Ensure sustainable consumption and production patterns.",
    descriptionAr: "",
  },
  {
    id: 13,
    number: 13,
    slug: "climate-action",
    nameEn: "Climate Action",
    nameAr: "العمل المناخي",
    color: "#3F7E44",
    descriptionEn: "Take urgent action to combat climate change and its impacts.",
    descriptionAr: "",
  },
  {
    id: 14,
    number: 14,
    slug: "life-below-water",
    nameEn: "Life Below Water",
    nameAr: "الحياة تحت الماء",
    color: "#0A97D9",
    descriptionEn:
      "Conserve and sustainably use the oceans, seas and marine resources for sustainable development.",
    descriptionAr: "",
  },
  {
    id: 15,
    number: 15,
    slug: "life-on-land",
    nameEn: "Life on Land",
    nameAr: "الحياة في البر",
    color: "#56C02B",
    descriptionEn:
      "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss.",
    descriptionAr: "",
  },
  {
    id: 16,
    number: 16,
    slug: "peace-justice-and-strong-institutions",
    nameEn: "Peace, Justice and Strong Institutions",
    nameAr: "السلام والعدل والمؤسسات القوية",
    color: "#00689D",
    descriptionEn:
      "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels.",
    descriptionAr: "",
  },
  {
    id: 17,
    number: 17,
    slug: "partnerships-for-the-goals",
    nameEn: "Partnerships for the Goals",
    nameAr: "عقد الشراكات لتحقيق الأهداف",
    color: "#19486A",
    descriptionEn:
      "Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development.",
    descriptionAr: "",
  },
];

export async function seedSdgs(prisma: PrismaClient): Promise<number> {
  for (const sdg of SDG_SEED_DATA) {
    await prisma.sdg.upsert({
      where: { id: sdg.id },
      create: {
        id: sdg.id,
        number: sdg.number,
        slug: sdg.slug,
        nameEn: sdg.nameEn,
        nameAr: sdg.nameAr,
        color: sdg.color,
        descriptionEn: sdg.descriptionEn,
        descriptionAr: sdg.descriptionAr,
        iconUrl: "",
      },
      update: {
        number: sdg.number,
        slug: sdg.slug,
        nameEn: sdg.nameEn,
        nameAr: sdg.nameAr,
        color: sdg.color,
        descriptionEn: sdg.descriptionEn,
        descriptionAr: sdg.descriptionAr,
      },
    });
  }
  return SDG_SEED_DATA.length;
}
