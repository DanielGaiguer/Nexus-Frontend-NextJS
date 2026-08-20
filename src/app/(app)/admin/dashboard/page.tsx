import { Construction } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";

// AdminDashboardDTO (AdminController) fica pra quando as telas de admin
// entrarem na migração — esta fatia só prova que a navegação por papel e o
// gate de sessão também funcionam pra ADMIN.
export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardContent>
          <EmptyState
            icon={Construction}
            title="Dashboard de admin chega em breve"
            description="Esta área ainda não foi portada do nexus-frontend — só a navegação e o controle de acesso por papel já estão validados aqui."
          />
        </CardContent>
      </Card>
    </div>
  );
}
