'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
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
  whatsappNumber,
}: {
  email: string;
  whatsappNumber?: string;
}) {
  const [open, setOpen] = useState(false);

  // Número do suporte vem via prop ou usa env public como fallback futuro.
  // No MVP é só placeholder do Doppler (SUPPORT_WHATSAPP). Pra expor no
  // client precisa promover pra NEXT_PUBLIC_SUPPORT_WHATSAPP — fica
  // pra fazer junto com o setup de prod.
  const numero = whatsappNumber ?? process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '5547999999999';

  function abrirSuporte() {
    const mensagem = encodeURIComponent(
      `Oi, quero solicitar reembolso da Sacada IA.\n\nEmail da conta: ${email}\nMotivo: `,
    );
    window.open(`https://wa.me/${numero}?text=${mensagem}`, '_blank');
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <MessageCircle className="size-4" />
        solicitar reembolso
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>solicitar reembolso</DialogTitle>
            <DialogDescription>
              vou abrir o WhatsApp com a mensagem pronta. o suporte processa
              manualmente na Perfect Pay e tua conta é desativada quando o reembolso
              cair.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              cancelar
            </Button>
            <Button onClick={abrirSuporte}>
              <MessageCircle className="size-4" />
              abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
