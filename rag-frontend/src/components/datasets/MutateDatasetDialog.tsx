import { useState, useEffect } from "react";
import { useCreateDataset, useUpdateDataset } from "@/api/DatasetsApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

import { type CreateDataset } from "@/types/datasets/CreateDataset";
import { type UpdateDataset } from "@/types/datasets/UpdateDataset";
import { type Dataset } from "@/types/datasets/Dataset";

type MutateDatasetDialogProps = {
  dataset?: Dataset | null;
  trigger: React.ReactNode;
  onSuccess?: () => void;
};

export function MutateDatasetDialog({
  dataset,
  trigger,
  onSuccess,
}: MutateDatasetDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Hooks para create e update
  const {
    mutate: createDataset,
    isPending: isCreating,
  } = useCreateDataset();
  const {
    mutate: updateDataset,
    isPending: isUpdating,
  } = useUpdateDataset();

  // Preenche os campos se for edição
  useEffect(() => {
    if (dataset) {
      setName(dataset.name || "");
      setDescription(dataset.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [dataset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dataset) {
      // Update
      const payload: UpdateDataset = {
        id: dataset.id,
        name,
        description,
      };
      updateDataset(payload, {
        onSuccess: () => {
          setOpen(false);
          if (onSuccess) onSuccess();
        },
      });
    } else {
      // Create
      const payload: CreateDataset = {
        name,
        description,
        organization_id: 1,
      };
      createDataset(payload, {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
          if (onSuccess) onSuccess();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dataset ? "Editar Dataset" : "Criar novo Dataset"}
          </DialogTitle>
          <DialogDescription>
            {dataset
              ? "Altere os campos desejados e salve as alterações."
              : "Preencha os campos abaixo para criar um novo dataset."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dataset ? "Salvando..." : "Criando..."}
                </>
              ) : (
                dataset ? "Salvar" : "Criar"
              )}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}