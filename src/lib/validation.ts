import { z } from "zod";

/**
 * Regras espelhando o que o nexus-frontend antigo valida no client
 * (js/nexus-validation.js) — o backend só exige presença dos campos
 * obrigatórios (ver AuthService#registerProfessional/#registerCompany),
 * então isto é validação de UX, não uma regra do domínio.
 *
 * Os schemas aqui NÃO fazem `.transform()` de propósito: react-hook-form +
 * o `Form` do shadcn ficam mais simples de tipar quando o shape de entrada
 * e o de saída do zod são o mesmo (string sempre, mesmo quando vazia). A
 * conversão pra `string | null` / `number | null` que os *RequestDTO
 * esperam acontece no `onSubmit` de cada form (ver toNullable/toNumberOrNull
 * abaixo), não aqui.
 */

const PHONE_REGEX = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
const CEP_REGEX = /^\d{5}-?\d{3}$/;
const CNPJ_REGEX = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;
const CPF_REGEX = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

export const phoneField = z
  .string()
  .trim()
  .refine((value) => value === "" || PHONE_REGEX.test(value), {
    message: "Telefone inválido. Use o formato (11) 99999-9999.",
  });

export const cepField = z
  .string()
  .trim()
  .refine((value) => value === "" || CEP_REGEX.test(value), {
    message: "CEP inválido. Use o formato 00000-000.",
  });

// Permissivo (aceita CPF OU CNPJ) — a checagem estrita pelo tipo escolhido
// (Pessoa Física/Empresa) roda via .superRefine() nos schemas de cadastro.
// No dialog de edição de perfil o campo não é editável, então só precisa
// não bloquear o submit independente do subtipo do contratante.
const taxIdField = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || CPF_REGEX.test(value) || CNPJ_REGEX.test(value),
    {
      message:
        "Documento inválido. Use o formato de CPF (000.000.000-00) ou CNPJ (00.000.000/0001-00).",
    }
  );

export const moneyField = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    {
      message: "Valor inválido.",
    }
  );

export const urlField = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\/.+/.test(value), {
    message: "Informe uma URL válida (começando com http:// ou https://).",
  });

/** string vazia/whitespace → null; senão o valor trimado (é assim que os *RequestDTO esperam "sem valor"). */
export function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** string vazia → null; senão o número (pros campos de expectativa salarial). */
export function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Espelha o checkbox obrigatório "allowCepUsage" dos templates
// register-professional.html/register-company.html: o nexus-frontend
// antigo trava o submit via JS se não estiver marcado, embora o campo não
// exista em nenhum *RequestDTO do backend real (nunca foi conectado a
// nada — é só um gate de UX). Fidelidade de conteúdo/comportamento com o
// original, então continua travando o submit aqui também.
const allowCepUsageField = z.boolean().refine((value) => value === true, {
  message: "É necessário marcar esta opção para continuar.",
});

export const registerProfessionalSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome completo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("E-mail inválido."),
  password: z.string().min(6, "Mínimo de 6 caracteres."),
  phone: phoneField,
  cep: cepField,
  expectedSalaryCLT: moneyField,
  expectedSalaryPJ: moneyField,
  freelanceMinExpectation: moneyField,
  freelanceMaxExpectation: moneyField,
  allowCepUsage: allowCepUsageField,
});

export type RegisterProfessionalFormValues = z.infer<
  typeof registerProfessionalSchema
>;

// Checa se o documento informado bate com o formato esperado pro tipo de
// contratante escolhido (Pessoa Física → CPF, Empresa → CNPJ). Compartilhado
// pelos dois schemas de cadastro (tradicional e via LinkedIn).
function refineTaxIdByType<
  T extends { type: "LEGAL_ENTITY" | "INDIVIDUAL"; taxId: string },
>(values: T, ctx: z.RefinementCtx) {
  if (values.taxId === "") return;
  const isIndividual = values.type === "INDIVIDUAL";
  const regex = isIndividual ? CPF_REGEX : CNPJ_REGEX;
  if (!regex.test(values.taxId)) {
    ctx.addIssue({
      code: "custom",
      message: isIndividual
        ? "CPF inválido. Use o formato 000.000.000-00."
        : "CNPJ inválido. Use o formato 00.000.000/0001-00.",
      path: ["taxId"],
    });
  }
}

