import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Página de teste do Prompt 0 — não é uma tela de produto, é a vitrine do
 * design system (paletas dark/light, tokens de marca, componentes shadcn
 * base) pra validar que tudo se conecta antes de portar telas reais.
 */
export default function ThemeTestPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Design system</h1>
          <p className="text-muted-foreground text-sm">
            nexus-frontend-next — shadcn/ui (new-york) + Tailwind v4
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid gap-3 sm:grid-cols-3 md:grid-cols-6">
        {(
          [
            ["primary", "bg-primary"],
            ["secondary", "bg-secondary"],
            ["accent", "bg-accent"],
            ["success", "bg-success"],
            ["warning", "bg-warning"],
            ["info", "bg-info"],
          ] as const
        ).map(([label, className]) => (
          <div key={label} className="space-y-1.5">
            <div className={`h-14 rounded-lg border ${className}`} />
            <span className="text-muted-foreground text-xs capitalize">
              {label}
            </span>
          </div>
        ))}
      </section>

      <Separator />

      <section className="flex flex-wrap items-center gap-3">
        <Button>Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="outline">Contorno</Button>
        <Button variant="ghost">Fantasma</Button>
        <Button variant="destructive">Destrutivo</Button>
        <Button variant="link">Link</Button>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Match sugerido</CardTitle>
            <CardDescription>
              Exemplo de card em conteúdo real, pra checar contraste.
            </CardDescription>
            <CardAction>
              <Avatar>
                <AvatarImage src="" alt="" />
                <AvatarFallback>NX</AvatarFallback>
              </Avatar>
            </CardAction>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Skeletons, EmptyState e toasts (sonner) substituem os alert/confirm
            estáticos do Thymeleaf nas próximas telas.
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">Aceitar</Button>
            <Button size="sm" variant="outline">
              Recusar
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado do tema</CardTitle>
            <CardDescription>
              Persistido via next-themes (localStorage), sobrevive a reload.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Toggle sol/lua no cabeçalho. Paleta dark espelha
            nexus-frontend/style.css; paleta light foi desenhada nesta migração.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
