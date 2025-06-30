import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteDataSource } from "@/api/DatasourcesApi";
import type { Datasource } from "@/types/datasources/Datasource";
import { Loader2 } from "lucide-react";

export function DeleteDatasourceAlert({
  trigger,
  datasource,
  onSuccess,
}: {
  trigger: React.ReactNode;
  datasource: Datasource | null;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { mutate: deletedatasource, isPending } = useDeleteDataSource();

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!datasource) return;

    deletedatasource(datasource.id, {
      onSuccess: () => {
        setOpen(false);
        if (onSuccess) onSuccess();
      },
      // Opcional, mas recomendado: tratar o erro
      // onError: (error) => {
      //   // Você pode mostrar uma notificação de erro aqui
      //   console.error(error.message);
      // }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      {datasource && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O datasource <b>{datasource?.name}</b>{" "}
              será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {"Excluindo..."}
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
