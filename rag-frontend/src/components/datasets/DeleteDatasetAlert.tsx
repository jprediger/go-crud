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
import { useDeleteDataset } from "@/api/DatasetsApi";
import type { Dataset } from "@/types/datasets/Dataset";
import { Loader2 } from "lucide-react";

export function DeleteDatasetAlert({
  trigger,
  dataset,
  onSuccess,
}: {
  trigger: React.ReactNode;
  dataset: Dataset | null;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteDataset, isPending } = useDeleteDataset();

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!dataset) return;

    deleteDataset(dataset.id, {
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
      {dataset && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O dataset <b>{dataset?.name}</b>{" "}
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
