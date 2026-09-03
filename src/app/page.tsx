import { Building2, Cpu, Handshake, Star, User, UserPlus } from "lucide-react";
import Link from "next/link";

import { AnimatedCounter } from "@/components/marketing/animated-counter";
import { HomeNav } from "@/components/marketing/home-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/session";

const techLogos = [
  "Java",
  "Spring Boot",
  "React",
  "Node.js",
  "Python",
  "Flutter",
  "AWS",
  "Docker",
  "Kubernetes",
  "TypeScript",
  "PostgreSQL",
  "Go",
];

const steps = [
  {
    icon: UserPlus,
    title: "Crie seu perfil",
    text: "Profissionais informam skills, pretensão e nível; contratantes descrevem a vaga.",
  },
  {
    icon: Cpu,
    title: "O algoritmo age",
    text: "Score de compatibilidade calculado com 7 critérios: skills, orçamento, experiência, localização, reputação, histórico e disponibilidade.",
  },
  {
    icon: Handshake,
    title: "Conecte-se",
    text: "Match confirmado, contatos liberados, chat desbloqueado por 30 dias.",
  },
];

const metrics = [
  { target: 94, suffix: "%", label: "Taxa média de compatibilidade" },
  { target: 7, suffix: "", label: "Critérios no algoritmo de match" },
  { target: 30, suffix: "", label: "Dias de chat após match confirmado" },
  { target: 2, suffix: "min", label: "Tempo médio para primeiro match" },
];

const testimonials = [
  {
    text: "Recebi 3 convites na primeira semana. O algoritmo entendeu exatamente o que eu buscava.",
    name: "Lucas M.",
    role: "Engenheiro Backend Sênior",
  },
  {
    text: "Encontramos o DevOps certo em 48 horas. O score de match foi cirúrgico.",
    name: "Ana P.",
    role: "CTO na TechInova Soluções",
  },
  {
    text: "Nunca perco tempo com candidatos fora do perfil. Cada match já vem pré-qualificado.",
    name: "Rafael S.",
    role: "Head de Produto na CloudNexus",
  },
];

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col">
      <HomeNav session={session} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="from-primary/10 pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent"
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                Matching inteligente para TI
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                Conectamos talentos ao projeto{" "}
                <span className="text-primary">certo.</span>
              </h1>
              <p className="text-muted-foreground mt-4 max-w-md text-base sm:text-lg">
                Score de compatibilidade real. Match bilateral. Contato liberado
                só quando os dois lados dizem sim.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/register/professional">Encontrar projetos</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register/company">Publicar oportunidades</Link>
                </Button>
              </div>
              <div className="text-muted-foreground mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm">
                <span>▪ +2.400 profissionais cadastrados</span>
                <span>▪ +180 contratantes</span>
                <span>▪ 94% de taxa de match</span>
              </div>
            </div>

            <div
              className="mx-auto w-full max-w-sm"
              role="img"
              aria-label="Visualizador de score de compatibilidade: 94% de match entre contratante e profissional"
            >
              <Card>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-muted/50 flex w-full items-center gap-3 rounded-lg border p-3">
                    <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                      <Building2 className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        TechNova Ltda
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Vaga: Dev Backend Pleno
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-primary text-4xl font-bold tabular-nums">
                      <AnimatedCounter target={94} suffix="%" />
                    </span>
                    <span className="text-muted-foreground text-xs tracking-wide uppercase">
                      match
                    </span>
                  </div>

                  <div className="bg-muted/50 flex w-full items-center gap-3 rounded-lg border p-3">
                    <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                      <User className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        Daniel Gaiguer
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Backend · 6 anos exp.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Logos belt */}
        <section className="border-b py-8">
          <p className="text-muted-foreground text-center text-xs font-semibold tracking-wide uppercase">
            Ecossistema de tecnologias
          </p>
          <div className="mt-4 overflow-hidden">
            <div className="animate-marquee flex w-max gap-8">
              {[...techLogos, ...techLogos].map((tech, i) => (
                <span
                  key={i}
                  className="text-muted-foreground/80 text-sm font-medium whitespace-nowrap"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section
          id="como-funciona"
          className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="max-w-xl">
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              O processo
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Do cadastro ao match em minutos.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <Card key={step.title}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                      <step.icon className="size-5" />
                    </div>
                    <span className="text-muted-foreground/40 text-3xl font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm">
                    {step.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Métricas */}
        <section id="metricas" className="bg-muted/30 border-y py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-primary text-3xl font-bold tabular-nums sm:text-4xl">
                  <AnimatedCounter
                    target={metric.target}
                    suffix={metric.suffix}
                  />
                </div>
                <div className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Para quem */}
        <section
          id="para-quem"
          className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Card id="para-profissionais" className="border-primary/20">
              <CardContent>
                <h3 className="text-xl font-bold">Para profissionais</h3>
                <ul className="text-muted-foreground mt-4 space-y-2.5 text-sm">
                  {[
                    "Seja encontrado por contratantes compatíveis",
                    "Score de match baseado nas suas skills reais",
                    "Chat direto após confirmação mútua",
                    "Portfólio valorizado a cada projeto concluído",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6" asChild>
                  <Link href="/register/professional">Criar perfil grátis</Link>
                </Button>
              </CardContent>
            </Card>

            <Card id="para-empresas">
              <CardContent>
                <h3 className="text-xl font-bold">Para contratantes</h3>
                <ul className="text-muted-foreground mt-4 space-y-2.5 text-sm">
                  {[
                    "Ranking de candidatos por compatibilidade",
                    "Vagas e projetos freelance na mesma plataforma",
                    "Histórico de reputação verificado",
                    "Dashboard analítico de todas as oportunidades",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-6" asChild>
                  <Link href="/register/company">Publicar primeira vaga</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Depoimentos */}
        <section
          id="depoimentos"
          className="bg-muted/30 border-y py-16 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-xl">
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                Resultados reais
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Quem já encontrou o match certo.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardContent>
                    <div className="flex gap-0.5" aria-hidden>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="fill-warning text-warning size-3.5"
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-sm">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="mt-4 text-sm font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section
          id="cta-final"
          className="relative overflow-hidden py-20 sm:py-28"
        >
          <div
            aria-hidden
            className="from-primary/15 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"
          />
          <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Seu próximo projeto começa aqui.
            </h2>
            <p className="text-muted-foreground mt-2">
              Cadastro gratuito. Sem cartão de crédito.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/register/professional">Sou profissional</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register/company">Sou contratante</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-4">
          <div>
            <div className="text-lg font-bold tracking-tight">
              nexus<span className="text-primary">.</span>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Matching inteligente para o ecossistema de TI.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Produto</h4>
            <ul className="text-muted-foreground mt-3 space-y-1.5 text-sm">
              <li>
                <a href="#como-funciona" className="hover:text-foreground">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#para-profissionais" className="hover:text-foreground">
                  Para profissionais
                </a>
              </li>
              <li>
                <a href="#para-empresas" className="hover:text-foreground">
                  Para contratantes
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Empresa</h4>
            <ul className="text-muted-foreground mt-3 space-y-1.5 text-sm">
              <li>Sobre nós</li>
              <li>Carreiras</li>
              <li>Contato</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="text-muted-foreground mt-3 space-y-1.5 text-sm">
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacidade
                </Link>
              </li>
              <li>Cookies</li>
            </ul>
          </div>
        </div>
        <div className="text-muted-foreground mt-8 border-t px-4 pt-6 text-center text-xs sm:px-6">
          © 2026 Nexus. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
