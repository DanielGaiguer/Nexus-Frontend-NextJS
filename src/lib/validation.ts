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

const taxIdField = z
  .string()
  .trim()
  .refine((value) => value === "" || CNPJ_REGEX.test(value), {
    message: "CNPJ inválido. Use o formato 00.000.000/0001-00.",
  });

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
});

export type RegisterProfessionalFormValues = z.infer<
  typeof registerProfessionalSchema
>;

export const registerCompanySchema = z.object({
  companyName: z.string().trim().min(1, "Informe o nome da empresa."),
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
});

export type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>;

export const registerCompanyLinkedInSchema = z.object({
  companyName: z.string().trim().min(1, "Informe o nome da empresa."),
  taxId: taxIdField,
  phone: phoneField,
  cep: cepField,
  description: z.string(),
});

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
  companyName: z.string().trim().min(2, "Informe o nome da empresa."),
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
