import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/**
 * Renderiza o conteúdo (Markdown) de um documento legal.
 *
 * SEGURANÇA: react-markdown renderiza para elementos React e NÃO interpreta
 * HTML bruto embutido no texto (não há `rehype-raw` aqui, de propósito). Como
 * o conteúdo é publicado pelo Admin — e texto jurídico costuma vir colado de
 * um Word/Google Docs, que arrasta HTML solto —, isso garante que nenhuma tag
 * embutida seja executada: ela aparece como texto literal ou é ignorada.
 * Nunca adicione `rehype-raw`/`dangerouslySetInnerHTML` aqui.
 *
 * A estilização é por variantes de descendente do Tailwind no container (em vez
 * de um `components` map), então não há wrappers customizados nem props de
 * elemento a repassar — react-markdown emite os elementos padrão e o CSS abaixo
 * cuida da aparência, com suporte a tema claro/escuro pelos tokens.
 */
const PROSE = cn(
  "text-foreground text-sm leading-relaxed",
  "[&_h1]:text-foreground [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:first:mt-0",
  "[&_h2]:text-foreground [&_h2]:mt-7 [&_h2]:mb-2.5 [&_h2]:text-lg [&_h2]:font-semibold",
  "[&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
  "[&_p]:my-3",
  "[&_ul]:my-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5",
  "[&_ol]:my-3 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1.5",
  "[&_li]:pl-1",
  "[&_a]:text-primary [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2",
  "[&_strong]:text-foreground [&_strong]:font-semibold",
  "[&_blockquote]:border-primary/40 [&_blockquote]:bg-primary/5 [&_blockquote]:text-muted-foreground [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:py-2 [&_blockquote]:pr-3 [&_blockquote]:pl-4",
  "[&_blockquote_p]:my-1",
  "[&_hr]:border-border [&_hr]:my-6",
  "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
  "[&_table]:my-4 [&_table]:block [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-left [&_table]:text-xs",
  "[&_thead]:bg-muted",
  "[&_th]:border-border [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold",
  "[&_td]:border-border [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top"
);

export function LegalMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn(PROSE, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