export const registerCompanySchema = z
  .object({
    type: z.enum(["LEGAL_ENTITY", "INDIVIDUAL"]),
    companyName: z.string().trim().min(1, "Informe o nome."),
    taxId: taxIdField,
    email: z
      .string()
      .trim()
      .min(1, "Informe o e-mail.")
      .email("E-mail inválido."),
    password: z.string().min(6, "Mínimo de 6 caracteres."),
    phone: phoneField,
    cep: cepField,
    description: z.string(),
    allowCepUsage: allowCepUsageField,
  })
  .superRefine(refineTaxIdByType);

export type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>;

export const registerCompanyLinkedInSchema = z
  .object({
    type: z.enum(["LEGAL_ENTITY", "INDIVIDUAL"]),
    companyName: z.string().trim().min(1, "Informe o nome."),
    taxId: taxIdField,
    phone: phoneField,
    cep: cepField,
    description: z.string(),
  })
  .superRefine(refineTaxIdByType);

export type RegisterCompanyLinkedInFormValues = z.infer<
  typeof registerCompanyLinkedInSchema
>;

// ── pro-profile.html :: #editModal ──────────────────────────────────────

export const professionalProfileEditSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo."),
  phone: phoneField,
  cep: cepField,
  experienceLevel: z.enum([
    "",
    "INTERNSHIP",
    "TRAINEE",
    "JUNIOR",
    "PLENO",
    "SENIOR",
  ]),
  preferredTypes: z.array(z.enum(["FREELANCE", "FULL_TIME", "PART_TIME"])),
  preferredOpportunityTypes: z.array(z.enum(["JOB", "PROJECT"])),
  expectedSalaryCLT: moneyField,
  expectedSalaryPJ: moneyField,
  freelanceMinExpectation: moneyField,
  freelanceMaxExpectation: moneyField,
  linkedinUrl: urlField,
  githubUrl: urlField,
});

export type ProfessionalProfileEditFormValues = z.infer<
  typeof professionalProfileEditSchema
>;

// ── pro-portfolio.html — CRUD de PreviousProject ────────────────────────

export const previousProjectSchema = z.object({
  title: z.string().trim().min(2, "Informe o título do projeto."),
  description: z.string().trim(),
  technologies: z.string().trim(),
  yearOfCompletion: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d{4}$/.test(value) &&
          Number(value) >= 1990 &&
          Number(value) <= 2100),
      { message: "Informe um ano válido (ex: 2024)." }
    ),
});

export type PreviousProjectFormValues = z.infer<typeof previousProjectSchema>;

// ── pro-profile.html :: #certificatesModal / #eventsModal ───────────────

export const credentialSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome."),
  color: z.enum([
    "NEXUS",
    "SLATE",
    "CIANO",
    "VIOLETA",
    "TEAL",
    "AMBAR",
    "ROSA",
    "ESMERALDA",
  ]),
});

export type CredentialFormValues = z.infer<typeof credentialSchema>;

// ── company-profile.html :: #editModal ──────────────────────────────────

export const companyProfileEditSchema = z.object({
  companyName: z.string().trim().min(2, "Informe o nome."),
  taxId: taxIdField,
  phone: phoneField,
  cep: cepField,
  description: z.string(),
  linkedinUrl: urlField,
});

export type CompanyProfileEditFormValues = z.infer<
  typeof companyProfileEditSchema
>;

// ── company-project-form.html — validação condicional PROJECT vs JOB,
// espelhando 1:1 ProjectService#validateByType do backend. Além de checar
// aqui (feedback antes mesmo de submeter), o Route Handler ainda repassa o
// 400 real do backend se algo escapar — dupla checagem, fonte da verdade é
// sempre o Spring.

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

