/**
 * Tradução de mensagens de erro do backend (`nexus`, quase sempre em inglês
 * — ver `ApiExceptionHandler`/`ResponseStatusException` por lá) pro texto em
 * português que o usuário final vê. Único ponto de tradução do app — chamado
 * de dentro de `ApiError`/`parseResponse` (api-client.ts), então qualquer
 * `error.message` de uma `ApiError` já chega traduzido em qualquer toast,
 * banner ou flash message, sem precisar repetir isso em cada tela.
 *
 * Duas camadas, mesma ideia do `NexusApiException`/`AuthService` do app
 * antigo (nexus-frontend):
 *   1. `MESSAGE_RULES` — tradução específica pra mensagens conhecidas, por
 *      trecho do texto original (`includes`, sensível a maiúsculas —
 *      as frases do backend são strings fixas de desenvolvedor, então uma
 *      correspondência exata evita falso positivo sem precisar de regex).
 *      Ordenado por especificidade (trecho mais longo primeiro) antes de
 *      procurar, pra "Company profile not found" nunca cair na regra mais
 *      genérica de outro campo por engano.
 *   2. `genericMessageForStatus` — fallback só pelo código HTTP, cobre
 *      qualquer mensagem nova ou não mapeada (validações de projeto, IA,
 *      etc.) sem nunca deixar inglês cru chegar na tela.
 */

interface MessageRule {
  /** Trecho exato (case-sensitive) que precisa aparecer na mensagem crua do backend. */
  includes: string;
  pt: string;
}

