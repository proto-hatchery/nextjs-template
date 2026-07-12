import { RiChatAiFill, RiChatAiLine } from "@remixicon/react";
import {
  Blend,
  Calendar,
  CalendarDays,
  FileText,
  Globe,
  HandCoins,
  Home,
  LayoutTemplate,
  Monitor,
  Receipt,
  Target,
  UserCircle,
} from "lucide-react";

import type { NavEntry } from "./types";

export const defaultNavEntries: NavEntry[] = [
  {
    isSection: true,
    visibleWhen: ["space", "desk"],
    children: [
      {
        title: "Início",
        url: "/dashboard",
        icon: Home,
        activeIcon: Home,
      },
      {
        title: "Calendário",
        url: "/calendar",
        icon: Calendar,
        activeIcon: CalendarDays,
      },
      {
        title: "Comunidade",
        url: "/community",
        icon: Globe,
        activeIcon: Globe,
        badge: "comingSoon",
      },
    ],
  },

  {
    title: "Financeiro",
    isSection: true,
    visibleWhen: ["space", "desk"],
    children: [
      {
        title: "Cobranças",
        url: "/billing",
        icon: Receipt,
        activeIcon: Receipt,
      },
      {
        title: "Resumo Financeiro",
        url: "/finances",
        icon: HandCoins,
        activeIcon: HandCoins,
        visibleWhen: "space",
      },
    ],
  },

  {
    title: "Atendimentos",
    isSection: true,
    visibleWhen: ["space", "desk"],
    children: [
      {
        title: "Pacientes",
        url: "/patients",
        icon: UserCircle,
        activeIcon: UserCircle,
      },
      {
        title: "Sessões",
        url: "/sessions",
        icon: Blend,
        activeIcon: Blend,
      },
    ],
  },

  {
    title: "Evolução Clínica",
    isSection: true,
    visibleWhen: "space",
    children: [
      {
        title: "Documentos",
        url: "/documents",
        icon: FileText,
        activeIcon: FileText,
      },
      {
        title: "Atividades",
        url: "/activities",
        icon: Target,
        activeIcon: Target,
      },
      {
        title: "Modelos de Entrevista",
        url: "/interview-template",
        icon: LayoutTemplate,
        activeIcon: LayoutTemplate,
        badge: "comingSoon",
      },
    ],
  },

  {
    title: "Ferramentas",
    isSection: true,
    visibleWhen: "space",
    children: [
      {
        title: "Fluri Chat",
        url: "/chat",
        icon: RiChatAiLine,
        activeIcon: RiChatAiFill,
      },
      {
        title: "Meu Site",
        icon: Monitor,
        activeIcon: Monitor,
        children: [
          {
            title: "Sobre Mim",
            url: "/presence/profile",
          },
          {
            title: "Linktree",
            url: "/presence/links",
          },
          {
            title: "Preferências",
            url: "/presence/preferences",
          },
        ],
      },
    ],
  },
];

export function getNavEntriesForApp(app: "space" | "desk"): NavEntry[] {
  return defaultNavEntries.filter((entry) => {
    if ("separator" in entry) return true;
    if (!entry.visibleWhen) return true;
    if (Array.isArray(entry.visibleWhen)) {
      return entry.visibleWhen.includes(app);
    }
    return entry.visibleWhen === app;
  });
}
