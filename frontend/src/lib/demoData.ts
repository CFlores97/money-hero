import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  Crown,
  Flame,
  Footprints,
  Laptop,
  PiggyBank,
  Plane,
  Shield,
  Swords,
} from "lucide-react";

export const player = {
  name: "Héroe Demo",
  level: 4,
  title: "Ahorrador",
  xp: 1250,
  xpToNext: 2000,
  streak: 7,
  coins: 3200,
};

export const stats = {
  balance: 12500,
  income: 4200,
  expenses: 2750,
};

export const missions = [
  {
    id: 1,
    title: "Registra 3 gastos hoy",
    description: "Anota tus gastos para mantener tu bitácora al día.",
    progress: 2,
    total: 3,
    xp: 50,
    category: "Diaria",
  },
  {
    id: 2,
    title: "Ahorra L200 esta semana",
    description: "Aparta dinero hacia cualquiera de tus metas.",
    progress: 120,
    total: 200,
    xp: 150,
    category: "Semanal",
  },
  {
    id: 3,
    title: "3 días sin comida rápida",
    description: "Evita la categoría 'Comida rápida' por 3 días seguidos.",
    progress: 1,
    total: 3,
    xp: 100,
    category: "Semanal",
  },
  {
    id: 4,
    title: "Crea tu primer presupuesto",
    description: "Define un límite mensual para una categoría.",
    progress: 0,
    total: 1,
    xp: 80,
    category: "Logro único",
  },
  {
    id: 5,
    title: "Revisa tu dashboard",
    description: "Entra a tu base de operaciones hoy.",
    progress: 1,
    total: 1,
    xp: 20,
    category: "Diaria",
  },
];

export const goals: { id: number; title: string; current: number; target: number; icon: LucideIcon }[] = [
  { id: 1, title: "Fondo de emergencia", current: 1800, target: 5000, icon: Shield },
  { id: 2, title: "Viaje a la playa", current: 650, target: 1200, icon: Plane },
  { id: 3, title: "Laptop nueva", current: 900, target: 4000, icon: Laptop },
];

export const bosses = [
  {
    id: 1,
    name: "Dragón de la Tarjeta de Crédito",
    description: "Cada pago que hagas a tu tarjeta le quita HP a este dragón.",
    maxHp: 8000,
    hp: 5200,
    reward: "300 XP + insignia 'Cazador de deudas'",
  },
  {
    id: 2,
    name: "Ogro del Préstamo del Auto",
    description: "Un enemigo lento pero resistente. La constancia lo derrota.",
    maxHp: 15000,
    hp: 13500,
    reward: "500 XP",
  },
];

export const achievements: { id: number; title: string; description: string; unlocked: boolean; icon: LucideIcon }[] = [
  { id: 1, title: "Primer paso", description: "Registra tu primera transacción", unlocked: true, icon: Footprints },
  { id: 2, title: "Racha de 7 días", description: "Usa la app 7 días seguidos", unlocked: true, icon: Flame },
  { id: 3, title: "Ahorrador novato", description: "Alcanza L1,000 ahorrados", unlocked: true, icon: PiggyBank },
  { id: 4, title: "Presupuesto maestro", description: "Cumple un presupuesto mensual completo", unlocked: false, icon: ClipboardCheck },
  { id: 5, title: "Cazador de jefes", description: "Derrota a un jefe financiero", unlocked: false, icon: Swords },
  { id: 6, title: "Leyenda financiera", description: "Alcanza el nivel 10", unlocked: false, icon: Crown },
];

export const ranking = [
  { id: 1, name: "Valeria R.", level: 9, xp: 8200 },
  { id: 2, name: "Carlos M.", level: 7, xp: 6100 },
  { id: 3, name: "Héroe Demo", level: 4, xp: 1250 },
  { id: 4, name: "Ana P.", level: 4, xp: 1100 },
  { id: 5, name: "Diego F.", level: 3, xp: 800 },
];

export const transactions = [
  { id: 1, title: "Supermercado", category: "Comida", amount: -45.5, date: "2026-06-12" },
  { id: 2, title: "Pago de salario", category: "Ingreso", amount: 1500, date: "2026-06-10" },
  { id: 3, title: "Netflix", category: "Suscripciones", amount: -12.99, date: "2026-06-09" },
  { id: 4, title: "Gasolina", category: "Transporte", amount: -35, date: "2026-06-08" },
  { id: 5, title: "Freelance", category: "Ingreso extra", amount: 300, date: "2026-06-05" },
];
