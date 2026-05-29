import Link from 'next/link';

// TODO design: tela 404 (definir com humano)
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">não tem nada aqui.</h1>
      <p className="text-muted-foreground max-w-prose text-sm">
        essa página não existe. talvez tenha sido removida ou o link está errado.
      </p>
      <Link href="/" className="text-sm underline underline-offset-4">
        voltar pra home
      </Link>
    </main>
  );
}
