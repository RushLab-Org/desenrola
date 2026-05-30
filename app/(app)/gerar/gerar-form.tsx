'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GerarTextForm } from './gerar-text-form';
import { GerarPrintForm } from './gerar-print-form';
import { GerarAudioForm } from './gerar-audio-form';

// Wrapper com Tabs Texto / Print / Áudio (ADR-022 Marco 4).
// Cada tab mantém seu próprio estado (form + result). Mudar de aba não
// persiste resultado — tradeoff aceito pro MVP.
export function GerarForm({
  crushes,
}: {
  crushes: Array<{ id: string; name: string; relationship_type: string }>;
}) {
  return (
    <Tabs defaultValue="texto" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="texto">texto</TabsTrigger>
        <TabsTrigger value="print">print</TabsTrigger>
        <TabsTrigger value="audio">áudio</TabsTrigger>
      </TabsList>
      <TabsContent value="texto" className="pt-4">
        <GerarTextForm crushes={crushes} />
      </TabsContent>
      <TabsContent value="print" className="pt-4">
        <GerarPrintForm crushes={crushes} />
      </TabsContent>
      <TabsContent value="audio" className="pt-4">
        <GerarAudioForm crushes={crushes} />
      </TabsContent>
    </Tabs>
  );
}
