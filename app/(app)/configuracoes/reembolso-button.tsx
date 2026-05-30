'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// TODO design: visual do dialog de reembolso (definir com humano)
export function ReembolsoButton({
  email,
  supportEmail,
}: {
  email: string;
  supportEmail?: string;
}) {
  const [open, setOpen] = useState(false);

  // Email do suporte vem via prop ou via env pública. Se nenhum dos dois
  // estiver setado, o botão é renderizado mesmo assim mas avisa erro ao clicar.
  const dest = supportEmail ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? '';

  function abrirSuporte() {
    if (!dest) {
      alert('email de suporte não configurado. fala com o time pelo canal interno.');
      return;
    }
    const assunto = 'Solicitar reembolso — Sacada IA';
    const corpo = `Email da conta: ${email}\n\nMotivo do reembolso:\n\n`;
    window.open(
      `mailto:${dest}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`,
      '_blank',
    );
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Mail className="size-4" />
        solicitar reembolso
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>solicitar reembolso</DialogTitle>
            <DialogDescription>
              vou abrir teu cliente de email com a mensagem pronta pra mandar pro
              suporte. processamos manualmente na Perfect Pay e tua conta é
              desativada quando o reembolso cair.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              cancelar
            </Button>
            <Button onClick={abrirSuporte}>
              <Mail className="size-4" />
              abrir email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
