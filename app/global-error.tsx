'use client';

// TODO design: tela de erro global (definir com humano)
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">algo quebrou.</h1>
        <p className="text-muted-foreground max-w-prose text-sm">
          aconteceu um erro inesperado. tenta de novo daqui um pouco.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          tentar de novo
        </button>
      </body>
    </html>
  );
}
