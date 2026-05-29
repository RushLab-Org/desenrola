'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteCrush } from '../actions';

// TODO design: visual do dialog de confirmação
export function DeleteCrushButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteCrush(id);
      // deleteCrush usa redirect() em sucesso, então só chega aqui em erro
      if (result && !result.ok) {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        excluir
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>excluir {name}?</DialogTitle>
          <DialogDescription>
            isso apaga o perfil dela e o histórico de gerações junto. não tem como
            desfazer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'excluindo...' : 'excluir'}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
