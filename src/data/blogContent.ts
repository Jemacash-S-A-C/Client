export type BlogCategory =
  | "Educación Financiera"
  | "Seguridad"
  | "Tecnología"
  | "Mercado"
  | "Ahorro"
  | "Inversión";

export type ThumbTone = "a" | "b" | "c" | "d" | "e" | "f";

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readMinutes: number;
  thumbTone: ThumbTone;
};

export const blogCategories: BlogCategory[] = [
  "Educación Financiera",
  "Seguridad",
  "Tecnología",
  "Mercado",
  "Ahorro",
  "Inversión",
];

export const featuredPost = {
  title: "Ahorrar en soles cuando todo sube: por dónde empezar",
  excerpt:
    "Nadie tiene una fórmula mágica. Aquí van tres ideas concretas que aplicamos en casa: revisar comisiones, separar el colchón del gasto diario y evitar “ofertas” de préstamos por WhatsApp.",
};

export const recentPosts: BlogPost[] = [
  {
    id: "1",
    title: "Si te escriben por un préstamo urgente, para y comprueba",
    excerpt:
      "Cómo ver en dos minutos si la empresa está en la lista de la SBS y qué hacer si ya pasaste datos.",
    category: "Seguridad",
    readMinutes: 6,
    thumbTone: "a",
  },
  {
    id: "2",
    title: "La primera vez que invertí cien soles",
    excerpt:
      "Sin jerga: qué leí, qué ignoré y por qué me quedé con algo aburrido en lugar de la moda del momento.",
    category: "Educación Financiera",
    readMinutes: 8,
    thumbTone: "b",
  },
  {
    id: "3",
    title: "¿Qué miran los bancos cuando pides una línea?",
    excerpt:
      "Historial, ingresos declarados y deudas chicas que mucha gente olvida. Nada de “la IA lo decide todo”.",
    category: "Tecnología",
    readMinutes: 5,
    thumbTone: "c",
  },
  {
    id: "4",
    title: "Tipo de cambio: lo que alcanza con leer el noticiero",
    excerpt:
      "Importaciones, combustible y un poco de política monetaria, explicado como charla de sobremesa.",
    category: "Mercado",
    readMinutes: 7,
    thumbTone: "d",
  },
  {
    id: "5",
    title: "Metas de ahorro que no me duraron una semana",
    excerpt:
      "Qué cambié: menos Excel y más transferencia automática el día que cae la planilla.",
    category: "Ahorro",
    readMinutes: 4,
    thumbTone: "e",
  },
  {
    id: "6",
    title: "Fondos mutuos frente a plazo fijo: sin tablas infinitas",
    excerpt:
      "Liquidez, comisiones y el mal hábito de comparar solo la tasa del cartel del banco.",
    category: "Inversión",
    readMinutes: 9,
    thumbTone: "f",
  },
];
