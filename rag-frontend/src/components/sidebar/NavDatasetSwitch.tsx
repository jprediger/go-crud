import * as React from "react";
import { ChevronsUpDown, Plus, Database } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "@tanstack/react-router";

export function NavDatasetSwitch({
  datasets,
  activeDatasetId,
}: {
  datasets: {
    id: string;
    name: string;
    logo: React.ElementType;
  }[];
  activeDatasetId?: string;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  // Sincroniza com a rota
  const active = React.useMemo(
    () => datasets.find((ds) => ds.id === activeDatasetId) || datasets[0],
    [datasets, activeDatasetId]
  );

  const ActiveLogo = active?.logo || Database; // Logo padrão
  const activeName = active?.name || "Nenhum dataset"; // Nome padrão

  console.log("Active dataset:", active);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ActiveLogo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeName}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Datasets
            </DropdownMenuLabel>
            {datasets.map((dataset, index) => (
              <DropdownMenuItem
                key={dataset.name}
                onClick={() => {
                  router.navigate({ to: `/dataset/${dataset.id}/documents` });
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <dataset.logo className="size-3.5 shrink-0" />
                </div>
                {dataset.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add dataset
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
