import {
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  FileQuestion,
  FileText,
  FolderOpen,
  HeartHandshake,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  MapPin,
  MessageCircle,
  Percent,
  Receipt,
  Repeat,
  Sparkles,
  Star,
  Store,
  Tag,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/types/auth";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  items: NavItem[];
}

/**
 * Espelha fragments/app-shell.html :: shell (nexus-frontend antigo) — mesma
 * navegação, mesmo agrupamento (principal + "rodapé" do menu) por papel.
 * Só /pro/dashboard e /company/dashboard têm página de verdade nesta etapa;
 * os demais itens ficam aqui porque são a navegação real do produto e vão
 * ganhando conteúdo prompt a prompt — até lá, levam a um 404 esperado.
 */
export const navByRole: Record<UserRole, NavSection[]> = {
  PROFESSIONAL: [
    {
      items: [
        { title: "Dashboard", href: "/pro/dashboard", icon: LayoutDashboard },
        { title: "Oportunidades", href: "/pro/opportunities", icon: Sparkles },
        { title: "Matches", href: "/pro/matches", icon: HeartHandshake },
        { title: "Propostas", href: "/pro/proposals", icon: FileText },
        {
          title: "Processos Seletivos",
          href: "/pro/screening-invitations",
          icon: FileQuestion,
        },
        { title: "Conversas", href: "/chat", icon: MessageCircle },
        { title: "Contratantes", href: "/pro/companies", icon: Building2 },
        { title: "Profissionais", href: "/pro/professionals", icon: Users },
        { title: "Mapa", href: "/pro/map", icon: MapPin },
      ],
    },
    {
      items: [
        { title: "Analytics", href: "/pro/analytics", icon: BarChart3 },
        { title: "Portfólio", href: "/pro/portfolio", icon: Briefcase },
        { title: "Avaliações", href: "/pro/reviews", icon: Star },
        { title: "Suporte", href: "/support", icon: LifeBuoy },
        { title: "Meu Perfil", href: "/pro/profile", icon: User },
      ],
    },
  ],
  COMPANY: [
    {
      items: [
        {
          title: "Dashboard",
          href: "/company/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Minhas oportunidades",
          href: "/company/projects",
          icon: FolderOpen,
        },
        { title: "Matches", href: "/company/matches", icon: HeartHandshake },
        { title: "Propostas", href: "/company/proposals", icon: FileText },
        {
          title: "Processos Seletivos",
          href: "/company/screening-invitations",
          icon: FileQuestion,
        },
        { title: "Conversas", href: "/chat", icon: MessageCircle },
        { title: "Profissionais", href: "/company/professionals", icon: Users },
        { title: "Contratantes", href: "/company/companies", icon: Building2 },
        {
          title: "Oportunidades",
          href: "/company/opportunities",
          icon: Sparkles,
        },
        { title: "Mapa", href: "/company/map", icon: MapPin },
      ],
    },
    {
      items: [
        { title: "Analytics", href: "/company/analytics", icon: BarChart3 },
        { title: "Avaliações", href: "/company/reviews", icon: Star },
        {
          title: "Minha Plataforma",
          href: "/company/custom-portal",
          icon: Store,
        },
        { title: "Financeiro", href: "/company/billing", icon: Wallet },
        { title: "Suporte", href: "/support", icon: LifeBuoy },
        { title: "Perfil", href: "/company/profile", icon: Building2 },
      ],
    },
  ],
  ADMIN: [
    {
      items: [
        { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { title: "Pendentes", href: "/admin/approvals", icon: ListChecks },
        {
          title: "Plataformas personalizadas",
          href: "/admin/custom-portals",
          icon: Store,
        },
        {
          title: "Mensalidades de plataforma",
          href: "/admin/portal-subscription-charges",
          icon: Repeat,
        },
        { title: "Financeiro", href: "/admin/finance", icon: Wallet },
        { title: "Comissão", href: "/admin/commission-policy", icon: Percent },
        {
          title: "Config fiscal",
          href: "/admin/fiscal-config",
          icon: Landmark,
        },
        {
          title: "Confirmações",
          href: "/admin/confirmations",
          icon: BadgeCheck,
        },
        {
          title: "Cobranças",
          href: "/admin/commission-charges",
          icon: Receipt,
        },
        {
          title: "Notas fiscais",
          href: "/admin/invoices",
          icon: FileText,
        },
        { title: "Suporte", href: "/admin/support", icon: LifeBuoy },
        { title: "Skills", href: "/admin/skills", icon: Tag },
        { title: "Oportunidades", href: "/admin/projects", icon: FolderOpen },
        { title: "Usuários", href: "/admin/users", icon: Users },
        { title: "Contratantes", href: "/admin/companies", icon: Building2 },
        { title: "Profissionais", href: "/admin/professionals", icon: Users },
        { title: "Mapa", href: "/admin/map", icon: MapPin },
      ],
    },
  ],
};

export const roleLabel: Record<UserRole, string> = {
  PROFESSIONAL: "Profissional",
  COMPANY: "Contratante",
  ADMIN: "Admin",
};
