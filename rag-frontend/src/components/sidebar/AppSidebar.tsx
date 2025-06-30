import * as React from "react";

import {
  Settings,
  HelpCircle,
  Search,
  Layers,
  Building2,
  Database,
  Settings2,
  LineChart,
  MessageCircle,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/NavMain";
import { NavSecondary } from "@/components/sidebar/NavSecondary";
import { NavUser } from "@/components/sidebar/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { useAuth } from "@/contexts/AuthContext";
import { NavDatasetSwitch } from "./NavDatasetSwitch";
import type { Dataset } from "@/types/datasets/Dataset";
import { useRouter } from "@tanstack/react-router";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  datasets: Dataset[];
  activeDatasetId?: string; // Permite identificar o dataset ativo
};

export function AppSidebar({ datasets, activeDatasetId, ...props }: AppSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const sidebarDatasets = datasets.map((ds) => ({
    id: String(ds.id),
    name: ds.name,
    logo: Building2,
  }));

  const data = {
    user: {
      name: user?.username || "Usuário não encontrados",
      email: user?.userEmail || "user@example.com",
      avatar: "",
    },
    navMain: [
      {
        title: "Base de dados",
        url: `/dataset/${activeDatasetId}`,
        icon: Database,
        isActive: currentPath.startsWith(`/dataset/${activeDatasetId}`),
        items: [
          {
            title: "Documentos",
            url: `/dataset/${activeDatasetId}/documents`,
            isActive: currentPath.startsWith(`/dataset/${activeDatasetId}/documents`),
          },
          {
            title: "Chunks",
            url: `/dataset/${activeDatasetId}/chunks`,
            isActive: currentPath.startsWith(`/dataset/${activeDatasetId}/chunks`),
          },
          {
            title: "Conexões",
            url: `/dataset/${activeDatasetId}/connections`,
            isActive: currentPath.startsWith(`/dataset/${activeDatasetId}/connections`),
          },
        ],
      },
      {
        title: "Configuração RAG", // Agrupa as configurações de forma clara
        url: `/dataset/${activeDatasetId}/rag`,
        icon: Settings2,
        isActive: currentPath.startsWith(`/dataset/${activeDatasetId}/rag`),
        items: [
          {
            title: "Recuperação", // Focado na primeira parte do RAG
            url: `/dataset/${activeDatasetId}/rag/retrieval`,
            isActive: currentPath.startsWith(`/dataset/${activeDatasetId}/rag/retrieval`),
          },
          {
            title: "Geração (LLM)", // Focado na segunda parte do RAG
            url: `/dataset/${activeDatasetId}/rag/generation`,
            isActive: currentPath.startsWith(`/dataset/${activeDatasetId}/rag/generation`),
          },
        ],
      },
      {
        title: "Playground", // Para testes
        url: `/dataset/${activeDatasetId}/playground`,
        icon: MessageCircle, // Ícone mais intuitivo
        isActive: currentPath === `/dataset/${activeDatasetId}/playground`,
      },
      {
        title: "Versionamento", // Ótima funcionalidade, bem posicionada
        url: `/dataset/${activeDatasetId}/versioning`,
        icon: Layers,
        isActive: currentPath === `/dataset/${activeDatasetId}/versioning`,
      },
      {
        title: "Monitoramento", // Para análise de performance
        url: `/dataset/${activeDatasetId}/monitoring`,
        icon: LineChart, // Ícone mais representativo
        isActive: currentPath === `/dataset/${activeDatasetId}/monitoring`,
      },
    ],
    navSecondary: [
      {
        title: "Configurações",
        url: "/settings",
        icon: Settings,
      },
      {
        title: "Ajuda",
        url: "/help",
        icon: HelpCircle,
      },
      {
        title: "Pesquisar",
        url: "/search",
        icon: Search,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavDatasetSwitch datasets={sidebarDatasets} activeDatasetId={activeDatasetId} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
