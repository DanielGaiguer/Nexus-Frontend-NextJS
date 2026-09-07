"use client";

import { Crown, Mail, ShieldAlert, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useInviteMember,
  useRemoveMember,
  useRevokeInvitation,
  useTransferOwnership,
} from "@/hooks/mutations/useCompanyMemberActions";
import {
  useCompanyMembers,
  useCompanyRole,
} from "@/hooks/queries/useCompanyMembers";
import { useSession } from "@/hooks/queries/useSession";
import { ApiError } from "@/lib/api-client";
import type { CompanyMemberDTO } from "@/types/members";

function errMsg(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function MembersManager() {
  const role = useCompanyRole();

  if (role.isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Membros da equipe</h1>
        <p className="text-muted-foreground text-sm">
          Pessoas com acesso a esta conta empresarial. Recrutadores entram como{" "}
          <strong>membros</strong>; o <strong>proprietário</strong> cuida de
          dados cadastrais, financeiros e da própria equipe.
        </p>
      </div>

      {role.data?.role === "OWNER" ? (
        <OwnerView />
      ) : (
        <MemberView isMember={role.data?.role === "MEMBER"} />
      )}
    </div>
  );
}

// ── Visão do MEMBER (ou sessão sem papel resolvido) ────────────────────

function MemberView({ isMember }: { isMember: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldAlert className="text-muted-foreground size-4" />
          Gestão restrita ao proprietário
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-2 text-sm">
        {isMember ? (
          <p>
            Você é um <strong>membro</strong> desta conta. Convidar pessoas,
            remover membros e transferir a titularidade são ações exclusivas do
            proprietário da conta. Fale com ele se precisar de mais acesso.
          </p>
        ) : (
          <p>
            Não foi possível confirmar o seu papel nesta conta. Recarregue a
            página ou entre em contato com o suporte.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Visão do OWNER ────────────────────────────────────────────────────

function OwnerView() {
  const session = useSession();
  const { data, isLoading, error } = useCompanyMembers();

  // Corrida rara: o probe disse OWNER, mas a lista veio 403 (papel mudou entre
  // as duas chamadas, ex.: titularidade transferida em outra aba).
  if (error instanceof ApiError && error.status === 403) {
    return <MemberView isMember />;
  }
  if (error) {
    return (
      <Card>
        <CardContent className="text-destructive text-sm">
          {errMsg(error, "Não foi possível carregar os membros.")}
        </CardContent>
      </Card>
    );
  }
  if (isLoading || !data) {
    return <Skeleton className="h-64" />;
  }

  const myUserId = session.data?.id;

  return (
    <>
      <InviteForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Membros ativos ({data.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  isSelf={m.userId === myUserId}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PendingInvitations invitations={data.pendingInvitations} />
    </>
  );
}

function InviteForm() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const invite = useInviteMember();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setFormError("Informe um e-mail.");
      return;
    }
    setFormError(null);
    invite.mutate(
      { email: value },
      {
        onSuccess: () => {
          toast.success(`Convite enviado para ${value}.`);
          setEmail("");
        },
        onError: (err) => {
          const msg = errMsg(err, "Não foi possível enviar o convite.");
          setFormError(msg);
          toast.error(msg);
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <UserPlus className="text-primary size-4" />
          Convidar por e-mail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            placeholder="pessoa@empresa.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formError) setFormError(null);
            }}
            autoComplete="off"
          />
          <Button type="submit" disabled={invite.isPending}>
            <Mail className="size-4" />
            {invite.isPending ? "Enviando…" : "Enviar convite"}
          </Button>
        </form>
        {formError ? (
          <p className="text-destructive text-sm">{formError}</p>
        ) : (
          <p className="text-muted-foreground text-xs">
            A pessoa recebe um link para criar a conta como membro. Só é
            possível convidar quem ainda não tem conta no Nexus.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MemberRow({
  member,
  isSelf,
}: {
  member: CompanyMemberDTO;
  isSelf: boolean;
}) {
  const remove = useRemoveMember();
  const transfer = useTransferOwnership();
  const isOwner = member.role === "OWNER";

  return (
    <TableRow>
      <TableCell className="font-medium break-all">{member.email}</TableCell>
      <TableCell>
        {isOwner ? (
          <Badge className="bg-primary/15 text-primary">
            <Crown className="size-3" />
            Proprietário
          </Badge>
        ) : (
          <Badge variant="secondary">Membro</Badge>
        )}
        {isSelf && (
          <span className="text-muted-foreground ml-2 text-xs">(você)</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {fmtDate(member.joinedAt)}
      </TableCell>
      <TableCell className="text-right">
        {isOwner ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <div className="flex justify-end gap-1">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Crown className="size-4" />
                  Transferir titularidade
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Transferir titularidade para {member.email}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>{member.email}</strong> passa a ser o proprietário
                    da conta e você vira um membro comum —{" "}
                    <strong>na hora, sem confirmação por e-mail</strong>. Você
                    perde acesso a dados financeiros/fiscais, à gestão da equipe
                    e à exclusão da conta. Só o novo proprietário poderá
                    devolver a titularidade.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={transfer.isPending}
                    onClick={() =>
                      transfer.mutate(member.id, {
                        onSuccess: () =>
                          toast.success(
                            `Titularidade transferida para ${member.email}.`
                          ),
                        onError: (e) =>
                          toast.error(
                            errMsg(e, "Não foi possível transferir.")
                          ),
                      })
                    }
                  >
                    Transferir agora
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <UserMinus className="size-4" />
                  Remover
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover {member.email}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A pessoa perde o acesso a esta conta imediatamente. A conta
                    dela é desativada. Você pode convidá-la de novo mais tarde.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={remove.isPending}
                    onClick={() =>
                      remove.mutate(member.id, {
                        onSuccess: () =>
                          toast.success(`${member.email} foi removido.`),
                        onError: (e) =>
                          toast.error(errMsg(e, "Não foi possível remover.")),
                      })
                    }
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

function PendingInvitations({
  invitations,
}: {
  invitations: { id: number; email: string; expiresAt: string }[];
}) {
  const revoke = useRevokeInvitation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Convites pendentes ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhum convite aguardando resposta.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div>
                  <div className="text-sm font-medium break-all">
                    {inv.email}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Expira em {fmtDate(inv.expiresAt)}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Revogar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Revogar o convite de {inv.email}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        O link enviado deixa de funcionar. Você pode enviar um
                        novo convite depois.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={revoke.isPending}
                        onClick={() =>
                          revoke.mutate(inv.id, {
                            onSuccess: () => toast.success("Convite revogado."),
                            onError: (e) =>
                              toast.error(
                                errMsg(e, "Não foi possível revogar.")
                              ),
                          })
                        }
                      >
                        Revogar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