// Case-sensitive de propósito: são strings fixas escritas por quem programou
// o backend, não texto de usuário — comparar com a capitalização exata que
// cada uma usa é o que evita, por exemplo, que a regra genérica "Profile not
// found" (início de frase, P maiúsculo) capture "Company profile not found"
// (profile no meio da frase, minúsculo) antes da regra mais específica.
const MESSAGE_RULES: MessageRule[] = [
  // ── Autenticação / cadastro (AuthService) ──────────────────────────
  { includes: "Email is required.", pt: "O e-mail é obrigatório." },
  { includes: "Password is required.", pt: "A senha é obrigatória." },
  { includes: "Name is required.", pt: "O nome é obrigatório." },
  {
    includes: "Company name is required.",
    pt: "O nome da empresa é obrigatório.",
  },
  {
    includes: "Email already registered in the system.",
    pt: "Este e-mail já está cadastrado. Tente fazer login ou use outro endereço.",
  },
  {
    includes: "CPF already registered in the system.",
    pt: "Este CPF já está cadastrado no sistema.",
  },
  {
    includes: "CNPJ already registered in the system.",
    pt: "Este CNPJ já está cadastrado no sistema.",
  },
  {
    includes: "CEP not found. Please check the ZIP code and try again.",
    pt: "CEP não encontrado. Verifique o CEP informado e tente novamente.",
  },
  {
    includes:
      "CEP has an invalid format. Expected format: 00000-000 or 00000000.",
    pt: "CEP inválido. Use o formato 00000-000 ou 00000000.",
  },
  {
    includes:
      "Could not validate the ZIP code at this moment. Please try again in a few seconds.",
    pt: "Não foi possível validar o CEP no momento. Tente novamente em instantes.",
  },
  {
    includes: "Email and password are required.",
    pt: "E-mail e senha são obrigatórios.",
  },
  {
    includes: "Invalid email or password.",
    pt: "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.",
  },
  {
    includes: "Account is inactive.",
    pt: "Esta conta está desativada. Entre em contato com o suporte.",
  },
  {
    includes: "Company registration is pending admin approval.",
    pt: "Sua empresa ainda está aguardando aprovação do administrador. Você receberá um e-mail quando o acesso for liberado.",
  },
  {
    includes: "Company registration was rejected.",
    pt: "O cadastro da sua empresa foi rejeitado. Acesse seu e-mail para saber o motivo da rejeição.",
  },
  {
    includes: "LinkedIn session expired. Please connect with LinkedIn again.",
    pt: "Sua conexão com o LinkedIn expirou. Conecte-se novamente.",
  },
  {
    includes: "This LinkedIn account is already linked to another user.",
    pt: "Esta conta do LinkedIn já está vinculada a outro usuário.",
  },
  {
    includes: "Professional profile missing for this user.",
    pt: "Perfil de profissional não encontrado para este usuário.",
  },
  {
    includes: "Company profile missing for this user.",
    pt: "Perfil de empresa não encontrado para este usuário.",
  },

  // ── Avaliações (ReviewService/ReviewController) ────────────────────
  {
    includes: "Reviews are only allowed after a confirmed or rejected match.",
    pt: "Só é possível avaliar depois que o match for confirmado ou rejeitado.",
  },
  {
    includes: "A review from this author type already exists for this match.",
    pt: "Você já avaliou este match.",
  },
  {
    includes: "Please answer the match status check before reviewing.",
    pt: "Responda como foi o match antes de avaliar.",
  },
  {
    includes: "Reviews are not available when there was no contact.",
    pt: "A avaliação não está disponível porque não houve contato neste match.",
  },
  {
    includes: "Only the company of this match can submit a COMPANY review.",
    pt: "Somente a empresa deste match pode enviar essa avaliação.",
  },
  {
    includes:
      "Only the professional of this match can submit a PROFESSIONAL review.",
    pt: "Somente o profissional deste match pode enviar essa avaliação.",
  },
  { includes: "No pending review.", pt: "Nenhuma avaliação pendente." },
  { includes: "No pending status check.", pt: "Nenhum status check pendente." },
  {
    includes: "This match is not a confirmed match.",
    pt: "Este match não está confirmado.",
  },
  {
    includes: "This match has already been answered.",
    pt: "Este status check já foi respondido.",
  },

  // ── Matches ─────────────────────────────────────────────────────────
  {
    includes: "This match does not belong to your company.",
    pt: "Este match não pertence à sua empresa.",
  },
  {
    includes: "This match does not belong to you.",
    pt: "Este match não pertence a você.",
  },
  {
    includes: "You are not authorized to view this match.",
    pt: "Você não tem autorização para ver este match.",
  },
  {
    includes: "You are not authorized to cancel this match.",
    pt: "Você não tem autorização para cancelar este match.",
  },
  {
    includes: "Only companies or professionals can cancel a match.",
    pt: "Somente empresas ou profissionais podem cancelar um match.",
  },
  {
    includes: "This match was rejected and cannot be reactivated.",
    pt: "Este match foi rejeitado e não pode ser reativado.",
  },
  {
    includes: "This match is not awaiting a company response.",
    pt: "Este match não está aguardando resposta da empresa.",
  },
  {
    includes: "This match is not awaiting a professional response.",
    pt: "Este match não está aguardando resposta do profissional.",
  },
  {
    includes: "At least one rejection reason must be provided.",
    pt: "Informe pelo menos um motivo de recusa.",
  },
  {
    includes: "This match cannot be cancelled.",
    pt: "Este match não pode ser cancelado.",
  },
  {
    includes: "This opportunity is not open.",
    pt: "Esta oportunidade não está mais aberta.",
  },
  {
    includes: "This opportunity has reached its position limit.",
    pt: "Esta oportunidade atingiu o limite de vagas.",
  },
  {
    includes: "You are not a participant of this match.",
    pt: "Você não faz parte deste match.",
  },
  {
    includes: "This project does not belong to your company.",
    pt: "Este projeto não pertence à sua empresa.",
  },
  { includes: "Match not found", pt: "Match não encontrado." },

  // ── Chat ────────────────────────────────────────────────────────────
  {
    includes: "This chat is no longer available. The match has expired.",
    pt: "Este chat não está mais disponível. O match expirou.",
  },
  {
    includes: "Chat is only available for confirmed matches.",
    pt: "O chat só está disponível para matches confirmados.",
  },
  {
    includes: "Message content must not be empty.",
    pt: "A mensagem não pode ficar vazia.",
  },
  {
    includes: "Message content must not exceed 2000 characters.",
    pt: "A mensagem não pode passar de 2000 caracteres.",
  },

  // ── Empresa / profissional (perfil, contato, currículo) ────────────
  {
    includes: "Tax ID already in use.",
    pt: "Este CNPJ/CPF já está em uso.",
  },
  {
    includes: "Contact info is only available after a confirmed match.",
    pt: "As informações de contato só ficam disponíveis após um match confirmado.",
  },
  {
    includes:
      "Resume is only available to the professional or a company with a confirmed match.",
    pt: "O currículo só está disponível para o profissional ou para uma empresa com match confirmado.",
  },
  {
    includes: "Resume is only available after a confirmed match.",
    pt: "O currículo só fica disponível após um match confirmado.",
  },
  {
    includes: "This professional has no resume.",
    pt: "Este profissional ainda não enviou um currículo.",
  },
  {
    includes: "Company profile not found",
    pt: "Perfil de empresa não encontrado.",
  },
  {
    includes: "Professional profile not found",
    pt: "Perfil de profissional não encontrado.",
  },
  {
    includes: "User profile not found.",
    pt: "Perfil de usuário não encontrado.",
  },
  { includes: "Company not found", pt: "Empresa não encontrada." },
  { includes: "Professional not found", pt: "Profissional não encontrado." },
  { includes: "Profile not found", pt: "Perfil não encontrado." },
  { includes: "User not found.", pt: "Usuário não encontrado." },

  // ── Projetos ────────────────────────────────────────────────────────
  {
    includes: "Maximum positions cannot be less than filled positions.",
    pt: "O número máximo de vagas não pode ser menor que o de vagas já preenchidas.",
  },
  {
    includes: "Only closed projects can be reactivated.",
    pt: "Somente projetos encerrados podem ser reabertos.",
  },
  {
    includes: "Only paused projects can be resumed this way.",
    pt: "Somente projetos pausados podem ser retomados dessa forma.",
  },
  {
    includes: "additionalPositions must be at least 1.",
    pt: "É preciso informar ao menos 1 vaga adicional.",
  },
  { includes: "Project not found", pt: "Projeto não encontrado." },

  // ── Skills ──────────────────────────────────────────────────────────
  {
    includes: "Skill name cannot be blank.",
    pt: "O nome da skill não pode ficar em branco.",
  },
  {
    includes: "Skill name is required.",
    pt: "O nome da skill é obrigatório.",
  },
  { includes: "Skill already exists", pt: "Essa skill já existe." },
  { includes: "Skill already deleted", pt: "Essa skill já foi removida." },
  { includes: "Skill not found", pt: "Skill não encontrada." },

  // ── Credenciais / projetos anteriores ──────────────────────────────
  { includes: "Credential not found", pt: "Credencial não encontrada." },
  {
    includes: "Not authorized.",
    pt: "Você não tem autorização para esta ação.",
  },

  // ── Comparação de candidatos ────────────────────────────────────────
  {
    includes: "At least one match ID is required.",
    pt: "Informe ao menos um ID de match.",
  },

  // ── Upload de arquivos (foto de perfil, currículo) ─────────────────
  {
    includes: "Only JPEG, PNG and WebP images are accepted.",
    pt: "Só são aceitas imagens JPEG, PNG ou WebP.",
  },
  {
    includes: "Image size must not exceed 5MB.",
    pt: "A imagem não pode passar de 5MB.",
  },
  {
    includes: "Resume file is required.",
    pt: "É necessário selecionar um arquivo de currículo.",
  },
  {
    includes: "Only PDF files are accepted.",
    pt: "Só são aceitos arquivos PDF.",
  },
  {
    includes: "Resume size must not exceed 10MB.",
    pt: "O currículo não pode passar de 10MB.",
  },

  // ── CEP / geolocalização (GeolocationService) ──────────────────────
  { includes: "Invalid CEP format.", pt: "Formato de CEP inválido." },
  { includes: "CEP not found.", pt: "CEP não encontrado." },
  {
    includes: "Could not geocode this address.",
    pt: "Não foi possível localizar este endereço no mapa.",
  },

  // ── Documentos (CPF/CNPJ — DocumentValidator, sufixo fixo) ─────────
  {
    includes: "has an invalid format. Expected",
    pt: "Documento com formato inválido. Verifique o número informado e tente novamente.",
  },
  {
    includes: "Sequences of identical digits are not accepted.",
    pt: "Documento inválido: sequências de dígitos repetidos não são aceitas.",
  },
  {
    includes: "is invalid. Please check the number and try again.",
    pt: "Documento inválido. Verifique o número e tente novamente.",
  },

  // ── Reputação / analytics ──────────────────────────────────────────
  {
    includes: "No reputation data yet.",
    pt: "Ainda não há dados de reputação.",
  },

  // ── Propostas (ProposalService/ProposalController) ─────────────────
  {
    includes:
      "This match was rejected and cannot be reactivated by accepting a proposal.",
    pt: "Este match foi recusado anteriormente e não pode ser reativado através do aceite de uma proposta.",
  },
  {
    includes: "This opportunity does not accept proposals.",
    pt: "Esta oportunidade não aceita propostas no momento.",
  },
  {
    includes: "You already have a pending proposal for this project.",
    pt: "Você já tem uma proposta pendente para este projeto.",
  },
  {
    includes: "'validityDays' must be a positive number.",
    pt: "A validade da proposta precisa ser maior que zero.",
  },
  {
    includes: "Only a pending proposal can be edited.",
    pt: "Só é possível editar uma proposta enquanto ela estiver pendente.",
  },
  {
    includes: "Only a pending proposal can be withdrawn.",
    pt: "Só é possível retirar uma proposta enquanto ela estiver pendente.",
  },
  {
    includes: "Only a pending proposal can be changed.",
    pt: "Só é possível alterar os anexos de uma proposta enquanto ela estiver pendente.",
  },
  {
    includes: "Only a pending proposal can be accepted.",
    pt: "Esta proposta não está mais pendente e não pode ser aceita.",
  },
  {
    includes: "Only a pending proposal can be rejected.",
    pt: "Esta proposta não está mais pendente e não pode ser recusada.",
  },
  {
    includes: "This proposal does not belong to your company.",
    pt: "Esta proposta não pertence à sua empresa.",
  },
  {
    includes: "This proposal does not belong to you.",
    pt: "Esta proposta não pertence a você.",
  },
  {
    includes: "You are not authorized to view this proposal.",
    pt: "Você não tem autorização para ver esta proposta.",
  },
  { includes: "Proposal not found", pt: "Proposta não encontrada." },
  {
    includes: "A proposal can have at most",
    pt: "Uma proposta pode ter no máximo 5 anexos.",
  },
  {
    includes: "At least one file is required.",
    pt: "Selecione ao menos um arquivo.",
  },
  {
    includes: "Attachment file is required.",
    pt: "Selecione um arquivo para anexar.",
  },
  {
    includes: "Only PDF, PNG, JPEG, WebP and ZIP files are accepted.",
    pt: "Só são aceitos arquivos PDF, PNG, JPEG, WebP ou ZIP.",
  },
  {
    includes: "Attachment size must not exceed 15MB.",
    pt: "O anexo não pode passar de 15MB.",
  },
  { includes: "Attachment not found.", pt: "Anexo não encontrado." },
  {
    includes: "Failed to upload file to storage. Please try again.",
    pt: "Não foi possível enviar o arquivo para o armazenamento. Tente novamente.",
  },

  // ── Plataforma personalizada (CustomPortalService) ─────────────────
  {
    includes: "This company already has a custom portal.",
    pt: "Este contratante já possui uma plataforma personalizada.",
  },
  {
    includes:
      "There is already a pending custom portal request for this company.",
    pt: "Já existe uma solicitação de plataforma personalizada pendente para este contratante.",
  },
  {
    includes: "This request is not pending a decision.",
    pt: "Esta solicitação não está mais pendente de decisão.",
  },
  {
    includes: "A rejection reason must be provided.",
    pt: "É necessário informar o motivo da recusa.",
  },
  {
    includes:
      "The company must be approved before a custom portal can be created.",
    pt: "O contratante precisa estar aprovado antes de ter uma plataforma personalizada.",
  },
  {
    includes: "This subdomain is already in use.",
    pt: "Este subdomínio já está em uso. Escolha outro.",
  },
  {
    includes: "This subdomain is reserved.",
    pt: "Este subdomínio é reservado. Escolha outro.",
  },
  {
    includes:
      "Invalid subdomain. Use 3 to 63 lowercase letters, digits or hyphens",
    pt: "Subdomínio inválido. Use de 3 a 63 caracteres — letras minúsculas, números ou hífen — sem começar ou terminar com hífen.",
  },
  {
    includes: "A subdomain is required.",
    pt: "Informe um subdomínio.",
  },
  {
    includes: "A plan name is required.",
    pt: "Informe o nome do plano.",
  },
  {
    includes: "A plan price of zero or more is required.",
    pt: "Informe um valor de plano igual ou maior que zero.",
  },
  {
    includes: "Subscription start date and next due date are required.",
    pt: "Informe a data de início e o próximo vencimento da assinatura.",
  },
  {
    includes: "A next due date is required.",
    pt: "Informe o próximo vencimento da assinatura.",
  },
  {
    includes: "The next due date cannot be before the subscription start date.",
    pt: "O próximo vencimento não pode ser anterior ao início da assinatura.",
  },
  {
    includes: "Only an active custom portal can be suspended.",
    pt: "Só é possível suspender uma plataforma personalizada que esteja ativa.",
  },
  {
    includes: "Only a suspended custom portal can be reactivated.",
    pt: "Só é possível reativar uma plataforma personalizada que esteja suspensa.",
  },
  {
    includes: "This custom portal is already canceled.",
    pt: "Esta plataforma personalizada já está cancelada.",
  },
  {
    includes: "Cannot change the subscription of a canceled custom portal.",
    pt: "Não é possível alterar a assinatura de uma plataforma personalizada cancelada.",
  },
  {
    includes: "Custom portal request not found",
    pt: "Solicitação não encontrada.",
  },
  {
    includes: "Custom portal not found for this company.",
    pt: "Este contratante ainda não tem uma plataforma personalizada.",
  },
  {
    includes: "Custom portal not found",
    pt: "Plataforma personalizada não encontrada.",
  },
  { includes: "companyId is required.", pt: "Selecione um contratante." },
  {
    includes: "Invalid color. Use a hex value like",
    pt: "Cor inválida. Use um valor hexadecimal como #4F46E5.",
  },
  {
    includes: "A section title is required.",
    pt: "Toda seção com texto precisa de um título.",
  },
  {
    includes: "A section title must be at most",
    pt: "O título da seção é longo demais (máx. 150 caracteres).",
  },
  {
    includes: "You can add at most",
    pt: "Você pode adicionar no máximo 10 seções.",
  },
  {
    includes: "must be at most 120 characters.",
    pt: "O nome de exibição é longo demais (máx. 120 caracteres).",
  },
].sort((a, b) => b.includes.length - a.includes.length);

function genericMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Dados inválidos. Verifique os campos e tente novamente.";
    case 401:
      return "Sua sessão expirou. Faça login novamente.";
    case 403:
      return "Você não tem permissão para realizar essa ação.";
    case 404:
      return "Registro não encontrado.";
    case 409:
      return "Essa ação não pode ser concluída no estado atual do registro.";
    case 410:
      return "Isso não está mais disponível.";
    case 422:
      return "Não foi possível processar os dados enviados.";
    case 429:
      // Fallback: o caminho normal de 429 nem chega aqui -- translateApiError
      // trata 429 antes, montando a mensagem com o Retry-After real e a
      // distinção login-bloqueado.
      return "Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.";
    default:
      return status >= 500
        ? "O servidor encontrou um problema. Tente novamente em instantes."
        : "Não foi possível concluir a ação. Tente novamente.";
  }
}

/**
 * Traduz a mensagem crua que o backend mandou (`reason`, quase sempre em
 * inglês) pro texto em português mostrado ao usuário. Nunca retorna vazio —
 * na ausência de uma regra específica, cai no genérico por status.
 *
 * `rateLimit` só é passado nos 429 (por `parseResponse`): aí a mensagem é
 * montada a partir dos campos estruturados (segundos de espera + tipo), não
 * do texto — inclui o valor real do `Retry-After` e distingue "muitas
 * requisições" de "login bloqueado".
 */
export function translateApiError(
  status: number,
  reason: string,
  rateLimit?: {
    retryAfter?: number;
    rateLimitKind?: "REQUESTS" | "LOGIN_LOCKED";
  }
): string {
  if (status === 429) {
    if (rateLimit?.rateLimitKind === "LOGIN_LOCKED") {
      return "Muitas tentativas de login incorretas. Tente novamente em 15 minutos.";
    }
    const secs = rateLimit?.retryAfter;
    return secs && secs > 0
      ? `Você fez muitas requisições. Tente novamente em ${secs} segundo${secs === 1 ? "" : "s"}.`
      : "Você fez muitas requisições. Aguarde um instante e tente novamente.";
  }
  const rule = MESSAGE_RULES.find((r) => reason.includes(r.includes));
  return rule ? rule.pt : genericMessageForStatus(status);
}