export const projectFormSchema = z
  .object({
    opportunityType: z.enum(["PROJECT", "JOB"]),
    title: z.string().trim().min(2, "Informe o título."),
    description: z.string().trim().min(5, "Descreva a oportunidade."),
    workMode: z.enum(["", "REMOTE", "ONSITE", "HYBRID"]),
    type: z.enum(["", "FREELANCE", "FULL_TIME", "PART_TIME"]),
    experienceLevel: z.enum([
      "",
      "INTERNSHIP",
      "TRAINEE",
      "JUNIOR",
      "PLENO",
      "SENIOR",
    ]),
    maxPositions: z
      .string()
      .trim()
      .refine((v) => Number(v) >= 1, { message: "Informe ao menos 1 vaga." }),
    cep: cepField,
    skillIds: z
      .array(z.number())
      .min(1, "Selecione ao menos uma skill.")
      .max(15, "Máximo de 15 skills."),

    // PROJECT
    minimumBudget: moneyField,
    maximumBudget: moneyField,
    deadline: z.string(),

    // JOB
    contractType: z.enum([
      "",
      "CLT",
      "PJ",
      "INTERNSHIP",
      "TEMPORARY",
      "FREELANCER",
    ]),
    monthlySalaryMin: moneyField,
    monthlySalaryMax: moneyField,
    workloadHoursPerWeek: z.string(),
    startDate: z.string(),
    benefits: z.string(),

    visibleToCompanies: z.boolean(),
    salaryVisibleToProfessionals: z.boolean(),
    salaryVisibleToCompanies: z.boolean(),

    acceptsProposals: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.workMode === "") {
      ctx.addIssue({
        code: "custom",
        message: "Selecione a modalidade.",
        path: ["workMode"],
      });
    }
    if (values.type === "") {
      ctx.addIssue({
        code: "custom",
        message: "Selecione o regime de trabalho.",
        path: ["type"],
      });
    }
    if (values.opportunityType === "PROJECT") {
      if (!values.minimumBudget || !values.maximumBudget) {
        ctx.addIssue({
          code: "custom",
          message:
            "Orçamento mínimo e máximo são obrigatórios para um Projeto.",
          path: ["maximumBudget"],
        });
      } else if (Number(values.maximumBudget) < Number(values.minimumBudget)) {
        ctx.addIssue({
          code: "custom",
          message: "O orçamento máximo deve ser maior ou igual ao mínimo.",
          path: ["maximumBudget"],
        });
      }
      if (!values.deadline) {
        ctx.addIssue({
          code: "custom",
          message: "O prazo de entrega é obrigatório para um Projeto.",
          path: ["deadline"],
        });
      } else if (values.deadline < todayIsoDate()) {
        ctx.addIssue({
          code: "custom",
          message: "O prazo deve ser uma data futura.",
          path: ["deadline"],
        });
      }
    } else {
      if (!values.contractType) {
        ctx.addIssue({
          code: "custom",
          message: "Selecione o tipo de contrato.",
          path: ["contractType"],
        });
      }
      if (!values.monthlySalaryMin || !values.monthlySalaryMax) {
        ctx.addIssue({
          code: "custom",
          message: "Salário mínimo e máximo são obrigatórios para uma Vaga.",
          path: ["monthlySalaryMax"],
        });
      } else if (
        Number(values.monthlySalaryMax) < Number(values.monthlySalaryMin)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "O salário máximo deve ser maior ou igual ao mínimo.",
          path: ["monthlySalaryMax"],
        });
      }
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

// ── pro/opportunities/[projectId]/proposal — envio de Proposal ─────────────

export const proposalFormSchema = z.object({
  proposedValue: z
    .string()
    .trim()
    .min(1, "Informe o valor proposto.")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Informe um valor válido.",
    }),
  estimatedDays: z
    .string()
    .trim()
    .refine((v) => Number(v) >= 1, { message: "Informe ao menos 1 dia." }),
  proposedStartDate: z.string(),
  proposedDeliveryDate: z.string(),
  description: z
    .string()
    .trim()
    .min(10, "Descreva como pretende executar o projeto."),
  relevantExperience: z.string(),
  skillIds: z.array(z.number()),
  deliverables: z.string(),
  // useFieldArray (react-hook-form) exige um array de objetos, não de
  // primitivos -- cada etapa vira { value: string } aqui e volta pra
  // string[] só na hora de montar o payload de ProposalRequestDTO.
  executionSteps: z.array(
    z.object({ value: z.string().trim().min(1, "Etapa não pode ficar vazia.") })
  ),
  paymentTerms: z.string(),
  validityDays: z
    .string()
    .trim()
    .refine((v) => Number(v) >= 1, {
      message: "Informe ao menos 1 dia de validade.",
    }),
  questionsForCompany: z.string(),
});

export type ProposalFormValues = z.infer<typeof proposalFormSchema>;

// ── matches/review.html — avaliação pós-match ───────────────────────────

export const reviewFormSchema = z.object({
  rating: z.number().min(1, "Selecione uma nota.").max(5),
  comment: z.string(),
  positiveReasons: z.array(z.string()),
  negativeReasons: z.array(z.string()),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
