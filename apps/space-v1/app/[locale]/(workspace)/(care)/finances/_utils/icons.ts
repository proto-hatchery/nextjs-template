import type { LucideIcon } from "lucide-react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Blend,
  Briefcase,
  Car,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  LayoutGrid,
  Lightbulb,
  MoreHorizontal,
  Plane,
  ShoppingBag,
  Smartphone,
  Stethoscope,
  Utensils,
  Wallet,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Despesas comuns
  Restaurantes: Utensils,
  Serviços: Briefcase,
  Compras: ShoppingBag,
  Transporte: Car,
  Moradia: Home,
  Saúde: HeartPulse,
  Lazer: Plane,
  Educação: LayoutGrid,
  Supermercado: ShoppingBag,
  Luz: Lightbulb,
  Celular: Smartphone,
  Presentes: Gift,
  Outros: MoreHorizontal,
  "Despesas operacionais": Briefcase,
  "Outras despesas": MoreHorizontal,
  "Ferramentas Clinicas": Briefcase,

  // Categorias de receita específicas
  Supervisão: GraduationCap,
  "Serviços Prestados": Blend,
  "Consolidação Diária": Blend,
  Atendimento: Stethoscope,
  Consulta: Stethoscope,
  Sessão: Stethoscope,
  Receita: Wallet,
  "Receita de sessão": Stethoscope,
  "Receita de Sessao": Stethoscope,
  "Outras receitas": Wallet,
  Salário: Wallet,
  Pix: Wallet,
  Transferência: Wallet,
};

export function getCategoryIcon(categoryName?: string | null, type?: "income" | "expense") {
  if (!categoryName) return type === "income" ? ArrowUpCircle : ArrowDownCircle;

  // Busca exata primeiro
  const icon = CATEGORY_ICONS[categoryName];
  if (icon) return icon;

  // Busca case-insensitive
  const normalizedName = categoryName.trim();
  for (const [key, iconValue] of Object.entries(CATEGORY_ICONS)) {
    if (key.toLowerCase() === normalizedName.toLowerCase()) {
      return iconValue;
    }
  }

  const lower = categoryName.toLowerCase();

  // Categorias de receita (prioridade alta)
  if (lower.includes("supervisão") || lower.includes("supervisao")) return GraduationCap;
  if (
    lower.includes("serviços prestados") ||
    lower.includes("consolidação") ||
    lower.includes("consolidacao")
  )
    return Blend;
  if (
    lower.includes("atendimento") ||
    lower.includes("consulta") ||
    lower.includes("sessão") ||
    lower.includes("sessao")
  )
    return Stethoscope;
  if (
    lower.includes("receita") ||
    lower.includes("salário") ||
    lower.includes("pix") ||
    lower.includes("transferência")
  )
    return Wallet;

  // Despesas comuns
  if (lower.includes("restaurante") || lower.includes("comida") || lower.includes("alimentação"))
    return Utensils;
  if (lower.includes("compra") || lower.includes("loja")) return ShoppingBag;
  if (
    lower.includes("uber") ||
    lower.includes("taxi") ||
    lower.includes("carro") ||
    lower.includes("transporte")
  )
    return Car;
  if (lower.includes("casa") || lower.includes("aluguel") || lower.includes("moradia")) return Home;
  if (
    lower.includes("saúde") ||
    lower.includes("médico") ||
    lower.includes("farmácia") ||
    lower.includes("saude") ||
    lower.includes("medico") ||
    lower.includes("farmacia")
  )
    return HeartPulse;
  if (
    lower.includes("luz") ||
    lower.includes("energia") ||
    lower.includes("água") ||
    lower.includes("agua")
  )
    return Lightbulb;
  if (lower.includes("celular") || lower.includes("telefone") || lower.includes("internet"))
    return Smartphone;
  if (
    lower.includes("viagem") ||
    lower.includes("lazer") ||
    lower.includes("ferias") ||
    lower.includes("férias")
  )
    return Plane;
  if (
    lower.includes("educação") ||
    lower.includes("educacao") ||
    lower.includes("curso") ||
    lower.includes("estudo")
  )
    return LayoutGrid;
  if (lower.includes("serviço") || lower.includes("servico")) return Briefcase;
  if (lower.includes("presente")) return Gift;

  // Fallback: seta para cima (receita) ou para baixo (despesa)
  return type === "income" ? ArrowUpCircle : ArrowDownCircle;
}
